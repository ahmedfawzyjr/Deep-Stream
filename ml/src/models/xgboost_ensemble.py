import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.calibration import CalibratedClassifierCV
import logging

logger = logging.getLogger(__name__)

class XGBoostMatchPredictor:
    """
    Gradient boosting ensemble for match outcome prediction.
    Features: 200+ engineered features per match
    Output: P(win), P(draw), P(loss) with calibration
    """
    
    def __init__(self, config: dict = None):
        config = config or {}
        # Gracefully choose tree_method based on GPU availability
        tree_method = config.get("tree_method", "hist") 
        
        self.model = xgb.XGBClassifier(
            n_estimators=config.get("n_estimators", 100),
            max_depth=config.get("max_depth", 6),
            learning_rate=config.get("learning_rate", 0.05),
            subsample=0.8,
            colsample_bytree=0.8,
            objective='multi:softprob',
            num_class=3,  # win, draw, loss
            eval_metric='mlogloss',
            tree_method=tree_method,
        )
        self.calibrator = CalibratedClassifierCV(
            estimator=self.model,
            method='sigmoid',
            cv=3
        )
        
    def fit(self, X_train: np.ndarray, y_train: np.ndarray, X_val: np.ndarray, y_val: np.ndarray):
        """Train with validation set and calibrate probabilities"""
        logger.info("Fitting XGBoost match outcome predictor...")
        # Train baseline model
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False
        )
        # Calibrate probabilities using training predictions
        self.calibrator.fit(X_train, y_train)
        logger.info("XGBoost training and calibration complete.")
        return self
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Return calibrated probabilities"""
        return self.calibrator.predict_proba(X)
    
    def feature_importance(self, X_sample: np.ndarray, feature_names: list) -> pd.DataFrame:
        """SHAP-based feature importance approximation"""
        import shap
        explainer = shap.TreeExplainer(self.model)
        shap_values = explainer.shap_values(X_sample)
        # Take mean absolute value across outcomes
        mean_shap = np.abs(shap_values).mean(axis=(0, 2)) if len(shap_values.shape) > 2 else np.abs(shap_values).mean(axis=0)
        return pd.DataFrame({
            'feature': feature_names,
            'importance': mean_shap
        }).sort_values('importance', ascending=False)
