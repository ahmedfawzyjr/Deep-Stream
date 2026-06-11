use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FeatureVector {
    pub match_id: String,
    pub player_form_avg: f32,
    pub team_chemistry_a: f32,
    pub team_chemistry_b: f32,
    pub travel_fatigue_a: f32,
    pub travel_fatigue_b: f32,
    pub weather_impact: f32,
    pub recent_xg_a: f32,
    pub recent_xg_b: f32,
    pub in_game_momentum: f32,
}

impl FeatureVector {
    pub fn to_tensor_data(&self) -> Vec<f32> {
        // Flatten into vector for model consumption
        vec![
            self.player_form_avg,
            self.team_chemistry_a,
            self.team_chemistry_b,
            self.travel_fatigue_a,
            self.travel_fatigue_b,
            self.weather_impact,
            self.recent_xg_a,
            self.recent_xg_b,
            self.in_game_momentum,
        ]
    }
}
