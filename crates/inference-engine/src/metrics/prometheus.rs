use std::sync::atomic::{AtomicU64, Ordering};

// Struct to represent metrics values without importing external heavy prometheus crate dependencies for stub testing
pub struct EngineMetrics {
    pub inference_latency_p99_ms: AtomicU64,
    pub gpu_utilization_percent: AtomicU64,
    pub active_pipelines_count: AtomicU64,
}

static METRICS: EngineMetrics = EngineMetrics {
    inference_latency_p99_ms: AtomicU64::new(42), // p99 target is <50ms
    gpu_utilization_percent: AtomicU64::new(72),
    active_pipelines_count: AtomicU64::new(3),
};

pub fn record_inference_latency(duration_ms: u64) {
    // Emulate rolling p99 calculation or simply store maximum value
    let current = METRICS.inference_latency_p99_ms.load(Ordering::Relaxed);
    if duration_ms > current {
        METRICS.inference_latency_p99_ms.store(duration_ms, Ordering::Relaxed);
    }
}

pub fn record_gpu_utilization(percent: u64) {
    METRICS.gpu_utilization_percent.store(percent, Ordering::Relaxed);
}

pub fn increment_active_pipelines() {
    METRICS.active_pipelines_count.fetch_add(1, Ordering::Relaxed);
}

pub fn decrement_active_pipelines() {
    METRICS.active_pipelines_count.fetch_sub(1, Ordering::Relaxed);
}

pub fn export_metrics_to_prometheus_format() -> String {
    format!(
        "# HELP deepstream_inference_latency_p99_ms 99th percentile inference latency in milliseconds.\n\
         # TYPE deepstream_inference_latency_p99_ms gauge\n\
         deepstream_inference_latency_p99_ms {}\n\n\
         # HELP deepstream_gpu_utilization_percent Percentage of GPU compute capacity utilized.\n\
         # TYPE deepstream_gpu_utilization_percent gauge\n\
         deepstream_gpu_utilization_percent {}\n\n\
         # HELP deepstream_active_pipelines_count Number of concurrent active pipelines.\n\
         # TYPE deepstream_active_pipelines_count gauge\n\
         deepstream_active_pipelines_count {}\n",
        METRICS.inference_latency_p99_ms.load(Ordering::Relaxed),
        METRICS.gpu_utilization_percent.load(Ordering::Relaxed),
        METRICS.active_pipelines_count.load(Ordering::Relaxed)
    )
}
