"""
AI Scouting & Player Similarity Engine + Tactical Scenario Simulator.
Provides vector cosine similarity search for scouting and calculates 
win/draw/loss probability shifts for substitution scenarios.
"""

import math
from typing import List, Dict, Any

class ScoutingService:
    def __init__(self):
        # Database of player metric profiles (normalized 0-100)
        self.player_db = [
            {"id": "p1", "name": "Bukayo Saka", "team": "Arsenal", "position": "RW", "passing": 84, "dribbling": 89, "pressing": 82, "defending": 60, "physicality": 76, "tactical": 88, "xt_contribution": 0.82},
            {"id": "p2", "name": "Martin Ødegaard", "team": "Arsenal", "position": "CAM", "passing": 92, "dribbling": 87, "pressing": 85, "defending": 64, "physicality": 72, "tactical": 94, "xt_contribution": 0.91},
            {"id": "p3", "name": "Declan Rice", "team": "Arsenal", "position": "CDM", "passing": 86, "dribbling": 80, "pressing": 90, "defending": 88, "physicality": 89, "tactical": 90, "xt_contribution": 0.65},
            {"id": "p4", "name": "William Saliba", "team": "Arsenal", "position": "CB", "passing": 85, "dribbling": 74, "pressing": 78, "defending": 92, "physicality": 88, "tactical": 91, "xt_contribution": 0.40},
            {"id": "p5", "name": "Gabriel Martinelli", "team": "Arsenal", "position": "LW", "passing": 78, "dribbling": 88, "pressing": 87, "defending": 58, "physicality": 80, "tactical": 82, "xt_contribution": 0.79},
            {"id": "p6", "name": "Cole Palmer", "team": "Chelsea", "position": "CAM", "passing": 89, "dribbling": 86, "pressing": 76, "defending": 55, "physicality": 74, "tactical": 89, "xt_contribution": 0.88},
            {"id": "p7", "name": "Enzo Fernández", "team": "Chelsea", "position": "CM", "passing": 90, "dribbling": 81, "pressing": 80, "defending": 75, "physicality": 76, "tactical": 87, "xt_contribution": 0.74},
            {"id": "p8", "name": "Moises Caicedo", "team": "Chelsea", "position": "CDM", "passing": 82, "dribbling": 78, "pressing": 92, "defending": 87, "physicality": 86, "tactical": 85, "xt_contribution": 0.58},
            {"id": "p9", "name": "Florian Wirtz", "team": "Bayer Leverkusen", "position": "CAM", "passing": 91, "dribbling": 90, "pressing": 81, "defending": 58, "physicality": 70, "tactical": 92, "xt_contribution": 0.93},
            {"id": "p10", "name": "Jamal Musiala", "team": "Bayern Munich", "position": "CAM", "passing": 86, "dribbling": 94, "pressing": 79, "defending": 56, "physicality": 73, "tactical": 88, "xt_contribution": 0.89},
            {"id": "p11", "name": "Rodri", "team": "Manchester City", "position": "CDM", "passing": 93, "dribbling": 83, "pressing": 88, "defending": 89, "physicality": 91, "tactical": 96, "xt_contribution": 0.78},
            {"id": "p12", "name": "Lamine Yamal", "team": "FC Barcelona", "position": "RW", "passing": 85, "dribbling": 93, "pressing": 75, "defending": 50, "physicality": 68, "tactical": 86, "xt_contribution": 0.87},
        ]

    def _extract_vector(self, p: Dict[str, Any]) -> List[float]:
        return [
            p["passing"],
            p["dribbling"],
            p["pressing"],
            p["defending"],
            p["physicality"],
            p["tactical"],
            p["xt_contribution"] * 100
        ]

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        dot = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot / (norm1 * norm2)

    def find_similar_players(self, target_player_name: str, top_k: int = 4) -> Dict[str, Any]:
        target = next((p for p in self.player_db if p["name"].lower() == target_player_name.lower()), None)
        if not target:
            # Fallback to first player if not found
            target = self.player_db[0]

        target_vec = self._extract_vector(target)
        results = []

        for p in self.player_db:
            if p["id"] == target["id"]:
                continue
            p_vec = self._extract_vector(p)
            sim = self._cosine_similarity(target_vec, p_vec)
            results.append({
                "player": p,
                "similarity_pct": round(sim * 100, 1),
                "metrics": {
                    "passing": p["passing"],
                    "dribbling": p["dribbling"],
                    "pressing": p["pressing"],
                    "defending": p["defending"],
                    "physicality": p["physicality"],
                    "tactical": p["tactical"],
                    "xt_contribution": p["xt_contribution"]
                }
            })

        results.sort(key=lambda x: x["similarity_pct"], reverse=True)
        return {
            "target_player": target,
            "similar_players": results[:top_k]
        }

    def simulate_tactical_scenario(self, base_win_prob: float, sub_out_id: str, sub_in_id: str, tactic_mode: str) -> Dict[str, Any]:
        """Calculates win/draw/loss probability shifts based on tactical sub and team approach."""
        out_player = next((p for p in self.player_db if p["id"] == sub_out_id), None)
        in_player = next((p for p in self.player_db if p["id"] == sub_in_id), None)

        quality_diff = 0.0
        if out_player and in_player:
            out_score = (out_player["passing"] + out_player["dribbling"] + out_player["pressing"] + out_player["tactical"]) / 4.0
            in_score = (in_player["passing"] + in_player["dribbling"] + in_player["pressing"] + in_player["tactical"]) / 4.0
            quality_diff = (in_score - out_score) / 100.0

        tactic_modifier = 0.0
        if tactic_mode == "high_press":
            tactic_modifier = 0.05
        elif tactic_mode == "low_block":
            tactic_modifier = -0.04  # defensive priority
        elif tactic_mode == "possession":
            tactic_modifier = 0.03
        elif tactic_mode == "counter_attack":
            tactic_modifier = 0.02

        new_win_prob = max(0.05, min(0.90, base_win_prob + quality_diff * 0.15 + tactic_modifier))
        rem_prob = 1.0 - new_win_prob
        new_draw_prob = round(rem_prob * 0.55, 3)
        new_loss_prob = round(rem_prob * 0.45, 3)

        return {
            "base_win_prob": base_win_prob,
            "simulated_win_prob": round(new_win_prob, 3),
            "simulated_draw_prob": new_draw_prob,
            "simulated_loss_prob": new_loss_prob,
            "prob_delta_pct": round((new_win_prob - base_win_prob) * 100, 1),
            "tactic_applied": tactic_mode,
            "sub_out": out_player["name"] if out_player else "Standard Starter",
            "sub_in": in_player["name"] if in_player else "Bench Sub"
        }
