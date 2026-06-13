import os
import json
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import log_loss, accuracy_score
import optuna
import mlflow
import mlflow.xgboost

# Ensure reproducible seeds
np.random.seed(42)
optuna.logging.set_verbosity(optuna.logging.WARNING)

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

def objective(trial, X, y):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 250),
        'max_depth': trial.suggest_int('max_depth', 3, 8),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.15, log=True),
        'subsample': trial.suggest_float('subsample', 0.6, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
        'eval_metric': 'mlogloss',
        'random_state': 42,
        'n_jobs': -1
    }
    
    tscv = TimeSeriesSplit(n_splits=5)
    losses = []
    
    for train_idx, val_idx in tscv.split(X):
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
        
        clf = xgb.XGBClassifier(**params)
        clf.fit(X_train, y_train)
        
        preds = clf.predict_proba(X_val)
        losses.append(log_loss(y_val, preds, labels=[0, 1, 2]))
        
    return np.mean(losses)

def run_training():
    print("Loading engineered features dataset...")
    df = pd.read_parquet("ml/data/processed/features.parquet")
    
    # Sort chronologically to maintain Time-Series integrity
    df = df.sort_values(by='match_date').reset_index(drop=True)
    
    X = df[FEATURE_COLS]
    y = df['result']
    
    # Split train/test (80/20 time-series split)
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    print(f"Dataset split: {len(X_train)} training matches, {len(X_test)} test matches.")
    
    # Initialize MLflow experiment
    mlflow.set_experiment("DeepStream_Match_Outcome_Prediction")
    
    print("Beginning hyperparameter optimization with Optuna (50 trials)...")
    study = optuna.create_study(direction="minimize")
    study.optimize(lambda trial: objective(trial, X_train, y_train), n_trials=50)
    
    print(f"Best trial log-loss: {study.best_value:.4f}")
    print("Best hyperparameters:", study.best_params)
    
    with mlflow.start_run() as run:
        # Log Best Hyperparameters
        for key, val in study.best_params.items():
            mlflow.log_param(key, val)
            
        mlflow.log_metric("optuna_best_cv_logloss", study.best_value)
        
        # Train final model with best parameters on training set
        best_params = study.best_params
        best_params['eval_metric'] = 'mlogloss'
        best_params['random_state'] = 42
        
        print("Training final XGBoost classifier with best parameters...")
        model = xgb.XGBClassifier(**best_params)
        model.fit(X_train, y_train)
        
        # Log final model
        mlflow.xgboost.log_model(model, "xgboost_model")
        
        # Save model locally for evaluation and export stages
        os.makedirs("ml/models", exist_ok=True)
        model.save_model("ml/models/best_model.json")
        
        # Save feature column names order so Rust/Go can align them exactly
        with open("ml/models/feature_names.json", "w") as f:
            json.dump(FEATURE_COLS, f)
            
        print("Final model saved locally to ml/models/best_model.json.")

if __name__ == "__main__":
    run_training()
