# ADR-003: Selection of Rust for ML Inference Servicing

## Status
Approved

## Context
Running deep learning models (transformers and sequence LSTMs) to predict win/loss probabilities on live stream metrics requires extremely low inference latency (<15ms). Python servers (like Flask or FastAPI) have interpreter overhead and garbage collection pauses that violate this.

## Decision
We chose **Rust** for the machine learning inference engine container (`inference` service).

## Rationale
1. **Zero-cost Abstractions**: Allows high-performance computations and matrix operations without VM overhead.
2. **Deterministic Latency**: No Garbage Collection (GC) ensures predictable p99 response times.
3. **Memory Safety**: Guarantees concurrency safety without data races at compile time.

## Consequences
- Steeper learning curve for data scientists, requiring ONNX serialization to export models from Python/PyTorch.
