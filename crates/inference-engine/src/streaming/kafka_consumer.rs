use std::time::Duration;
use rdkafka::config::ClientConfig;
use rdkafka::consumer::{Consumer, StreamConsumer, CommitMode};
use rdkafka::message::Message;
use serde::{Deserialize, Serialize};
use tracing::{info, warn, error};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct VideoFramePayload {
    pub pipeline_id: String,
    pub sequence: u64,
    pub data: Vec<u8>,
    pub width: i32,
    pub height: i32,
    pub timestamp: String,
}

pub struct KafkaFrameConsumer {
    consumer: StreamConsumer,
    topic: String,
}

impl KafkaFrameConsumer {
    pub fn new(brokers: &str, group_id: &str, topic: &str) -> Result<Self, rdkafka::error::KafkaError> {
        let consumer: StreamConsumer = ClientConfig::new()
            .set("group.id", group_id)
            .set("bootstrap.servers", brokers)
            .set("enable.partition.eof", "false")
            .set("session.timeout.ms", "6000")
            .set("enable.auto.commit", "true")
            .set("auto.offset.reset", "earliest")
            .create()?;

        Ok(Self {
            consumer,
            topic: topic.to_string(),
        })
    }

    pub async fn start_consuming<F, Fut>(&self, process_fn: F) -> Result<(), rdkafka::error::KafkaError>
    where
        F: Fn(VideoFramePayload) -> Fut + Send + Sync + 'static,
        Fut: std::future::Future<Output = ()> + Send + 'static,
    {
        self.consumer.subscribe(&[&self.topic])?;
        info!("Subscribed to Kafka topic: {}", self.topic);

        loop {
            match self.consumer.recv().await {
                Err(e) => {
                    error!("Kafka receive error: {:?}", e);
                }
                Ok(msg) => {
                    let payload = match msg.payload_view::<str>() {
                        None => {
                            warn!("Empty Kafka message payload skipped");
                            continue;
                        }
                        Some(Ok(s)) => s,
                        Some(Err(e)) => {
                            warn!("Corrupted Kafka payload encoding skipped: {:?}", e);
                            continue;
                        }
                    };

                    match serde_json::from_str::<VideoFramePayload>(payload) {
                        Err(e) => {
                            warn!("Failed to deserialize frame payload: {:?}", e);
                        }
                        Ok(frame) => {
                            // Run callback function
                            process_fn(frame).await;
                        }
                    }

                    // Commit offset
                    let _ = self.consumer.commit_message(&msg, CommitMode::Async);
                }
            }
        }
    }
}
