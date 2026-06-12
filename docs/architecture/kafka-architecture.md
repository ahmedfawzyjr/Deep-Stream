# Advanced Kafka Architecture

DeepKick uses Apache Kafka as its core event-driven backbone, enabling high-throughput ingestion of real-time match events.

## 1. Exactly-Once Processing (EOS)
To ensure match statistics and betting odds are processed without duplicates or omissions under network partitions:
- **Transactional Producer**: The feature engineering workers use Kafka Transactions (`processing.guarantee="exactly_once_v2"`) when writing to the feature store.
- **Idempotence**: Producers are configured with `enable.idempotence=true` and `max.in.flight.requests.per.connection=1` to guarantee sequence ordering.

## 2. Confluent Schema Registry
All event schemas are versioned and enforced using Avro.
- **Schema Compatibility**: Set to `BACKWARD` compatibility to allow smooth updates to match events (e.g., adding xG (Expected Goals) fields) without breaking existing consumers.

## 3. Event Replay & Retention
- **Log Retention Policy**: Set to 7 days (`log.retention.hours=168`) to allow model backtesting and historical replay of match events.
- **Offset Reset**: Consumer groups can reset offsets to `earliest` to reprocess events during model retraining cycles.
