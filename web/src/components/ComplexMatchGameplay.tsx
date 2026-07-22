import React, { useState } from 'react';
import { PREMIER_LEAGUE_TEAMS, EPLPlayer } from '../data/premierLeagueData';
import { PlayerRadarModal } from './PlayerRadarModal';
import { Flame, Activity, Zap, Shield, Target } from 'lucide-react';

export const ComplexMatchGameplay: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<'ars_mci' | 'liv_ars'>('ars_mci');
  const [selectedPlayer, setSelectedPlayer] = useState<EPLPlayer | null>(null);
  const [showPressingLines, setShowPressingLines] = useState(true);
  const [showOffsideLine, setShowOffsideLine] = useState(true);

  const homeTeam = PREMIER_LEAGUE_TEAMS[0]; // Arsenal
  const awayTeam = PREMIER_LEAGUE_TEAMS[1]; // Man City

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
        <div>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>
            🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League Live Match Center & Tactical Gameplay
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Click ANY player node to view 6-axis Radar & Tactical Metrics
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowPressingLines(!showPressingLines)}
            style={{
              background: showPressingLines ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
              color: showPressingLines ? '#38bdf8' : '#94a3b8',
              border: '1px solid ' + (showPressingLines ? '#38bdf8' : '#334155'),
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            ⚡ Pressing Trap Vectors
          </button>
          <button
            onClick={() => setShowOffsideLine(!showOffsideLine)}
            style={{
              background: showOffsideLine ? 'rgba(239, 68, 68, 0.2)' : '#1e293b',
              color: showOffsideLine ? '#ef4444' : '#94a3b8',
              border: '1px solid ' + (showOffsideLine ? '#ef4444' : '#334155'),
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            🏁 VAR Offside Plane
          </button>
        </div>
      </div>

      {/* 2D Spatial Pitch Canvas with Passing Vectors & Clickable Player Nodes */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '380px',
        background: '#0a231c',
        borderRadius: '12px',
        border: '2px solid rgba(56, 189, 248, 0.4)',
        overflow: 'hidden'
      }}>
        {/* Pitch Field Lines */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.25)' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: '100px', height: '100px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', transform: 'translate(-50%, -50%)' }} />

        {/* VAR Offside Line */}
        {showOffsideLine && (
          <div style={{
            position: 'absolute',
            left: '74%',
            top: 0,
            bottom: 0,
            width: '2px',
            background: '#ef4444',
            boxShadow: '0 0 12px #ef4444',
            zIndex: 3
          }}>
            <span style={{ fontSize: '0.65rem', color: '#ef4444', background: '#000', padding: '2px 4px', borderRadius: '4px' }}>
              VAR LINE: 0.00m
            </span>
          </div>
        )}

        {/* Passing Vectors SVG Lines */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
          {/* Odegaard to Saka pass line */}
          <line x1="62%" y1="50%" x2="78%" y2="18%" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="5,5" />
          {/* De Bruyne to Haaland pass line */}
          <line x1="38%" y1="35%" x2="18%" y2="50%" stroke="#c084fc" strokeWidth="2.5" strokeDasharray="5,5" />
        </svg>

        {/* Home Squad Nodes (Arsenal - Red) */}
        {homeTeam.squad.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelectedPlayer(p)}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ef4444 0%, #991b1b 100%)',
              border: '2px solid #fff',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
              zIndex: 10
            }}
            title={`${p.name} (${p.position})`}
          >
            {p.number}
          </div>
        ))}

        {/* Away Squad Nodes (Man City - Sky Blue) */}
        {awayTeam.squad.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelectedPlayer(p)}
            style={{
              position: 'absolute',
              right: `${p.x}%`,
              top: `${p.y}%`,
              transform: 'translate(50%, -50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #38bdf8 0%, #0284c7 100%)',
              border: '2px solid #fff',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)',
              zIndex: 10
            }}
            title={`${p.name} (${p.position})`}
          >
            {p.number}
          </div>
        ))}
      </div>

      {/* Render Player Radar Modal if selected */}
      {selectedPlayer && (
        <PlayerRadarModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
};
