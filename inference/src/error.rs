#[derive(thiserror::Error, Debug)]
pub enum InferenceError {
    #[error("Model not loaded: {0}")]
    ModelNotLoaded(String),
    #[error("Invalid feature count: expected {expected}, got {got}")]
    InvalidFeatureCount { expected: usize, got: usize },
    #[error("Inference failed: {0}")]
    InferenceFailed(String),
    #[error("Validation failed: {0}")]
    ValidationFailed(String),
}
