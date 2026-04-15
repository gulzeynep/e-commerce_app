import asyncio
import json
import time
from datetime import datetime, timezone
import asyncpg
from aiokafka import AIOKafkaConsumer
from config import settings

KAFKA_TOPIC = "product_views"
BATCH_SIZE = 100           # Maximum number of messages to process in a single batch
FLUSH_TIMEOUT_SEC = 10    # Maximum time to wait for a batch to fill up (10 seconds)

async def setup_database(pool):
    """Creates required tables and indexes if they don't exist."""
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
        print("--- Database Schema Verified ---")

async def flush_batch(pool, batch_data):
    """Inserts a batch of records into the database using highly efficient executemany."""
    if not batch_data:
        return

    query = """
        INSERT INTO browse_history (event, messageid, userid, productid, source, timestamp, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, 1)
        ON CONFLICT (messageid) DO NOTHING
    """
    try:
        async with pool.acquire() as connection:
            # executemany is significantly faster than inserting rows one by one
            await connection.executemany(query, batch_data)
            print(f"[BATCH FLUSH] {len(batch_data)} records inserted into PostgreSQL successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to flush batch: {e}")

async def run_consumer():
    """
    Initializes connection pools and consumes messages continuously in batches.
    """
    pool = await asyncpg.create_pool(
        host=settings.postgres_host,
        port=settings.postgres_port,
        database=settings.postgres_db,
        user=settings.postgres_user,
        password=settings.postgres_password,
        min_size=2,
        max_size=10
    )
    
    await setup_database(pool)

    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=settings.kafka_bootstrap_servers,
        group_id="product_view_consumers",
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    await consumer.start()
    print(f"--- Kafka Consumer Listening (STRICT BATCH: {BATCH_SIZE} msgs OR {FLUSH_TIMEOUT_SEC} sec) ---")

    try:
        buffer = []
        last_flush_time = time.time()
        while True:
            batch_dict = await consumer.getmany(
                timeout_ms=FLUSH_TIMEOUT_SEC, 
                max_records=BATCH_SIZE
            )
            # Iterate through the returned dictionary and extract values
            for tp, messages in batch_dict.items():
                for msg in messages:
                    data = msg.value
                    try:
                        event = data.get('event')
                        message_id = data.get('messageid')
                        user_id = str(data.get('userid'))
                        product_id = data.get('properties', {}).get('productid')
                        source = data.get('context', {}).get('source')
                        
                        ts_str = data.get('timestamp')
                        timestamp = datetime.fromisoformat(ts_str) if ts_str else datetime.now(timezone.utc)

                        if product_id and message_id:
                            buffer.append((event, message_id, user_id, product_id, source, timestamp))
                    
                    except Exception as e:
                        print(f"[WARNING] Malformed message skipped: {e}")

            # If we collected valid records, flush them to the database
            current_time = time.time()
            time_elapsed = current_time - last_flush_time

            if len(buffer) >= BATCH_SIZE or (time_elapsed >= FLUSH_TIMEOUT_SEC and len(buffer) > 0):
                await flush_batch(pool, buffer)
                buffer.clear() 
                last_flush_time = time.time() 

    except Exception as e:
        print(f"[CRITICAL] Consumer loop error: {e}")
    finally:
        await consumer.stop()
        await pool.close()
        print("--- Kafka Consumer Closed Gracefully ---")

if __name__ == "__main__":
    asyncio.run(run_consumer())