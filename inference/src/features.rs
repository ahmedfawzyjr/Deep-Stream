import_path_placeholder::ignore;
use crate::error::InferenceError;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::Read;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchFeatures {
    pub home_shots: f32,
    pub away_shots: f32,
    pub home_shots_on_target: f32,
    pub away_shots_on_target: f32,
    pub home_pass_accuracy: f32,
    pub away_pass_accuracy: f32,
    pub home_possession_pct: f32,
    pub away_possession_pct: f32,
    pub home_xg: f32,
    pub away_xg: f32,
    pub home_form_last5: f32,
    pub away_form_last5: f32,
    pub home_goals_scored_avg: f32,
    pub away_goals_scored_avg: f32,
    pub head_to_head_home_wins: f32,
}

impl MatchFeatures {
    pub fn to_vec(&self) -> Vec<f32> {
        vec![
            self.home_shots,
            self.away_shots,
            self.home_shots_on_target,
            self.away_shots_on_target,
            self.home_pass_accuracy,
            self.away_pass_accuracy,
            self.home_possession_pct,
            self.away_possession_pct,
            self.home_xg,
            self.away_xg,
            self.home_form_last5,
            self.away_form_last5,
            self.home_goals_scored_avg,
            self.away_goals_scored_avg,
            self.head_to_head_home_wins,
        ]
    }

    pub fn validate(&self) -> Result<(), InferenceError> {
        let values = self.to_vec();
        for val in &values {
            if !val.is_finite() {
                return Err(InferenceError::ValidationFailed("All feature values must be finite numbers".to_string()));
            }
        }

        // Validate percentage-like fields
        if self.home_pass_accuracy < 0.0 || self.home_pass_accuracy > 1.0 {
            return Err(InferenceError::ValidationFailed("home_pass_accuracy must be in [0, 1]".to_string()));
        }
        if self.away_pass_accuracy < 0.0 || self.away_pass_accuracy > 1.0 {
            return Err(InferenceError::ValidationFailed("away_pass_accuracy must be in [0, 1]".to_string()));
        }
        if self.home_possession_pct < 0.0 || self.home_possession_pct > 1.0 {
            return Err(InferenceError::ValidationFailed("home_possession_pct must be in [0, 1]".to_string()));
        }
        if self.away_possession_pct < 0.0 || self.away_possession_pct > 1.0 {
            return Err(InferenceError::ValidationFailed("away_possession_pct must be in [0, 1]".to_string()));
        }
        if self.home_form_last5 < 0.0 || self.home_form_last5 > 1.0 {
            return Err(InferenceError::ValidationFailed("home_form_last5 must be in [0, 1]".to_string()));
        }
        if self.away_form_last5 < 0.0 || self.away_form_last5 > 1.0 {
            return Err(InferenceError::ValidationFailed("away_form_last5 must be in [0, 1]".to_string()));
        }

        Ok(())
    }
}

pub fn verify_feature_ordering<P: AsRef<Path>>(path: P) -> Result<(), anyhow::Error> {
    if !path.as_ref().exists() {
        return Ok(()); // Skip check if JSON file not present yet (during cargo test or before training)
    }

    let mut file = File::open(path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    let expected_order: Vec<String> = serde_json::from_str(&contents)?;
    let actual_fields = vec![
        "home_shots",
        "away_shots",
        "home_shots_on_target",
        "away_shots_on_target",
        "home_pass_accuracy",
        "away_pass_accuracy",
        "home_possession_pct",
        "away_possession_pct",
        "home_xg",
        "away_xg",
        "home_form_last5",
        "away_form_last5",
        "home_goals_scored_avg",
        "away_goals_scored_avg",
        "head_to_head_home_wins",
    ];

    if expected_order.len() != actual_fields.len() {
        return Err(anyhow::anyhow!("Feature count mismatch: expected {}, got {}", expected_order.len(), actual_fields.len()));
    }

    for (i, (expected, actual)) in expected_order.iter().zip(actual_fields.iter()).enumerate() {
        if expected != actual {
            return Err(anyhow::anyhow!("Feature mismatch at index {}: expected {}, got {}", i, expected, actual));
        }
    }

    Ok(())
}
