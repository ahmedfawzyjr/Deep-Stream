# DeepStream — Sports Analytics & ML Prediction Platform

A full-stack sports analytics system built to explore distributed systems, real-time data pipelines, and ML inference at the edge. The platform ingests football match events, trains machine learning models to predict outcomes, and serves live predictions over a high-throughput API.

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
|  React Web / Flutter Mobile    |
+--------------------------------+
```

## Status

| Component | Status | Description |
|---|---|---|
| Go REST + WS API | 🚧 In progress | Setting up handlers, repositories, and WebSocket feeds |
| Rust Inference Engine | 🚧 In progress | Porting to tract-onnx with tonic gRPC |
| ML Model Pipeline | 🚧 In progress | Preparing dataset fetchers and model training script |
| React Dashboard | 🚧 In progress | Base dashboard layout |
| Flutter Mobile App | 🚧 In progress | Mobile application framework |
| Docker Compose Setup | 📋 Planned | Containerization of all components |

## Tech Stack

- **Backend API**: Go (planned router: Chi)
- **Inference Engine**: Rust (planned ONNX runtime: tract-onnx, gRPC: tonic)
- **ML Training**: Python (XGBoost, scikit-learn, mlflow)
- **Database**: PostgreSQL (planned)
- **Containerization**: Docker & Docker Compose (planned)

## Running Locally

To run the current simulation/seed script (Python):
1. Navigate to the root directory and ensure you have Python 3.11 installed.
2. Install the features package:
   ```bash
   pip install -e features/
   ```
3. Run the seed data script:
   ```bash
   python scripts/seed_data.py
   ```

*(Detailed instructions for running the complete docker-compose stack will be added once Phase 4 is complete).*

## Real Benchmarks

- **Inference Latency (p99)**: TBD (run cargo bench in the inference package once the engine is complete)
- **API Throughput**: TBD (run k6 load tests in infra/load-test once API is complete)
