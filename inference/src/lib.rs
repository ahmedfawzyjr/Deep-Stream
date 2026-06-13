pub mod error;
pub mod features;
pub mod engine;
pub mod metrics;

// Include compiled proto file
pub mod pb {
    tonic::include_proto!("inference");
}
