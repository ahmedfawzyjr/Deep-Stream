pub mod models;
pub mod features;
pub mod metrics;
pub mod server;
pub mod explainability;
pub mod streaming;

#[derive(Debug, thiserror::Error)]
pub enum InferenceError {
    #[error("ONNX model execution failed: {0}")]
    OnnxError(String),
    #[error("Feature lookup failed for key: {0}")]
    FeatureLookupError(String),
    #[error("Serialization / Deserialization error: {0}")]
    SerializationError(String),
}
