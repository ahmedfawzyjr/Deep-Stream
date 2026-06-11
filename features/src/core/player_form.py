import numpy as np

def calculate_player_form(match_ratings: list) -> float:
    """
    Computes a weighted player form vector over the last 10 matches.
    Ratings closer to current date are exponentially weighted higher.
    """
    if not match_ratings:
        return 6.0 # Average default rating
    
    # Cap at last 10 matches
    ratings = match_ratings[-10:]
    n = len(ratings)
    
    # Exponential decay weights
    weights = np.exp(np.linspace(-1, 0, n))
    weights /= weights.sum()
    
    weighted_rating = np.dot(ratings, weights)
    return float(round(weighted_rating, 2))
