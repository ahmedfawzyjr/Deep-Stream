# DeepStream — Complete Improvement Plan
## From AI-Generated Template → Credible FAANG-Level Portfolio Project

> **Goal:** Transform the repo into a project where every claim is verifiable, every metric is measured, and every line of code is yours.

---

## The Core Problem (Honest Assessment)

| Issue | Current State | Target State |
|---|---|---|
| README honesty | Contains "Why This Gets You Into FAANG" section | Removed. Honest project description |
| Language split | TypeScript 71%, Rust 4%, Go 5% | Go 25%, Rust 18%, Python 15%, TS 30%, Dart 12% |
| Performance claims | "10M+ predictions/day", "99.9% uptime" (unverified) | All metrics measured + linked to benchmark output |
| Git history | 23 commits, no meaningful progression | 80–120 commits with logical feature progression |
| Tests | Unknown / likely none | 75%+ coverage, CI badge in README |
| Live demo | Vercel deploy of a Next.js frontend only | Working API endpoint + Flutter app |
| ML model | Described but not trained | Real XGBoost model trained on StatsBomb open data |
| Rust engine | 4% of codebase, claims GPU/sub-100ms | Real tract-onnx inference with Criterion benchmarks |

---

## Phase 1 — Credibility & Honesty Fix
### Timeline: Week 1–2 | No code required | Do this TODAY

---

### 1.1 README Complete Rewrite

**Delete these sections entirely:**
- "🎯 Why This Project Gets You Into FAANG"
- "🚀 Why This Gets You Hired"
- "Interview Talking Points" with pre-scripted quotes
- All "Verified 🟢" metrics that were never measured
- "10M+ predictions/day" (projected, not real)

**New README structure:**

```markdown
# DeepStream — Sports Analytics & ML Prediction Platform

A full-stack sports analytics system built to explore distributed systems,
real-time data pipelines, and ML inference at the edge.

## What this project actually does
- Ingests football match data from StatsBomb open dataset
- Trains an XGBoost ensemble model to predict match outcomes
- Serves predictions via a Go REST + WebSocket API
- Runs a Rust/ONNX inference engine for low-latency scoring
- Displays live predictions on a React dashboard and Flutter mobile app

## Architecture
[honest diagram — not aspirational]

## Tech Stack
[list only what is actually implemented]

## Real benchmarks
- Inference latency (p99): Xms [link to Criterion output]
- API throughput: X req/s [link to k6 load test result]

## Status
| Component | Status |
|---|---|
| Go API | ✅ Working |
| Rust inference | ✅ Working |
| ML model | ✅ Trained on StatsBomb data |
| Flutter app | 🚧 In progress |
| Kafka pipeline | 📋 Planned |

## Running locally
[actual working docker-compose instructions]
```

---

### 1.2 Repo Cleanup

**Files to delete or empty:**
```
# These are template/placeholder files — verify and clean
features/          → delete if empty or AI-generated stubs
notebooks/         → keep ONLY if they contain real training code
scripts/           → keep only scripts that actually run
```

**Files to add immediately:**
```
docs/
  decisions/
    001-why-go-for-api.md          ← ADR: why Go over Python for API
    002-why-rust-for-inference.md  ← ADR: why Rust over Python for serving
    003-data-source-choice.md      ← ADR: why StatsBomb open data
  architecture/
    system-overview.png            ← real diagram (draw.io or Excalidraw)
CONTRIBUTING.md                    ← how to run the project locally
.env.example                       ← env vars with descriptions
```

**ADR format (Architecture Decision Record):**
```markdown
# ADR-001: Why Go for the Prediction API

## Status: Accepted

## Context
We need a high-throughput API layer to serve ML predictions with 
low latency. Options considered: Python (FastAPI), Go (Gin/Chi), Node.js.

## Decision
Go with Chi router.

## Reasons
- Goroutines handle WebSocket concurrency better than async Python
- Compiled binary — no runtime overhead, easy Docker image (~15MB vs 500MB)
- Type safety catches bugs at compile time
- Strong standard library for HTTP and testing

## Consequences
- Less ML-friendly than Python (model training stays in Python)
- Team needs Go knowledge (acceptable for this project scope)
```

---

### 1.3 Git History Strategy

Your current 23 commits look like a bulk upload. Fix this going forward by committing incrementally as you build each feature. Each commit should be one logical unit:

```bash
# Good commit messages (Conventional Commits format)
feat(api): add match prediction endpoint
feat(api): add WebSocket live match feed
test(api): add handler unit tests — 82% coverage
feat(inference): implement ONNX model loading in Rust
bench(inference): add Criterion benchmarks for prediction latency
feat(ml): train XGBoost model on StatsBomb open dataset
docs(adr): add ADR-001 why Go for API layer
ci: add GitHub Actions pipeline with go test and cargo test
fix(api): handle concurrent WebSocket disconnections gracefully
perf(inference): batch predictions reduce p99 from 18ms to 8ms
```

**Target: 80–120 meaningful commits by end of Phase 4.**

---

## Phase 2 — Real Go API
### Timeline: Week 2–5 | Core credibility builder | ~1,200 lines of real Go

---

### 2.1 Project Structure

```
api/
├── cmd/
│   └── server/
│       └── main.go                 ← entry point
├── internal/
│   ├── config/
│   │   └── config.go              ← env-based config
│   ├── handler/
│   │   ├── match_handler.go       ← HTTP handlers
│   │   ├── match_handler_test.go  ← unit tests
│   │   ├── ws_handler.go          ← WebSocket handler
│   │   └── ws_handler_test.go
│   ├── repository/
│   │   ├── match_repo.go          ← DB layer (interface + impl)
│   │   └── match_repo_test.go     ← DB tests with testcontainers
│   ├── service/
│   │   ├── prediction_service.go  ← business logic
│   │   └── prediction_service_test.go
│   └── middleware/
│       ├── auth.go                ← JWT middleware
│       ├── ratelimit.go           ← token bucket rate limiter
│       └── logging.go             ← structured logging (slog)
├── migrations/
│   ├── 001_create_matches.sql
│   ├── 002_create_predictions.sql
│   └── 003_create_users.sql
├── Makefile
├── Dockerfile
└── go.mod
```

---

### 2.2 Database Schema (PostgreSQL)

```sql
-- migrations/001_create_matches.sql
CREATE TABLE matches (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team   VARCHAR(100) NOT NULL,
    away_team   VARCHAR(100) NOT NULL,
    competition VARCHAR(100) NOT NULL,
    match_date  TIMESTAMPTZ NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    home_score  INT,
    away_score  INT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- migrations/002_create_predictions.sql
CREATE TABLE predictions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id     UUID NOT NULL REFERENCES matches(id),
    home_win_prob FLOAT NOT NULL,
    draw_prob     FLOAT NOT NULL,
    away_win_prob FLOAT NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    latency_ms    FLOAT NOT NULL,    -- track actual inference time
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_predictions_match_id ON predictions(match_id);
```

---

### 2.3 Go Dependencies (go.mod)

```go
module github.com/ahmedfawzyjr/deep-stream

go 1.22

require (
    github.com/go-chi/chi/v5 v5.0.12
    github.com/go-chi/cors v1.2.1
    github.com/go-chi/httprate v0.9.0       // rate limiting
    github.com/jackc/pgx/v5 v5.5.5          // PostgreSQL driver
    github.com/gorilla/websocket v1.5.1
    github.com/golang-jwt/jwt/v5 v5.2.1
    github.com/prometheus/client_golang v1.19.0
    github.com/stretchr/testify v1.9.0
    github.com/testcontainers/testcontainers-go v0.29.1
    golang.org/x/exp v0.0.0-20240325151524
    log/slog v0.0.0  // stdlib in Go 1.21+
)
```

---

### 2.4 Core Handler Implementation

```go
// internal/handler/match_handler.go
package handler

import (
    "encoding/json"
    "net/http"
    "github.com/go-chi/chi/v5"
    "github.com/ahmedfawzyjr/deep-stream/internal/service"
)

type MatchHandler struct {
    predSvc *service.PredictionService
}

func NewMatchHandler(predSvc *service.PredictionService) *MatchHandler {
    return &MatchHandler{predSvc: predSvc}
}

// GET /v1/matches/{id}/predict
func (h *MatchHandler) Predict(w http.ResponseWriter, r *http.Request) {
    matchID := chi.URLParam(r, "id")

    pred, err := h.predSvc.Predict(r.Context(), matchID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(pred)
}
```

```go
// internal/service/prediction_service.go
package service

import (
    "context"
    "time"
    "github.com/ahmedfawzyjr/deep-stream/internal/repository"
)

type PredictionService struct {
    matchRepo   *repository.MatchRepository
    inferClient InferenceClient  // interface → easy to mock in tests
}

type Prediction struct {
    MatchID      string    `json:"match_id"`
    HomeWinProb  float64   `json:"home_win_prob"`
    DrawProb     float64   `json:"draw_prob"`
    AwayWinProb  float64   `json:"away_win_prob"`
    ModelVersion string    `json:"model_version"`
    LatencyMs    float64   `json:"latency_ms"`
    CreatedAt    time.Time `json:"created_at"`
}

func (s *PredictionService) Predict(ctx context.Context, matchID string) (*Prediction, error) {
    match, err := s.matchRepo.GetByID(ctx, matchID)
    if err != nil {
        return nil, err
    }

    features := extractFeatures(match)

    start := time.Now()
    probs, err := s.inferClient.Infer(ctx, features)
    if err != nil {
        return nil, err
    }
    latency := time.Since(start).Seconds() * 1000  // ms

    return &Prediction{
        MatchID:     matchID,
        HomeWinProb: probs[0],
        DrawProb:    probs[1],
        AwayWinProb: probs[2],
        LatencyMs:   latency,
    }, nil
}
```

---

### 2.5 WebSocket Handler

```go
// internal/handler/ws_handler.go
package handler

import (
    "log/slog"
    "net/http"
    "sync"
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool { return true },
}

type Hub struct {
    clients    map[string]map[*websocket.Conn]bool  // matchID → connections
    mu         sync.RWMutex
    broadcast  chan BroadcastMsg
}

type BroadcastMsg struct {
    MatchID string
    Payload []byte
}

func NewHub() *Hub {
    h := &Hub{
        clients:   make(map[string]map[*websocket.Conn]bool),
        broadcast: make(chan BroadcastMsg, 256),
    }
    go h.run()
    return h
}

func (h *Hub) run() {
    for msg := range h.broadcast {
        h.mu.RLock()
        conns := h.clients[msg.MatchID]
        h.mu.RUnlock()

        for conn := range conns {
            if err := conn.WriteMessage(websocket.TextMessage, msg.Payload); err != nil {
                slog.Error("ws write error", "err", err)
                h.remove(msg.MatchID, conn)
            }
        }
    }
}

// GET /v1/ws/matches/{id}/live
func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request) {
    matchID := chi.URLParam(r, "id")
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        return
    }
    h.add(matchID, conn)
    defer h.remove(matchID, conn)

    for {
        if _, _, err := conn.ReadMessage(); err != nil {
            break
        }
    }
}
```

---

### 2.6 Unit Tests (Real ones)

```go
// internal/handler/match_handler_test.go
package handler_test

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

// Mock the service
type MockPredictionService struct{ mock.Mock }

func (m *MockPredictionService) Predict(ctx context.Context, matchID string) (*service.Prediction, error) {
    args := m.Called(ctx, matchID)
    return args.Get(0).(*service.Prediction), args.Error(1)
}

func TestPredict_Success(t *testing.T) {
    mockSvc := new(MockPredictionService)
    mockSvc.On("Predict", mock.Anything, "match-123").Return(&service.Prediction{
        MatchID:     "match-123",
        HomeWinProb: 0.55,
        DrawProb:    0.25,
        AwayWinProb: 0.20,
    }, nil)

    h := handler.NewMatchHandler(mockSvc)
    req := httptest.NewRequest("GET", "/v1/matches/match-123/predict", nil)
    rr := httptest.NewRecorder()

    h.Predict(rr, req)

    assert.Equal(t, http.StatusOK, rr.Code)
    var pred service.Prediction
    json.NewDecoder(rr.Body).Decode(&pred)
    assert.InDelta(t, 0.55, pred.HomeWinProb, 0.001)
    mockSvc.AssertExpectations(t)
}

func TestPredict_MatchNotFound(t *testing.T) {
    mockSvc := new(MockPredictionService)
    mockSvc.On("Predict", mock.Anything, "bad-id").
        Return((*service.Prediction)(nil), repository.ErrNotFound)

    h := handler.NewMatchHandler(mockSvc)
    req := httptest.NewRequest("GET", "/v1/matches/bad-id/predict", nil)
    rr := httptest.NewRecorder()
    h.Predict(rr, req)

    assert.Equal(t, http.StatusNotFound, rr.Code)
}
```

---

### 2.7 CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/api.yml
name: API CI

on:
  push:
    paths: ['api/**']
  pull_request:
    paths: ['api/**']

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: deepstream_test
        ports: ['5432:5432']

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
          cache: true

      - name: Run migrations
        run: make migrate-test
        working-directory: api

      - name: Run tests with coverage
        run: go test ./... -coverprofile=coverage.out -race
        working-directory: api

      - name: Check coverage threshold (75%)
        run: |
          COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}' | tr -d '%')
          if (( $(echo "$COVERAGE < 75" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 75% threshold"
            exit 1
          fi

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
```

---

## Phase 3 — Real ML Model + Rust Inference Engine
### Timeline: Week 5–9 | The FAANG differentiator

---

### 3.1 Data Source: StatsBomb Open Data (Free & Real)

```bash
# Install statsbombpy
pip install statsbombpy

# This gives you access to real professional football match data
```

```python
# ml/data/fetch_data.py
from statsbombpy import sb
import pandas as pd

def fetch_training_data():
    """Fetch real match data from StatsBomb open dataset."""
    
    # Get all available competitions
    competitions = sb.competitions()
    
    # Use La Liga (has the most open data)
    matches = sb.matches(competition_id=11, season_id=90)
    
    all_features = []
    for _, match in matches.iterrows():
        events = sb.events(match_id=match['match_id'])
        features = extract_features(match, events)
        all_features.append(features)
    
    return pd.DataFrame(all_features)

def extract_features(match, events):
    """Extract numerical features from a match."""
    shots = events[events['type'] == 'Shot']
    passes = events[events['type'] == 'Pass']
    
    return {
        'match_id': match['match_id'],
        'home_shots': len(shots[shots['team'] == match['home_team']]),
        'away_shots': len(shots[shots['team'] == match['away_team']]),
        'home_shots_on_target': len(shots[
            (shots['team'] == match['home_team']) & 
            (shots['shot_outcome'] == 'On Target')
        ]),
        'home_pass_accuracy': passes[
            passes['team'] == match['home_team']
        ]['pass_outcome'].isna().mean(),
        # ... 20+ more features
        'result': get_result(match),  # 0=away win, 1=draw, 2=home win
    }
```

---

### 3.2 Model Training Pipeline

```python
# ml/train.py
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import log_loss, accuracy_score
import onnx
import skl2onnx
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import mlflow
import mlflow.xgboost

FEATURE_COLS = [
    'home_shots', 'away_shots',
    'home_shots_on_target', 'away_shots_on_target',
    'home_pass_accuracy', 'away_pass_accuracy',
    'home_possession', 'away_possession',
    'home_xg', 'away_xg',
    'home_form_last5',       # win rate in last 5 matches
    'away_form_last5',
    'home_goals_scored_avg', # avg goals scored last 5
    'away_goals_scored_avg',
    'head_to_head_home_wins',
]

def train():
    mlflow.set_experiment("deepstream-match-prediction")
    
    with mlflow.start_run():
        df = pd.read_parquet("data/processed/features.parquet")
        X = df[FEATURE_COLS]
        y = df['result']  # 0, 1, 2

        # Time-series cross validation (don't leak future data)
        tscv = TimeSeriesSplit(n_splits=5)
        
        model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            use_label_encoder=False,
            eval_metric='mlogloss',
            random_state=42,
        )

        cv_scores = []
        for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
            X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
            
            model.fit(X_train, y_train,
                     eval_set=[(X_val, y_val)],
                     early_stopping_rounds=20,
                     verbose=False)
            
            preds = model.predict_proba(X_val)
            score = log_loss(y_val, preds)
            cv_scores.append(score)
            print(f"Fold {fold+1} log loss: {score:.4f}")

        print(f"Mean CV log loss: {np.mean(cv_scores):.4f} ± {np.std(cv_scores):.4f}")
        
        mlflow.log_metric("mean_cv_log_loss", np.mean(cv_scores))
        mlflow.log_metric("cv_std", np.std(cv_scores))
        
        # Export to ONNX for Rust inference
        initial_type = [('float_input', FloatTensorType([None, len(FEATURE_COLS)]))]
        onnx_model = convert_sklearn(model, initial_types=initial_type)
        
        with open("models/match_predictor_v1.onnx", "wb") as f:
            f.write(onnx_model.SerializeToString())
        
        print("Model exported to ONNX.")
        mlflow.xgboost.log_model(model, "model")

if __name__ == "__main__":
    train()
```

---

### 3.3 Rust Inference Engine (tract-onnx)

```
inference/
├── Cargo.toml
├── src/
│   ├── main.rs           ← gRPC server entry point
│   ├── engine.rs         ← ONNX loading + inference
│   ├── features.rs       ← feature struct + validation
│   └── metrics.rs        ← Prometheus metrics
├── benches/
│   └── inference_bench.rs ← Criterion benchmarks
└── proto/
    └── inference.proto    ← gRPC service definition
```

```toml
# inference/Cargo.toml
[package]
name = "deepstream-inference"
version = "0.1.0"
edition = "2021"

[dependencies]
tract-onnx = "0.21"
tonic = "0.11"           # gRPC
tokio = { version = "1", features = ["full"] }
prometheus = "0.13"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
anyhow = "1"
tracing = "0.1"
tracing-subscriber = "0.3"

[dev-dependencies]
criterion = { version = "0.5", features = ["html_reports"] }

[[bench]]
name = "inference_bench"
harness = false
```

```rust
// inference/src/engine.rs
use anyhow::Result;
use tract_onnx::prelude::*;
use std::sync::Arc;

pub struct InferenceEngine {
    model: Arc<TypedRunnableModel<TypedModel>>,
    feature_count: usize,
}

impl InferenceEngine {
    pub fn load(model_path: &str) -> Result<Self> {
        let model = tract_onnx::onnx()
            .model_for_path(model_path)?
            .into_optimized()?
            .into_runnable()?;
        
        Ok(Self {
            model: Arc::new(model),
            feature_count: 15,  // must match training
        })
    }

    pub fn predict(&self, features: &[f32]) -> Result<Probabilities> {
        assert_eq!(features.len(), self.feature_count,
            "Expected {} features, got {}", self.feature_count, features.len());

        let input = tract_ndarray::Array2::from_shape_vec(
            (1, self.feature_count),
            features.to_vec()
        )?.into();

        let result = self.model.run(tvec!(Tensor::from(input)))?;
        
        let probs = result[0]
            .to_array_view::<f32>()?
            .as_slice()
            .expect("output tensor slice")
            .to_vec();

        Ok(Probabilities {
            away_win: probs[0],
            draw:     probs[1],
            home_win: probs[2],
        })
    }
}

#[derive(Debug, serde::Serialize)]
pub struct Probabilities {
    pub away_win: f32,
    pub draw:     f32,
    pub home_win: f32,
}
```

---

### 3.4 Criterion Benchmarks (Real Measured Latency)

```rust
// inference/benches/inference_bench.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use deepstream_inference::engine::InferenceEngine;

fn bench_single_prediction(c: &mut Criterion) {
    let engine = InferenceEngine::load("../models/match_predictor_v1.onnx")
        .expect("model must exist for benchmarks");

    let features = vec![
        8.0, 6.0,    // home/away shots
        4.0, 2.0,    // shots on target
        0.85, 0.78,  // pass accuracy
        55.0, 45.0,  // possession %
        1.8, 0.9,    // expected goals
        0.6, 0.4,    // form last 5
        1.5, 1.1,    // goals avg
        3.0,         // h2h home wins
    ];

    c.bench_function("single_prediction_p99", |b| {
        b.iter(|| {
            engine.predict(black_box(&features)).unwrap()
        })
    });
}

fn bench_batch_predictions(c: &mut Criterion) {
    let engine = InferenceEngine::load("../models/match_predictor_v1.onnx").unwrap();
    let features = vec![1.0_f32; 15];

    let mut group = c.benchmark_group("batch_size");
    for size in [1, 10, 50, 100].iter() {
        group.bench_with_input(BenchmarkId::from_parameter(size), size, |b, &size| {
            let batch: Vec<Vec<f32>> = (0..size).map(|_| features.clone()).collect();
            b.iter(|| {
                batch.iter().map(|f| engine.predict(black_box(f)).unwrap()).collect::<Vec<_>>()
            })
        });
    }
    group.finish();
}

criterion_group!(benches, bench_single_prediction, bench_batch_predictions);
criterion_main!(benches);
```

**Run benchmarks:**
```bash
cd inference && cargo bench
# Criterion generates HTML report at target/criterion/report/index.html
# Screenshot this and put it in docs/ — THIS is your evidence
```

---

### 3.5 Rust CI Pipeline

```yaml
# .github/workflows/inference.yml
name: Inference CI

on:
  push:
    paths: ['inference/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy, rustfmt

      - name: Cache cargo
        uses: Swatinem/rust-cache@v2
        with:
          workspaces: inference

      - name: Clippy (no warnings)
        run: cargo clippy -- -D warnings
        working-directory: inference

      - name: Tests
        run: cargo test
        working-directory: inference

      - name: Run benchmarks (smoke test only in CI)
        run: cargo bench --no-run
        working-directory: inference
```

---

## Phase 4 — Polish, Deploy & Document
### Timeline: Week 9–11 | Makes it 10/10

---

### 4.1 Docker Compose (Actually Working)

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: deepstream
      POSTGRES_USER: deepstream
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
      - ./api/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U deepstream']
      interval: 5s
      retries: 5

  inference:
    build: ./inference
    ports:
      - "50051:50051"
    volumes:
      - ./models:/models:ro
    environment:
      MODEL_PATH: /models/match_predictor_v1.onnx
    healthcheck:
      test: ['CMD', 'grpc_health_probe', '-addr=:50051']

  api:
    build: ./api
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://deepstream:${DB_PASSWORD}@postgres:5432/deepstream
      INFERENCE_ADDR: inference:50051
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      inference:
        condition: service_healthy

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./infra/prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    volumes:
      - ./infra/grafana/dashboards:/etc/grafana/provisioning/dashboards
    depends_on:
      - prometheus

volumes:
  pg_data:
```

---

### 4.2 Prometheus Metrics in Go API

```go
// internal/metrics/metrics.go
package metrics

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    PredictionsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "deepstream_predictions_total",
            Help: "Total number of predictions made",
        },
        []string{"status"},
    )

    InferenceLatency = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "deepstream_inference_latency_ms",
            Help:    "Inference latency in milliseconds",
            Buckets: []float64{1, 2, 5, 10, 20, 50, 100},
        },
        []string{"model_version"},
    )

    ActiveWebSockets = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "deepstream_active_websockets",
            Help: "Number of active WebSocket connections",
        },
    )
)
```

**Take a screenshot of the Grafana dashboard showing real metrics — this goes in the README.**

---

### 4.3 Deployment (Railway — Free Tier)

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Deploy the Go API
railway new deepstream-api
railway up --service api

# Your API will be live at:
# https://deepstream-api.railway.app
```

**The live URL goes in your README and CV.**

---

### 4.4 Load Testing (k6) — Real Throughput Numbers

```javascript
// infra/load-test/api_load_test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(99)<200'],  // 99% under 200ms
        http_req_failed: ['rate<0.01'],    // <1% errors
    },
};

export default function () {
    const res = http.get('https://deepstream-api.railway.app/v1/matches');
    check(res, { 'status 200': (r) => r.status === 200 });
    sleep(0.1);
}
```

```bash
k6 run infra/load-test/api_load_test.js
# Save the output as docs/benchmarks/load-test-results.txt
# This is your REAL "X req/s" number for the CV
```

---

### 4.5 Final README Badges

```markdown
# DeepStream

[![API CI](https://github.com/ahmedfawzyjr/Deep-Stream/actions/workflows/api.yml/badge.svg)](...)
[![Inference CI](https://github.com/ahmedfawzyjr/Deep-Stream/actions/workflows/inference.yml/badge.svg)](...)
[![Coverage](https://codecov.io/gh/ahmedfawzyjr/Deep-Stream/branch/main/graph/badge.svg)](...)
[![Go Version](https://img.shields.io/github/go-mod/go-version/ahmedfawzyjr/Deep-Stream)](...)
```

---

## CV Bullets — Before & After

### OLD (delete these):
> *"Designed and implemented a fault-tolerant multi-modal AI inference platform capable of processing real-time video and audio streams with sub-100ms latency."*

> *"Built a distributed event-driven architecture using Apache Kafka, Redis Streams, and Go-based ingestion services with rate limiting, circuit breakers, and automatic failover mechanisms."*

### NEW (honest & verifiable):
> *"Built a Go REST + WebSocket API serving real-time football match predictions; designed repository + service layered architecture with 80%+ test coverage and GitHub Actions CI."*

> *"Implemented a Rust/ONNX inference engine using tract-onnx achieving p99 prediction latency of Xms (measured via Criterion benchmarks) — 3× faster than equivalent Python/FastAPI implementation."*

> *"Trained an XGBoost ensemble model on StatsBomb open football dataset; exported to ONNX; achieved X% accuracy on held-out test set using time-series cross-validation."*

> *"Containerised full stack (Go API, Rust inference, PostgreSQL, Prometheus, Grafana) with Docker Compose; deployed API to Railway with live endpoint."*

---

## Timeline Summary

| Week | Phase | Deliverable |
|---|---|---|
| 1 | Phase 1 | README rewritten, fake metrics removed, ADRs added |
| 2 | Phase 1 | Repo structure cleaned, .env.example, CONTRIBUTING.md |
| 2–3 | Phase 2 | Go API skeleton, DB schema, migrations |
| 3–4 | Phase 2 | All endpoints working, WebSocket handler |
| 4–5 | Phase 2 | Unit tests 80%+, CI pipeline green |
| 5–6 | Phase 3 | StatsBomb data fetched, features extracted |
| 6–7 | Phase 3 | XGBoost model trained, exported to ONNX |
| 7–8 | Phase 3 | Rust engine running, gRPC server working |
| 8–9 | Phase 3 | Criterion benchmarks, Rust CI pipeline |
| 9–10 | Phase 4 | Docker Compose working end-to-end |
| 10 | Phase 4 | Railway deployment live, k6 load test done |
| 10–11 | Phase 4 | Grafana dashboard screenshot, README badges |
| 11 | Phase 4 | CV bullets rewritten with real numbers |

---

## Language Distribution Target

| Language | Current | Target | How |
|---|---|---|---|
| TypeScript | 71% | 30% | Keep web dashboard, nothing more |
| Go | 5% | 25% | Full API layer (Phase 2) |
| Rust | 4% | 18% | Real inference engine (Phase 3) |
| Python | 9% | 15% | ML training pipeline (Phase 3) |
| Dart | 4% | 12% | Flutter app improvements |

---

## What a FAANG Interviewer Will Check (And Find)

| Check | Before | After |
|---|---|---|
| Open the repo | README says "Why This Gets You Into FAANG" 🚩 | Honest description, clear status table ✅ |
| Count commits | 23 bulk commits 🚩 | 90+ incremental feature commits ✅ |
| Check language % | 71% TypeScript, 4% Rust 🚩 | Go 25%, Rust 18% ✅ |
| Run the code | Probably won't work locally 🚩 | `docker-compose up` works in 60 seconds ✅ |
| Check tests | None visible 🚩 | CI badge, 80%+ coverage ✅ |
| Click live demo | Next.js frontend only 🚩 | Working API + live predictions ✅ |
| Ask about latency | "sub-100ms" (unverified) 🚩 | "Xms p99, here's the Criterion report" ✅ |
| Ask about ML | "XGBoost + LSTM + Transformer" 🚩 | "XGBoost on StatsBomb data, here's the notebook" ✅ |
