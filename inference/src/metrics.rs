use lazy_static::lazy_static;
use prometheus::{opts, register_histogram, register_int_counter, Histogram, IntCounter};

lazy_static! {
    pub static ref INFERENCE_REQUESTS: IntCounter = register_int_counter!(
        opts!(
            "deepstream_inference_requests_total",
            "Total number of inference requests"
        )
    )
    .unwrap();
    pub static ref INFERENCE_LATENCY_HISTOGRAM: Histogram = register_histogram!(
        "deepstream_inference_latency_ms",
        "Inference latency in milliseconds",
        vec![1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0]
    )
    .unwrap();
}
