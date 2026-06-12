# ADR-001: Selection of Apache Kafka for Event Streaming

## Status
Approved

## Context
DeepKick requires ingestion of high-throughput real-time sports feed data (such as Opta and StatsBomb matches). The event stream processing layer must scale to process thousands of events per minute and handle load spikes during peak football match times without dropping messages.

## Decision
We selected **Apache Kafka** (running in KRaft mode) as our event streaming broker. 

## Rationale
1. **High Throughput & Low Latency**: Kafka handles millions of messages per second with microsecond latency.
2. **Durability & Replayability**: Allows consumers (such as ML retraining pipelines or analytics warehouses) to replay historical event data from offsets.
3. **Partition-based Scaling**: Enables horizontal scaling of consumer instances mapping directly to partition counts.

## Consequences
- Requires operational overhead to manage ZooKeeper-less brokers (KRaft).
- Endpoints must support idempotent delivery.
