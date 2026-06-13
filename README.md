# DeepStream — Sports Analytics & ML Prediction Platform

[![API CI](https://github.com/ahmedfawzyjr/Deep-Stream/actions/workflows/api.yml/badge.svg)](https://github.com/ahmedfawzyjr/Deep-Stream/actions)
[![Inference CI](https://github.com/ahmedfawzyjr/Deep-Stream/actions/workflows/inference.yml/badge.svg)](https://github.com/ahmedfawzyjr/Deep-Stream/actions)
[![Go Version](https://img.shields.io/github/go-mod/go-version/ahmedfawzyjr/Deep-Stream?filename=api%2Fgo.mod)](https://go.dev/)

DeepStream is a sports analytics system built to explore distributed systems, real-time data pipelines, and machine learning inference. The platform ingests football match event data from StatsBomb, processes features, trains XGBoost models, and serves live predictions over a high-throughput API.

## Live Demo
Check out the live REST API endpoint: `https://deepstream-api.railway.app/health`

## What this project actually does
- Ingests football match data from StatsBomb open dataset
- Trains an XGBoost ensemble model to predict match outcomes
- Serves predictions via a Go REST + WebSocket API
- Runs a Rust/ONNX inference engine for low-latency scoring
- Displays live predictions on a React dashboard and Flutter mobile app

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

## Tech Stack

- **Go 1.22**: Main API gateway and WebSocket provider (Chi + pgx).
- **Rust stable (1.77+)**: High-performance gRPC model inference using `tract-onnx` and `tonic`.
- **Python 3.12**: Machine learning training pipeline using XGBoost, Optuna, MLflow, and statsbombpy.
- **PostgreSQL 16**: Relational storage for matches and prediction history.
- **Docker & Docker Compose**: Full-stack containerization and health orchestration.
- **Prometheus & Grafana**: Observability and metrics collection.

## Real Benchmarks

- **Inference Latency (p99)**: 1.42ms (measured via Criterion benchmark)
- **API Throughput**: 340+ req/s at p99 latency of 28.42ms under 100 concurrent users (measured via k6 load test)
- **ML Model Accuracy**: 42.9% accuracy on held-out La Liga test set (realistic football prediction baseline)

## Status

| Component | Status | Description |
|---|---|---|
| Go REST + WS API | ✅ Working | Endpoints, rate-limiting, JWT auth, and live WS broadcast |
| Rust Inference Engine | ✅ Working | gRPC service running tract-onnx model inference |
| Python ML Pipeline | ✅ Working | XGBoost training, Optuna tuning, and ONNX export |
| Docker Compose Setup | ✅ Working | Multi-stage containerization with health checks |

## Running Locally

To run the complete stack locally:

1. Ensure you have Docker and Docker Compose installed.
2. Copy `.env.example` to `.env`.
3. Build and start the services:
   ```bash
   docker-compose up --build
   ```
4. Access the services:
   - Go API: `http://localhost:8080/health`
   - Grafana Dashboard: `http://localhost:3000` (admin/admin)
   - Prometheus: `http://localhost:9090`

## Monitoring Dashboard

Here is a visual overview of the Grafana dashboard scraping live API and Rust inference statistics:

![Grafana Dashboard](docs/benchmarks/grafana_dashboard.png)
