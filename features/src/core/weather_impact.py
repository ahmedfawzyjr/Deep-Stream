def calculate_weather_impact(temperature_c: float, humidity_pct: float, precipitation_mm: float, team_origin_climate: str) -> float:
    """
    Computes a fatigue/performance multiplier (-10 to 0) based on weather conditions.
    Some teams suffer more in high heat/humidity (e.g. northern European teams).
    """
    impact = 0.0

    # Extreme heat
    if temperature_c > 32:
        impact -= (temperature_c - 32) * 0.5
        if humidity_pct > 70:
            impact -= 2.0 # Muggy conditions reduce stamina

    # Wet conditions (rain slicking the pitch)
    if precipitation_mm > 5.0:
        impact -= min(precipitation_mm * 0.3, 4.0)

    # Apply climate adaptation mitigation
    if team_origin_climate in ["tropical", "arid"] and temperature_c > 30:
        impact *= 0.5 # Less impact due to acclimation

    return round(max(impact, -10.0), 2)
