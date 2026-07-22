import React, { useState } from 'react';
import { RefreshCw, Users, ShieldAlert, ArrowRight, Zap, TrendingUp, TrendingDown } from 'lucide-react';

interface TacticalScenarioSimulatorProps {
  currentWinProb: number;
  onApplyScenario?: (newWinProb: number) => void;
}

const PLAYERS_LIST = [
  { id: 'p1', name: 'Bukayo Saka', position: 'RW', rating: 89, team: 'Starter' },
  { id: 'p2', name: 'Martin Ødegaard', position: 'CAM', rating: 91, team: 'Starter' },
  { id: 'p3', name: 'Declan Rice', position: 'CDM', rating: 88, team: 'Starter' },
  { id: 'p4', name: 'William Saliba', position: 'CB', rating: 90, team: 'Starter' },
  { id: 'p5', name: 'Gabriel Martinelli', position: 'LW', rating: 86, team: 'Starter' },
  { id: 'p6', name: 'Florian Wirtz', position: 'CAM', rating: 92, team: 'Bench' },
  { id: 'p7', name: 'Jamal Musiala', position: 'CAM', rating: 90, team: 'Bench' },
  { id: 'p8', name: 'Cole Palmer', position: 'RW', rating: 88, team: 'Bench' },
  { id: 'p9', name: 'Rodri', position: 'CDM', rating: 93, team: 'Bench' },
  { id: 'p10', name: 'Lamine Yamal', position: 'RW', rating: 89, team: 'Bench' },
];

export const TacticalScenarioSimulator: React.FC<TacticalScenarioSimulatorProps> = ({
  currentWinProb,
  onApplyScenario
}) => {
  const [subOutId, setSubOutId] = useState('p1');
  const [subInId, setSubInId] = useState('p6');
  const [tactic, setTactic] = useState<'high_press' | 'low_block' | 'possession' | 'counter_attack'>('high_press');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{
    winProb: number;
    drawProb: number;
    lossProb: number;
    deltaPct: number;
    summary: string;
  } | null>(null);

  const handleRunSimulation = async () => {
    setIsSimulating(true);

    try {
      const res = await fetch('http://localhost:5001/api/v1/tactics/scenario-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_win_prob: currentWinProb,
          sub_out: subOutId,
          sub_in: subInId,
          tactic
        })
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.simulation;
        setSimResult({
          winProb: data.simulated_win_prob,
          drawProb: data.simulated_draw_prob,
          lossProb: data.simulated_loss_prob,
          deltaPct: data.prob_delta_pct,
          summary: `Swapping ${data.sub_out} for ${data.sub_in} under ${data.tactic_applied.replace('_', ' ').toUpperCase()} strategy.`
        });
        if (onApplyScenario) {
          onApplyScenario(data.simulated_win_prob);
        }
      } else {
        throw new Error('API offline');
      }
    } catch {
      // Local calculation fallback
      const outP = PLAYERS_LIST.find(p => p.id === subOutId);
      const inP = PLAYERS_LIST.find(p => p.id === subInId);
      const diff = ((inP?.rating || 85) - (outP?.rating || 85)) / 100;
      const tacMod = tactic === 'high_press' ? 0.04 : tactic === 'possession' ? 0.03 : -0.02;
      const newWin = Math.max(0.1, Math.min(0.9, currentWinProb + diff * 0.2 + tacMod));
      const delta = Math.round((newWin - currentWinProb) * 100);

      setSimResult({
        winProb: Math.round(newWin * 100) / 100,
        drawProb: Math.round((1 - newWin) * 0.55 * 100) / 100,
        lossProb: Math.round((1 - newWin) * 0.45 * 100) / 100,
        deltaPct: delta,
        summary: `Swapping ${outP?.name} for ${inP?.name} under ${tactic.replace('_', ' ').toUpperCase()} strategy.`
      });
      if (onApplyScenario) {
        onApplyScenario(newWin);
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const starters = PLAYERS_LIST.filter(p => p.team === 'Starter');
  const bench = PLAYERS_LIST.filter(p => p.team === 'Bench');

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={22} color="#3b82f6" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
            Tactical Substitution & Scenario Simulator ("What-If")
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(59, 130, 246, 0.2)',
          color: '#60a5fa',
          fontWeight: 600
        }}>
          AI PROBABILITY ENGINE
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Sub Out */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
            Substitute OUT (Starter)
          </label>
          <select
            value={subOutId}
            onChange={(e) => setSubOutId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
              fontSize: '0.9rem'
            }}
          >
            {starters.map(p => (
              <option key={p.id} value={p.id}>
                🔴 {p.name} ({p.position} - OVR {p.rating})
              </option>
            ))}
          </select>
        </div>

        {/* Sub In */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
            Substitute IN (Bench / Scout Target)
          </label>
          <select
            value={subInId}
            onChange={(e) => setSubInId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
              fontSize: '0.9rem'
            }}
          >
            {bench.map(p => (
              <option key={p.id} value={p.id}>
                🟢 {p.name} ({p.position} - OVR {p.rating})
              </option>
            ))}
          </select>
        </div>

        {/* Tactical Approach */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
            Team Tactical Shift
          </label>
          <select
            value={tactic}
            onChange={(e) => setTactic(e.target.value as any)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
              fontSize: '0.9rem'
            }}
          >
            <option value="high_press">⚡ High Pressing (Gegenpressing)</option>
            <option value="possession">🎯 Tiki-Taka Possession Control</option>
            <option value="counter_attack">🚀 Fast Transition Counter-Attack</option>
            <option value="low_block">🛡️ Low-Block Defensive Lock</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleRunSimulation}
        disabled={isSimulating}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: '#fff',
          border: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
        }}
      >
        {isSimulating ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
        {isSimulating ? 'Simulating 10,000 Match Outcomes...' : 'Run "What-If" Scenario Simulation'}
      </button>

      {simResult && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
            {simResult.summary}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>New Win Prob</span>
              <strong style={{ fontSize: '1.2rem', color: '#34d399' }}>
                {(simResult.winProb * 100).toFixed(1)}%
              </strong>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '0.75rem',
                marginLeft: '6px',
                color: simResult.deltaPct >= 0 ? '#34d399' : '#f87171'
              }}>
                {simResult.deltaPct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {simResult.deltaPct >= 0 ? `+${simResult.deltaPct}%` : `${simResult.deltaPct}%`}
              </span>
            </div>

            <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Draw Prob</span>
              <strong style={{ fontSize: '1.2rem', color: '#fbbf24' }}>
                {(simResult.drawProb * 100).toFixed(1)}%
              </strong>
            </div>

            <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Loss Prob</span>
              <strong style={{ fontSize: '1.2rem', color: '#f87171' }}>
                {(simResult.lossProb * 100).toFixed(1)}%
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
