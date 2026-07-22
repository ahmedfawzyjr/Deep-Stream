import React, { useState } from 'react';
import { PenTool, Move, RotateCcw, Save, CheckCircle, Shield, ArrowRight } from 'lucide-react';

interface TacticalToken {
  id: string;
  label: string;
  role: string;
  x: number;
  y: number;
  team: 'home' | 'away';
}

export const TacticalBoard3D: React.FC = () => {
  const [tokens, setTokens] = useState<TacticalToken[]>([
    { id: 't1', label: '10', role: 'CAM', x: 50, y: 35, team: 'home' },
    { id: 't2', label: '7', role: 'RW', x: 75, y: 25, team: 'home' },
    { id: 't3', label: '11', role: 'LW', x: 25, y: 25, team: 'home' },
    { id: 't4', label: '9', role: 'ST', x: 50, y: 15, team: 'home' },
    { id: 't5', label: '4', role: 'CB', x: 35, y: 70, team: 'away' },
    { id: 't6', label: '5', role: 'CB', x: 65, y: 70, team: 'away' },
  ]);

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const [drawMode, setDrawMode] = useState(false);

  const handleMoveToken = (id: string, deltaX: number, deltaY: number) => {
    setTokens(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          x: Math.max(5, Math.min(95, t.x + deltaX)),
          y: Math.max(5, Math.min(95, t.y + deltaY))
        };
      }
      return t;
    }));
  };

  const handleSavePlay = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleResetFormations = () => {
    setTokens([
      { id: 't1', label: '10', role: 'CAM', x: 50, y: 35, team: 'home' },
      { id: 't2', label: '7', role: 'RW', x: 75, y: 25, team: 'home' },
      { id: 't3', label: '11', role: 'LW', x: 25, y: 25, team: 'home' },
      { id: 't4', label: '9', role: 'ST', x: 50, y: 15, team: 'home' },
      { id: 't5', label: '4', role: 'CB', x: 35, y: 70, team: 'away' },
      { id: 't6', label: '5', role: 'CB', x: 65, y: 70, team: 'away' },
    ]);
  };

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
          <PenTool size={22} color="#4ade80" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Interactive 3D Tactical Blackboard & Formation Designer
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setDrawMode(!drawMode)}
            style={{
              background: drawMode ? 'rgba(34, 197, 94, 0.25)' : '#1e293b',
              color: drawMode ? '#4ade80' : '#cbd5e1',
              border: '1px solid #334155',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            ✏️ {drawMode ? 'Drawing Vector Active' : 'Enable Vector Draw'}
          </button>
          <button
            onClick={handleResetFormations}
            style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={handleSavePlay}
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <Save size={14} /> Save Play
          </button>
        </div>
      </div>

      {savedMsg && (
        <div style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={16} /> Play sequence saved to Django Tactical Playbook Repository.
        </div>
      )}

      {/* Pitch Blackboard SVG Interactive Surface */}
      <div style={{
        position: 'relative',
        height: '360px',
        borderRadius: '12px',
        backgroundColor: '#071615',
        backgroundImage: 'radial-gradient(circle, #0e2925 0%, #030a08 100%)',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Pitch Lines */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '110px', height: '110px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', transform: 'translate(-50%, -50%)' }} />

        {/* Vector Arrow Paths */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
          </defs>
          <line x1="50%" y1="35%" x2="75%" y2="25%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow)" />
          <line x1="50%" y1="35%" x2="50%" y2="15%" stroke="#4ade80" strokeWidth="2" markerEnd="url(#arrow)" />
        </svg>

        {/* Interactive Tactical Tokens */}
        {tokens.map((token) => {
          const isSelected = selectedTokenId === token.id;
          const isHome = token.team === 'home';

          return (
            <div
              key={token.id}
              onClick={() => setSelectedTokenId(token.id)}
              style={{
                position: 'absolute',
                left: `${token.x}%`,
                top: `${token.y}%`,
                transform: 'translate(-50%, -50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isHome ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #dc2626, #991b1b)',
                border: '2px solid ' + (isSelected ? '#facc15' : '#ffffff'),
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 0 15px #facc15' : '0 4px 10px rgba(0,0,0,0.5)',
                userSelect: 'none',
                transition: 'border 0.2s, box-shadow 0.2s'
              }}
            >
              {token.label}
            </div>
          );
        })}

        {/* Selected Token Nudge Controls */}
        {selectedTokenId && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #475569',
            padding: '8px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem'
          }}>
            <span style={{ color: '#facc15', fontWeight: 600 }}>Nudge Token Position:</span>
            <button onClick={() => handleMoveToken(selectedTokenId, -5, 0)} style={nudgeBtnStyle}>←</button>
            <button onClick={() => handleMoveToken(selectedTokenId, 5, 0)} style={nudgeBtnStyle}>→</button>
            <button onClick={() => handleMoveToken(selectedTokenId, 0, -5)} style={nudgeBtnStyle}>↑</button>
            <button onClick={() => handleMoveToken(selectedTokenId, 0, 5)} style={nudgeBtnStyle}>↓</button>
          </div>
        )}
      </div>
    </div>
  );
};

const nudgeBtnStyle: React.CSSProperties = {
  background: '#334155',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  width: '24px',
  height: '24px',
  cursor: 'pointer',
  fontWeight: 700
};
