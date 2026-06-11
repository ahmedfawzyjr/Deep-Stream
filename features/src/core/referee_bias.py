def calculate_referee_bias(referee_name: str, home_fouls: int, away_fouls: int) -> dict:
    """
    Looks up historical statistics for a referee and projects booking probability.
    """
    # Simple registry of mock referee stats
    ref_database = {
        "Michael Oliver": {"cards_per_game": 3.8, "home_win_ratio": 0.46},
        "Szymon Marciniak": {"cards_per_game": 4.2, "home_win_ratio": 0.52},
        "Clement Turpin": {"cards_per_game": 3.5, "home_win_ratio": 0.44},
        "Daniele Orsato": {"cards_per_game": 4.9, "home_win_ratio": 0.50}
    }

    stats = ref_database.get(referee_name, {"cards_per_game": 4.0, "home_win_ratio": 0.48})
    
    # Calculate simple dynamic match booking forecast
    foul_differential = abs(home_fouls - away_fouls)
    projected_cards = stats["cards_per_game"] + (foul_differential * 0.1)

    return {
        "referee": referee_name,
        "base_cards_per_game": stats["cards_per_game"],
        "projected_cards": round(projected_cards, 2),
        "historical_home_win_bias": stats["home_win_ratio"]
    }
