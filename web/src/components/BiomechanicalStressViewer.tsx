import React, { useState } from 'react';
import { Activity, ShieldAlert, Zap, Heart, CheckCircle2 } from 'lucide-react';

export const BiomechanicalStressViewer: React.FC = () => {
  const [kneeFlexion, setKneeFlexion] = useState(18); // Low flexion = high ACL strain
  const [valgusAngle, setValgusAngle] = useState(18); // High valgus = collapse
  const [groundForce, setGroundForce] = useState(2400); // N

  // Calculate strain
  const baseStrain = (valgusAngle / 20.0) * 0.6 + (groundForce / 2500.0) * 0.4;
  const multiplier = kneeFlexion < 25 ? 1.45 : 1.0;
  const aclRiskPct = Math.min(98.0, Math.round(baseStrain * multiplier * 100 * 10) / 10);
  const isHighRisk = aclRiskPct > 65;

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={22} color="#ef4444" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Biomechanical Joint Stress & ACL Injury Risk Heatmap Engine
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          fontWeight: 600
        }}>
          3D POSE EVALUATOR
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Knee Flexion Angle: {kneeFlexion}° ({kneeFlexion < 25 ? 'Low - High Risk' : 'Optimal'})
          </label>
          <input
            type="range"
            min={10}
            max={60}
            value={kneeFlexion}
            onChange={(e) => setKneeFlexion(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Valgus Angle: {valgusAngle}° ({valgusAngle > 15 ? 'Knee Collapse' : 'Neutral'})
          </label>
          <input
            type="range"
            min={0}
            max={30}
            value={valgusAngle}
            onChange={(e) => setValgusAngle(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Ground Reaction Force: {groundForce} N
          </label>
          <input
            type="range"
            min={800}
            max={3500}
            step={100}
            value={groundForce}
            onChange={(e) => setGroundForce(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{
        background: isHighRisk ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
        border: '1px solid ' + (isHighRisk ? '#ef4444' : '#34d399'),
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isHighRisk ? <ShieldAlert size={28} color="#ef4444" /> : <CheckCircle2 size={28} color="#34d399" />}
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
              ACL Strain Index: {aclRiskPct}% Risk
            </h4>
            <span style={{ fontSize: '0.8rem', color: isHighRisk ? '#fca5a5' : '#86efac' }}>
              {isHighRisk ? 'CRITICAL ACL STRAIN 🚨 Reduce high-speed deceleration turns' : 'Biomechanical alignment optimal'}
            </span>
          </div>
        </div>

        <strong style={{ fontSize: '1.5rem', color: isHighRisk ? '#ef4444' : '#34d399' }}>
          {aclRiskPct}%
        </strong>
      </div>
    </div>
  );
};
