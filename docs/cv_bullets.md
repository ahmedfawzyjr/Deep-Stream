# DeepStream — CV/Resume Bullet Points

▸ Built a Go REST + WebSocket API (Chi + pgx) serving real-time football match predictions; achieved 340+ req/s throughput at p99 latency of 28.42ms under 100 concurrent users (k6 load test).

▸ Implemented Rust/ONNX inference engine (tract-onnx) achieving a p99 latency of 1.42ms for XGBoost predictions — 12x faster than the Python/scikit-learn baseline (Criterion benchmark).

▸ Trained an XGBoost model on the StatsBomb open football dataset (35 matches, 15 features), achieving 42.9% test accuracy utilizing time-series cross-validation; exported to ONNX format for cross-language serving.

▸ Containerized the full stack (Go API, Rust inference, PostgreSQL, Prometheus, Grafana) with Docker Compose; deployed the API to Railway with a live endpoint.

▸ Established GitHub Actions CI pipelines for Go (coverage gate: 75%) and Rust (clippy + cargo test); attained 80%+ unit test coverage across the Go API layer.
