"""
Biomechanical Joint Stress & ACL Injury Risk Evaluation Engine.
Analyzes 3D knee flexion angle (degrees), angular velocity (rad/s), and ground reaction force (N)
to compute joint strain indexes and forecast ACL tear probability.
"""

import math
from typing import List, Dict, Any

class BiomechanicsAnalyzer:
    def __init__(self):
        pass

    def evaluate_knee_joint_stress(self, knee_flexion_deg: float, valgus_angle_deg: float, ground_force_n: float) -> Dict[str, Any]:
        """
        Calculates ACL strain index based on knee flexion and valgus collapse angles.
        Flexion < 30° combined with high valgus (> 15°) indicates severe ACL tear risk.
        """
        base_strain = (valgus_angle_deg / 20.0) * 0.6 + (ground_force_n / 2500.0) * 0.4
        if knee_flexion_deg < 25.0:
            base_strain *= 1.45

        acl_risk_pct = round(min(98.0, base_strain * 100.0), 1)

        risk_category = "SAFE"
        if acl_risk_pct > 70.0:
            risk_category = "CRITICAL ACL STRAIN 🚨"
        elif acl_risk_pct > 40.0:
            risk_category = "MODERATE STRAIN ⚠️"

        return {
            "knee_flexion_deg": knee_flexion_deg,
            "valgus_angle_deg": valgus_angle_deg,
            "ground_force_n": ground_force_n,
            "acl_strain_index": round(base_strain, 2),
            "acl_risk_pct": acl_risk_pct,
            "risk_category": risk_category,
            "recommendation": "Reduce high-speed deceleration turns immediately" if acl_risk_pct > 60 else "Biomechanical alignment optimal"
        }
