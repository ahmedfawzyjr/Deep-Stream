"""
Player Fatigue & Injury Risk Prediction Service.
Analyzes player workload, sprint counts, environmental heat index, and stamina degradation
to forecast muscular injury probability during live matches.
"""

from typing import List, Dict, Any

class InjuryRiskService:
    def __init__(self):
        pass

    def predict_squad_fatigue(self, match_minute: int, temperature_c: float = 28.0) -> List[Dict[str, Any]]:
        """Predicts stamina and injury risk score for active players."""
        players = [
            {"name": "Bukayo Saka", "sprints": 24, "distance_km": 8.4, "prev_injuries": 1},
            {"name": "Martin Ødegaard", "sprints": 18, "distance_km": 9.8, "prev_injuries": 0},
            {"name": "Declan Rice", "sprints": 16, "distance_km": 10.2, "prev_injuries": 0},
            {"name": "William Saliba", "sprints": 10, "distance_km": 7.6, "prev_injuries": 1},
            {"name": "Gabriel Martinelli", "sprints": 28, "distance_km": 9.1, "prev_injuries": 2},
        ]

        results = []
        for p in players:
            fatigue_index = min(100, (match_minute / 90.0) * 50 + (p["sprints"] * 1.2) + (temperature_c * 0.5))
            injury_risk_pct = round(min(95.0, (fatigue_index * 0.4) + (p["prev_injuries"] * 15.0)), 1)
            stamina_pct = round(max(10.0, 100.0 - fatigue_index * 0.7), 1)

            risk_level = "LOW"
            if injury_risk_pct > 65:
                risk_level = "HIGH ⚠️"
            elif injury_risk_pct > 40:
                risk_level = "MEDIUM 🟡"

            results.append({
                "player": p["name"],
                "stamina_pct": stamina_pct,
                "injury_risk_pct": injury_risk_pct,
                "risk_level": risk_level,
                "sprints_count": p["sprints"],
                "distance_km": p["distance_km"]
            })

        results.sort(key=lambda x: x["injury_risk_pct"], reverse=True)
        return results
