# 🛸 DeepStream: Production-Grade Multi-Modal AI Inference Pipeline Platform

DeepStream is an open-source, ultra-low latency multi-modal AI inference platform built as a monorepo leveraging **Rust**, **Go**, **Python**, **TypeScript/React**, and **Dart/Flutter**. The platform ingests live video/audio streams, runs real-time multi-modal inference (object localizer, face detection, OCR, whisper speech-to-text, BERT sentiment, translator, toxicity), and broadcasts results to client dashboards in sub-100ms.

---

## 🏗️ System Architecture & Data Flow

```
                      +------------------+
                      |   Client Stream  |
                      +--------+---------+
                               |
                               v
                      +------------------+
                      |   Load Balancer  |
                      +--------+---------+
                               |
                               v
                      +------------------+
                      |    Go Gateway    +<---+ Token Bucket Rate Limiter
                      +--------+---------+
                               |
                       [Circuit Breaker]
                               | (Dual-Dispatch Fallback)
                               +-----------------------------+
                               |                             |
                               v                             v
                      +--------+---------+         +---------+--------+
                      |   Apache Kafka   |         |   Redis Streams  |
                      |  (Primary Queue) |         | (Backup Fallback)|
                      +--------+---------+         +---------+--------+
                               |                             |
                               +--------------+--------------+
                                              |
                                              v
                                   +----------+----------+
                                   |  Rust Inference     +<---+ GPU (CUDA) / CPU Fallback
                                   |      Engine         |
                                   +----------+----------+
                                              |
                                              v
                                   +----------+----------+
                                   |    Redis Pub/Sub    |
                                   +----------+----------+
                                              |
                                              v
                                   +----------+----------+
                                   |   FastAPI Results   |
                                   |      Server         |
                                   +-----+----+-----+----+
                                         |    |     |
                                         |    |     +----> PostgreSQL (Warm Tier)
                                         |    +----------> ClickHouse (Cold Analytics)
                                         +---------------> MinIO / S3 (Archive)
                                         |
                                         v
                                  [WebSockets / SSE]
                                         |
                                         v
                               +---------+---------+
                               | React / Flutter   |
                               |    Dashboards     |
                               +-------------------+
```

---

## 🚀 Key Features & "Anti-Gravity" Resiliency

*   **GPU-to-CPU Dynamic Fallback:** The Rust Inference engine monitors CUDA health and seamlessly switches execution to CPU pipelines without dropping frames.
*   **Dual-Dispatch Fallback Ingestion:** If Kafka brokers experience network lag or failures, the Go Gateway automatically routes incoming stream packets to Redis Streams to guarantee ingestion uptime.
*   **Token-Bucket Rate Limiter & Breakers:** Go Gateway isolates pipelines using circuit breakers (`gobreaker`) and limits ingestion load per client token.
*   **Auto-Tiering Storage:** Python Results API queries results through HOT (Redis), WARM (PostgreSQL), COLD (ClickHouse), and ARCHIVE (MinIO/S3) layers based on event age.
*   **Dynamic Batching:** Rust inference batches model input tensors with a max size of 32 or a 5ms timeout to balance latency and GPU throughput.

---

## 📁 Repository Structure

```
deepstream/
├── .github/workflows/      # TypeScript, Flutter, Rust, Go, Python CI & release workflows
├── api/                    # Python FastAPI Results Aggregator & storage connectors
├── benchmarks/             # Locust load tests and performance benchmarks
├── crates/                 # Rust workspace (Inference engine, ONNX, and pipelines)
├── dashboard/              # Vite React TypeScript frontend dashboard
├── gateway/                # Go gRPC ingestion gateway, middlewares, and protocol adapters
├── infrastructure/         # Terraform GKE scripts and Kubernetes base deployments
├── proto/                  # Protocol Buffers (Shared common, ingestion, and results contracts)
└── sdk/                    # Flutter cross-platform Client SDK (WebSockets, Models, and Rust FFI)
```

---

## 🏁 Quick Start (Local Development)

### 1. Launch Shared Infrastructure
Start local Kafka KRaft, Redis, Postgres, ClickHouse, and MinIO instances using:
```bash
docker-compose up -d
```

### 2. Ingestion Gateway (Go)
Launches the HTTP admin server (port `8080`) and gRPC server (port `50051`):
```bash
cd gateway
go run cmd/server/main.go
```

### 3. AI Inference Engine (Rust)
Runs the streaming worker task consuming video frames from Kafka:
```bash
cd crates/inference-engine
cargo run --bin inference-engine
```

### 4. Results API (Python FastAPI)
Starts the async server (port `8000`) for tiered queries and WebSockets results:
```bash
cd api
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Web Dashboard (React)
Launches the interactive dark-themed telemetry dashboard (port `3000`):
```bash
cd dashboard
npm install
npm run dev
```

---

## 🧪 Testing & Benchmarks

Run all unit and integration test suites:
```bash
make test-all
```

For performance load testing (FastAPI endpoints):
```bash
locust -f benchmarks/locustfile.py
```

---

## 👥 Author & Portfolios

**Ahmed Fawzy** - *Flutter & Mobile/Backend Systems Engineer*
*   4+ years experience building production cross-platform apps and real-time distributed backends.
*   880+ Leetcode problems solved (Strong algorithms and systems design background).
*   Seeking opportunities in Ireland, Germany, and the Netherlands.
*   Email: [ahmedfawzyjr@gmail.com](mailto:ahmedfawzyjr@gmail.com)

*Licensed under the Apache License, Version 2.0 (LICENSE).*
