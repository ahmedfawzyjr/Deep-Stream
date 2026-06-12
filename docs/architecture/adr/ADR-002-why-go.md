# ADR-002: Selection of Go for prediction API serving

## Status
Approved

## Context
The API gateway serving predictions and websocket streams needs to support high concurrency, fast startup times, low resource overhead, and integrate cleanly with containerized environments (Kubernetes/Helm).

## Decision
We chose **Go (Golang)** as the primary programming language for the `api` service.

## Rationale
1. **Goroutines Concurrency**: Lightweight thread execution allows serving thousands of WebSocket connections simultaneously with minimal RAM.
2. **Fast Startup & Compile Times**: Speeds up Kubernetes scaling loops (HPA) and CI/CD pipelines.
3. **Robust Tooling**: Standard library HTTP server and gin-gonic framework provide excellent base layer API capabilities.

## Consequences
- Less dynamic programming capabilities than Python, requiring explicit structures for JSON transformations.
