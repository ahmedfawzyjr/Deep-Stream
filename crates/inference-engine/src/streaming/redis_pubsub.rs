use redis::AsyncCommands;
use serde::{Serialize, Deserialize};
use tracing::{info, error};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Detection {
    pub label: String,
    pub confidence: f32,
    pub bbox: Vec<f32>, // [x, y, w, h]
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InferenceResultPayload {
    pub pipeline_id: String,
    pub sequence: u64,
    pub detections: Vec<Detection>,
    pub latency_ms: u64,
    pub timestamp: u64,
}

pub struct RedisResultPublisher {
    client: redis::Client,
}

impl RedisResultPublisher {
    pub fn new(redis_url: &str) -> Result<Self, redis::RedisError> {
        let client = redis::Client::open(redis_url)?;
        Ok(Self { client })
    }

    pub async fn publish_result(&self, result: InferenceResultPayload) -> Result<(), redis::RedisError> {
        let mut conn = self.client.get_async_connection().await?;
        let payload_str = match serde_json::to_string(&result) {
            Ok(s) => s,
            Err(e) => {
                error!("Failed to serialize inference result payload: {:?}", e);
                return Err(redis::RedisError::from((
                    redis::ErrorKind::IoError,
                    "JSON serialization error",
                    e.to_string(),
                )));
            }
        };

        let channel = format!("pipeline:{}:results", result.pipeline_id);
        let _: () = conn.publish(&channel, payload_str).await?;
        info!("Published result for pipeline {} seq {}", result.pipeline_id, result.sequence);
        Ok(())
    }
}
