import asyncio
import json
import os
from datetime import datetime, timezone

from aiokafka import AIOKafkaProducer
from aiokafka.errors import KafkaError

from config import Settings

async def run_producer():
    """Initializes and runs kafka producer."""
    producer = AIOKafkaProducer(
        bootstrap_servers=Settings.kafka_bootstrap_servers,
        acks="all",                # Wait for all replicas to acknowledge
        enable_idempotence=True,   # Prevent duplicate messages on retries
        retry_backoff_ms=500       # Wait 500ms before retrying a failed send
    )
    await producer.start()
    print("--- Kafka Producer Started Safely ---")

    try:
        current_dir = os.path.dirname(__file__)
        file_path = os.path.join(current_dir, 'product-views.json')

        with open(file_path, 'r') as file:
            for line in file:
                if not line.strip():
                    continue  # Skip empty lines to prevent JSONDecodeError

                data = json.loads(line.strip())
                data['timestamp'] = datetime.now(timezone.utc).isoformat()
                user_id = str(data.get('userid', 'unknown_user'))

                # Non-blocking send: yields control back to the event loop
                await producer.send_and_wait(
                    topic="product_views", 
                    key=user_id.encode('utf-8'),
                    value=json.dumps(data).encode('utf-8')
                )
                print(f"[PRODUCED] Event for user: {user_id}")
                
                # Non-blocking sleep to simulate real-time traffic flow
                await asyncio.sleep(1)

    except FileNotFoundError:
        print(f"[CRITICAL] Data file not found at {file_path}")
    except json.JSONDecodeError as e:
        print(f"[ERROR] Invalid JSON format in data file: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected producer error: {e}")
    finally:
        # Graceful shutdown ensures all buffered messages are sent before exiting
        await producer.stop()
        print("--- Kafka Producer Stopped Gracefully ---")

if __name__ == "__main__":
    asyncio.run(run_producer())