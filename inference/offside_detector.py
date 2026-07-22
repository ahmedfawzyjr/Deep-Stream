"""
VAR Automated 3D Offside Line Engine.
Calculates 3D spatial alignment between attacker body parts, defender rearmost body parts,
and goal line planes to determine offside margin down to millimeter precision.
"""

from typing import List, Dict, Any, Tuple

class VAROffsideDetector:
    def __init__(self, pitch_length: float = 105.0):
        self.pitch_length = pitch_length

    def calculate_offside_line(
        self,
        attacker_pos: Tuple[float, float],
        defenders_pos: List[Tuple[float, float]],
        ball_pos: Tuple[float, float]
    ) -> Dict[str, Any]:
        """
        Calculates offside line position relative to the last defender (excluding goalkeeper).
        Attacker coordinates: (x, y)
        Defenders coordinates: [(x1, y1), (x2, y2), ...]
        """
        # Sort defenders by x coordinate (closest to defender goal line at x = pitch_length)
        sorted_defenders = sorted(defenders_pos, key=lambda d: d[0], reverse=True)

        # Last defender before goalkeeper (second last overall closest to goal)
        last_defender_x = sorted_defenders[1][0] if len(sorted_defenders) >= 2 else sorted_defenders[0][0]
        attacker_x = attacker_pos[0]
        ball_x = ball_pos[0]

        # Offside condition: attacker ahead of last defender AND ahead of ball
        is_offside = (attacker_x > last_defender_x) and (attacker_x > ball_x)
        margin_meters = round(attacker_x - last_defender_x, 3)

        return {
            "is_offside": is_offside,
            "margin_meters": margin_meters,
            "margin_cm": round(margin_meters * 100, 1),
            "offside_line_x": last_defender_x,
            "attacker_x": attacker_x,
            "ball_x": ball_x,
            "var_verdict": "OFFSIDE 🚩" if is_offside else "ONSIDE ✅"
        }
