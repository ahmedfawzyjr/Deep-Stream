import React, { useState, useEffect } from 'react';
import { Target, Zap, ArrowRight, Shield, Award } from 'lucide-react';

interface PassOption {
  target_player: string;
  position: string;
  pass_type: string;
  expected_threat_gain: number;
  completion_prob_pct: number;
  q_value: number;
  rank: number;
}

export const AlphaZeroPassRecommender: React.FC = () => {
  const [ballHolder, setBallHolder] = useState('Lionel Messi');
  const [passOptions, setPassOptions] = useState<PassOption[]>([
    { target_player: 'Julián Álvarez', position: 'ST', pass_type: 'Diagonal Through-Ball', expected_threat_gain: 0.42, completion_prob_pct: 84.5, q_value: 0.89, rank: 1 },
    { target_player: 'Rodrigo De Paul', position: 'CM', pass_type: 'Short Possession Layoff', expected_threat_gain: 0.12, completion_prob_pct: 96.2, q_value: 0.72, rank: 2 },
    { target_player: 'Ángel Di María', position: 'LW', pass_type: 'Over-The-Top Switch', expected_threat_gain: 0.35, completion_prob_pct: 71.0, q_value: 0.68, rank: 3 },
  ]);

  const fetchRecommendations = async (holder: string) => {
    try {
      const res = await fetch('http://localhost:5001/api/v1/tactics/alphazero-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ball_holder: holder })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.alphazero_pass_recommendation?.all_pass_vectors) {
          setPassOptions(json.alphazero_pass_recommendation.all_pass_vectors);
        }
      }
    } catch {
      // Mock state
    }
  };

  useEffect(() => {
    fetchRecommendations(ballHolder);
  }, [ballHolder]);

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
          <Target size={22} color="#4ade80" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            AlphaZero-Style AI Optimal Pass Vector Recommender
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(34, 197, 94, 0.2)',
          color: '#4ade80',
          fontWeight: 600
        }}>
          DEEP Q-LEARNING
        </span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
          Current Ball Holder
        </label>
        <select
          value={ballHolder}
          onChange={(e) => setBallHolder(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid #475569', color: '#fff', fontSize: '0.9rem' }}
        >
          <option value="Lionel Messi">⚽ Lionel Messi (Right Wing / Playmaker)</option>
          <option value="Enzo Fernández">⚽ Enzo Fernández (Defensive Midfield)</option>
          <option value="Rodrigo De Paul">⚽ Rodrigo De Paul (Central Midfield)</option>
        </select>
      </div>

      <h4 style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '10px' }}>
        Evaluated Pass Vectors Ranked by Expected Q-Value
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {passOptions.map((opt) => (
          <div
            key={opt.target_player}
            style={{
              background: opt.rank === 1 ? 'rgba(34, 197, 94, 0.15)' : '#1e293b',
              border: '1px solid ' + (opt.rank === 1 ? '#34d399' : '#334155'),
              padding: '12px 16px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: opt.rank === 1 ? '#4ade80' : '#94a3b8' }}>
                  #{opt.rank} {opt.rank === 1 && '⭐ OPTIMAL CHOICE'}
                </span>
                <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{opt.target_player} ({opt.position})</strong>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Type: {opt.pass_type} • Threat Gain: +{opt.expected_threat_gain} xT
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <strong style={{ fontSize: '1.1rem', color: '#38bdf8', display: 'block' }}>
                Q-Value: {opt.q_value}
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>
                {opt.completion_prob_pct}% Pass Acc
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
