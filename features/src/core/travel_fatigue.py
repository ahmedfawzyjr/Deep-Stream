def calculate_travel_fatigue(distance_km: float, hours_since_travel: float) -> float:
    """
    Computes travel fatigue index (0 to 100).
    Higher values represent higher fatigue levels due to long journeys and short rest intervals.
    """
    if distance_km < 100:
        return 0.0

    # Base fatigue score on distance
    base_fatigue = (distance_km / 1000.0) * 15.0 # 15 points per 1000km

    # Decay over time (stamina recovery)
    recovery_rate = max(hours_since_travel / 24.0, 1.0)
    final_fatigue = base_fatigue / recovery_rate

    return round(min(final_fatigue, 100.0), 2)
