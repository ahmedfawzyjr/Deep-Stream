You are an elite polyglot systems engineer with deep expertise in:
- Rust (async/await, tokio, zero-cost abstractions, unsafe when necessary)
- Go (concurrency patterns, gRPC, high-performance networking)
- Python (FastAPI, async SQLAlchemy, Celery, ML ecosystem)
- TypeScript/React (real-time dashboards, WebSockets, data visualization)
- Dart/Flutter (cross-platform mobile, FFI bindings)
- DevOps (Kubernetes, Terraform, GitOps, observability)

You write production-grade, FAANG-level code with:
- Comprehensive error handling and logging
- Performance optimizations (zero-allocation paths, SIMD where applicable)
- Security best practices (no secrets in code, input validation, rate limiting)
- Extensive testing (unit, integration, property-based, load testing)
- Clear documentation and architecture decision records

You follow these principles:
1. "Make illegal states unrepresentable" (Rust type system)
2. "Fail fast, fail loud, recover gracefully" (Go error handling)
3. "Explicit is better than implicit" (Python Zen)
4. "Composition over inheritance" (React/TypeScript)
5. "Hot reload, cold deploy" (Flutter development)



--------------------------------------------------------
Create a complete open-source project called "DeepStream" — a production-grade real-time multi-modal AI inference platform.

## CORE CONCEPT
DeepStream ingests live video/audio streams, runs real-time AI inference (object detection, speech-to-text, sentiment analysis, OCR), and produces actionable events with sub-100ms latency at scale.

This is NOT a fleet/transportation system. It is a generic AI platform for ANY real-time video/audio analytics use case: live streaming moderation, security cameras, content creation, virtual events, telemedicine, etc.

## ARCHITECTURE REQUIREMENTS

### 1. Ingestion Gateway (Go)
- gRPC server with Protocol Buffers schema
- Support WebRTC, RTMP, SRT, raw UDP protocols
- Circuit breaker pattern (50% failure threshold, 30s cooldown)
- Token bucket rate limiting per user
- Request validation and sanitization
- Distributed tracing with OpenTelemetry
- Health checks: liveness, readiness, startup probes

### 2. AI Inference Engine (Rust)
- Async runtime with tokio
- ONNX Runtime for model execution (GPU + CPU fallback)
- Video pipeline: YOLOv8 object detection, face detection, OCR (Tesseract)
- Audio pipeline: Whisper speech-to-text, sentiment analysis (BERT), speaker identification
- NLP pipeline: Named entity recognition, toxicity detection, translation
- Dynamic batching (max 32 items, 5ms timeout)
- GPU health monitoring with automatic CPU fallback
- Zero-copy data paths where possible
- Memory pool allocators to reduce fragmentation

### 3. Results API (Python/FastAPI)
- RESTful API with OpenAPI/Swagger documentation
- WebSocket endpoint for real-time results streaming
- Server-Sent Events (SSE) for browser clients
- JWT authentication with refresh token rotation
- Role-based access control (RBAC)
- Async database operations with SQLAlchemy 2.0
- PostgreSQL for transactional data
- ClickHouse for analytics time-series data
- MinIO (S3-compatible) for raw video storage
- Celery for background task processing
- Redis for caching and pub/sub

### 4. Web Dashboard (TypeScript/React)
- Real-time video stream viewer with bounding box overlay
- Pipeline builder (drag-and-drop AI model composition)
- Analytics dashboard with D3.js visualizations
- WebSocket client for live results
- Dark/light theme support
- Responsive design (mobile, tablet, desktop)
- Accessibility (WCAG 2.1 AA compliance)

### 5. Mobile SDK (Dart/Flutter)
- Cross-platform (iOS, Android, Web)
- FFI bindings to Rust inference engine
- Real-time camera stream processing
- Local inference option (on-device models)
- WebSocket client for cloud results
- Example app demonstrating all features

### 6. Infrastructure (Terraform + Kubernetes)
- GKE cluster with node pools (CPU, GPU, preemptible)
- Multi-region deployment (europe-west1 primary, europe-west4 standby)
- Horizontal Pod Autoscaler based on custom metrics (queue depth)
- Vertical Pod Autoscaler for right-sizing
- Pod disruption budgets
- Network policies for zero-trust security
- Cert-manager for TLS
- Ingress with nginx + rate limiting
- ArgoCD for GitOps deployments
- Argo Rollouts for blue-green/canary deployments

### 7. Observability Stack
- Prometheus for metrics collection
- Grafana for dashboards (pre-built for all services)
- Jaeger for distributed tracing
- ELK stack (Elasticsearch, Logstash, Kibana) for logging
- Custom metrics:
  - inference_latency_histogram (p50, p95, p99)
  - gpu_utilization_gauge
  - websocket_connections_gauge
  - kafka_consumer_lag
  - circuit_breaker_state
  - storage_tier_hits (hot/warm/cold/archive)

### 8. CI/CD (GitHub Actions)
- Separate workflows per language (Rust, Go, Python, TypeScript, Dart)
- Linting: clippy, go vet, pylint, eslint, dart analyze
- Testing: unit, integration, property-based, load testing
- Coverage reporting to Codecov
- Benchmark tracking with github-action-benchmark
- Multi-arch Docker builds (amd64, arm64)
- Vulnerability scanning with Trivy
- Automated dependency updates with Dependabot
- Semantic versioning with conventional commits
- Automated changelog generation

### 9. Chaos Engineering
- Litmus Chaos experiments
- Random pod deletion (inference engine)
- Network latency injection (Kafka traffic)
- CPU hog (API pods)
- Memory pressure (Redis)
- Automated rollback on SLO violation

## DATA FLOW
Client Stream → Load Balancer → Go Gateway → Circuit Breaker → Kafka → Rust Inference → Redis Pub/Sub → Python API → WebSocket → Client Dashboard
↓              ↓                ↓
Rate Limiter    Dead Letter Queue   PostgreSQL
↓              ↓                ↓
Metrics (Prometheus) Alert (PagerDuty) ClickHouse (Analytics)


## PERFORMANCE TARGETS

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Video inference latency (p99) | < 50ms | Prometheus histogram |
| Audio transcription latency (p99) | < 100ms | Prometheus histogram |
| WebSocket message latency (p99) | < 100ms | Prometheus histogram |
| Concurrent video streams | 500+ | Load test with Locust |
| Concurrent WebSocket connections | 1000+ | Load test with k6 |
| API response time (p95) | < 50ms | Prometheus histogram |
| System availability | 99.9% | Uptime monitoring |
| Error rate | < 0.1% | Prometheus counter |
| Test coverage | > 85% | Coverage reports |

## SECURITY REQUIREMENTS

- No secrets in code (use environment variables + Kubernetes secrets)
- Input validation on all entry points
- SQL injection prevention (parameterized queries)
- XSS prevention (Content Security Policy)
- CSRF tokens for web dashboard
- Rate limiting per IP and per user
- JWT with short expiry + refresh rotation
- mTLS between internal services
- Network policies (zero-trust)
- Vulnerability scanning in CI/CD
- Dependency audit (cargo audit, npm audit, safety)

## DOCUMENTATION REQUIREMENTS

- README with architecture diagram
- API documentation (OpenAPI/Swagger)
- Architecture Decision Records (ADRs) in docs/architecture/decision-log/
- Deployment guides for local, staging, production
- Development setup guide
- Contributing guidelines
- Code of conduct
- Security policy
- Benchmark reports

## PROJECT STRUCTURE
deepstream/
├── .github/workflows/          # CI/CD per language
├── docs/
│   ├── architecture/           # System diagrams, ADRs
│   ├── api/                  # OpenAPI specs
│   ├── deployment/           # GCP, AWS, local
│   └── development/          # Setup, testing
├── proto/                    # Protocol Buffers
├── crates/                   # Rust workspace
│   ├── deepstream-core/      # Shared types
│   ├── inference-engine/     # Main AI service
│   └── model-loader/         # ONNX management
├── gateway/                  # Go service
├── api/                      # Python FastAPI
├── dashboard/                # React frontend
├── sdk/                      # Flutter SDK
├── infrastructure/            # Terraform + K8s
│   ├── terraform/
│   └── kubernetes/
├── benchmarks/              # Load tests
└── scripts/                # Automation


## IMPLEMENTATION ORDER

1. Week 1: Rust inference engine scaffold + ONNX integration
2. Week 2: Go gateway + gRPC + circuit breaker
3. Week 3: Kafka messaging + dead letter queue
4. Week 4: Python API + FastAPI + WebSocket
5. Week 5: PostgreSQL + ClickHouse + MinIO storage
6. Week 6: React dashboard + real-time visualization
7. Week 7: Flutter SDK + FFI bindings
8. Week 8: Docker + Kubernetes manifests
9. Week 9: Terraform + GCP deployment
10. Week 10: Observability + chaos engineering

## ANTI-GRAVITY PRINCIPLES (System Resilience)

1. **Failure Isolation**: Bulkhead pattern per pipeline type
2. **Graceful Degradation**: GPU → CPU fallback, reduced quality mode
3. **Self-Healing**: Kubernetes auto-restart, health probes
4. **Backpressure**: Rate limiting, queue depth monitoring, load shedding
5. **Idempotency**: Exactly-once Kafka processing
6. **Observability**: Distributed tracing, structured logging, metrics
7. **Chaos Engineering**: Random failures in staging prove resilience
8. **Zero-Downtime**: Blue-green deployments, rolling updates
9. **Multi-Region**: Cross-region replication, automatic failover
10. **Capacity Planning**: Predictive auto-scaling based on trends

## DELIVERABLES

Generate complete, production-ready code for:
1. All Rust crates with Cargo.toml, lib.rs, main.rs, tests
2. All Go packages with go.mod, main.go, internal packages
3. All Python modules with pyproject.toml, app structure, tests
4. All React components with package.json, TypeScript, tests
5. All Flutter SDK files with pubspec.yaml, Dart code
6. All Terraform modules with variables, outputs
7. All Kubernetes manifests with ConfigMaps, Secrets, Deployments, Services, HPAs
8. All GitHub Actions workflows
9. Complete documentation

Every file must be fully implemented, not stubbed. Include error handling, logging, tests, and comments explaining design decisions.

Use Apache 2.0 license. Include CODE_OF_CONDUCT.md and CONTRIBUTING.md.

Make this a project that would impress Google L4, Meta E4, and Amazon SDE II interviewers.

-------------------------------------------------------------------------------------------
The project author is Ahmed Fawzy, a Flutter & Mobile Engineer with 4+ years experience building production cross-platform apps. He has:
- 880+ LeetCode problems solved
- Experience with real-time systems (WebSockets, SSE)
- CI/CD with GitHub Actions and Fastlane
- Infrastructure experience (VMware, Windows Server, networking)
- German B1 language proficiency
- Seeking opportunities in Ireland, Germany, Netherlands

This project must demonstrate backend engineering capabilities beyond mobile development, proving full-stack and systems engineering competence suitable for FAANG-level positions.

The project should be impressive enough to:
1. Get past initial recruiter screening
2. Impress hiring managers in system design interviews
3. Serve as a portfolio piece for technical discussions
4. Generate organic interest on GitHub (stars, forks, issues)
5. Lead to conference talk opportunities

Key differentiators to highlight:
- Multi-language polyglot architecture (Rust/Go/Python/TS/Dart)
- Real-time performance (<100ms latency)
- Production-grade DevOps (K8s, Terraform, GitOps)
- AI/ML infrastructure (ONNX, GPU acceleration)
- Open-source community building (good docs, contributing guidelines)
---------------------------------------------------------------------------------
PROMPT FOR SPECIFIC MODULES
When generating individual modules, use these focused prompts:
Rust Inference Engine
plain
Implement the Rust inference engine for DeepStream with:
- tokio async runtime
- ONNX Runtime integration with GPU (CUDA) and CPU fallback
- Video pipeline: YOLOv8 object detection using tract-onnx or ort
- Dynamic batching with configurable timeout and max batch size
- Memory pool allocator for tensor buffers
- Prometheus metrics integration
- gRPC server for receiving inference requests
- Health check endpoint
- Comprehensive error types using thiserror
- Structured logging with tracing
- Unit tests with mock models
- Integration tests with real ONNX models
- Benchmarks with criterion.rs

File: crates/inference-engine/src/main.rs
Go Gateway
plain
Implement the Go ingestion gateway for DeepStream with:
- gRPC server using google.golang.org/grpc
- Protocol Buffers generated from proto/ directory
- Circuit breaker using sony/gobreaker
- Token bucket rate limiter
- Request validation middleware
- Distributed tracing with OpenTelemetry
- Health check endpoints (liveness, readiness, startup)
- Kafka producer for dispatching to inference queue
- Structured logging with zap
- Unit tests with testify
- Integration tests with testcontainers
- Benchmarks

File: gateway/cmd/server/main.go
Python API
plain
Implement the Python FastAPI results service for DeepStream with:
- FastAPI with async endpoints
- SQLAlchemy 2.0 with async PostgreSQL
- WebSocket endpoint for real-time results
- JWT authentication with python-jose
- Redis caching and pub/sub
- Celery background tasks
- Pydantic v2 models
- Comprehensive test suite with pytest
- OpenAPI documentation

File: api/app/main.py
React Dashboard
plain
Implement the React dashboard for DeepStream with:
- Vite + React + TypeScript
- Real-time video player with bounding box overlay
- WebSocket client for live results
- D3.js analytics charts
- Dark/light theme with Tailwind CSS
- Responsive layout
- Accessibility features

File: dashboard/src/App.tsx
Flutter SDK
plain
Implement the Flutter SDK for DeepStream with:
- FFI bindings to Rust inference engine
- Real-time camera stream processing
- WebSocket client
- Example app
- Comprehensive documentation

File: sdk/lib/deepstream_sdk.dart
FINAL INSTRUCTION
plain
Generate the COMPLETE project structure with ALL files fully implemented. Do not use placeholders or TODOs. Every function must have a body. Every test must be runnable. Every configuration must be valid.

The project must be ready to:
1. `docker-compose up --build` for local development
2. `terraform apply` for GCP deployment
3. `cargo test`, `go test`, `pytest`, `npm test`, `flutter test` all passing
4. GitHub Actions CI/CD fully configured
5. Documentation complete and accurate

This is a portfolio project that will be reviewed by FAANG engineers. Quality must be impeccable.
USAGE INSTRUCTIONS FOR AI
When using this prompt with an AI coding assistant:
Start with the SYSTEM PROMPT to set the context
Provide the PROJECT PROMPT for the full scope
Use module-specific prompts for individual components
Reference the ADDITIONAL CONTEXT for personalization
End with FINAL INSTRUCTION for quality requirements
For iterative development:
Generate one module at a time
Review and refine before moving to next
Ensure cross-module compatibility (protobuf schemas, API contracts)
Test integration points early