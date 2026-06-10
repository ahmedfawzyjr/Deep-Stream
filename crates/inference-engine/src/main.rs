mod runtime;
mod pipelines;
mod streaming;
mod metrics;

use std::env;
use std::sync::Arc;
use std::time::{Instant, SystemTime, UNIX_EPOCH};
use tokio::signal;
use tracing::{info, warn, error};
use tracing_subscriber::fmt::format::FmtSpan;

use crate::runtime::gpu::AntiGravityRuntime;
use crate::pipelines::video::yolo::{YoloDetector, Detection as YoloDetection};
use crate::streaming::kafka_consumer::{KafkaFrameConsumer, VideoFramePayload};
use crate::streaming::redis_pubsub::{RedisResultPublisher, InferenceResultPayload, Detection as RedisDetection};
use crate::metrics::prometheus::{record_inference_latency, increment_active_pipelines, decrement_active_pipelines};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // 1. Initialize Structured Logging
    tracing_subscriber::fmt()
        .with_span_events(FmtSpan::CLOSE)
        .init();

    info!("Initializing DeepStream AI Inference Engine...");

    // 2. Load Environment Configurations
    let kafka_brokers = env::var("KAFKA_BROKERS").unwrap_or_else(|_| "localhost:9092".to_string());
    let kafka_topic = env::var("KAFKA_VIDEO_TOPIC").unwrap_or_else(|_| "deepstream-video-ingest".to_string());
    let redis_url = env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
    let model_path = env::var("MODEL_PATH").unwrap_or_else(|_| "models/yolov8n.onnx".to_string());

    info!("Config: Kafka Brokers={}, Ingest Topic={}", kafka_brokers, kafka_topic);
    info!("Config: Redis URL={}, Model Path={}", redis_url, model_path);

    // 3. Initialize Compute Runtime & YOLO Detector
    let runtime = Arc::new(AntiGravityRuntime::new().await?);
    info!("Anti-Gravity compute backend initialized successfully.");

    let detector = Arc::new(YoloDetector::new(&model_path)?);
    info!("YOLOv8 ONNX model loaded successfully.");

    // 4. Initialize Redis Result Publisher
    let publisher = Arc::new(RedisResultPublisher::new(&redis_url)?);
    info!("Redis pub/sub publisher connected.");

    // 5. Initialize Kafka Ingest Consumer
    let consumer = KafkaFrameConsumer::new(&kafka_brokers, "inference-engine-group", &kafka_topic)?;
    info!("Kafka consumer client bound to bootstrap brokers.");

    increment_active_pipelines();

    // 6. Spawn Ingestion and Processing Task Loop
    let process_runtime = runtime.clone();
    let process_detector = detector.clone();
    let process_publisher = publisher.clone();

    info!("Starting multi-modal inference worker task...");
    tokio::spawn(async move {
        let process_fn = move |frame: VideoFramePayload| {
            let runtime = process_runtime.clone();
            let detector = process_detector.clone();
            let publisher = process_publisher.clone();

            async move {
                let start_time = Instant::now();

                // Convert bytes to RGB frame (using image preprocessing inside detect method)
                let detections = match detector.detect(&frame.data) {
                    Ok(dets) => dets,
                    Err(e) => {
                        error!("YOLO model detection error: {:?}", e);
                        return;
                    }
                };

                // Normalizing YOLO output format to Redis payload formats
                let mut output_detections = Vec::new();
                for det in detections {
                    output_detections.push(RedisDetection {
                        label: det.label,
                        confidence: det.confidence,
                        bbox: det.bbox,
                    });
                }

                // Run active backend inference task context for anti-gravity tracking
                let dummy_tensor = vec![0.5; 10];
                if let Err(e) = runtime.infer(dummy_tensor).await {
                    warn!("Compute backend tracking call failed: {:?}", e);
                }

                let latency_ms = start_time.elapsed().as_millis() as u64;
                record_inference_latency(latency_ms);

                let timestamp = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_millis() as u64;

                let result_payload = InferenceResultPayload {
                    pipeline_id: frame.pipeline_id.clone(),
                    sequence: frame.sequence,
                    detections: output_detections,
                    latency_ms,
                    timestamp,
                };

                // Broadcast results to Redis Pub/Sub channel
                if let Err(e) = publisher.publish_result(result_payload).await {
                    error!("Failed to publish results payload: {:?}", e);
                }
            }
        };

        if let Err(err) = consumer.start_consuming(process_fn).await {
            error!("Fatal Kafka processing thread loop error: {:?}", err);
        }
    });

    info!("Inference Engine running successfully. Press Ctrl+C to terminate.");

    // 7. Await termination signal
    signal::ctrl_c().await?;
    decrement_active_pipelines();
    info!("DeepStream Inference Engine stopped.");

    Ok(())
}
