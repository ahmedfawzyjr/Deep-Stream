import time
import random
import logging
from data.ingestion.opta_connector import OptaConnector
from data.streaming.kafka_producer import KafkaEventProducer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_data")

def main():
    logger.info("Initializing mock football seed simulation...")
    connector = OptaConnector()
    producer = KafkaEventProducer()

    matches = [f"match_{i}" for i in range(1, 6)]
    
    # Run a quick 10-second loop sending simulated football events to Kafka
    logger.info("Streaming simulated match events to Kafka...")
    for _ in range(20):
        match_id = random.choice(matches)
        event = connector.fetch_live_events(match_id)
        producer.send_event("football-match-events", key=match_id, value=event)
        time.sleep(0.5)

    logger.info("Finished seeding initial real-time simulation events.")

if __name__ == "__main__":
    main()
