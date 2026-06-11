def calculate_momentum_vector(shots_last_10: int, danger_zone_entries: int, possession_change: float) -> float:
    """
    Computes a single float representing the attacking team's momentum (-100 to 100).
    A positive number means Team A is dominating; negative means Team B.
    """
    momentum = (shots_last_10 * 8.0) + (danger_zone_entries * 12.0) + (possession_change * 2.0)
    # Cap at -100 to 100
    return max(min(round(momentum, 2), 100.0), -100.0)
