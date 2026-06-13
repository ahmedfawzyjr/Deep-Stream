import os
import json
import pandas as pd
import numpy as np
import xgboost as xgb
import onnxmltools
from onnxmltools.convert.common.data_types import FloatTensorType
import onnxruntime as ort

FEATURE_COLS = [
    'home_shots', 'away_shots',
    'home_shots_on_target', 'away_shots_on_target',
    'home_pass_accuracy', 'away_pass_accuracy',
    'home_possession_pct', 'away_possession_pct',
    'home_xg', 'away_xg',
    'home_form_last5', 'away_form_last5',
    'home_goals_scored_avg', 'away_goals_scored_avg',
    'head_to_head_home_wins'
]

def export_to_onnx():
    print("Loading XGBoost model...")
    model = xgb.XGBClassifier()
    model.load_model("ml/models/best_model.json")
    
    # Define input type (15 float features)
    initial_type = [('float_input', FloatTensorType([None, len(FEATURE_COLS)]))]
    
    print("Converting model to ONNX...")
    # Convert using onnxmltools
    onnx_model = onnxmltools.convert_xgboost(model, initial_types=initial_type, target_opset=15)
    
    # Ensure root models directory exists
    os.makedirs("models", exist_ok=True)
    onnx_path = "models/match_predictor_v1.onnx"
    
    # Save the ONNX file
    with open(onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"ONNX model saved successfully to: {onnx_path}")
    
    # Save feature names list
    feature_names_path = "models/feature_names.json"
    with open(feature_names_path, "w") as f:
        json.dump(FEATURE_COLS, f)
    print(f"Feature names saved to: {feature_names_path}")
    
    # Verify ONNX outputs against original XGBoost outputs
    print("Verifying ONNX model predictions...")
    df = pd.read_parquet("ml/data/processed/features.parquet")
    X_test = df[FEATURE_COLS].iloc[:100] # Test on first 100 rows
    
    # Original model predictions
    xgb_probs = model.predict_proba(X_test)
    
    # ONNX runtime predictions
    sess = ort.InferenceSession(onnx_path)
    input_name = sess.get_inputs()[0].name
    
    # Run session
    onnx_outputs = sess.run(None, {input_name: X_test.values.astype(np.float32)})
    
    # Parse ONNX probabilities output (output index 1 is typical for probabilities)
    # The output from converted xgboost classifier can be a list of dicts, or a multi-dimensional array.
    onnx_probs_raw = onnx_outputs[1]
    
    if isinstance(onnx_probs_raw, list):
        # List of dictionaries: [{'0': prob0, '1': prob1, '2': prob2}, ...]
        onnx_probs = np.array([[d[0], d[1], d[2]] for d in onnx_probs_raw])
    elif isinstance(onnx_probs_raw, np.ndarray):
        # Array of dicts or standard array
        if len(onnx_probs_raw.shape) == 1 and isinstance(onnx_probs_raw[0], dict):
            onnx_probs = np.array([[d[0], d[1], d[2]] for d in onnx_probs_raw])
        else:
            onnx_probs = onnx_probs_raw
    else:
        # Fallback parsing
        onnx_probs = np.array([[d[0], d[1], d[2]] for d in onnx_probs_raw])
        
    # Check max absolute difference
    max_diff = np.max(np.abs(xgb_probs - onnx_probs))
    
    print(f"ONNX model verified — max prediction diff: {max_diff:.6f}")
    assert max_diff < 1e-4, f"Prediction discrepancy is too high: {max_diff}"

if __name__ == "__main__":
    export_to_onnx()
