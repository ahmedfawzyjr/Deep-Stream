# FinOps Cost Model & Unit Economics

This document details the cost metric equations and resource models to track the financial efficiency of DeepKick's real-time analytics system.

---

## 1. Cost per Prediction ($C_{\text{prediction}}$)
Quantifies the server computing costs required to generate a single match prediction output.

### Equation
$$C_{\text{prediction}} = \frac{R_{\text{GKE GPU}} + R_{\text{API CPU}} + R_{\text{Redis}}}{\text{Total Predictions Served}}$$

### Components
- $R_{\text{GKE GPU}}$: Cost of NVIDIA T4 Spot Instances running Rust inference servers ($0.11/hour).
- $R_{\text{API CPU}}$: Cost of API node pools.
- $R_{\text{Redis}}$: In-memory cache node cost.
- **Benchmark Target**: **<$0.0001 per prediction**.

---

## 2. Cost per Match ($C_{\text{match}}$)
Quantifies the data ingestion and storage fees needed to stream and index an entire football match's real-time data.

### Equation
$$C_{\text{match}} = \frac{R_{\text{Kafka Ingest}} + R_{\text{Spark Ingestion}} + R_{\text{ClickHouse Storage}}}{\text{Total Live Matches Streamed}}$$

### Components
- $R_{\text{Kafka Ingest}}$: Broker compute and egress fees.
- $R_{\text{ClickHouse Storage}}$: Analytics storage disk cost.
- **Benchmark Target**: **<$0.05 per match**.

---

## 3. Cost per Active User ($C_{\text{user}}$)
Quantifies the monthly server maintenance and websocket stream keep-alive costs per user session.

### Equation
$$C_{\text{user}} = \frac{R_{\text{Load Balancer}} + R_{\text{Websocket Egress}} + R_{\text{Keycloak Auth}}}{\text{Monthly Active Users (MAU)}}$$

### Components
- $R_{\text{Load Balancer}}$: Global Ingress rules billing.
- $R_{\text{Websocket Egress}}$: Bandwidth egress fees.
- **Benchmark Target**: **<$0.02 per user/month**.
