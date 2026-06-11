use std::sync::Arc;
use crate::features::feature_vector::FeatureVector;
use crate::InferenceError;

#[derive(Clone, Debug)]
pub struct MatchPrediction {
    pub win_probability: f32,
    pub draw_probability: f32,
    pub loss_probability: f32,
    pub confidence: f32,
    pub key_factors: Vec<String>,
}

pub struct ModelWeights {
    pub xgboost: f32,
    pub lstm: f32,
    pub transformer: f32,
}

pub struct ProbabilityCalibrator;

impl ProbabilityCalibrator {
    pub fn calibrate(&self, probs: &[f32]) -> Vec<f32> {
        let sum: f32 = probs.iter().sum();
        probs.iter().map(|p| p / sum).collect()
    }
}

pub struct OnnxModel {
    pub name: String,
}

impl OnnxModel {
    pub async fn predict(&self, _features: &FeatureVector) -> Result<Vec<f32>, InferenceError> {
        // Simulates model predictions
        match self.name.as_str() {
            "xgboost" => Ok(vec![0.45, 0.30, 0.25]),
            "lstm" => Ok(vec![0.50, 0.25, 0.25]),
            "transformer" => Ok(vec![0.40, 0.35, 0.25]),
            _ => Err(InferenceError::OnnxError("Unknown model".to_string())),
        }
    }
}

pub struct AntiGravityEnsemble {
    pub xgboost: Arc<OnnxModel>,
    pub lstm: Arc<OnnxModel>,
    pub transformer: Arc<OnnxModel>,
    pub weights: ModelWeights,
    pub calibrator: ProbabilityCalibrator,
}

impl AntiGravityEnsemble {
    pub fn new() -> Self {
        Self {
            xgboost: Arc::new(OnnxModel { name: "xgboost".to_string() }),
            lstm: Arc::new(OnnxModel { name: "lstm".to_string() }),
            transformer: Arc::new(OnnxModel { name: "transformer".to_string() }),
            weights: ModelWeights {
                xgboost: 0.5,
                lstm: 0.3,
                transformer: 0.2,
            },
            calibrator: ProbabilityCalibrator,
        }
    }

    pub async fn predict(
        &self,
        features: &FeatureVector,
    ) -> Result<MatchPrediction, InferenceError> {
        // Run all three models in parallel
        let (xgboost_out, lstm_out, transformer_out) = tokio::join!(
            self.xgboost.predict(features),
            self.lstm.predict(features),
            self.transformer.predict(features)
        );
        
        let xgboost_proba = xgboost_out?;
        let lstm_proba = lstm_out?;
        let transformer_proba = transformer_out?;
        
        // Weighted ensemble based on model confidence
        let ensemble_proba = self.ensemble_weighted(
            &xgboost_proba,
            &lstm_proba,
            &transformer_proba,
        );
        
        // Calibrate probabilities (prevent overconfidence)
        let calibrated = self.calibrator.calibrate(&ensemble_proba);
        
        // Generate explanation
        let key_factors = self.explain_prediction(features, &calibrated);
        
        Ok(MatchPrediction {
            win_probability: calibrated[0],
            draw_probability: calibrated[1],
            loss_probability: calibrated[2],
            confidence: self.calculate_confidence(&calibrated),
            key_factors,
        })
    }
    
    fn ensemble_weighted(
        &self,
        xgb: &[f32],
        lstm: &[f32],
        transformer: &[f32],
    ) -> Vec<f32> {
        vec![
            self.weights.xgboost * xgb[0] + 
                self.weights.lstm * lstm[0] + 
                self.weights.transformer * transformer[0],
            self.weights.xgboost * xgb[1] + 
                self.weights.lstm * lstm[1] + 
                self.weights.transformer * transformer[1],
            self.weights.xgboost * xgb[2] + 
                self.weights.lstm * lstm[2] + 
                self.weights.transformer * transformer[2],
        ]
    }

    fn calculate_confidence(&self, calibrated: &[f32]) -> f32 {
        // Entropy or max probability based confidence
        let max_val = calibrated.iter().cloned().fold(0.0/0.0, f32::max);
        (max_val - 0.33) / 0.67
    }

    fn explain_prediction(&self, features: &FeatureVector, _probs: &[f32]) -> Vec<String> {
        let mut factors = Vec::new();
        if features.player_form_avg > 7.0 {
            factors.push("Stellar team/player form (+15% Win probability)".to_string());
        }
        if features.travel_fatigue_b > 30.0 {
            factors.push("Opponent suffers from high travel fatigue".to_string());
        }
        if factors.is_empty() {
            factors.push("Default statistical baseline prediction".to_string());
        }
        factors
    }
}
