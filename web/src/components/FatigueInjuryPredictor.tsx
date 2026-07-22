import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Zap, Flame, Thermometer } from 'lucide-react';

interface PlayerFatigue {
  player: string;
  stamina_pct: number;
  injury_risk_pct: number;
  risk_level: string;
  sprints_count: number;
  distance_km: number;
}

export const FatigueInjuryPredictor: React.FC<{ currentMinute?: number }> = ({ currentMinute = 65 }) => {
  const [temperature, setTemperature] = useState(28);
  const [fatigueData, setFatigueData] = useState<PlayerFatigue[]>([
    { player: 'Gabriel Martinelli', stamina_pct: 42.5, injury_risk_pct: 68.2, risk_level: 'HIGH ⚠️', sprints_count: 28, distance_km: 9.1 },
    { player: 'Bukayo Saka', stamina_pct: 54.0, injury_risk_pct: 52.4, risk_level: 'MEDIUM 🟡', sprints_count: 24, distance_km: 8.4 },
    { player: 'William Saliba', stamina_pct: 65.0, injury_risk_pct: 45.0, risk_level: 'MEDIUM 🟡', sprints_count: 10, distance_km: 7.6 },
    { player: 'Martin Ødegaard', stamina_pct: 58.2, injury_risk_pct: 32.1, risk_level: 'LOW', sprints_count: 18, distance_km: 9.8 },
    { player: 'Declan Rice', stamina_pct: 61.5, injury_risk_pct: 28.5, risk_level: 'LOW', sprints_count: 16, distance_km: 10.2 },
  ]);

  const fetchFatigueData = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/v1/analytics/fatigue-injury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minute: currentMinute, temperature })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.fatigue_analytics) {
          setFatigueData(json.fatigue_analytics);
        }
      }
    } catch {
      // Keep mock state
    }
  };

  useEffect(() => {
    fetchFatigueData();
  }, [currentMinute, temperature]);

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
          <ShieldAlert size={22} color="#ef4444" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Player Fatigue & Injury Risk Forecast Engine
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Thermometer size={16} color="#f97316" />
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Pitch Temp:</span>
          <select
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            style={{ background: '#1e293b', color: '#f97316', border: '1px solid #475569', borderRadius: '6px', padding: '2px 8px', fontSize: '0.8rem' }}
          >
            <option value={20}>20°C (Mild)</option>
            <option value={28}>28°C (Warm)</option>
            <option value={35}>35°C (Extreme Heat)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {fatigueData.map((item) => {
          const isHighRisk = item.injury_risk_pct > 60;
          return (
            <div
              key={item.player}
              style={{
                background: isHighRisk ? 'rgba(239, 68, 68, 0.12)' : '#1e293b',
                border: '1px solid ' + (isHighRisk ? 'rgba(239, 68, 68, 0.4)' : '#334155'),
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{item.player}</strong>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    background: isHighRisk ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.2)',
                    color: isHighRisk ? '#fca5a5' : '#4ade80'
                  }}>
                    {item.risk_level}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>Distance: <strong style={{ color: '#e2e8f0' }}>{item.distance_km} km</strong></span>
                  <span>Sprints: <strong style={{ color: '#e2e8f0' }}>{item.sprints_count}</strong></span>
                </div>
              </div>

              {/* Progress Gauges */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '100px', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Stamina Level</span>
                  <div style={{ height: '6px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                    <div style={{ width: `${item.stamina_pct}%`, height: '100%', background: item.stamina_pct < 45 ? '#f87171' : '#34d399' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>{item.stamina_pct}%</span>
                </div>

                <div style={{ width: '110px', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Injury Risk</span>
                  <strong style={{ fontSize: '1.1rem', color: isHighRisk ? '#ef4444' : '#fbbf24' }}>
                    {item.injury_risk_pct}%
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
