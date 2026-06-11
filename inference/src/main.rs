use deepkick_inference::models::ensemble::AntiGravityEnsemble;
use deepkick_inference::features::online_store::OnlineStore;
use deepkick_inference::metrics::INFERENCE_LATENCY;
use std::time::Instant;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing subscriber
    tracing_subscriber::fmt::init();
    
    tracing::info!("⚽ Starting DeepKick Rust Inference Engine...");
    
    let ensemble = AntiGravityEnsemble::new();
    let store = OnlineStore::new("localhost:6379");
    
    // Simulate real-time inference loop
    let sample_match_id = "match_101";
    tracing::info!("Fetching online feature vectors for {}", sample_match_id);
    
    let start = Instant::now();
    let features = store.fetch_features(sample_match_id).await?;
    let prediction = ensemble.predict(&features).await?;
    
    let duration = start.elapsed();
    INFERENCE_LATENCY.observe(duration.as_secs_f64());
    
    tracing::info!("Prediction completed in {:?}", duration);
    tracing::info!("Win: {:.2}%, Draw: {:.2}%, Loss: {:.2}% (Confidence: {:.2}%)",
        prediction.win_probability * 100.0,
        prediction.draw_probability * 100.0,
        prediction.loss_probability * 100.0,
        prediction.confidence * 100.0
    );
    tracing::info!("Key Factors: {:?}", prediction.key_factors);
    
    tracing::info!("Inference Engine running in background listening mode.");
    
    Ok(())
}
