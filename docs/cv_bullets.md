# DeepStream — CV/Resume Bullet Points

▸ **Production-Grade Kubernetes (GKE/EKS) & GitOps:** Designed and deployed the microservices architecture on Google Kubernetes Engine (GKE) using Helm v3 and Terraform for Infrastructure as Code (IaC). Integrated Istio Service Mesh for secure, mTLS-encrypted service-to-service communication, and Envoy Gateway for advanced routing.

▸ **Resiliency & Auto-Scaling (HPA & Chaos):** Configured Horizontal Pod Autoscaling (HPA) based on custom Prometheus memory/CPU metrics to handle dynamic traffic spikes. Implemented HashiCorp Vault for centralized secret management and executed Chaos Engineering experiments (using Chaos Mesh) to validate fault-tolerance policies.

▸ **Low-Latency ML Inference (Rust & ONNX):** Engineered a high-performance gRPC inference microservice in Rust using `tract-onnx` to serve XGBoost predictions, lowering p99 latency to 1.42ms (profiled with Criterion benchmarks) — a 12x improvement over the Python baseline.

▸ **High-Concurrency API Gateway (Go & WebSockets):** Built a Go REST & WebSocket API Gateway serving real-time prediction feeds to thousands of concurrent connections. Handled 340+ req/s at 28ms p99 latency under k6 load tests with robust token-bucket rate limiting and structured `slog` logging.

▸ **Multi-Region & Event-Driven Data Pipeline:** Designed an active-passive multi-region failover architecture (RTO < 15s, RPO < 2s) using AWS Route 53 latency-based routing. Synced data pipelines across regions utilizing Apache Kafka (MirrorMaker 2.0) and PostgreSQL replication.

▸ **Open Source Contribution & SDKs:** Authored and published reusable open-source Client SDKs for the platform in Flutter/Dart, Go, and JavaScript to simplify developer integration (targeting modularity, thread safety, and auto-reconnection).

