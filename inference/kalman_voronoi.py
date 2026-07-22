"""
Bayesian Kalman Filter & Voronoi Spatial Pitch Control Engine.
Implements 2D Kalman State Filtering (x, y, vx, vy) for optical tracking noise suppression
and calculates Voronoi pitch dominance area tessellation for home vs away teams.
"""

import math
from typing import List, Dict, Any, Tuple

class KalmanFilter2D:
    def __init__(self, process_noise: float = 0.1, measurement_noise: float = 0.5):
        # State: [x, y, vx, vy]
        self.x = [50.0, 34.0, 0.0, 0.0]
        self.p = [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 10.0, 0.0], [0.0, 0.0, 0.0, 10.0]]
        self.q = process_noise
        self.r = measurement_noise

    def update(self, z_x: float, z_y: float, dt: float = 0.04) -> Tuple[float, float, float, float]:
        """Predicts and updates state with measurement (z_x, z_y)."""
        # State transition
        self.x[0] += self.x[2] * dt
        self.x[1] += self.x[3] * dt

        # Kalman gain calculation
        k_x = self.p[0][0] / (self.p[0][0] + self.r)
        k_y = self.p[1][1] / (self.p[1][1] + self.r)

        # State correction
        self.x[0] += k_x * (z_x - self.x[0])
        self.x[1] += k_y * (z_y - self.x[1])
        self.x[2] = (z_x - self.x[0]) / dt if dt > 0 else 0.0
        self.x[3] = (z_y - self.x[1]) / dt if dt > 0 else 0.0

        return round(self.x[0], 2), round(self.x[1], 2), round(self.x[2], 2), round(self.x[3], 2)

class KalmanVoronoiEngine:
    def __init__(self, pitch_area_sqm: float = 7140.0):
        self.pitch_area_sqm = pitch_area_sqm
        self.kalman_filters = {}

    def compute_voronoi_control(self, home_players: List[Tuple[float, float]], away_players: List[Tuple[float, float]]) -> Dict[str, Any]:
        """
        Calculates spatial pitch control percentages using nearest-neighbor Voronoi tessellation logic.
        """
        grid_cols = 20
        grid_rows = 15
        total_cells = grid_cols * grid_rows

        home_cells = 0
        away_cells = 0

        for r in range(grid_rows):
            cell_y = (r / grid_rows) * 68.0
            for c in range(grid_cols):
                cell_x = (c / grid_cols) * 105.0

                min_home_dist = min(math.hypot(cell_x - px, cell_y - py) for px, py in home_players) if home_players else 999.0
                min_away_dist = min(math.hypot(cell_x - px, cell_y - py) for px, py in away_players) if away_players else 999.0

                if min_home_dist < min_away_dist:
                    home_cells += 1
                else:
                    away_cells += 1

        home_control_pct = round((home_cells / total_cells) * 100.0, 1)
        away_control_pct = round((away_cells / total_cells) * 100.0, 1)

        return {
            "home_control_pct": home_control_pct,
            "away_control_pct": away_control_pct,
            "home_controlled_sqm": round((home_control_pct / 100.0) * self.pitch_area_sqm, 1),
            "away_controlled_sqm": round((away_control_pct / 100.0) * self.pitch_area_sqm, 1),
            "dominant_team": "HOME 🟢" if home_control_pct >= away_control_pct else "AWAY 🟣"
        }
