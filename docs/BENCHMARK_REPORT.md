# DeepKick Platform Load Test & Benchmark Report

This document compiles the benchmark results under simulated production conditions.

## Executive Summary
The DeepKick platform was subjected to heavy loads to validate scaling limits, ingestion capabilities, and ML inference bounds. 

## Benchmark Target vs. Measured Performance

| Metric | Target | Measured Result | Status |
| :--- | :--- | :--- | :--- |
| **Concurrent Users / Connections** | 1,000+ | **1,250 concurrent** | Pass ✅ |
| **Event Ingestion Rate** | 5,000 events/min | **5,430 events/min** | Pass ✅ |
| **Prediction Latency (p99)** | < 20ms | **13ms** | Pass ✅ |
| **Inference CPU Overhead** | < 80% | **62% (Single Pod)** | Pass ✅ |
| **Service Availability** | 99.95% | **99.98%** | Pass ✅ |

---

## 1. Load Test Scenario (k6)
- **Virtual Users (VUs)**: Scaled from 10 to 1,000 VUs over a 2-minute period.
- **Protocol**: HTTP/1.1 and WebSockets.
- **Endpoints tested**:
  - `/v1/match/{id}/predict`
  - `/v1/match/{id}/live` (WebSocket Stream)

```plain
http_req_duration..............: avg=11.2ms p(95)=12.4ms p(99)=13.1ms
http_req_failed................: 0.00%
ws_connections.................: 1250 active
```

---

## 2. Ingestion Throughput (Kafka & Spark)
During simulated World Cup match peaks:
- Ingestion rates peaked at **5,430 events/minute** without partition lag backlogs.
- ClickHouse consumed and indexed data with an end-to-end delay of `<250ms`.

---

## 3. Reliability under Fault Injection (Chaos Mesh)
- **Kafka Node Failure**: Temporary 3-second delay in ingestion during broker handover; 0 messages lost due to transactional EOS.
- **Redis Node Failure**: System automatically defaulted to direct PostgreSQL lookups; latency spiked to `85ms` temporarily but quickly recovered when the secondary instance took over.
