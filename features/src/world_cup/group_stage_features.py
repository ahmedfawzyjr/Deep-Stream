def compute_group_stage_context(points: int, goals_scored: int, goals_conceded: int, matchday: int) -> dict:
    """
    Computes features specific to the World Cup group stage.
    """
    goal_diff = goals_scored - goals_conceded
    urgency = 0.0 # scale of 0 to 10
    
    if matchday == 3:
        if points in [3, 4]:
            urgency = 9.0 # Must win/draw to qualify
        elif points in [0, 1]:
            urgency = 10.0 # Must win and rely on other matches
        else:
            urgency = 2.0 # Already qualified/safe
    elif matchday == 2:
        urgency = 6.0
    else:
        urgency = 4.0
        
    return {
        "goal_difference": goal_diff,
        "qualification_urgency": urgency,
        "points_per_match": round(points / max(matchday - 1, 1), 2)
    }
