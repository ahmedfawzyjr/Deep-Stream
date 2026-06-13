use deepstream_inference::engine::InferenceEngine;
use deepstream_inference::features::MatchFeatures;
use std::path::Path;

#[test]
fn test_match_features_validation() {
    let features = MatchFeatures {
        home_shots: 10.0,
        away_shots: 5.0,
        home_shots_on_target: 4.0,
        away_shots_on_target: 2.0,
        home_pass_accuracy: 0.85,
        away_pass_accuracy: 0.75,
        home_possession_pct: 0.55,
        away_possession_pct: 0.45,
        home_xg: 1.5,
        away_xg: 0.8,
        home_form_last5: 0.6,
        away_form_last5: 0.4,
        home_goals_scored_avg: 1.8,
        away_goals_scored_avg: 1.2,
        head_to_head_home_wins: 3.0,
    };

    assert!(features.validate().is_ok());

    let invalid_features = MatchFeatures {
        home_pass_accuracy: 1.5, // Invalid: > 1.0
        ..features
    };
    assert!(invalid_features.validate().is_err());
}

#[test]
fn test_inference_engine_prediction() {
    let model_path = "../models/match_predictor_v1.onnx";
    if !Path::new(model_path).exists() {
        println!("ONNX model not found, skipping engine test");
        return;
    }

    let engine = InferenceEngine::new(model_path, 15).unwrap();
    let features = vec![
        8.0, 6.0, 4.0, 2.0, 0.85, 0.78, 55.0, 45.0, 1.8, 0.9, 0.6, 0.4, 1.5, 1.1, 3.0,
    ];

    let probs = engine.predict(&features).unwrap();
    assert_eq!(probs.len(), 3);
    for prob in probs {
        assert!(prob >= 0.0 && prob <= 1.0);
    }
}
