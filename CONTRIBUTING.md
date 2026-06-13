# Contributing to DeepStream

Thank you for contributing! Please follow these guidelines to ensure a smooth workflow.

## Prerequisites

- **Go**: 1.22+
- **Rust**: stable (1.77+)
- **Python**: 3.11+
- **Docker & Docker Compose**: For local infrastructure

## Running Components Locally

### 1. Go API
```bash
cd api
go run ./cmd/server
```

### 2. Rust Inference Engine
```bash
cd inference
cargo run
```

### 3. ML Pipeline
```bash
cd ml
pip install -r requirements.txt
python train.py
```

## Running Tests

### Go API Tests
```bash
cd api
go test ./... -race
```

### Rust Inference Tests
```bash
cd inference
cargo test
```

## Commit Message Format

We enforce **Conventional Commits**:
- `feat(...)`: A new feature
- `fix(...)`: A bug fix
- `test(...)`: Adding or updating tests
- `docs(...)`: Documentation changes
- `perf(...)`: Performance improvements
- `ci(...)`: CI/CD changes

Example:
`feat(api): add JWT authentication middleware`

## PR Checklist

- [ ] All functions have corresponding unit tests.
- [ ] Code compiles and passes all checks.
- [ ] Documentation is updated (README / ADRs if design changed).
- [ ] Coverage requirements are met (e.g., 75% for API).
