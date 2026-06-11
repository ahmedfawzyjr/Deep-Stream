"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Info, Sparkles, Shield, Cpu, RefreshCw, X } from 'lucide-react';

interface TeamNode {
  name: string;
  flag: string;
  probability: number;
}

interface Matchup {
  id: string;
  teamA: TeamNode;
  teamB: TeamNode;
  winner: string;
  stage: 'r16' | 'qf' | 'sf' | 'final';
  nextMatchId?: string;
  stats: {
    xg: string;
    shots: string;
    possession: string;
    monteCarloSims: string;
  };
}

export default function InteractiveBracket() {
  const [selectedWinner, setSelectedWinner] = useState<string>("Argentina");
  const [activeSimulation, setActiveSimulation] = useState<Matchup | null>(null);

  // Knockout stage matchups
  const matchups: Matchup[] = [
    // Round of 16
    {
      id: "r16_1",
      teamA: { name: "Argentina", flag: "🇦🇷", probability: 0.82 },
      teamB: { name: "USA", flag: "🇺🇸", probability: 0.18 },
      winner: "Argentina",
      stage: "r16",
      nextMatchId: "qf_1",
      stats: { xg: "2.35 - 0.84", shots: "14 - 6", possession: "62% - 38%", monteCarloSims: "94% Win Conf" }
    },
    {
      id: "r16_2",
      teamA: { name: "Brazil", flag: "🇧🇷", probability: 0.71 },
      teamB: { name: "Japan", flag: "🇯🇵", probability: 0.29 },
      winner: "Brazil",
      stage: "r16",
      nextMatchId: "qf_1",
      stats: { xg: "1.92 - 1.10", shots: "11 - 8", possession: "54% - 46%", monteCarloSims: "78% Win Conf" }
    },
    {
      id: "r16_3",
      teamA: { name: "France", flag: "🇫🇷", probability: 0.65 },
      teamB: { name: "Senegal", flag: "🇸🇳", probability: 0.35 },
      winner: "France",
      stage: "r16",
      nextMatchId: "qf_2",
      stats: { xg: "1.80 - 1.25", shots: "12 - 9", possession: "53% - 47%", monteCarloSims: "69% Win Conf" }
    },
    {
      id: "r16_4",
      teamA: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", probability: 0.61 },
      teamB: { name: "Croatia", flag: "🇭🇷", probability: 0.39 },
      winner: "England",
      stage: "r16",
      nextMatchId: "qf_2",
      stats: { xg: "1.65 - 1.40", shots: "10 - 11", possession: "50% - 50%", monteCarloSims: "62% Win Conf" }
    },
    // Quarter Finals
    {
      id: "qf_1",
      teamA: { name: "Argentina", flag: "🇦🇷", probability: 0.54 },
      teamB: { name: "Brazil", flag: "🇧🇷", probability: 0.46 },
      winner: "Argentina",
      stage: "qf",
      nextMatchId: "final_1",
      stats: { xg: "1.74 - 1.62", shots: "13 - 12", possession: "51% - 49%", monteCarloSims: "54% Edge" }
    },
    {
      id: "qf_2",
      teamA: { name: "France", flag: "🇫🇷", probability: 0.52 },
      teamB: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", probability: 0.48 },
      winner: "France",
      stage: "qf",
      nextMatchId: "final_1",
      stats: { xg: "1.68 - 1.55", shots: "11 - 10", possession: "49% - 51%", monteCarloSims: "52% Edge" }
    },
    // Grand Final
    {
      id: "final_1",
      teamA: { name: "Argentina", flag: "🇦🇷", probability: 0.51 },
      teamB: { name: "France", flag: "🇫🇷", probability: 0.49 },
      winner: "Argentina",
      stage: "final",
      stats: { xg: "1.45 - 1.38", shots: "9 - 9", possession: "52% - 48%", monteCarloSims: "51% Edge" }
    }
  ];

  const getMatchByTeam = (stage: 'r16' | 'qf' | 'final', index: number) => {
    return matchups.filter(m => m.stage === stage)[index];
  };

  return (
    <div style={{ padding: '20px 0', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', alignItems: 'center', flexWrap: 'nowrap', minWidth: '800px', overflowX: 'auto', padding: '20px' }}>
        
        {/* Round of 16 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>
            Round of 16
          </span>
          
          {matchups.filter(m => m.stage === 'r16').map((match) => (
            <motion.div 
              key={match.id}
              className="glass-panel"
              whileHover={{ scale: 1.03, borderColor: 'var(--color-blue)', boxShadow: '0 0 12px rgba(0, 229, 255, 0.1)' }}
              transition={{ duration: 0.2 }}
              style={{ padding: '12px 16px', width: '210px', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div 
                onClick={() => setSelectedWinner(match.teamA.name)}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', 
                  borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                  color: selectedWinner === match.teamA.name ? 'var(--color-green)' : 'inherit',
                  fontWeight: selectedWinner === match.teamA.name ? 800 : 400
                }}>
                <span>{match.teamA.flag} {match.teamA.name}</span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>{(match.teamA.probability * 100).toFixed(0)}%</span>
              </div>
              <div 
                onClick={() => setSelectedWinner(match.teamB.name)}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', paddingTop: '6px', cursor: 'pointer',
                  color: selectedWinner === match.teamB.name ? 'var(--color-green)' : 'inherit',
                  fontWeight: selectedWinner === match.teamB.name ? 800 : 400
                }}>
                <span>{match.teamB.flag} {match.teamB.name}</span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>{(match.teamB.probability * 100).toFixed(0)}%</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button 
                  onClick={() => setActiveSimulation(match)}
                  style={{ display: 'flex', alignItems: 'center', gap: '3px', border: 'none', background: 'transparent', color: 'var(--color-blue)', fontSize: '10px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  <Cpu size={10} /> Model Simulator
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SVG Neon Connectors R16 to QF */}
        <div style={{ width: '40px', height: '340px', position: 'relative' }}>
          <svg style={{ width: '100%', height: '100%', position: 'absolute', overflow: 'visible' }}>
            {/* Draw connectors */}
            <path d="M 0 50 L 20 50 L 20 120 L 40 120" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />
            <path d="M 0 190 L 20 190 L 20 120 L 40 120" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />
            
            <path d="M 0 320 L 20 320 L 20 390 L 40 390" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />
            <path d="M 0 460 L 20 460 L 20 390 L 40 390" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />

            {/* Neon glowing line path for selected winner */}
            {selectedWinner === "Argentina" && (
              <motion.path 
                d="M 0 50 L 20 50 L 20 120 L 40 120" 
                stroke="var(--color-green)" 
                strokeWidth="2.5" 
                fill="none" 
                initial={{ strokeDasharray: "100", strokeDashoffset: "100" }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1 }}
              />
            )}
            {selectedWinner === "France" && (
              <motion.path 
                d="M 0 320 L 20 320 L 20 390 L 40 390" 
                stroke="var(--color-green)" 
                strokeWidth="2.5" 
                fill="none" 
                initial={{ strokeDasharray: "100", strokeDashoffset: "100" }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1 }}
              />
            )}
          </svg>
        </div>

        {/* Quarter Finals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '110px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>
            Quarter Finals
          </span>
          
          {matchups.filter(m => m.stage === 'qf').map((match) => {
            const isHighlighted = (match.id === 'qf_1' && selectedWinner === 'Argentina') || 
                                (match.id === 'qf_2' && selectedWinner === 'France');
            return (
              <motion.div 
                key={match.id}
                className="glass-panel"
                whileHover={{ scale: 1.03 }}
                style={{ 
                  padding: '16px', 
                  width: '210px', 
                  border: isHighlighted ? '1px solid var(--color-green)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isHighlighted ? '0 0 15px rgba(0, 255, 135, 0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontWeight: selectedWinner === match.teamA.name ? 800 : 400, color: selectedWinner === match.teamA.name ? 'var(--color-green)' : 'inherit' }}>
                    {match.teamA.flag} {match.teamA.name}
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>{(match.teamA.probability * 100).toFixed(0)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px' }}>
                  <span style={{ fontWeight: selectedWinner === match.teamB.name ? 800 : 400, color: selectedWinner === match.teamB.name ? 'var(--color-green)' : 'inherit' }}>
                    {match.teamB.flag} {match.teamB.name}
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>{(match.teamB.probability * 100).toFixed(0)}%</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button 
                    onClick={() => setActiveSimulation(match)}
                    style={{ display: 'flex', alignItems: 'center', gap: '3px', border: 'none', background: 'transparent', color: 'var(--color-blue)', fontSize: '10px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    <Cpu size={10} /> Model Simulator
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* SVG Neon Connectors QF to Final */}
        <div style={{ width: '40px', height: '340px', position: 'relative' }}>
          <svg style={{ width: '100%', height: '100%', position: 'absolute', overflow: 'visible' }}>
            <path d="M 0 120 L 20 120 L 20 250 L 40 250" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />
            <path d="M 0 390 L 20 390 L 20 250 L 40 250" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />
            
            {selectedWinner === "Argentina" && (
              <motion.path 
                d="M 0 120 L 20 120 L 20 250 L 40 250" 
                stroke="var(--color-green)" 
                strokeWidth="2.5" 
                fill="none" 
                initial={{ strokeDasharray: "100", strokeDashoffset: "100" }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1 }}
              />
            )}
            {selectedWinner === "France" && (
              <motion.path 
                d="M 0 390 L 20 390 L 20 250 L 40 250" 
                stroke="var(--color-green)" 
                strokeWidth="2.5" 
                fill="none" 
                initial={{ strokeDasharray: "100", strokeDashoffset: "100" }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1 }}
              />
            )}
          </svg>
        </div>

        {/* Grand Final */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>
            World Cup Final
          </span>
          <motion.div 
            className="glass-panel"
            whileHover={{ scale: 1.04 }}
            style={{ 
              padding: '20px', 
              width: '220px', 
              border: '1px solid var(--color-gold)', 
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', background: 'linear-gradient(135deg, transparent 50%, rgba(251,191,36,0.1) 50%)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontWeight: selectedWinner === "Argentina" ? 800 : 400, color: selectedWinner === "Argentina" ? 'var(--color-gold)' : 'inherit' }}>
                🇦🇷 Argentina
              </span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>51%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
              <span style={{ fontWeight: selectedWinner === "France" ? 800 : 400, color: selectedWinner === "France" ? 'var(--color-gold)' : 'inherit' }}>
                🇫🇷 France
              </span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>49%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                onClick={() => setActiveSimulation(matchups[6])}
                style={{ display: 'flex', alignItems: 'center', gap: '3px', border: 'none', background: 'transparent', color: 'var(--color-gold)', fontSize: '10px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                <Sparkles size={10} /> Final Forecast
              </button>
            </div>
          </motion.div>
        </div>

        {/* Projected Champion Showcase */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '32px', minWidth: '150px' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '84px', height: '84px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)' }}
          >
            <Trophy size={42} color="gold" style={{ filter: 'drop-shadow(0 0 15px rgba(251,191,36,0.6))' }} />
          </motion.div>
          <span style={{ color: 'var(--color-gold)', fontSize: '11px', fontWeight: 800, marginTop: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Projected Champion
          </span>
          <motion.span 
            key={selectedWinner}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '6px', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}
          >
            {selectedWinner.toUpperCase()} {selectedWinner === "Argentina" ? "🇦🇷" : "🇫🇷"}
          </motion.span>
        </div>

      </div>

      {/* Model Simulator Detailed Stats Overlay Popup */}
      <AnimatePresence>
        {activeSimulation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(8px)',
              display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel"
              style={{
                width: '400px', padding: '28px', border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: '#0b1329', position: 'relative'
              }}
            >
              <button 
                onClick={() => setActiveSimulation(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  Monte Carlo AI Match Simulation
                </span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: 800 }}>
                  {activeSimulation.teamA.flag} vs {activeSimulation.teamB.flag}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  1,000,000 algorithmic iterations completed
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Expected Goals (xG)</span>
                  <strong>{activeSimulation.stats.xg}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Projected Shots</span>
                  <strong>{activeSimulation.stats.shots}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Possession Split</span>
                  <strong>{activeSimulation.stats.possession}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Confidence rating</span>
                  <strong style={{ color: 'var(--color-green)' }}>{activeSimulation.stats.monteCarloSims}</strong>
                </div>
              </div>

              <button 
                onClick={() => setActiveSimulation(null)}
                style={{
                  width: '100%', padding: '12px', border: 'none', borderRadius: '8px',
                  backgroundColor: 'var(--color-green)', color: '#030712', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <RefreshCw size={14} /> Re-Simulate Calibration
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
