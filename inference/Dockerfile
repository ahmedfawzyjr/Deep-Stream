# Build stage
FROM rust:1.77-slim AS builder

RUN apt-get update && apt-get install -y protobuf-compiler libssl-dev pkg-config

WORKDIR /app

# Cache dependencies
COPY Cargo.toml ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && echo "" > src/lib.rs
RUN cargo build --release
RUN rm -rf src

# Copy real source code
COPY . .
RUN touch src/main.rs src/lib.rs
RUN cargo build --release --bin inference-server

# Run stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/inference-server .

EXPOSE 50051
EXPOSE 2112

CMD ["./inference-server"]
