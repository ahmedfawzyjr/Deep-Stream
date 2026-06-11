import numpy as np

def calculate_shot_xg(distance: float, angle_degrees: float, body_part: str, play_type: str) -> float:
    """
    Computes Expected Goal (xG) for a single shot.
    Uses log-odds ratio estimation based on distance and shooting angle.
    """
    # Simple logistic regression coefficients
    intercept = 0.5
    coeff_dist = -0.15
    coeff_angle = 0.05
    
    # Distance penalty
    score = intercept + (coeff_dist * distance) + (coeff_angle * angle_degrees)
    
    # Adjust for qualifiers
    if body_part == "header":
        score -= 0.5
    elif body_part == "strong_foot":
        score += 0.3
        
    if play_type == "penalty":
        return 0.79 # Fixed penalty probability standard
    elif play_type == "counter_attack":
        score += 0.4
        
    # Logistic sigmoid
    xg = 1.0 / (1.0 + np.exp(-score))
    return float(round(xg, 3))
