# ADR-001: Why Go for the Prediction API

## Status: Accepted

## Context
We need a high-throughput, low-latency API gateway to serve match predictions via REST and stream live updates via WebSockets to concurrent clients. We considered Python (FastAPI), Go (Chi), and Node.js.

## Decision
We chose Go 1.22 with the Chi router for the API gateway service.

## Reasons
- **High Concurrency**: Goroutines have a low footprint (~2KB starting stack) and scale to thousands of active WebSocket connections much more efficiently than Python's async event loop or Node's single thread.
- **Low Memory & Startup Overhead**: The compiled binary size is minimal (typically <20MB), making it lightweight for containerization and microsecond startup times.
- **Strong Typings**: Avoids runtime errors typical in dynamic environments, which is crucial for handling complex sports stats telemetry.
- **Standard Library**: Go provides a robust and highly performant standard `net/http` package and structured logging (`log/slog`).

## Consequences
- Requires cross-language communication (gRPC) to request inference from the Rust-based ML engine.
- Model training logic must remain in Python, requiring standard serialization formats like ONNX to share weights.
