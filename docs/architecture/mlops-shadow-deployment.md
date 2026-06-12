# MLOps: Shadow Deployments & A/B Testing

This document details the ML deployment strategies implemented in DeepKick to safely release and validate models under production loads.

## 1. Shadow Deployment (Traffic Mirroring)
Before promoting a new prediction model (e.g., `model_v2_transformer`) to production, we validate its compute footprint and predictions using **Shadow Deployment**.

### Traffic Flow Architecture
```mermaid
graph TD
    Client([User Client]) --> Gateway[Envoy API Gateway]
    Gateway -->|90% HTTP Output| ProductionModel[Go API & Model v1]
    Gateway -->|Mirrored Async Copy| ShadowModel[Shadow Model Service v2]
    
    ProductionModel -->|Return Output| Client
    ShadowModel -->|Log Predictions (No Client Output)| ClickHouse[(ClickHouse DB)]
```

### Key Parameters
- **Zero Client Impact**: Shadow model latency or runtime failures do not affect user requests.
- **Verification**: Outputs of the production model and shadow model are joined in ClickHouse to compare accuracy and metric drift.

---

## 2. A/B Testing (Split Traffic)
Once a model passes the shadow stage, we shift to A/B testing using Istio virtual service rules:
- **Variant A (Control)**: 90% of requests routed to `v1_production`.
- **Variant B (Treatment)**: 10% of requests routed to `v2_canary`.
- **Metrics Evaluated**: Calibration (Brier Score) and prediction confidence.
