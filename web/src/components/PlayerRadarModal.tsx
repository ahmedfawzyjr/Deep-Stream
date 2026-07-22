import React from 'react';
import { X, Activity, Target, Zap, Shield, TrendingUp } from 'lucide-react';
import { EPLPlayer } from '../data/premierLeagueData';

interface Props {
  player: EPLPlayer | null;
  onClose: () => void;
}

export const PlayerRadarModal: React.FC<Props> = ({ player, onClose }) => {
  if (!player) return null;

  const { stats } = player;
  const axes = [
    { label: 'PAC', value: stats.pace, angle: 0 },
    { label: 'SHO', value: stats.shooting, angle: 60 },
    { label: 'PAS', value: stats.passing, angle: 120 },
    { label: 'DRI', value: stats.dribbling, angle: 180 },
    { label: 'DEF', value: stats.defending, angle: 240 },
    { label: 'PHY', value: stats.physicality, angle: 300 },
  ];

  // Radar chart polygon points math
  const cx = 100;
  const cy = 100;
  const maxRadius = 75;

  const points = axes.map(axis => {
    const rad = (axis.angle - 90) * (Math.PI / 180);
    const r = (axis.value / 100) * maxRadius;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
    return `${x},${y}`;
  }).join(' ');

  const outerPoints = axes.map(axis => {
    const rad = (axis.angle - 90) * (Math.PI / 180);
    const x = cx + maxRadius * Math.cos(rad);
    const y = cy + maxRadius * Math.sin(rad);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '540px',
        padding: '24px',
        color: '#fff',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#1e293b',
            border: 'none',
            color: '#94a3b8',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            fontWeight: 800
          }}>
            #{player.number}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>{player.name}</h3>
            <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>
              {player.team} • {player.position}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
          {/* SVG 6-Axis Radar Chart */}
          <div style={{ textAlign: 'center' }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Outer boundary polygon */}
              <polygon points={outerPoints} fill="none" stroke="#334155" strokeWidth="1" />
              <circle cx={cx} cy={cy} r={maxRadius * 0.5} fill="none" stroke="#1e293b" strokeDasharray="3,3" />

              {/* Axis lines */}
              {axes.map(axis => {
                const rad = (axis.angle - 90) * (Math.PI / 180);
                const x2 = cx + maxRadius * Math.cos(rad);
                const y2 = cy + maxRadius * Math.sin(rad);
                return <line key={axis.label} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#334155" strokeWidth="1" />;
              })}

              {/* Player metric polygon */}
              <polygon points={points} fill="rgba(56, 189, 248, 0.35)" stroke="#38bdf8" strokeWidth="2.5" />

              {/* Axis Labels */}
              {axes.map(axis => {
                const rad = (axis.angle - 90) * (Math.PI / 180);
                const tx = cx + (maxRadius + 16) * Math.cos(rad);
                const ty = cy + (maxRadius + 16) * Math.sin(rad);
                return (
                  <text
                    key={axis.label}
                    x={tx}
                    y={ty}
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {axis.label} ({axis.value})
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Player Metric Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Expected Goals (xG / 90)</span>
              <strong style={{ fontSize: '1.2rem', color: '#4ade80' }}>{player.xg}</strong>
            </div>

            <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Expected Threat (xT Gain)</span>
              <strong style={{ fontSize: '1.2rem', color: '#38bdf8' }}>+{player.xt}</strong>
            </div>

            <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Pass Accuracy</span>
              <strong style={{ fontSize: '1.2rem', color: '#facc15' }}>{player.passAccPct}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
