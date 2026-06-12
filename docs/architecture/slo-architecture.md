# Google SRE SLO & Error Budget Architecture

This document outlines DeepKick's SRE metrics definitions, formulas, and Prometheus mappings.

## 1. Availability Service Level Objective (SLO)
We target **99.98% availability** calculated over a rolling 30-day window.

### Mathematical Equation (SLI)
$$\text{SLI}_{\text{Availability}} = \frac{\sum \text{Successful HTTP Requests (Non-5xx)}}{\sum \text{Total HTTP Requests Ingress}} \times 100$$

### Prometheus Query Mapping (PromQL)
```promql
sum(rate(gin_request_status_count{status!~"5.."}[30d])) / sum(rate(gin_request_status_count[30d])) * 100
```

---

## 2. Error Budget
The allowed failure rate before deployment freezing is triggered:
- **Availability Target**: 99.98%
- **Allowed Failure Rate**: 0.02%
- **Error Budget (Seconds of outage allowed per 30 days)**:
  $$30 \text{ days} \times 24 \text{ hours} \times 60 \text{ mins} \times 60 \text{ secs} \times 0.0002 = 518.4 \text{ seconds (8.64 minutes)}$$

---

## 3. MTTx Metrics

### MTTR (Mean Time to Repair)
The average time required to detect, isolate, and fully mitigate an incident.
$$\text{MTTR} = \frac{\sum \text{Downtime Resolution Durations}}{\text{Number of Outage Incidents}}$$

### MTBF (Mean Time Between Failures)
The average operational running time between system outages.
$$\text{MTBF} = \frac{\sum \text{Operational Running Time}}{\text{Number of Outage Incidents}}$$
