# ADR-001: Why Go for the API Gateway

## Status: Accepted

## Context
We need a robust, fast, and concurrent API gateway to handle REST requests and support persistent WebSocket connections for live match streaming predictions to clients.

## Decision
We chose Go 1.22 with the Chi router for the primary web and WebSocket server.

## Reasons
- **High Concurrency**: Go's goroutines make it extremely lightweight to handle thousands of concurrent WebSocket connections.
- **Fast Startup & Low Memory**: Go binaries compile to native code, starting instantly and consuming minimal RAM compared to Node.js/JVM.
- **Standard Library**: Go provides excellent native packages for networking, HTTP, and SQL.
- **Maintainability**: Go's simple language design makes it easy for developers to read, write, and maintain.

## Consequences
- Need to write Go code for model invocation, translating to gRPC calls to the Rust inference service.
- Manual serialization/deserialization logic is common in Go compared to dynamic languages, but it offers better type-safety.
