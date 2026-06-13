# Deployment Guide

This document outlines the steps to deploy the DeepStream platform components.

## API Gateway Deployment (Railway)

We deploy the Go API gateway on Railway.

### Prerequisites
1. [Railway CLI](https://docs.railway.app/develop/cli) installed.
2. Railway account connected.

### Deployment Steps
1. Initialize a new project or link to an existing project:
   ```bash
   railway link
   ```
2. Provision a PostgreSQL service within Railway.
3. Configure the environment variables in the Railway dashboard:
   - `DATABASE_URL`: Set to the PostgreSQL service connection string provided by Railway.
   - `INFERENCE_ADDR`: Set to the address of the deployed Rust inference service.
   - `JWT_SECRET`: Generate a secure random string.
   - `PORT`: `8080` (or leave default).
4. Run the deployment:
   ```bash
   railway up
   ```

## Rust Inference Engine Deployment

The Rust inference engine can be deployed as a containerized service on any container hosting platform (e.g., Railway, Render, or AWS ECS) that supports gRPC protocol routing.

### Environment Setup
- `MODEL_PATH`: Set to the location of the ONNX model file (bundled in the container at `/app/models/match_predictor_v1.onnx`).
- Expose port `50051` for gRPC traffic and port `2112` for Prometheus metric scraping.
