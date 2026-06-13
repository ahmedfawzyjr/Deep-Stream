# Contributing to DeepStream

Thank you for contributing! To maintain code quality and credibility, please follow these guidelines.

## Prerequisites

- **Go**: 1.22+
- **Rust**: Stable (1.77+)
- **Python**: 3.11
- **Docker & Docker Compose**

## Local Development & Running Components

### 1. Go API (api/)
To run the Go API locally:
```bash
cd api
go run cmd/server/main.go
```

To run Go unit tests:
```bash
cd api
go test ./... -race -coverprofile=coverage.out
```

### 2. Rust Inference Engine (inference/)
To run the Rust gRPC server:
```bash
cd inference
cargo run
```

To run Rust unit tests:
```bash
cd inference
cargo test
```

To run Criterion benchmarks:
```bash
cd inference
cargo bench
```

### 3. Python ML Pipeline (ml/)
To install dependencies and run python scripts:
```bash
cd ml
pip install -r requirements.txt
python train.py
```

## Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/). Ensure your commit messages follow this schema:

- `feat(component): description` (new features)
- `fix(component): description` (bug fixes)
- `test(component): description` (adding/modifying tests)
- `docs(component): description` (documentation changes)
- `perf(component): description` (performance tuning)
- `ci: description` (CI/CD pipeline updates)

*Example:* `feat(api): add WebSocket live match stream`

## Pull Request Checklist

Before submitting a PR:
- [ ] Code compiles cleanly on Go, Rust, and Python environment.
- [ ] Every new function has a corresponding unit test.
- [ ] All unit tests pass locally.
- [ ] Clippy/linter warnings are fixed.
- [ ] Commit history is clean with incremental logical commits.
- [ ] No TODO or placeholder stubs remain in the code.
