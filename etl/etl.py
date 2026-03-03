import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import asyncio
import logging
from sqlalchemy import delete, select, func, desc
from api.database import AsyncSessionLocal, redis_client
from api.models import GenBestSeller, CatBestSeller, Product, Order, OrderItem

logging.basicConfig(level=logging.INFO)

async def run_etl():
    logging.info("--- ETL process starting... ---")
    
    async with AsyncSessionLocal() as session:
        try:
            # clean tables
            await session.execute(delete(GenBestSeller))
            await session.execute(delete(CatBestSeller))
            
            # 2. General Best Sellers (unique buyers calculated for popularity)
            gen_stmt = (
                select(
                    OrderItem.product_id,
                    func.count(Order.user_id.distinct()).label("unique_buyers")
                )
                .join(Order, OrderItem.order_id == Order.order_id)
                .group_by(OrderItem.product_id)
                .order_by(desc("unique_buyers"))
                .limit(10)
            )
            gen_results = await session.execute(gen_stmt)
            
            gen_data = [
                GenBestSeller(product_id=row.product_id, unique_buyers=row.unique_buyers)
                for row in gen_results
            ]
            session.add_all(gen_data)

            # Category Best Sellers
            subq = (
                select(
                    Product.category_id,
                    OrderItem.product_id,
                    func.count(Order.user_id.distinct()).label("unique_buyers"),
                    func.row_number().over(
                        partition_by=Product.category_id,
                        order_by=desc(func.count(Order.user_id.distinct()))
                    ).label("rn")
                )
                .join(Order, OrderItem.order_id == Order.order_id)
                .join(Product, OrderItem.product_id == Product.product_id)
                .group_by(Product.category_id, OrderItem.product_id)
            ).subquery()

            cat_stmt = (
                select(subq.c.category_id, subq.c.product_id, subq.c.unique_buyers)
                .where(subq.c.rn <= 10)
            )
            cat_results = await session.execute(cat_stmt)
            
            cat_data = [
                CatBestSeller(
                    category_id=row.category_id, 
                    product_id=row.product_id, 
                    unique_buyers=row.unique_buyers
                ) for row in cat_results
            ]
            session.add_all(cat_data)
            
            await session.commit()
            logging.info("*** Database tables updated successfully.")

            # clean redis 
            try:
                await redis_client.delete("best_sellers:general")
                logging.info("*** Redis cache cleared")
            except Exception as redis_err:
                logging.warning(f"!!! Redis cache warning: {redis_err}")

        except Exception as e:
            await session.rollback()
            logging.error(f"!!! ETL Error: {e}", exc_info=True)

async def schedule_etl():
    while True:
        await run_etl()
        logging.info("Waiting for 1 hour...")
        await asyncio.sleep(3600)

if __name__ == "__main__":
    try:
        asyncio.run(schedule_etl())
    except KeyboardInterrupt:
        logging.info("--- ETL process stopped manually. ---")