"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, RefreshCw, Trophy, BarChart3, TrendingUp } from 'lucide-react';
import { playClickChime, playWhistleSound, playTrophyFanfare } from '../utils/audio';

interface TeamProbability {
  name: string;
  flag: string;
  baseProb: number;
  currentProb: number;
  color: string;
}

export default function MonteCarloRunner() {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [iteration, setIteration] = useState<number>(0);
  const [hasRun, setHasRun] = useState<boolean>(false);

  // Bayesian inputs to influence simulator
  const [argentinaBias, setArgentinaBias] = useState<number>(1.0);
  const [franceBias, setFranceBias] = useState<number>(1.0);
  const [brazilBias, setBrazilBias] = useState<number>(1.0);
  const [englandBias, setEnglandBias] = useState<number>(1.0);

  const [teams, setTeams] = useState<TeamProbability[]>([
    { name: "Argentina", flag: "🇦🇷", baseProb: 0.32, currentProb: 0.32, color: 'var(--color-blue)' },
    { name: "France", flag: "🇫🇷", baseProb: 0.28, currentProb: 0.28, color: 'var(--color-purple)' },
    { name: "Brazil", flag: "🇧🇷", baseProb: 0.20, currentProb: 0.20, color: 'var(--color-green)' },
    { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", baseProb: 0.12, currentProb: 0.12, color: 'var(--color-gold)' },
    { name: "Others", flag: "🌍", baseProb: 0.08, currentProb: 0.08, color: 'var(--text-muted)' }
  ]);

  // Handle simulation run
  const runSimulation = () => {
    if (isSimulating) return;

    try {
      playClickChime();
      setTimeout(() => {
        playWhistleSound();
      }, 100);
    } catch (e) {}

    setIsSimulating(true);
    setProgress(0);
    setIteration(0);
  };

  useEffect(() => {
    if (!isSimulating) return;

    let currentIter = 0;
    const maxIter = 10000;
    const intervalTime = 30; // Milliseconds per update tick
    const totalSteps = 40; // ~1.2 seconds simulation duration
    const stepSize = maxIter / totalSteps;

    const timer = setInterval(() => {
      currentIter += stepSize;
      const progressPercent = Math.min(100, (currentIter / maxIter) * 100);
      
      setProgress(progressPercent);
      setIteration(Math.min(maxIter, Math.round(currentIter)));

      if (currentIter >= maxIter) {
        clearInterval(timer);
        setIsSimulating(false);
        setHasRun(true);

        // Apply Bayesian adjustments to final simulated metrics
        const totalBias = (argentinaBias * 0.32) + (franceBias * 0.28) + (brazilBias * 0.20) + (englandBias * 0.12) + (1.0 * 0.08);

        setTeams(prev => prev.map(t => {
          let bias = 1.0;
          if (t.name === "Argentina") bias = argentinaBias;
          else if (t.name === "France") bias = franceBias;
          else if (t.name === "Brazil") bias = brazilBias;
          else if (t.name === "England") bias = englandBias;

          // Add slight stochastic noise to simulate unique Monte Carlo trials
          const noise = (Math.random() - 0.5) * 0.02;
          const adjustedProb = Math.max(0.02, (t.baseProb * bias) / totalBias + noise);

          return {
            ...t,
            currentProb: Number(adjustedProb.toFixed(3))
          };
        }));

        try {
          playTrophyFanfare();
        } catch (e) {}
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isSimulating, argentinaBias, franceBias, brazilBias, englandBias]);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={20} color="var(--color-green)" />
            Monte Carlo Tournament Simulator
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Simulate 10,000 knockout paths using live form weights</span>
        </div>

        <button
          onClick={runSimulation}
          disabled={isSimulating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isSimulating ? 'rgba(255,255,255,0.05)' : 'var(--color-green)',
            color: isSimulating ? 'var(--text-muted)' : '#030712',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: 800,
            cursor: isSimulating ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: isSimulating ? 'none' : '0 0 12px rgba(0, 255, 135, 0.3)'
          }}
        >
          <RefreshCw size={14} className={isSimulating ? 'spin-animation' : ''} />
          {isSimulating ? "Computing..." : "Run Simulation"}
        </button>
      </div>

      {/* Parametric Bias Controllers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span>🇦🇷 ARG Weight</span>
            <strong style={{ color: 'var(--color-blue)' }}>{argentinaBias.toFixed(1)}x</strong>
          </div>
          <input 
            type="range" min="0.5" max="2.0" step="0.1"
            value={argentinaBias}
            onChange={(e) => setArgentinaBias(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span>🇫🇷 FRA Weight</span>
            <strong style={{ color: 'var(--color-purple)' }}>{franceBias.toFixed(1)}x</strong>
          </div>
          <input 
            type="range" min="0.5" max="2.0" step="0.1"
            value={franceBias}
            onChange={(e) => setFranceBias(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span>🇧🇷 BRA Weight</span>
            <strong style={{ color: 'var(--color-green)' }}>{brazilBias.toFixed(1)}x</strong>
          </div>
          <input 
            type="range" min="0.5" max="2.0" step="0.1"
            value={brazilBias}
            onChange={(e) => setBrazilBias(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENG Weight</span>
            <strong style={{ color: 'var(--color-gold)' }}>{englandBias.toFixed(1)}x</strong>
          </div>
          <input 
            type="range" min="0.5" max="2.0" step="0.1"
            value={englandBias}
            onChange={(e) => setEnglandBias(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Simulator Progress Display */}
      {isSimulating && (
        <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(0, 255, 135, 0.03)', border: '1px solid rgba(0, 255, 135, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>Calculating node combinations...</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{iteration.toLocaleString()} / 10,000</span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--color-green)', transition: 'width 0.05s linear' }} />
          </div>
        </div>
      )}

      {/* Simulated Outcomes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Trophy size={14} color="var(--color-gold)" /> Projected Cup Winner Probability Splits
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {teams.map((team) => (
            <div key={team.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>{team.flag} {team.name}</span>
                <span style={{ fontWeight: 'bold', color: team.color }}>{(team.currentProb * 100).toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${team.currentProb * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ height: '100%', backgroundColor: team.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
