use std::sync::Arc;
use tokio::sync::RwLock;
use std::time::Duration;

#[derive(Debug, thiserror::Error)]
pub enum InferenceError {
    #[error("Inference failed: {0}")]
    Failed(String),
}

pub struct CudaDevice {
    device_id: u32,
}

impl CudaDevice {
    pub fn new(device_id: u32) -> Result<Self, InferenceError> {
        // Mock CUDA check
        if device_id == 0 {
            Ok(Self { device_id })
        } else {
            Err(InferenceError::Failed("CUDA device not found".to_string()))
        }
    }

    pub fn name(&self) -> String {
        format!("Nvidia GeForce RTX (Device {})", self.device_id)
    }

    pub fn health_check(&self) -> Result<(), InferenceError> {
        // Mock health check. Healthy.
        Ok(())
    }
}

pub struct CpuDevice;

impl CpuDevice {
    pub fn new() -> Result<Self, InferenceError> {
        Ok(Self)
    }
}

pub enum ComputeBackend {
    Gpu(CudaDevice),
    Cpu(CpuDevice),
}

pub struct AntiGravityRuntime {
    backend: Arc<RwLock<ComputeBackend>>,
    _health_checker: tokio::task::JoinHandle<()>,
}

impl AntiGravityRuntime {
    pub async fn new() -> Result<Self, InferenceError> {
        match CudaDevice::new(0) {
            Ok(gpu) => {
                tracing::info!("GPU initialized: {:?}", gpu.name());
                let backend = Arc::new(RwLock::new(ComputeBackend::Gpu(gpu)));
                let health_checker = Self::spawn_health_checker(backend.clone());

                Ok(Self {
                    backend,
                    _health_checker: health_checker,
                })
            }
            Err(e) => {
                tracing::warn!("GPU failed, falling back to CPU: {}", e);
                let cpu = CpuDevice::new()?;
                Ok(Self {
                    backend: Arc::new(RwLock::new(ComputeBackend::Cpu(cpu))),
                    _health_checker: tokio::spawn(async {}),
                })
            }
        }
    }

    fn spawn_health_checker(
        backend: Arc<RwLock<ComputeBackend>>
    ) -> tokio::task::JoinHandle<()> {
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(5));

            loop {
                interval.tick().await;

                let mut guard = backend.write().await;

                if let ComputeBackend::Gpu(ref gpu) = *guard {
                    if let Err(e) = gpu.health_check() {
                        tracing::error!("GPU health check failed: {}", e);
                        tracing::info!("Falling back to CPU inference");
                        if let Ok(cpu) = CpuDevice::new() {
                            *guard = ComputeBackend::Cpu(cpu);
                        }
                    }
                }
            }
        })
    }

    pub async fn infer(&self, input_data: Vec<f32>) -> Result<Vec<f32>, InferenceError> {
        let guard = self.backend.read().await;
        match &*guard {
            ComputeBackend::Gpu(_) => {
                // Mock GPU inference
                Ok(input_data.into_iter().map(|x| x * 2.0).collect())
            }
            ComputeBackend::Cpu(_) => {
                // Mock CPU inference
                Ok(input_data.into_iter().map(|x| x * 1.5).collect())
            }
        }
    }
}
