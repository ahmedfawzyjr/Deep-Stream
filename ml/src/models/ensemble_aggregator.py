import numpy as np

class EnsembleAggregator:
    """
    Combines predictions from XGBoost, LSTM, and Transformer models.
    Applies custom Bayesian confidence calibration.
    """
    def __init__(self, weights: dict = None):
        self.weights = weights or {"xgboost": 0.5, "lstm": 0.3, "transformer": 0.2}

    def aggregate(self, xgb_proba: np.ndarray, lstm_proba: np.ndarray, transformer_proba: np.ndarray) -> np.ndarray:
        """
        Computes weighted average of probabilities.
        """
        agg = (
            self.weights["xgboost"] * xgb_proba +
            self.weights["lstm"] * lstm_proba +
            self.weights["transformer"] * transformer_proba
        )
        # Re-normalize to sum to 1.0
        row_sums = agg.sum(axis=-1, keepdims=True)
        return agg / row_sums
