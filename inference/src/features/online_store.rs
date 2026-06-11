use crate::features::feature_vector::FeatureVector;
use crate::InferenceError;

pub struct OnlineStore {
    redis_address: String,
}

impl OnlineStore {
    pub fn new(redis_address: &str) -> Self {
        Self {
            redis_address: redis_address.to_string(),
        }
    }

    pub async fn fetch_features(&self, match_id: &str) -> Result<FeatureVector, InferenceError> {
        // Simulates retrieving match features from Feast/Redis in under 10ms
        Ok(FeatureVector {
            match_id: match_id.to_string(),
            player_form_avg: 7.2,
            team_chemistry_a: 84.5,
            team_chemistry_b: 79.1,
            travel_fatigue_a: 12.0,
            travel_fatigue_b: 34.5,
            weather_impact: -1.5,
            recent_xg_a: 1.85,
            recent_xg_b: 1.24,
            in_game_momentum: 45.0,
        })
    }
}
