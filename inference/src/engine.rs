import_path_placeholder::ignore;
use crate::error::InferenceError;
use crate::metrics::INFERENCE_LATENCY_HISTOGRAM;
use std::path::Path;
use std::sync::Arc;
use std::time::Instant;
use tract_onnx::prelude::*;

pub type Probabilities = Vec<f32>;

pub struct InferenceEngine {
    // tract model is Send + Sync
    model: Arc<SimplePlan<TypedFact, Box<dyn TypedOp>, Graph<TypedFact, Box<dyn TypedOp>>>>,
    expected_features: usize,
}

impl InferenceEngine {
    pub fn new<P: AsRef<Path>>(model_path: P, expected_features: usize) -> Result<Self, anyhow::Error> {
        let model = tract_onnx::onnx()
            // load the model
            .model_for_path(model_path)?
            // specify input type and shape (batch size dynamic, feature size fixed)
            .with_input_fact(0, f32::fact(&[1, expected_features]).into())?
            // optimize the model
            .into_optimized()?
            // make the model runnable
            .into_runnable()?;

        Ok(Self {
            model: Arc::new(model),
            expected_features,
        })
    }

    pub fn predict(&self, features: &[f32]) -> Result<Probabilities, InferenceError> {
        if features.len() != self.expected_features {
            return Err(InferenceError::InvalidFeatureCount {
                expected: self.expected_features,
                got: features.len(),
            });
        }

        let start = Instant::now();

        // Convert slice to tract tensor
        let tensor = tract_ndarray::Array2::from_shape_vec((1, self.expected_features), features.to_vec())
            .map_err(|e| InferenceError::InferenceFailed(e.to_string()))?;
        let tensor = tensor.into_tensor();

        // Run inference
        let outputs = self.model
            .run(tvec!(tensor.into()))
            .map_err(|e| InferenceError::InferenceFailed(e.to_string()))?;

        let latency = start.elapsed().as_secs_f64() * 1000.0;
        INFERENCE_LATENCY_HISTOGRAM.observe(latency);

        // Parse outputs: ONNX outputs typically contains labels (index 0) and probabilities (index 1)
        // For XGBoost Classifier, outputs[1] is a list of maps, or a matrix containing float probabilities for [away, draw, home]
        // Let's parse outputs[1] which is the probabilities matrix/sequence.
        let output_tensor = &outputs[1];
        
        // Let's convert output_tensor to slice or vector
        let probs: Vec<f32> = match output_tensor.to_array_view::<f32>() {
            Ok(view) => view.to_owned().into_iter().collect(),
            Err(e) => {
                // If it is a map of class probabilities (e.g. sequence of maps)
                // Let's try parsing it as map
                return Err(InferenceError::InferenceFailed(format!(
                    "Failed to parse ONNX output probabilities: {:?}",
                    e
                )));
            }
        };

        Ok(probs)
    }
}
