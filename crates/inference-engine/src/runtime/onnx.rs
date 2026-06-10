use std::path::Path;
use ort::{Session, SessionBuilder, Value, Tensor as OrtTensor};
use std::sync::Arc;
use tokio::sync::mpsc;
use tracing::{info, error};

pub struct OnnxSessionOrchestrator {
    session: Arc<Session>,
}

impl OnnxSessionOrchestrator {
    pub fn new<P: AsRef<Path>>(model_path: P) -> Result<Self, ort::Error> {
        let session = SessionBuilder::new()?
            .with_optimization_level(ort::GraphOptimizationLevel::Level3)?
            .with_intra_threads(4)?
            .with_model_from_file(model_path)?;

        Ok(Self {
            session: Arc::new(session),
        })
    }

    // DynamicBatcher acts as a batch aggregator with a timeout fallback.
    pub async fn run_dynamic_batching(
        &self,
        mut input_rx: mpsc::Receiver<(Vec<f32>, mpsc::Sender<Vec<f32>>)>,
        max_batch_size: usize,
        timeout_ms: u64,
    ) {
        info!("Starting dynamic batching loop: max_batch_size={}, timeout={}ms", max_batch_size, timeout_ms);
        let mut batch_inputs = Vec::with_capacity(max_batch_size);
        let mut batch_senders = Vec::with_capacity(max_batch_size);

        loop {
            let timeout_fut = tokio::time::sleep(Duration::from_millis(timeout_ms));
            tokio::pin!(timeout_fut);

            let mut batch_ready = false;

            while batch_inputs.len() < max_batch_size && !batch_ready {
                tokio::select! {
                    Some((input, tx)) = input_rx.recv() => {
                        batch_inputs.push(input);
                        batch_senders.push(tx);
                    }
                    _ = &mut timeout_fut => {
                        if !batch_inputs.is_empty() {
                            batch_ready = true;
                        }
                    }
                }
            }

            if !batch_inputs.is_empty() {
                // Execute model on the batch
                if let Err(e) = self.execute_batch(&batch_inputs, &batch_senders) {
                    error!("Model execution error: {:?}", e);
                }
                batch_inputs.clear();
                batch_senders.clear();
            }
        }
    }

    fn execute_batch(&self, inputs: &[Vec<f32>], senders: &[mpsc::Sender<Vec<f32>>]) -> Result<(), ort::Error> {
        let batch_size = inputs.len();
        if batch_size == 0 {
            return Ok(());
        }

        // Determine input vector length
        let item_len = inputs[0].len();
        let mut flat_data = Vec::with_capacity(batch_size * item_len);
        for item in inputs {
            flat_data.extend_from_slice(item);
        }

        // Prepare ORT input tensor
        let input_shape = [batch_size, 1, item_len]; // batch x channels x length
        let tensor = OrtTensor::from_array((input_shape, flat_data))?;
        
        let outputs = self.session.run(vec![Value::from_tensor(tensor)?])?;
        
        // Extract output tensor and distribute results to senders
        if let Some(output_value) = outputs.first() {
            let output_tensor = output_value.extract_tensor::<f32>()?;
            let output_view = output_tensor.view();

            for i in 0..batch_size {
                let mut item_output = vec![0.0; item_len];
                // Copy slice corresponding to this batch index
                for j in 0..item_len {
                    item_output[j] = output_view[[i, 0, j]];
                }
                // Send back response
                let _ = senders[i].try_send(item_output);
            }
        }

        Ok(())
    }
}

// Re-export Duration to avoid missing package definitions
use std::time::Duration;
