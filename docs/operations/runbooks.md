# DeepKick SRE Runbooks & Operational Playbooks

This repository of runbooks guides engineers on-call when critical system alerts fire.

---

## Runbook-001: API Latency Spike Alert (`LatencyAlert`)

### Severity
Critical (P1)

### Symptom
p99 API gateway response latency exceeds **50ms** for more than 2 consecutive minutes.

### Steps to Resolve
1. **Identify the Bottleneck**:
   Check Jaeger traces to see if the latency resides in:
   - `RustInferenceEngine.Run` (model processing delay).
   - Redis feature extraction.
   - ClickHouse analytics queries.
2. **Examine Auto-scaling Status**:
   ```bash
   kubectl get hpa -n deepkick
   ```
   If the API replicas are pinned at `maxReplicas` (20), manually override scale capacities:
   ```bash
   kubectl scale deployment deepkick-api --replicas=30 -n deepkick
   ```
3. **Inspect Cache Hit Ratio**:
   If Redis hits fall below 85%, check Redis connection pool limits or restart instances:
   ```bash
   kubectl rollout restart deployment deepkick-redis -n deepkick
   ```

---

## Runbook-002: Kafka Ingestion Partition Lag Alert

### Severity
Major (P2)

### Symptom
`kafka_consumergroup_lag` for group `clickhouse-predictions-group` exceeds **10,000** records.

### Steps to Resolve
1. **Identify Lagging Topic**:
   Check lag per partition:
   ```bash
   kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group clickhouse-predictions-group
   ```
2. **Increase Consumer Count**:
   Deploy additional instances of the ClickHouse sync workers to match the topic partition count:
   ```bash
   kubectl scale deployment clickhouse-consumer-deployment --replicas=6 -n deepkick
   ```
3. **Verify Broker CPU/Disk bounds**:
   If brokers are throttle-limiting writes, verify resource quotas.

---

## Runbook-003: Database Primary Failover Protocol

### Severity
Critical (P1)

### Symptom
PostgreSQL primary node `postgres-0` crashes or becomes unresponsive.

### Steps to Resolve
1. **Verify Automated Promotion**:
   Patroni should automatically promote `postgres-1` to primary in under 10 seconds. Check cluster state:
   ```bash
   patronictl -c /etc/patroni/patroni.yml list
   ```
2. **Manual Intervention (If auto promotion fails)**:
   Force failover:
   ```bash
   patronictl -c /etc/patroni/patroni.yml failover
   ```
3. **Route Traffic**:
   Ensure Kubernetes service endpoint points to the new primary.
