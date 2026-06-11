import numpy as np
import logging
from ml.src.models.xgboost_ensemble import XGBoostMatchPredictor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_and_evaluate():
    logger.info("Initializing synthetic football match training data...")
    # Generate synthetic features (200 matches, 20 features)
    np.random.seed(42)
    X = np.random.randn(200, 20)
    # y: 0=home win, 1=draw, 2=away win
    y = np.random.randint(0, 3, size=200)

    # Train / Val Split
    X_train, X_val = X[:150], X[150:]
    y_train, y_val = y[:150], y[150:]

    logger.info("Instantiating XGBoost predictor...")
    predictor = XGBoostMatchPredictor()
    predictor.fit(X_train, y_train, X_val, y_val)

    # Evaluate
    val_preds = predictor.predict_proba(X_val)
    accuracy = np.mean(np.argmax(val_preds, axis=1) == y_val)
    logger.info(f"Validation accuracy achieved: {accuracy * 100:.2f}%")

if __name__ == "__main__":
    train_and_evaluate()
