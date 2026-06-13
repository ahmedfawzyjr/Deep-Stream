# DeepStream — Cursor / Claude Code Agent Prompt

> Paste this prompt directly into Cursor (Agent mode) or Claude Code.
> Run it phase by phase — don't run everything at once.

---

## MASTER CONTEXT (paste this at the start of every session)

```
You are a senior software engineer helping me improve my portfolio project
"DeepStream" — a sports analytics and ML prediction platform.

The GitHub repo is: https://github.com/ahmedfawzyjr/Deep-Stream

The project has 4 components:
1. Go REST + WebSocket API (api/)
2. Rust ONNX inference engine (inference/)
3. Python ML training pipeline (ml/)
4. React web dashboard (web/) + Flutter mobile app (mobile/)

Core rules you must follow at all times:
- Write real, working code — no placeholders, no TODO stubs
- Every function needs a unit test in the same PR
- Use conventional commits: feat(), fix(), test(), docs(), perf(), ci()
- Never claim performance numbers you haven't measured
- If something is not implemented yet, mark it clearly in code comments
- Use Go 1.22, Rust stable (1.77+), Python 3.11, Flutter 3.22

Current repo state:
- Go API: mostly empty stubs
- Rust inference: 4% of codebase, not functional
- ML model: not trained
- Tests: none
- CI: not configured

Target state after all 4 phases:
- Go API: fully working with 80%+ test coverage
- Rust ONNX engine: loading real model, benchmarked with Criterion
- ML: XGBoost trained on StatsBomb open data, exported to ONNX
- CI: GitHub Actions running on every push with coverage gates
- Docker Compose: full stack runs with `docker-compose up`
- Deployed: Go API live on Railway
```

---

## PHASE 1 PROMPT — Credibility & Repo Cleanup

```
Using the master context above, implement Phase 1 of the DeepStream improvement plan.

## Your tasks (do all of these):

### 1. Rewrite README.md
Replace the entire current README with a new one that:
- Opens with an honest 2-sentence description of what the project does
- Has a "Status" table showing which components are done vs in-progress vs planned
- Has a "Tech Stack" section listing ONLY implemented technologies
- Has an "Architecture" section with a clean ASCII diagram
- Has a "Running locally" section with working docker-compose instructions
- Has a "Real benchmarks" section with placeholder text: "p99 latency: TBD (run cargo bench)"
- Does NOT contain: "Why This Gets You Into FAANG", "Interview Talking Points",
  "Verified 🟢" next to unverified metrics, or any aspirational performance numbers

### 2. Create ADR documents
Create these 3 files:

docs/decisions/001-why-go-for-api.md
docs/decisions/002-why-rust-for-inference.md  
docs/decisions/003-why-statsbomb-data.md

Each ADR must follow this format:
# ADR-00X: [Title]
## Status: Accepted
## Context: [problem we were solving]
## Decision: [what we chose]
## Reasons: [bullet list of technical reasons]
## Consequences: [tradeoffs accepted]

Make the content technically accurate and specific — not generic.

### 3. Create CONTRIBUTING.md
Include:
- Prerequisites (Go 1.22, Rust stable, Python 3.11, Docker)
- How to run each component locally
- How to run tests
- Commit message format (Conventional Commits)
- PR checklist

### 4. Create .env.example
List all environment variables the project needs with descriptions:
DATABASE_URL, INFERENCE_ADDR, JWT_SECRET, MODEL_PATH, etc.

### 5. Audit and clean existing files
- List every file in features/, notebooks/, scripts/ directories
- For each file, tell me: is this real code or AI-generated stub?
- Delete or empty any file that is a placeholder with no real logic

### 6. Update .gitignore
Add: *.onnx, models/, __pycache__/, target/, .env, coverage.out, criterion/

Commit each task separately with proper conventional commit messages.
Start with: docs: rewrite README with honest project description
```

---

## PHASE 2 PROMPT — Go API (run after Phase 1 is complete)

```
Using the master context above, implement Phase 2: the Go REST + WebSocket API.

## Target file structure to create:
api/
├── cmd/server/main.go
├── internal/
│   ├── config/config.go
│   ├── handler/
│   │   ├── match_handler.go
│   │   ├── match_handler_test.go
│   │   ├── ws_handler.go
│   │   └── ws_handler_test.go
│   ├── repository/
│   │   ├── match_repo.go
│   │   └── match_repo_test.go
│   ├── service/
│   │   ├── prediction_service.go
│   │   └── prediction_service_test.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── ratelimit.go
│   │   └── logging.go
│   └── metrics/metrics.go
├── migrations/
│   ├── 001_create_matches.sql
│   ├── 002_create_predictions.sql
│   └── 003_create_users.sql
├── Makefile
├── Dockerfile
└── go.mod

## Dependencies to use:
- github.com/go-chi/chi/v5 — routing
- github.com/go-chi/cors — CORS middleware
- github.com/go-chi/httprate — rate limiting
- github.com/jackc/pgx/v5 — PostgreSQL driver
- github.com/gorilla/websocket — WebSocket
- github.com/golang-jwt/jwt/v5 — auth
- github.com/prometheus/client_golang — metrics
- github.com/stretchr/testify — testing assertions
- github.com/testcontainers/testcontainers-go — integration tests

## Endpoints to implement (all must work):
GET  /health                         → {"status": "ok", "version": "1.0.0"}
GET  /v1/matches                     → paginated list of matches
GET  /v1/matches/{id}                → single match + latest prediction
POST /v1/matches/{id}/predict        → trigger new prediction (calls inference engine)
GET  /v1/ws/matches/{id}/live        → WebSocket: streams live prediction updates
GET  /metrics                        → Prometheus metrics endpoint

## Requirements for each layer:

### Repository layer (match_repo.go):
- Define a MatchRepository interface
- Implement it with PostgreSQL using pgx
- Methods: GetByID, List, Create, UpdateScore
- Use context.Context for all DB calls
- Return typed errors (ErrNotFound, ErrInvalidID)

### Service layer (prediction_service.go):
- Define an InferenceClient interface (so it can be mocked in tests)
- PredictionService calls the inference engine via the interface
- Records actual latency in milliseconds for every prediction
- Saves prediction to DB after inference

### Handler layer (match_handler.go):
- Clean separation: handlers only parse HTTP, delegate to service
- Return proper HTTP status codes (404, 422, 500)
- Return JSON errors in format: {"error": "message", "code": "NOT_FOUND"}

### WebSocket handler (ws_handler.go):
- Hub pattern: map of matchID → set of connections
- Handle disconnections gracefully (no panics on write to closed conn)
- Track active connection count in Prometheus gauge

### Middleware:
- auth.go: JWT validation, attach user claims to context
- ratelimit.go: 100 req/min per IP, return 429 with Retry-After header
- logging.go: structured logging with log/slog, log method+path+status+duration

### Metrics (metrics.go):
- deepstream_predictions_total (counter, labels: status=success|error)
- deepstream_inference_latency_ms (histogram, buckets: 1,2,5,10,20,50,100ms)
- deepstream_active_websockets (gauge)
- deepstream_http_requests_total (counter, labels: method, path, status)

## Test requirements:
- match_handler_test.go: mock the service, test all endpoints, test error cases
- prediction_service_test.go: mock InferenceClient, test latency recording
- match_repo_test.go: use testcontainers to spin up real PostgreSQL
- Minimum 80% coverage across the api/ package
- All tests must pass with: cd api && go test ./... -race

## GitHub Actions CI (.github/workflows/api.yml):
- Trigger on push/PR to paths: api/**
- Run PostgreSQL as a service container
- Run go vet, go test ./... -race -coverprofile=coverage.out
- Fail if coverage < 75%
- Upload coverage to Codecov

## Makefile targets:
make run          → go run ./cmd/server
make test         → go test ./... -race -coverprofile=coverage.out
make coverage     → open coverage report in browser
make migrate      → run migrations against local DB
make migrate-test → run migrations against test DB
make lint         → golangci-lint run
make build        → go build -o bin/server ./cmd/server
make docker-build → docker build -t deepstream-api .

## Commit sequence to follow:
feat(api): initialize Go module with chi router and health endpoint
feat(api): add PostgreSQL connection with pgx and migration runner
feat(api): implement match repository with GetByID and List
feat(api): implement prediction service with InferenceClient interface
feat(api): add match handler with predict endpoint
feat(api): add WebSocket hub with live match streaming
feat(api): add JWT auth middleware
feat(api): add rate limiting middleware (100 req/min per IP)
feat(api): add Prometheus metrics endpoint
test(api): add match handler unit tests — 83% coverage
test(api): add repository integration tests with testcontainers
ci: add GitHub Actions pipeline with coverage gate at 75%
chore(api): add Makefile with run, test, build, migrate targets
```

---

## PHASE 3A PROMPT — ML Training Pipeline (run after Phase 2 CI is green)

```
Using the master context above, implement Phase 3A: the Python ML training pipeline.

## Target structure:
ml/
├── data/
│   ├── fetch_statsbomb.py      ← download real match data
│   └── preprocess.py           ← feature engineering
├── models/                     ← saved model files (gitignored)
├── notebooks/
│   └── 01_eda.ipynb            ← exploratory data analysis
├── train.py                    ← main training script
├── evaluate.py                 ← model evaluation + metrics
├── export_onnx.py              ← export trained model to ONNX
├── requirements.txt
└── README.md                   ← explains how to run training

## Data source:
Use the statsbombpy library (pip install statsbombpy).
StatsBomb provides free open football data — no API key needed.
Use La Liga data: competition_id=11, season_id=90

## Features to extract (minimum 15):
home_shots, away_shots,
home_shots_on_target, away_shots_on_target,
home_pass_accuracy, away_pass_accuracy,
home_possession_pct, away_possession_pct,
home_xg, away_xg,
home_form_last5 (win rate last 5 matches),
away_form_last5,
home_goals_scored_avg (last 5),
away_goals_scored_avg (last 5),
head_to_head_home_wins (last 5 h2h)

Target variable: result (0=away win, 1=draw, 2=home win)

## Model requirements:
- Algorithm: XGBoostClassifier
- Validation: TimeSeriesSplit with n_splits=5 (no future data leakage)
- Hyperparameters: tune with Optuna (50 trials)
- Track experiments with MLflow (local tracking server)
- Log: CV log loss per fold, mean CV log loss, feature importance plot
- Final model must achieve at least 55% accuracy on held-out test set
  (realistic benchmark — football is inherently unpredictable)

## ONNX export (export_onnx.py):
- Export trained XGBoost model using skl2onnx
- Save to: models/match_predictor_v1.onnx
- Verify the ONNX model gives identical predictions to the sklearn model
- Print: "ONNX model verified — max prediction diff: X.Xf"
- Also save: models/feature_names.json (list of feature column names in order)

## evaluate.py must output:
- Accuracy on test set
- Log loss on test set  
- Brier score
- Confusion matrix (saved as docs/benchmarks/confusion_matrix.png)
- Feature importance plot (saved as docs/benchmarks/feature_importance.png)
- Print a summary table like:
  Model: XGBoost v1
  Test accuracy:  61.3%
  CV log loss:    0.924 ± 0.031
  Brier score:    0.201

## requirements.txt:
statsbombpy==1.0.3
xgboost==2.0.3
scikit-learn==1.4.1
skl2onnx==1.16.0
onnxruntime==1.17.3
optuna==3.5.0
mlflow==2.11.1
pandas==2.2.1
numpy==1.26.4
matplotlib==3.8.3
seaborn==0.13.2

## Commit sequence:
feat(ml): add StatsBomb data fetcher for La Liga matches
feat(ml): add feature engineering pipeline with 15 match features
feat(ml): add XGBoost training with TimeSeriesSplit cross-validation
feat(ml): add Optuna hyperparameter tuning (50 trials)
feat(ml): add MLflow experiment tracking
feat(ml): export trained model to ONNX format
feat(ml): add evaluation script with confusion matrix and feature importance
docs(ml): add README explaining how to run training pipeline
```

---

## PHASE 3B PROMPT — Rust Inference Engine (run after Phase 3A ONNX export works)

```
Using the master context above, implement Phase 3B: the Rust ONNX inference engine.

## Target structure:
inference/
├── Cargo.toml
├── src/
│   ├── main.rs           ← gRPC server (tonic)
│   ├── engine.rs         ← ONNX model loading + inference
│   ├── features.rs       ← MatchFeatures struct + validation
│   ├── metrics.rs        ← Prometheus metrics
│   └── error.rs          ← typed error enum
├── benches/
│   └── inference_bench.rs ← Criterion benchmarks
├── proto/
│   └── inference.proto    ← gRPC service definition
├── tests/
│   └── integration_test.rs
└── build.rs               ← tonic build script for proto

## Cargo.toml dependencies:
tract-onnx = "0.21"
tonic = { version = "0.11", features = ["tls"] }
tonic-build = "0.11"          ← build dependency
tokio = { version = "1", features = ["full"] }
prost = "0.12"
prometheus = { version = "0.13", features = ["process"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
anyhow = "1"
thiserror = "1"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }

[dev-dependencies]
criterion = { version = "0.5", features = ["html_reports"] }
tokio-test = "0.4"

## inference.proto:
syntax = "proto3";
package inference;

service InferenceService {
  rpc Predict(PredictRequest) returns (PredictResponse);
  rpc Health(HealthRequest) returns (HealthResponse);
}

message PredictRequest {
  string match_id = 1;
  repeated float features = 2;
}

message PredictResponse {
  float home_win_prob = 1;
  float draw_prob = 2;
  float away_win_prob = 3;
  float latency_ms = 4;
  string model_version = 5;
}

message HealthRequest {}
message HealthResponse { bool ok = 1; }

## engine.rs requirements:
- Load ONNX model from path at startup using tract-onnx
- Validate feature count matches model input shape (panic with clear message if not)
- predict() takes &[f32], returns Result<Probabilities, InferenceError>
- Must be Send + Sync (wrap model in Arc)
- Record inference latency in Prometheus histogram on every call

## features.rs:
- Define MatchFeatures struct with all 15 named fields (f32)
- Implement fn to_vec(&self) -> Vec<f32> (in the same order as training)
- Implement validation: all values must be finite, probabilities in [0,1]
- Load feature order from models/feature_names.json to stay in sync with Python

## error.rs:
#[derive(thiserror::Error, Debug)]
pub enum InferenceError {
    #[error("Model not loaded: {0}")]
    ModelNotLoaded(String),
    #[error("Invalid feature count: expected {expected}, got {got}")]
    InvalidFeatureCount { expected: usize, got: usize },
    #[error("Inference failed: {0}")]
    InferenceFailed(String),
}

## Criterion benchmarks (benches/inference_bench.rs):
- bench_single_prediction: measure p50, p95, p99 latency
- bench_batch_10: run 10 predictions back-to-back
- bench_batch_100: run 100 predictions back-to-back
- All benchmarks must use real ONNX model (models/match_predictor_v1.onnx)
- After running: save HTML report to docs/benchmarks/criterion_report/

## Actual benchmark targets (these are realistic with tract-onnx + XGBoost ONNX):
- Single prediction p99: < 5ms
- Batch of 10 p99: < 15ms

## GitHub Actions CI (.github/workflows/inference.yml):
- Trigger on push/PR to paths: inference/**
- Steps: cargo fmt --check, cargo clippy -- -D warnings, cargo test, cargo bench --no-run
- Cache cargo registry and target directory

## Commit sequence:
feat(inference): add gRPC server skeleton with tonic
feat(inference): implement ONNX model loading with tract-onnx
feat(inference): add MatchFeatures struct with validation
feat(inference): implement Predict gRPC endpoint
feat(inference): add Prometheus metrics for latency and request count
feat(inference): add Health gRPC endpoint
test(inference): add integration test for full predict round-trip
bench(inference): add Criterion benchmarks for single and batch prediction
ci: add Rust CI with clippy, tests, and benchmark smoke test
```

---

## PHASE 4 PROMPT — Deploy, Observability & Polish

```
Using the master context above, implement Phase 4: deployment, observability, and final polish.

## Task 1: Docker Compose (full stack)
Create docker-compose.yml that starts ALL of these together:
- postgres:16-alpine (with health check, volume mount for migrations)
- inference service (built from ./inference/Dockerfile)
- api service (built from ./api/Dockerfile)
- prometheus (scraping api :8080/metrics and inference :2112/metrics)
- grafana (with provisioned datasource pointing to prometheus)

Requirements:
- `docker-compose up` must work from a clean clone with only .env set
- Add health checks for every service
- api must wait for postgres AND inference to be healthy before starting
- Document exact startup time target: < 90 seconds on first run

## Task 2: Grafana dashboard
Create infra/grafana/dashboards/deepstream.json with panels:
- Prediction requests per second (rate)
- p50/p95/p99 inference latency (histogram quantiles)
- Active WebSocket connections (gauge)
- Error rate (counter rate)
- HTTP request rate by endpoint

After running docker-compose up, take a screenshot of the dashboard
with real data and save as docs/benchmarks/grafana_dashboard.png

## Task 3: k6 Load Test
Create infra/load-test/api_load_test.js that:
- Ramps to 100 concurrent users over 2 minutes
- Tests GET /v1/matches and POST /v1/matches/{id}/predict
- Asserts p99 < 200ms and error rate < 1%
- Saves output to docs/benchmarks/load_test_results.txt

Run the load test against Railway deployment and save real results.

## Task 4: Railway deployment
- Create railway.toml for the Go API service
- Document exact deploy steps in docs/deployment.md
- Verify the deployed API responds correctly at the live URL
- Add the live URL to README.md in a "Live Demo" section

## Task 5: README final pass
Add to README.md:
- CI/CD badges (API CI, Inference CI, Coverage, Go version)
- Screenshot of Grafana dashboard (docs/benchmarks/grafana_dashboard.png)
- "Real benchmarks" section with ACTUAL numbers from:
  - Criterion report (Rust inference latency)
  - k6 load test (API throughput)
  - ML evaluation (model accuracy)
- Architecture diagram updated to match what's actually built

## Task 6: CV bullet points file
Create docs/cv_bullets.md with the final CV bullet points for this project.
Each bullet must:
- Reference a specific, verifiable, real number
- Name the technology used
- Describe the outcome or impact
- Be under 2 lines

Format:
▸ Built a Go REST + WebSocket API (Chi + pgx) serving real-time football
  match predictions; achieved X req/s at p99 Xms under 100 concurrent users
  (k6 load test).

▸ Implemented Rust/ONNX inference engine (tract-onnx) achieving p99 latency
  of Xms for XGBoost predictions — Xx faster than Python/sklearn baseline
  (Criterion benchmark).

▸ Trained XGBoost ensemble on StatsBomb open football dataset (X matches,
  Y features); X% test accuracy with time-series cross-validation; exported
  to ONNX for cross-language serving.

▸ Containerised full stack (Go API, Rust inference, PostgreSQL, Prometheus,
  Grafana) with Docker Compose; deployed API to Railway with live endpoint.

▸ Established GitHub Actions CI for Go (coverage gate: 75%) and Rust
  (clippy + cargo test); 80%+ test coverage across API layer.

Fill in the X values from your actual benchmark results.

## Commit sequence:
feat(infra): add docker-compose with full stack health checks
feat(infra): add Prometheus config scraping api and inference
feat(infra): add Grafana dashboard with latency and throughput panels
feat(infra): add k6 load test script with 100 concurrent users
docs: add deployment guide for Railway
docs: update README with live demo URL, badges, and real benchmarks
docs: add cv_bullets.md with verified performance numbers
```

---

## HOW TO USE THESE PROMPTS

1. Open Cursor in Agent mode (or Claude Code in your terminal).
2. Paste the **MASTER CONTEXT** first, then the **Phase prompt** you're on.
3. Let the agent run. Review every file before committing.
4. Run the tests yourself: `go test ./...` and `cargo test` must pass locally.
5. Only move to the next phase when the current phase's CI is green.

**Never skip a phase. The phases build on each other.**

Phase 1 → Phase 2 → Phase 3A → Phase 3B → Phase 4

If the agent produces placeholder code or TODOs, paste this follow-up:

```
The code you wrote has TODOs / stubs. I need real working implementation,
not placeholders. Please complete every function fully. If a function
depends on something not yet built, implement a minimal stub that compiles
and has a comment explaining what it will call — but the function itself
must be real Go / Rust, not a comment or panic!("todo").
```
