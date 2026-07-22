import React, { useState, useEffect } from 'react';
import { Bot, UserPlus, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface SubRecommendation {
  player_out: string;
  player_in: string;
  reason: string;
  recommended_minute: number;
  urgency: string;
}

export const AICoManagerPanel: React.FC = () => {
  const [matchMinute, setMatchMinute] = useState(68);
  const [advice, setAdvice] = useState<{
    tactical_alert: string;
    recommended_formation_shift: string;
    substitutions: SubRecommendation[];
  }>({
    tactical_alert: 'Opponent pressing intensity increased in central zone.',
    recommended_formation_shift: 'Shift from 4-3-3 to 4-2-3-1 for double pivot control.',
    substitutions: [
      { player_out: 'Thomas Partey (CM)', player_in: 'Mikel Merino (CM)', reason: 'Fatigue index reached 78%. Midfield press intensity dropped by 14%.', recommended_minute: 70, urgency: 'HIGH 🚨' },
      { player_out: 'Gabriel Martinelli (LW)', player_in: 'Leandro Trossard (LW)', reason: 'Opponent RB (Kyle Walker) on yellow card. Trossard 1v1 dribble efficiency +22%.', recommended_minute: 72, urgency: 'MEDIUM ⚠️' },
    ]
  });

  const fetchCoManagerAdvice = async (min: number) => {
    try {
      const res = await fetch(`http://localhost:5001/api/v1/tactics/co-manager?minute=${min}`);
      if (res.ok) {
        const json = await res.json();
        if (json.co_manager_advice) {
          setAdvice(json.co_manager_advice);
        }
      }
    } catch {
      // Mock fallback
    }
  };

  useEffect(() => {
    fetchCoManagerAdvice(matchMinute);
  }, [matchMinute]);

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
          <Bot size={22} color="#f87171" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            AI Pitchside Co-Manager & Automated Substitution Assistant
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(239, 68, 68, 0.2)',
          color: '#f87171',
          fontWeight: 600
        }}>
          LIVE CO-MANAGER
        </span>
      </div>

      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <AlertTriangle size={18} color="#f87171" />
          <strong style={{ fontSize: '0.95rem', color: '#fca5a5' }}>Live Tactical Alert (Min {matchMinute})</strong>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>{advice.tactical_alert}</p>
        <span style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '6px', display: 'block', fontWeight: 600 }}>
          💡 Recommended Formation Adjustment: {advice.recommended_formation_shift}
        </span>
      </div>

      <h4 style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '10px' }}>
        Automated Substitution Recommendations
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {advice.substitutions.map((sub, idx) => (
          <div key={idx} style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>🔴 OUT: {sub.player_out}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>🟢 IN: {sub.player_in}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Rationale: {sub.reason}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: '#facc15', fontWeight: 700, display: 'block' }}>Min {sub.recommended_minute}'</span>
              <span style={{ fontSize: '0.7rem', color: '#f87171' }}>{sub.urgency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
