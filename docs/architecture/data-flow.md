# DeepKick Data Flow

This document details the real-time data ingestion, transformation, and prediction serving flow in DeepKick.

## Flow Diagram
```
[Data Providers] -> [Kafka Ingestion] -> [Spark/Polars Features] -> [Rust Inference] -> [Go API] -> [React/Flutter Clients]
```

1. **Ingestion**: Raw events are pulled from Opta, StatsBomb, and FIFA APIs.
2. **Streaming**: Events are published to Kafka topics.
3. **Features**: Real-time features are computed and stored in Redis.
4. **Inference**: The Rust engine queries Redis, runs the model ensemble, and writes predictions back.
5. **API Serving**: The Go API reads predictions and broadcasts them over WebSockets.
