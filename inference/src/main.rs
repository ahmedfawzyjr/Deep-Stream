use std::net::SocketAddr;
use std::sync::Arc;
use tonic::{transport::Server, Request, Response, Status};

use deepstream_inference::engine::InferenceEngine;
use deepstream_inference::metrics::INFERENCE_REQUESTS;
use deepstream_inference::pb::inference_service_server::{InferenceService, InferenceServiceServer};
use deepstream_inference::pb::{HealthRequest, HealthResponse, PredictRequest, PredictResponse};

pub struct InferenceServerImpl {
    engine: Arc<InferenceEngine>,
}

#[tonic::async_trait]
impl InferenceService for InferenceServerImpl {
    async fn predict(
        &self,
        request: Request<PredictRequest>,
    ) -> Result<Response<PredictResponse>, Status> {
        INFERENCE_REQUESTS.inc();
        let req = request.into_inner();

        let start = std::time::Instant::now();
        let probs = self.engine.predict(&req.features).map_err(|e| {
            Status::internal(format!("Inference error: {}", e))
        })?;
        let latency_ms = start.elapsed().as_secs_f64() * 1000.0;

        // ONNX probabilities output mapping:
        // index 0: away win, index 1: draw, index 2: home win
        if probs.len() < 3 {
            return Err(Status::internal("Invalid model output probabilities size"));
        }

        let reply = PredictResponse {
            home_win_prob: probs[2],
            draw_prob: probs[1],
            away_win_prob: probs[0],
            latency_ms: latency_ms as f32,
            model_version: "XGBoost-v1".to_string(),
        };

        Ok(Response::new(reply))
    }

    async fn health(
        &self,
        _request: Request<HealthRequest>,
    ) -> Result<Response<HealthResponse>, Status> {
        let reply = HealthResponse { ok: true };
        Ok(Response::new(reply))
    }
}

// Spawns a small HTTP server for Prometheus scraping on port 2112
async fn run_metrics_server() {
    use hyper::service::{make_service_fn, service_fn};
    use hyper::{Body, Response as HyperResponse, Server as HyperServer};
    use prometheus::{Encoder, TextEncoder};

    let addr = SocketAddr::from(([0, 0, 0, 0], 2112));
    let make_svc = make_service_fn(|_conn| async {
        Ok::<_, hyper::Error>(service_fn(|_req| async {
            let encoder = TextEncoder::new();
            let metric_families = prometheus::gather();
            let mut buffer = vec![];
            encoder.encode(&metric_families, &mut buffer).unwrap();

            Ok::<_, hyper::Error>(
                HyperResponse::builder()
                    .header("Content-Type", encoder.format_type())
                    .body(Body::from(buffer))
                    .unwrap(),
            )
        }))
    });

    let server = HyperServer::bind(&addr).serve(make_svc);
    if let Err(e) = server.await {
        eprintln!("Metrics server error: {}", e);
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let model_path = std::env::var("MODEL_PATH")
        .unwrap_or_else(|_| "../models/match_predictor_v1.onnx".to_string());

    println!("Loading ONNX model from: {}", model_path);
    let engine = Arc::new(InferenceEngine::new(&model_path, 15)?);
    println!("Model loaded successfully!");

    // Start Prometheus metrics server in background
    tokio::spawn(run_metrics_server());
    println!("Prometheus metrics server listening on http://0.0.0.0:2112/metrics");

    let addr = SocketAddr::from(([0, 0, 0, 0], 50051));
    let service = InferenceServerImpl { engine };

    println!("gRPC Inference Server listening on {}", addr);
    Server::builder()
        .add_service(InferenceServiceServer::new(service))
        .serve(addr)
        .await?;

    Ok(())
}
