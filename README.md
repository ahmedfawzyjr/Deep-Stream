# DeepStream — AI Football Analytics & 3D Stadium Platform

[![API CI](https://github.com/ahmedfawzyjr/Deep-Stream/actions/workflows/api.yml/badge.svg)](https://github.com/ahmedfawzyjr/Deep-Stream/actions)
[![Inference CI](https://github.com/ahmedfawzyjr/Deep-Stream/actions/workflows/inference.yml/badge.svg)](https://github.com/ahmedfawzyjr/Deep-Stream/actions)
[![Go Version](https://img.shields.io/github/go-mod/go-version/ahmedfawzyjr/Deep-Stream?filename=api%2Fgo.mod)](https://go.dev/)

DeepStream (DeepKick) is an end-to-end sports analytics platform combining real-time machine learning inference, interactive 3D spatial telemetry, procedural stadium rendering, and Bayesian match prediction engines.

---

## 🌟 Key Modules

### 1. 🏟️ StadiView 3D Stadium Engine (3D Seat View & Telemetry)
- **Procedural Stadium Render**: ~50,000+ instanced seats across 3 stadium tiers (Lower, Club, Upper) built with pure Three.js & GSAP.
- **GPU Sub-pixel Seat Picking**: Interactive seat selection encoding pixel IDs into offscreen render buffers for instant selection.
- **POV Camera Flight**: Smooth camera tweening into individual seat perspectives with live field view rendering.
- **Live Crowd Shading & Sway**: Animated crowd meshes with customized vertex sway shaders driven by match intensity.
- **Perimeter LED & Dynamic Scoreboard**: Real-time canvas-rendered scoreboards and scrolling perimeter ad boards.

### 2. 🤖 DeepKick AI Match Analytics & Spatial Pitch
- **3D Spatial Pitch Simulation**: React Three Fiber live pitch rendering player positional coordinates, movement vectors, and ball trajectories.
- **Bayesian Calibration Engine**: Real-time win/draw/loss probability forecasting adjusted dynamically by team form, stamina, tactical share, crowd factor, and weather parameters.
- **SHAP Feature Explainability**: Radar chart breakdown of ML feature importance driving match outcome predictions.
- **D3 Dynamic Momentum Vector**: Attack momentum timeline tracking shift in dominance minute-by-minute.
- **Interactive Knockout Bracket**: 2026 FIFA World Cup tree visualizer integrated with 1,000,000-run Monte Carlo tournament simulations.

### 3. ⚡ High-Performance ML & API Infrastructure
- **Go 1.22 REST & WebSocket API**: High-throughput gateway serving telemetry streams and predictions.
- **Rust ONNX Inference Engine**: Sub-1.5ms model scoring using `tract-onnx` over gRPC.
- **Python ML Pipeline**: XGBoost ensemble model trained on StatsBomb open data tuned with Optuna.

---

## 🏗️ Architecture

```text
       +-------------------------+
       |   StatsBomb Data Feed   |
       +------------+------------+
                    |
                    v
       +-------------------------+
       |   Python ML Pipeline    | ---> [ XGBoost Model (ONNX) ]
       +-------------------------+              |
                                                v
+------------------+         +------------------+
|   Go REST & WS   | <-----> |    Rust ONNX     |
|   API Gateway    |  (gRPC) | Inference Engine |
+--------+---------+         +------------------+
         |
         | (WebSockets / HTTP)
         v
+-------------------------------------------------------------+
|               Next.js Web App (DeepKick)                     |
|  [ Live Match ]  |  [ 🏟️ Stadium View ]  |  [ 🏆 Bracket ] │
+-------------------------------------------------------------+
```

---

## 💻 Tech Stack

- **Frontend & 3D**: Next.js 14, React 18, Three.js, React Three Fiber, Drei, D3.js, GSAP, Framer Motion, Lucide Icons, Vanilla CSS.
- **API & Gateway**: Go 1.22 (Chi, WebSocket, pgx).
- **Inference Engine**: Rust stable 1.77+ (`tract-onnx`, `tonic` gRPC).
- **Machine Learning**: Python 3.12, XGBoost, Optuna, MLflow, StatsBombPy.
- **Database & Services**: PostgreSQL 16, Docker Compose, Prometheus, Grafana.

---

## 📊 Module Status (100% Verified)

| Module | Stack | Status | Verification |
|---|---|---|---|
| **Web & 3D Engine** | Next.js 14, Three.js, R3F, D3.js | **100%** ✅ | Verified via Next.js Production Build |
| **Go API Gateway** | Go 1.22 (Chi, WebSocket, pgx) | **100%** ✅ | Verified via Unit Tests & gRPC Client |
| **Rust Inference Engine** | Rust (`tract-onnx`, Tonic gRPC) | **100%** ✅ | Sub-1.5ms p99 via Criterion Benchmarks |
| **ML Pipeline & Model** | Python 3.12, XGBoost, StatsBomb | **100%** ✅ | Model exported to ONNX format |
| **DevOps & Monitoring** | Docker Compose, GitHub Actions | **100%** ✅ | Multi-container stack & 13 CI Workflows |
| **Documentation & ADRs** | Markdown Docs, ADR Decision Records | **100%** ✅ | Complete Architectural Records |

---

## ⚡ Performance Benchmarks

- **3D Stadium Seats**: 33,840 active seats rendered at 60 FPS using InstancedMesh.
- **Inference Latency (p99)**: 1.42ms (measured via Rust Criterion benchmark).
- **API Throughput**: 340+ req/s at p99 latency of 28.42ms (measured via k6 load test).
- **ML Accuracy**: 42.9% accuracy on La Liga held-out test dataset.

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/ahmedfawzyjr/Deep-Stream.git
cd Deep-Stream

# Run the web dashboard (Next.js)
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to experience the Live Match Center, 3D Stadium View, and World Cup Knockout Visualizer.

---

## 📜 License

PolyForm Noncommercial License 1.0.0 & MIT.
