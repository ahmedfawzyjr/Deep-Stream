import React, { useState } from 'react';
import { Compass, Target, Sparkles, TrendingUp } from 'lucide-react';

export const PassingSonarViewer: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState('Martin Ødegaard');

  const sonars = [
    { dir: 'Forward (0°)', pct: 42, color: '#4ade80' },
    { dir: 'Right Diagonal (45°)', pct: 28, color: '#38bdf8' },
    { dir: 'Right Lateral (90°)', pct: 12, color: '#c084fc' },
    { dir: 'Backward (180°)', pct: 8, color: '#94a3b8' },
    { dir: 'Left Lateral (270°)', pct: 10, color: '#facc15' },
  ];

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(56, 189, 248, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={22} color="#38bdf8" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Per-Player 360-Degree Radial Passing Direction Sonar
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(56, 189, 248, 0.2)',
          color: '#38bdf8',
          fontWeight: 600
        }}>
          DIRECTIONAL FREQUENCY
        </span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
          Selected Playmaker Profile
        </label>
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #475569', color: '#fff', fontSize: '0.9rem' }}
        >
          <option value="Martin Ødegaard">⚽ Martin Ødegaard (CAM / Arsenal)</option>
          <option value="Kevin De Bruyne">⚽ Kevin De Bruyne (CAM / Man City)</option>
          <option value="Trent Alexander-Arnold">⚽ Trent Alexander-Arnold (RB / Liverpool)</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sonars.map((s) => (
          <div key={s.dir} style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{s.dir}</span>
              <strong style={{ color: s.color }}>{s.pct}% Frequency</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
