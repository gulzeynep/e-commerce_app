from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, update, desc
import redis.asyncio as redis 
import json

from config import (
                    DATABASE_URL,
                    REDIS_HOST, 
                    REDIS_PORT)
from api.models import Base, Product, BrowseHistory, GenBestSeller, CatBestSeller

#connection pooling 
engine = create_async_engine(DATABASE_URL, pool_size=20, max_overflow=10)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

#redis client for caching 
redis_client = redis.Redis(
    host=REDIS_HOST, 
    port=REDIS_PORT, 
    decode_responses=True
)

async def get_browsing_history(user_id: str):
    """Gets the last 10 product viewed according to user id.
        Only returns active history items.(is_active = 1)"""
    async with AsyncSessionLocal() as session:
        stmt = (
            select(BrowseHistory.productid, Product.category_id)
            .join(Product, BrowseHistory.productid == Product.product_id)
            .where(BrowseHistory.userid == user_id, BrowseHistory.is_active == 1)
            .order_by(desc(BrowseHistory.timestamp))
            .limit(10)
        )
        result = await session.execute(stmt)
        return [{"id": row.productid, "category": row.category_id} for row in result.all()]
    
async def delete_history_item(user_id: str, product_id: str):    
    """Soft delete a product from a specific users browsing history. 
        is_active = 0"""
    async with AsyncSessionLocal() as session:
        stmt = (
            update(BrowseHistory)
            .where(BrowseHistory.userid == user_id, BrowseHistory.productid == product_id)
            .values(is_active=0)
        )
        await session.execute(stmt)
        await session.commit()
    return {"status": "deleted", "product_id": product_id}

async def get_general_best_sellers():
    """Gets the top 10 general best seller product."""
    
    # checks the redis cache first
    cached = await redis_client.get("best_sellers:general") 
    if cached:
        print("Cache hit: general best sellers")
        return json.loads(cached)
    
    # if not in cache fetch from database
    async with AsyncSessionLocal() as session:
        stmt = (
            select(Product.product_id, Product.category_id)
            .join(GenBestSeller, Product.product_id == GenBestSeller.product_id)
            .order_by(desc(GenBestSeller.unique_buyers))
            .limit(10)
        )
        result = await session.execute(stmt)
        products = [{"id": row.product_id, "category": row.category_id} for row in result.all()]
        
        #updates redis cache
        if len(products) > 0:
            await redis_client.setex("best_sellers:general", 3600, json.dumps(products)) 
            
        return products 
    
async def get_personalized_best_sellers(user_id: str):
    """Gets the personalized reccommendations based on users browsing history."""
    async with AsyncSessionLocal() as session:
        # categories last searched by user 
        stmt_cats = (
            select(Product.category_id)
            .join(BrowseHistory, BrowseHistory.productid == Product.product_id)
            .where(BrowseHistory.userid == user_id, BrowseHistory.is_active == 1)
            .order_by(desc(BrowseHistory.timestamp))
            .limit(10)
        )
        result_cats = await session.execute(stmt_cats)
        user_categories = list(set([row.category_id for row in result_cats.all()])) # Tekrar edenleri temizle

        if user_categories:
            # best sellers in that category
            stmt_recs = (
                select(Product.product_id, Product.category_id)
                .join(CatBestSeller, Product.product_id == CatBestSeller.product_id)
                .where(CatBestSeller.category_id.in_(user_categories))
                .order_by(desc(CatBestSeller.unique_buyers))
                .limit(10)
            )
            result_recs = await session.execute(stmt_recs)
            recommendations = [{"id": row.product_id, "category": row.category_id} for row in result_recs.all()]

            # returns personalized list only if there is more than 5 history item
            if len(recommendations) >= 5:
                return recommendations

        # if there is not enough data for categorized best seller, bring general best seller
        return await get_general_best_sellers()
    

async def get_all_products_grouped():
    cache_key = "catalog:grouped_products"
    cached_data = await redis_client.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data)

    async with AsyncSessionLocal() as session:
        stmt = select(Product.product_id, Product.category_id).distinct()
        result = await session.execute(stmt)
        all_products = result.all()

        grouped = {}
        for row in all_products:
            cat = row.category_id
            pid = row.product_id
            if cat not in grouped:
                grouped[cat] = []
            grouped[cat].append(pid)

        if grouped:
            await redis_client.setex(cache_key, 3600, json.dumps(grouped))
            
        return grouped

    
