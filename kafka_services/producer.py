import sys, os 
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from aiokafka import AIOKafkaProducer
from aiokafka.errors import KafkaError
from datetime import datetime, timezone
import json
import asyncio

from config import KAFKA_BOOTSTRAP_SERVERS

async def send_events():
    producer = AIOKafkaProducer(
        bootstrap_servers= KAFKA_BOOTSTRAP_SERVERS,
        acks="all",
        enable_idempotence=True
    )

    await producer.start()

    try:
        with open('product-views.json', 'r') as file:
            for line in file:
                data  = json.loads(line.strip())
                data['timestamp'] = datetime.now(timezone.utc).isoformat()

                await producer.send_and_wait(
                    "product_views", 
                    key = data['userid'].encode('utf-8'),
                    value = json.dumps(data).encode('utf-8')
                    )
                print(f"Sent event for user {data['userid']} at {data['timestamp']}")
                await asyncio.sleep(1)  # Simulate delay between events

    finally: 
        await producer.stop()

asyncio.run(send_events())