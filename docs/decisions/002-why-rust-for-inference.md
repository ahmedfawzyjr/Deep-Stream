# ADR-002: Why Rust for the ONNX Inference Engine

## Status: Accepted

## Context
Serving ML models in real-time requires sub-millisecond to low single-digit millisecond latency. Python (via `onnxruntime` or `xgboost` runtime) introduces significant overhead (GIL, dynamic memory allocations). We need a runtime with predictable performance and low resource usage.

## Decision
We chose Rust stable (1.77+) with `tract-onnx` and `tonic` (gRPC) for the inference microservice.

## Reasons
- **Predictable Latency**: No Garbage Collector (GC) means no stop-the-world pauses, resulting in predictable p99 latency spikes.
- **tract-onnx Integration**: The `tract` crate is a pure-Rust, highly optimized neural network engine that allows building static binaries without needing heavy C++ dependencies or dynamic shared libraries (`onnxruntime` shared objects).
- **Concurrency & Safety**: Rust guarantees thread safety at compile time, making concurrent execution of predictions safe and highly parallelizable.
- **Resource Footprint**: The microservice runs efficiently on minimal memory (often <15MB RSS), which lowers operational costs on cloud platforms like Railway.

## Consequences
- Requires ONNX export pipeline in the Python training repository.
- Higher compile times compared to Python or Go.
- Strict data type constraints when parsing and aligning features between Python and Rust.
