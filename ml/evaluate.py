import os
import json
import pandas as pd
import numpy as np
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, log_loss, confusion_matrix
from sklearn.preprocessing import OneHotEncoder
import mlflow

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

def calculate_brier_score(y_true, y_prob):
    """
    Computes multi-class Brier Score.
    """
    ohe = OneHotEncoder(sparse_output=False, categories=[[0, 1, 2]])
    y_true_ohe = ohe.fit_transform(y_true.values.reshape(-1, 1))
    return float(np.mean(np.sum((y_prob - y_true_ohe) ** 2, axis=1)))

def evaluate_model():
    print("Loading test dataset split...")
    df = pd.read_parquet("ml/data/processed/features.parquet")
    df = df.sort_values(by='match_date').reset_index(drop=True)
    
    X = df[FEATURE_COLS]
    y = df['result']
    
    split_idx = int(len(df) * 0.8)
    X_test = X.iloc[split_idx:]
    y_test = y.iloc[split_idx:]
    
    # Load model
    model = xgb.XGBClassifier()
    model.load_model("ml/models/best_model.json")
    
    # Predict
    preds_prob = model.predict_proba(X_test.values)
    preds = model.predict(X_test.values)
    
    # Metrics
    acc = accuracy_score(y_test, preds)
    loss = log_loss(y_test, preds_prob, labels=[0, 1, 2])
    brier = calculate_brier_score(y_test, preds_prob)
    
    print("\n==================================================")
    print("                EVALUATION SUMMARY                ")
    print("==================================================")
    print(f"Model:          XGBoost v1")
    print(f"Test Accuracy:  {acc * 100:.1f}%")
    print(f"Test Log Loss:  {loss:.4f}")
    print(f"Brier Score:    {brier:.4f}")
    print("==================================================\n")
    
    # Log to MLflow if run is active
    if mlflow.active_run():
        mlflow.log_metric("test_accuracy", acc)
        mlflow.log_metric("test_logloss", loss)
        mlflow.log_metric("brier_score", brier)

    # Save Plots
    os.makedirs("docs/benchmarks", exist_ok=True)
    
    # 1. Confusion Matrix
    plt.figure(figsize=(6, 5))
    cm = confusion_matrix(y_test, preds)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Away Win', 'Draw', 'Home Win'],
                yticklabels=['Away Win', 'Draw', 'Home Win'])
    plt.ylabel('Actual')
    plt.xlabel('Predicted')
    plt.title('Confusion Matrix')
    cm_path = "docs/benchmarks/confusion_matrix.png"
    plt.savefig(cm_path, bbox_inches='tight')
    plt.close()
    print(f"Saved confusion matrix plot to: {cm_path}")
    
    # 2. Feature Importance
    plt.figure(figsize=(10, 6))
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    sorted_features = [FEATURE_COLS[i] for i in indices]
    sorted_importances = importances[indices]
    
    sns.barplot(x=sorted_importances, y=sorted_features, palette='viridis')
    plt.title('XGBoost Feature Importances')
    plt.xlabel('Relative Importance')
    fi_path = "docs/benchmarks/feature_importance.png"
    plt.savefig(fi_path, bbox_inches='tight')
    plt.close()
    print(f"Saved feature importance plot to: {fi_path}")

if __name__ == "__main__":
    evaluate_model()
