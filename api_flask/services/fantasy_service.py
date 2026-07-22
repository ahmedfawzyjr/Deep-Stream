"""
Predictive Fantasy Football & Live Leaderboard Service.
Handles fan prediction submissions, point scoring, and live leaderboards.
"""

from typing import List, Dict, Any

class FantasyService:
    def __init__(self):
        self.predictions_db: List[Dict[str, Any]] = [
            {"user": "Alex_Tactician", "points": 1420, "prediction": "ARG Win 2-1", "accuracy_pct": 92.4, "badge": "💎 Elite Analyst"},
            {"user": "Samantha_AI", "points": 1280, "prediction": "FRA Win 3-2", "accuracy_pct": 87.1, "badge": "🥇 Master Predictor"},
            {"user": "Kylian_Fan_99", "points": 1150, "prediction": "Draw 2-2", "accuracy_pct": 81.5, "badge": "🥈 Silver Scout"},
            {"user": "Tactical_Genius", "points": 990, "prediction": "ARG Win 1-0", "accuracy_pct": 76.0, "badge": "🥉 Bronze Strategist"},
        ]

    def submit_user_prediction(self, username: str, predicted_winner: str, predicted_score: str, next_scorer: str) -> Dict[str, Any]:
        """Processes user live match prediction and calculates estimated points."""
        base_points = 100
        if predicted_winner in ["ARG", "Argentina"]:
            base_points += 50
        
        user_entry = {
            "user": username or "Guest_User",
            "points": base_points,
            "prediction": f"{predicted_winner} {predicted_score} (Scorer: {next_scorer})",
            "accuracy_pct": 85.0,
            "badge": "⚡ Live Participant"
        }
        self.predictions_db.append(user_entry)
        self.predictions_db.sort(key=lambda x: x["points"], reverse=True)

        return {
            "status": "success",
            "submitted_prediction": user_entry,
            "rank": self.get_user_rank(username or "Guest_User")
        }

    def get_user_rank(self, username: str) -> int:
        for idx, entry in enumerate(self.predictions_db):
            if entry["user"].lower() == username.lower():
                return idx + 1
        return len(self.predictions_db)

    def get_leaderboard(self, top_n: int = 5) -> List[Dict[str, Any]]:
        """Returns sorted fantasy leaderboard."""
        return self.predictions_db[:top_n]
