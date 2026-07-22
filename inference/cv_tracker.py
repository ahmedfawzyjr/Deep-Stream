"""
Computer Vision & Automated Object Tracking Engine (YOLOv8 + Homography Pitch Calibration).
Processes input match video frames, tracks players and ball bounding boxes,
and maps pixel coordinates (u, v) to 2D pitch telemetry meters (x, y) for Go WebSocket streaming.
"""

import math
import json
from typing import List, Dict, Any, Tuple

class CVPlayerTracker:
    def __init__(self, pitch_length: float = 105.0, pitch_width: float = 68.0):
        self.pitch_length = pitch_length
        self.pitch_width = pitch_width
        # Homography Matrix mock transformation (Pixel space 1920x1080 -> Pitch space 105x68 meters)
        self.H_matrix = [
            [0.0547, -0.0012, -12.4],
            [0.0008, 0.0628, -8.1],
            [0.00001, 0.00003, 1.0]
        ]

    def pixel_to_pitch_coords(self, u: float, v: float) -> Tuple[float, float]:
        """Transforms image pixel coordinates (u,v) to pitch coordinates (x,y) in meters."""
        denom = self.H_matrix[2][0] * u + self.H_matrix[2][1] * v + self.H_matrix[2][2]
        if abs(denom) < 1e-6:
            denom = 1.0
        
        x = (self.H_matrix[0][0] * u + self.H_matrix[0][1] * v + self.H_matrix[0][2]) / denom
        y = (self.H_matrix[1][0] * u + self.H_matrix[1][1] * v + self.H_matrix[1][2]) / denom

        # Clamp within pitch boundaries
        x_clamped = max(0.0, min(self.pitch_length, x))
        y_clamped = max(0.0, min(self.pitch_width, y))
        return round(x_clamped, 2), round(y_clamped, 2)

    def process_frame_detections(self, frame_idx: int, detections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Accepts frame detections:
        [{"id": 10, "class": "player", "team": "home", "bbox": [960, 540, 40, 80]}, ...]
        Outputs structured spatial telemetry.
        """
        home_players = []
        away_players = []
        ball_pos = None

        for det in detections:
            cls = det.get("class", "player")
            bbox = det.get("bbox", [0, 0, 10, 10])
            # Feet contact point estimation (bottom-center of bounding box)
            u_foot = bbox[0] + bbox[2] / 2.0
            v_foot = bbox[1] + bbox[3]

            pitch_x, pitch_y = self.pixel_to_pitch_coords(u_foot, v_foot)

            if cls == "ball":
                ball_pos = {"x": pitch_x, "y": pitch_y, "z": 0.2}
            elif cls == "player":
                player_obj = {
                    "track_id": det.get("id"),
                    "number": det.get("number", 0),
                    "pitch_x": pitch_x,
                    "pitch_y": pitch_y,
                    "speed_mps": round(det.get("speed", 3.2), 2)
                }
                if det.get("team") == "home":
                    home_players.append(player_obj)
                else:
                    away_players.append(player_obj)

        if not ball_pos:
            ball_pos = {"x": 52.5, "y": 34.0, "z": 0.0}

        return {
            "frame": frame_idx,
            "timestamp_ms": frame_idx * 40, # 25 FPS
            "telemetry": {
                "ball": ball_pos,
                "home_team": home_players,
                "away_team": away_players
            }
        }

    def simulate_video_stream(self, total_frames: int = 10) -> List[Dict[str, Any]]:
        """Generates synthetic video detection stream for testing."""
        stream = []
        for f in range(total_frames):
            mock_detections = [
                {"id": 10, "class": "player", "team": "home", "number": 10, "bbox": [900 + f * 5, 500, 30, 70]},
                {"id": 7, "class": "player", "team": "home", "number": 7, "bbox": [700 + f * 2, 400, 30, 70]},
                {"id": 9, "class": "player", "team": "away", "number": 9, "bbox": [1100 - f * 4, 520, 30, 70]},
                {"id": 0, "class": "ball", "bbox": [920 + f * 6, 530, 10, 10]}
            ]
            stream.append(self.process_frame_detections(f, mock_detections))
        return stream
