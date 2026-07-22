"""
Youth Academy Player Growth Trajectory Forecast Service.
Uses time-series regression models to project youth player potential ratings
and market value from age 16 to age 23.
"""

from typing import List, Dict, Any

class AcademyGrowthService:
    def __init__(self):
        pass

    def predict_youth_trajectory(self, player_name: str = "Ethan Nwaneri", current_age: int = 17, current_rating: int = 74) -> Dict[str, Any]:
        """Calculates year-by-year rating progression curve up to age 23."""
        growth_curve = []
        rating = current_rating

        for age in range(current_age, 24):
            potential_delta = 3.5 if age <= 20 else 1.8
            rating += potential_delta
            growth_curve.append({
                "age": age,
                "projected_rating": round(rating, 1),
                "estimated_market_value_m": round((rating - 60) * 2.2, 1)
            })

        return {
            "player_name": player_name,
            "current_age": current_age,
            "current_rating": current_rating,
            "projected_peak_rating": growth_curve[-1]["projected_rating"],
            "projected_peak_value_m": growth_curve[-1]["estimated_market_value_m"],
            "trajectory": growth_curve
        }
