# DeepStream — Python ML Training Pipeline

This directory contains the machine learning pipeline used to train the soccer match outcome prediction model on the free, professional-grade StatsBomb Open Dataset.

## Pipeline Structure

```text
ml/
├── data/
│   ├── fetch_statsbomb.py  ← Fetches La Liga matches/events with local caching
│   └── preprocess.py       ← Performs feature engineering & rolling calculations
├── models/                 ← Directory for saving training weights locally
├── notebooks/
│   └── 01_eda.ipynb        ← Exploratory Data Analysis & correlation heatmap
├── train.py                ← Optuna hyperparameter optimization + MLflow tracking
├── evaluate.py             ← Generates Brier scores, Confusion Matrices, importances
└── export_onnx.py          ← Converts trained XGBoost to ONNX & verifies outputs
```

## Setup & Installation

1. Create a Python 3.11 virtual environment and activate it:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Pipeline

### Step 1: Preprocess Data
Download match events and engineer the 15 features:
```bash
python data/preprocess.py
```
*Note: This script will download matches/events from StatsBomb and cache them under `data/raw/` so subsequent runs are instantaneous.*

### Step 2: Train Model
Execute the training pipeline with Optuna hyperparameter optimization (50 trials) and MLflow tracking:
```bash
python train.py
```

### Step 3: Evaluate Model
Generate performance charts (Confusion Matrix & Feature Importance plots) and print the evaluation table:
```bash
python evaluate.py
```
This saves plots to `../docs/benchmarks/confusion_matrix.png` and `../docs/benchmarks/feature_importance.png`.

### Step 4: Export to ONNX
Export the trained model to the top-level directory for Go and Rust serving:
```bash
python export_onnx.py
```
This writes the serialized model to `../models/match_predictor_v1.onnx` and the feature names to `../models/feature_names.json`.
