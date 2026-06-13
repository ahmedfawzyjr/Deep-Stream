# ADR-002: Why Rust for the Inference Engine

## Status: Accepted

## Context
We need to load machine learning models (XGBoost exported to ONNX format) and perform low-latency predictions. Python's runtime overhead and GIL make it less ideal for high-throughput, low-latency production environments.

## Decision
We chose Rust stable (1.77+) using `tract-onnx` and `tonic` gRPC framework.

## Reasons
- **Minimal Overhead**: Rust compiles directly to machine code without a garbage collector or interpreter runtime, ensuring predictable and low latency (sub-5ms p99 target).
- **Safety**: Rust's ownership model guarantees thread safety, preventing race conditions when concurrently running inference.
- **Embedded ONNX Engine**: The `tract` crate is a pure Rust ONNX runner that is highly optimized and easy to bundle in statically-linked containers.
- **Efficient gRPC Integration**: Tonic provides zero-copy high-performance gRPC support matching Rust's performance goals.

## Consequences
- Requires compiling Rust binaries which can take more time during CI/CD builds.
- Strict compiler checks mean initial development of feature processing and model conversion takes more effort.
