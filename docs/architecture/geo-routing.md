# Geo Routing, Replication & Failover Design

This document details the Multi-Region deployment topology and traffic routing mechanics to scale DeepKick globally.

## 1. Global Geo-Routing & Anycast DNS
To ensure users from Europe, South America, and North America experience minimal load times, we implement Anycast DNS routing (using **Cloudflare Load Balancing** or **AWS Route 53 Geolocation Routing**).
- **Latency-Based Routing (LBR)**: Incoming HTTP/HTTPS/WebSocket connections are dynamically routed to the closest active GKE datacenter based on ping latency.
- **Failover Thresholds**: If a GKE cluster health check fails in `eu-west-1` (Ireland), DNS weight is shifted entirely to `eu-central-1` (Germany) within 5 seconds.

## 2. Multi-Region Database Replication
Data consistency across geographical regions is maintained using:
- **CockroachDB (Active-Active)** or **PostgreSQL with Patroni**:
  - Tables are sharded based on `region_code` (e.g., European matches sharded in `eu-west-1`, South American matches sharded in `us-east-1`).
  - Read replicas are available locally in all regional nodes to achieve `<5ms` local read queries.
  - Multi-region Raft consensus ensures safe write transactions without split-brain issues.

## 3. Real-Time Event Synchronization (Kafka MirrorMaker 2.0)
To synchronize live match statistics and odds streams:
- **Kafka MirrorMaker 2.0** is deployed in each region.
- Events are actively mirrored between regional Kafka topics.
- **Offset Synchronization**: Consumers leverage MirrorMaker's offset translation to resume reading from the exact matching index if they fail over to a recovery region.
