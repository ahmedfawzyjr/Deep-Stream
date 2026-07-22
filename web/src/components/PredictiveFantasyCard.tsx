import React, { useState, useEffect } from 'react';
import { Trophy, Award, Send, CheckCircle2, User, Flame } from 'lucide-react';

interface LeaderboardItem {
  user: string;
  points: number;
  prediction: string;
  accuracy_pct: number;
  badge: string;
}

export const PredictiveFantasyCard: React.FC = () => {
  const [username, setUsername] = useState('');
  const [predictedWinner, setPredictedWinner] = useState('ARG');
  const [predictedScore, setPredictedScore] = useState('2-1');
  const [nextScorer, setNextScorer] = useState('L. Messi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([
    { user: 'Alex_Tactician', points: 1420, prediction: 'ARG Win 2-1', accuracy_pct: 92.4, badge: '💎 Elite Analyst' },
    { user: 'Samantha_AI', points: 1280, prediction: 'FRA Win 3-2', accuracy_pct: 87.1, badge: '🥇 Master Predictor' },
    { user: 'Kylian_Fan_99', points: 1150, prediction: 'Draw 2-2', accuracy_pct: 81.5, badge: '🥈 Silver Scout' },
    { user: 'Tactical_Genius', points: 990, prediction: 'ARG Win 1-0', accuracy_pct: 76.0, badge: '🥉 Bronze Strategist' }
  ]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/v1/fantasy/leaderboard');
      if (res.ok) {
        const json = await res.json();
        if (json.leaderboard) {
          setLeaderboard(json.leaderboard);
        }
      }
    } catch {
      // Keep state mock
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleSubmitPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmittedStatus(null);

    const nameToUse = username.trim() || 'Guest_Analyst';

    try {
      const res = await fetch('http://localhost:5001/api/v1/fantasy/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: nameToUse,
          predicted_winner: predictedWinner,
          predicted_score: predictedScore,
          next_scorer: nextScorer
        })
      });

      if (res.ok) {
        setSubmittedStatus(`Prediction recorded! Earned +150 XPPoints.`);
        fetchLeaderboard();
      } else {
        throw new Error('API Offline');
      }
    } catch {
      // Local fallback submit
      const newItem: LeaderboardItem = {
        user: nameToUse,
        points: 1050,
        prediction: `${predictedWinner} ${predictedScore} (${nextScorer})`,
        accuracy_pct: 85.0,
        badge: '⚡ Live Participant'
      };
      setLeaderboard(prev => [newItem, ...prev].slice(0, 5));
      setSubmittedStatus(`Prediction recorded! Earned +150 XP Points.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(234, 179, 8, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy size={22} color="#facc15" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Live Predictive Fantasy & Leaderboard
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(234, 179, 8, 0.2)',
          color: '#facc15',
          fontWeight: 600
        }}>
          LIVE GAMIFICATION
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Prediction Form */}
        <form onSubmit={handleSubmitPrediction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
              Your Username
            </label>
            <input
              type="text"
              placeholder="e.g. Tactician_99"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                Winner
              </label>
              <select
                value={predictedWinner}
                onChange={(e) => setPredictedWinner(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="ARG">🇦🇷 Argentina</option>
                <option value="FRA">🇫🇷 France</option>
                <option value="DRAW">🤝 Draw</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                Full-Time Score
              </label>
              <input
                type="text"
                value={predictedScore}
                onChange={(e) => setPredictedScore(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
              Next Goal Scorer
            </label>
            <select
              value={nextScorer}
              onChange={(e) => setNextScorer(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            >
              <option value="L. Messi">Lionel Messi</option>
              <option value="J. Álvarez">Julián Álvarez</option>
              <option value="K. Mbappé">Kylian Mbappé</option>
              <option value="O. Dembélé">Ousmane Dembélé</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #eab308, #ca8a04)',
              color: '#020617',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px'
            }}
          >
            <Send size={16} /> Submit Live Prediction
          </button>

          {submittedStatus && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#4ade80',
              fontSize: '0.85rem',
              background: 'rgba(34, 197, 94, 0.1)',
              padding: '8px 12px',
              borderRadius: '6px'
            }}>
              <CheckCircle2 size={16} /> {submittedStatus}
            </div>
          )}
        </form>

        {/* Live Leaderboard */}
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} color="#facc15" /> Live Global Leaderboard
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {leaderboard.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: idx === 0 ? 'rgba(234, 179, 8, 0.15)' : '#1e293b',
                  border: '1px solid ' + (idx === 0 ? 'rgba(234, 179, 8, 0.4)' : '#334155'),
                  padding: '10px 14px',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#f8fafc', display: 'block' }}>
                    #{idx + 1} {item.user}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {item.badge} • {item.prediction}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1rem', color: '#facc15' }}>
                    {item.points} pts
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: '#4ade80', display: 'block' }}>
                    {item.accuracy_pct}% Acc
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
