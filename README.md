# DeepStream — Sports Analytics & ML Prediction Platform

DeepStream is a sports analytics system built to explore distributed systems, real-time data pipelines, and machine learning inference. The platform ingest football match event data, processes features, trains models, and serves live predictions over a high-throughput API.

## Status

| Component | Status | Description |
|---|---|---|
| Go REST + WS API | 🚧 In progress | Setting up endpoints, middlewares, and database migrations |
| Rust Inference Engine | 🚧 In progress | gRPC service running tract-onnx model inference |
| Python ML Pipeline | 🚧 In progress | XGBoost training and ONNX export |
| Docker Compose Setup | 🚧 In progress | Local stack configuration |

## Tech Stack

- **Go 1.22**: Main API gateway and WebSocket provider.
- **Rust**: High-performance gRPC model inference using `tract-onnx`.
- **Python 3.11**: Machine learning training pipeline using XGBoost and statsbombpy.

## Architecture

```text
       +-------------------------+
       |   StatsBomb Data Feed   |
       +------------+------------+
                    |
                    v
       +-------------------------+
       |   Python ML Pipeline    | ---> [ XGBoost Model (ONNX) ]
       +-------------------------+              |
                                                |
                                                v
+------------------+         +------------------+
|   Go REST & WS   | <-----> |    Rust ONNX     |
|   API Gateway    |  (gRPC) | Inference Engine |
+--------+---------+         +------------------+
         |
         | (WebSockets / HTTP)
         v
+--------------------------------+
|          Web Dashboard         |
+--------------------------------+
```

## Running Locally

To run the complete stack locally, make sure you have Docker and Docker Compose installed, then run:

```bash
docker-compose up --build
```

*(Note: Ensure you configure the appropriate environment variables in `.env` before running).*

## Real Benchmarks

- **Inference Latency (p99)**: p99 latency: TBD (run cargo bench)
- **API Throughput**: TBD (run k6 load tests)
