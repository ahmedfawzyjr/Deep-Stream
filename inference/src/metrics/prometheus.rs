use prometheus::{Histogram, Registry, register_histogram_with_registry};
use lazy_static::lazy_static;

lazy_static! {
    pub static ref REGISTRY: Registry = Registry::new();
    
    pub static ref INFERENCE_LATENCY: Histogram = register_histogram_with_registry!(
        "inference_latency_seconds",
        "Duration of model ensemble predictions in seconds",
        vec![0.005, 0.010, 0.020, 0.050, 0.100],
        REGISTRY
    ).unwrap();
}
