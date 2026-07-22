import React, { useState } from 'react';
import { Search, UserCheck, Shield, Award, Activity, Percent } from 'lucide-react';

interface ScoutResult {
  target_player: {
    name: string;
    team: string;
    position: string;
    passing: number;
    dribbling: number;
    pressing: number;
    defending: number;
    physicality: number;
    tactical: number;
    xt_contribution: number;
  };
  similar_players: Array<{
    player: {
      name: string;
      team: string;
      position: string;
    };
    similarity_pct: number;
    metrics: {
      passing: number;
      dribbling: number;
      pressing: number;
      defending: number;
      physicality: number;
      tactical: number;
      xt_contribution: number;
    };
  }>;
}

const PLAYER_OPTIONS = [
  'Bukayo Saka',
  'Martin Ødegaard',
  'Declan Rice',
  'William Saliba',
  'Cole Palmer',
  'Enzo Fernández',
  'Florian Wirtz',
  'Jamal Musiala',
  'Rodri',
  'Lamine Yamal'
];

export const PlayerSimilarityScout: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState('Bukayo Saka');
  const [isLoading, setIsLoading] = useState(false);
  const [scoutData, setScoutData] = useState<ScoutResult | null>(null);

  const fetchSimilarPlayers = async (playerName: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/v1/scouting/similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName, top_k: 4 })
      });

      if (res.ok) {
        const json = await res.json();
        setScoutData(json.data);
      } else {
        throw new Error('API Offline');
      }
    } catch {
      // Fallback local mock data
      setScoutData({
        target_player: {
          name: playerName,
          team: 'Target Club',
          position: 'RW/CAM',
          passing: 88,
          dribbling: 90,
          pressing: 82,
          defending: 58,
          physicality: 76,
          tactical: 89,
          xt_contribution: 0.85
        },
        similar_players: [
          {
            player: { name: 'Florian Wirtz', team: 'Bayer Leverkusen', position: 'CAM' },
            similarity_pct: 94.2,
            metrics: { passing: 91, dribbling: 90, pressing: 81, defending: 58, physicality: 70, tactical: 92, xt_contribution: 0.93 }
          },
          {
            player: { name: 'Cole Palmer', team: 'Chelsea', position: 'CAM' },
            similarity_pct: 91.8,
            metrics: { passing: 89, dribbling: 86, pressing: 76, defending: 55, physicality: 74, tactical: 89, xt_contribution: 0.88 }
          },
          {
            player: { name: 'Jamal Musiala', team: 'Bayern Munich', position: 'CAM' },
            similarity_pct: 88.5,
            metrics: { passing: 86, dribbling: 94, pressing: 79, defending: 56, physicality: 73, tactical: 88, xt_contribution: 0.89 }
          },
          {
            player: { name: 'Lamine Yamal', team: 'FC Barcelona', position: 'RW' },
            similarity_pct: 86.4,
            metrics: { passing: 85, dribbling: 93, pressing: 75, defending: 50, physicality: 68, tactical: 86, xt_contribution: 0.87 }
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSimilarPlayers(selectedPlayer);
  }, [selectedPlayer]);

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(168, 85, 247, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={22} color="#c084fc" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            AI Scouting & Player Similarity Search Engine
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(168, 85, 247, 0.2)',
          color: '#c084fc',
          fontWeight: 600
        }}>
          COSINE VECTOR MATCHING
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
          Select Target Player Profile to Match
        </label>
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '8px',
            background: '#1e293b',
            border: '1px solid #475569',
            color: '#f8fafc',
            fontSize: '0.95rem',
            fontWeight: 500
          }}
        >
          {PLAYER_OPTIONS.map(p => (
            <option key={p} value={p}>🔍 {p}</option>
          ))}
        </select>
      </div>

      {scoutData && (
        <div>
          {/* Target Summary */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.4), rgba(30, 41, 59, 0.6))',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f3e8ff' }}>
                  Target: {scoutData.target_player.name}
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#c084fc' }}>
                  {scoutData.target_player.team} • {scoutData.target_player.position}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Expected Threat (xT)</span>
                <strong style={{ display: 'block', color: '#38bdf8', fontSize: '1.1rem' }}>
                  {scoutData.target_player.xt_contribution} / match
                </strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', textAlign: 'center' }}>
              {[
                { label: 'PAS', val: scoutData.target_player.passing },
                { label: 'DRI', val: scoutData.target_player.dribbling },
                { label: 'PRS', val: scoutData.target_player.pressing },
                { label: 'DEF', val: scoutData.target_player.defending },
                { label: 'PHY', val: scoutData.target_player.physicality },
                { label: 'TAC', val: scoutData.target_player.tactical }
              ].map(m => (
                <div key={m.label} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '6px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block' }}>{m.label}</span>
                  <strong style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{m.val}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Similar Candidates Grid */}
          <h4 style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '12px' }}>
            Top Vector Match Candidates
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {scoutData.similar_players.map((item, idx) => (
              <div
                key={item.player.name}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '14px',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {item.similarity_pct}% Match
                </div>

                <h5 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#f8fafc' }}>
                  {item.player.name}
                </h5>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {item.player.team} • {item.player.position}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '0.75rem' }}>
                  <div style={{ background: '#0f172a', padding: '4px', borderRadius: '4px', textAlign: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>PAS: </span>
                    <strong style={{ color: '#38bdf8' }}>{item.metrics.passing}</strong>
                  </div>
                  <div style={{ background: '#0f172a', padding: '4px', borderRadius: '4px', textAlign: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>DRI: </span>
                    <strong style={{ color: '#c084fc' }}>{item.metrics.dribbling}</strong>
                  </div>
                  <div style={{ background: '#0f172a', padding: '4px', borderRadius: '4px', textAlign: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>TAC: </span>
                    <strong style={{ color: '#facc15' }}>{item.metrics.tactical}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
