def calculate_chemistry_score(squad_continuity_years: float, manager_tenure_months: int, recent_wins: int) -> float:
    """
    Computes squad chemistry score (0-100 scale) based on:
    - Squad continuity (how long players have played together)
    - Manager tenure
    - Recent performance/momentum
    """
    continuity_weight = 40
    manager_weight = 30
    wins_weight = 30

    # Max continuity cap at 5 years
    continuity_score = min((squad_continuity_years / 5.0) * 100, 100)
    # Max manager tenure cap at 36 months
    manager_score = min((manager_tenure_months / 36.0) * 100, 100)
    # Max recent wins cap at 5 matches
    wins_score = min((recent_wins / 5.0) * 100, 100)

    score = (continuity_score * continuity_weight +
             manager_score * manager_weight +
             wins_score * wins_weight) / 100.0
    return round(score, 2)
