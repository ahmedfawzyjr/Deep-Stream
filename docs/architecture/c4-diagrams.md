# C4 Architectural Diagrams

This document contains C4 architecture diagrams mapping out DeepKick's distributed system layers.

## Level 1: System Context Diagram

```mermaid
graph TD
    User([Football Analyst / Bettor]) -->|Uses Web/Mobile App| DeepKick[DeepKick Platform]
    DeepKick -->|Fetches Live Stats| Opta[Opta Sports API]
    DeepKick -->|Fetches Team Squads| FIFA[FIFA Official API]
    DeepKick -->|Pushes Notifications| Firebase[Firebase Cloud Messaging]
```

## Level 2: Container Diagram

```mermaid
graph TB
    User([User]) -->|HTTPS/WS| WebApp[React Dashboard]
    User -->|gRPC/HTTP| MobileApp[Flutter App]

    subgraph DeepKick Containers
        WebApp -->|Requests| Gateway[Envoy API Gateway]
        MobileApp -->|Requests| Gateway

        Gateway -->|HTTP/gRPC| GoAPI[Go Prediction API]
        Gateway -->|Traces| Jaeger[Jaeger Tracing]
        
        GoAPI -->|Cache| Redis[(Redis Feature Cache)]
        GoAPI -->|Logs/Metrics| Prom[Prometheus]
        GoAPI -->|Reads/Writes| Postgres[(PostgreSQL DB)]
        
        Ingest[Kafka Consumer / Ingest] -->|Streams predictions| ClickHouse[(ClickHouse OLAP)]
        GoAPI -->|Queries Analytics| ClickHouse
    end
```

## Level 3: Component Diagram (Go API Gateway)

```mermaid
graph TB
    Envoy[Envoy Gateway] -->|HTTP Request| Main[server/main.go]
    Main -->|Routing| Router[Gin Engine]
    
    subgraph Go API Components
        Router -->|OTel Tracing Middleware| OTEL[otel/otel.go]
        Router -->|Prometheus Metrics| Metrics[go-gin-prometheus]
        Router -->|Route Handler| Handlers[handlers/prediction_handler.go]
        
        Handlers -->|Fetch predictions| Cache[Redis Client]
        Handlers -->|Save match data| DB[Postgres Client]
        Handlers -->|Trigger trace span| Tracer[OpenTelemetry Tracer]
    end
```
