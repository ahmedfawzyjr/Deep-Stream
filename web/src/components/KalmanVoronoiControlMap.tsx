import React, { useState } from 'react';
import { Layers, Activity, Shield, Sparkles, Sliders } from 'lucide-react';

export const KalmanVoronoiControlMap: React.FC = () => {
  const [homeControlPct, setHomeControlPct] = useState(58.4);
  const [kalmanFilterActive, setKalmanFilterActive] = useState(true);

  const awayControlPct = Number((100 - homeControlPct).toFixed(1));
  const homeSqm = Math.round((homeControlPct / 100) * 7140);
  const awaySqm = Math.round((awayControlPct / 100) * 7140);

  // Voronoi grid cell representation (6x4 grid)
  const VORONOI_CELLS = [
    { team: 'home', intensity: 0.8 }, { team: 'home', intensity: 0.9 }, { team: 'home', intensity: 0.7 }, { team: 'away', intensity: 0.6 },
    { team: 'home', intensity: 0.9 }, { team: 'home', intensity: 0.95 }, { team: 'home', intensity: 0.85 }, { team: 'away', intensity: 0.75 },
    { team: 'home', intensity: 0.7 }, { team: 'home', intensity: 0.85 }, { team: 'away', intensity: 0.8 }, { team: 'away', intensity: 0.9 },
    { team: 'home', intensity: 0.6 }, { team: 'away', intensity: 0.7 }, { team: 'away', intensity: 0.85 }, { team: 'away', intensity: 0.95 },
    { team: 'home', intensity: 0.5 }, { team: 'away', intensity: 0.8 }, { team: 'away', intensity: 0.9 }, { team: 'away', intensity: 0.95 },
    { team: 'away', intensity: 0.6 }, { team: 'away', intensity: 0.85 }, { team: 'away', intensity: 0.95 }, { team: 'away', intensity: 0.98 },
  ];

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={22} color="#4ade80" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Bayesian Kalman Filter & Voronoi Spatial Pitch Control Map
          </h3>
        </div>
        <button
          onClick={() => setKalmanFilterActive(!kalmanFilterActive)}
          style={{
            background: kalmanFilterActive ? 'rgba(34, 197, 94, 0.2)' : '#1e293b',
            color: kalmanFilterActive ? '#4ade80' : '#94a3b8',
            border: '1px solid ' + (kalmanFilterActive ? '#4ade80' : '#334155'),
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {kalmanFilterActive ? '● KALMAN FILTER ACTIVE' : 'RAW OPTICAL NOISE'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '12px', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Argentina Control</span>
          <strong style={{ fontSize: '1.4rem', color: '#4ade80' }}>{homeControlPct}% ({homeSqm} m²)</strong>
        </div>

        <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '12px', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>France Control</span>
          <strong style={{ fontSize: '1.4rem', color: '#c084fc' }}>{awayControlPct}% ({awaySqm} m²)</strong>
        </div>
      </div>

      {/* Voronoi Pitch Grid Surface */}
      <div style={{
        height: '240px',
        borderRadius: '12px',
        background: '#071615',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(6, 1fr)',
        gap: '2px',
        padding: '2px',
        overflow: 'hidden'
      }}>
        {VORONOI_CELLS.map((cell, idx) => {
          const isHome = cell.team === 'home';
          const bg = isHome ? `rgba(34, 197, 94, ${cell.intensity * 0.45})` : `rgba(168, 85, 247, ${cell.intensity * 0.45})`;
          const border = isHome ? 'rgba(34, 197, 94, 0.3)' : 'rgba(168, 85, 247, 0.3)';

          return (
            <div
              key={idx}
              style={{
                background: bg,
                border: `1px stroke ${border}`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                color: '#fff',
                fontWeight: 700
              }}
            >
              {isHome ? 'ARG' : 'FRA'}
            </div>
          );
        })}
      </div>
    </div>
  );
};
