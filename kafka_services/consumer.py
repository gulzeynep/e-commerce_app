import sys, os 
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import asyncio
from datetime import datetime
import asyncpg
import json 
from aiokafka import AIOKafkaConsumer
from aiokafka.errors import KafkaError
from config import (KAFKA_BOOTSTRAP_SERVERS,
                    POSTGRES_HOST,
                    POSTGRES_PORT,
                    POSTGRES_DB,
                    POSTGRES_USER,
                    POSTGRES_PASS)


KAFKA_TOPIC = "product_views"
BATCH_SIZE = 100
FLUSH_INTERVAL = 60  # Flush every 60 seconds

async def setup_database(pool):
    query = """
    CREATE TABLE IF NOT EXISTS browse_history (
        messageid VARCHAR(255) PRIMARY KEY,
        event VARCHAR(50),
        userid VARCHAR(255),
        productid VARCHAR(255),
        source VARCHAR(100),
        timestamp TIMESTAMP WITH TIME ZONE,
        is_active SMALLINT DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_userid ON browse_history(userid);
    CREATE INDEX IF NOT EXISTS idx_is_active ON browse_history(is_active);
    """
    async with pool.acquire() as connection:
        await connection.execute(query)
        print("***Database setup completed.")

async def flush_buffer(pool, buffer):
    if not buffer:
        return
    
    batch_to_write = list(buffer)  # Create a copy of the buffer to write
    buffer.clear()  # Clear the original buffer immediately to allow new messages to be collected
    
    query = """
        INSERT INTO browse_history (event, messageid, userid, productid, source, timestamp, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, 1)
        ON CONFLICT (messageid) DO NOTHING
    """

    async with pool.acquire() as connection:
        try:
            await connection.executemany(query, batch_to_write)
            print(f"***Flushed {len(batch_to_write)} records to the database.")
        except Exception as e:
            print(f"Error flushing buffer: {e}")

async def timer_worker(pool, buffer):
    while True:
        await asyncio.sleep(FLUSH_INTERVAL)  
        if buffer:
            print("***Timer triggered flush.")
            await flush_buffer(pool, buffer)

async def run_consumer():
    # DB Pool and Table setup
    pool = await asyncpg.create_pool(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        database=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASS
    )
    await setup_database(pool)

    #Consumer setup
    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id="product_view_consumers",
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )
    await consumer.start()
    print("--- Consumer started, waiting for messages... ---")

    buffer = []

    #Background task for timer-based flushing
    asyncio.create_task(timer_worker(pool, buffer))
    print(f"---Started listening to topic '{KAFKA_TOPIC} ---")

    try:
        async for msg in consumer: 
            try:
                data = msg.value
                row = (
                    data.get('event'),
                    data.get('messageid'),
                    data.get('userid'),
                    data.get('properties', {}).get('productid'),
                    data.get('context', {}).get('source'),
                    datetime.fromisoformat(data['timestamp']) if 'timestamp' in data else datetime.now()
                )

                if row[3]:
                    buffer.append(row)

                if len(buffer) >= BATCH_SIZE:
                    await flush_buffer(pool, buffer)
            
            except Exception as e:
                print(f"Error processing message: {e}")

    finally:
        # Final flush before shutdown
        if buffer:
            await flush_buffer(pool, buffer)
        await consumer.stop()
        await pool.close()

if __name__ == "__main__":
    print("--- Starting Kafka Consumer ---")
    try:
        asyncio.run(run_consumer())
    except KeyboardInterrupt:
        print("--- Consumer interrupted ---")
                