"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  MapPin, 
  Shield, 
  Users,
  Compass,
  Zap,
  ChevronRight,
  TrendingDown,
  Gauge,
  Volume2,
  VolumeX,
  Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Stadium3D from '../components/Stadium3D';
import D3MomentumChart from '../components/D3MomentumChart';
import InteractiveBracket from '../components/InteractiveBracket';
import LiveCalibration from '../components/LiveCalibration';
import LiveCommentary from '../components/LiveCommentary';
import ModelComparison from '../components/ModelComparison';
import BettingSimulator from '../components/BettingSimulator';
import PassingNetwork from '../components/PassingNetwork';
import MonteCarloRunner from '../components/MonteCarloRunner';
import ShapRadar from '../components/ShapRadar';
import StadiViewStadium from '../components/StadiViewStadium';
import SeatPickerPanel, { type SeatInfo } from '../components/SeatPickerPanel';
import MatchAnalyticsBar from '../components/MatchAnalyticsBar';

import {
  playWhistleSound,
  playClickChime,
  startStadiumAmbient,
  stopStadiumAmbient
} from '../utils/audio';


interface MatchState {
  match_id: string;
  win_probability: number;
  draw_probability: number;
  loss_probability: number;
  minute: number;
  xg: {
    team_a: number;
    team_b: number;
  };
  momentum: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("live");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Stadium View state
  const [selectedSeat, setSelectedSeat] = useState<SeatInfo | null>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);

  const [scoreHome] = useState(2);
  const [scoreAway] = useState(1);
  const xgHome = 1.65;
  const xgAway = 0.98;

  const toggleSound = () => {
    if (soundEnabled) {
      stopStadiumAmbient();
      setSoundEnabled(false);
    } else {
      startStadiumAmbient();
      playWhistleSound();
      setSoundEnabled(true);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (soundEnabled) {
      playClickChime();
      if (tab === "live") {
        setTimeout(() => {
          playWhistleSound();
        }, 150);
      }
    }
  };
  
  // Bayesian Simulator States
  const [argentinaForm, setArgentinaForm] = useState<number>(85);
  const [franceForm, setFranceForm] = useState<number>(81);
  const [tacticalIndex, setTacticalIndex] = useState<number>(55);
  const [staminaIndex, setStaminaIndex] = useState<number>(88);
  const [crowdFactor, setCrowdFactor] = useState<number>(75);
  const [weatherImpact, setWeatherImpact] = useState<number>(68);

  // Probabilities derived dynamically from parametric inputs
  const [probabilities, setProbabilities] = useState({ win: 0.49, draw: 0.27, loss: 0.24 });

  // Ticker Alert Messages
  const tickerAlerts = [
    "🔥 SPATIAL UPDATE: Argentina threat index increased by +12.4% in the penalty box.",
    "📊 LIVE ESTIMATE: Expected Goals (xG) calibration matches 1M simulated Monte Carlo iterations.",
    "⚠️ PLAYER WARNING: France defensive line stamina levels falling below 70% baseline.",
    "🏟️ STADIUM VIEW: Click any seat in the Stadium View tab to preview the match from your vantage point.",
    "💡 OPTIMIZATION TIP: Click 'Model Simulator' inside the bracket to view deep feature explainability models.",
    "🏆 HISTORIC RATIO: Meta-learner models predict a 73.4% chance of penalty shootouts in tie scenarios.",
    "📍 STADIUM LIVE: 45,732 fans in attendance. Section 101–132 (Lower Tier) at 96% capacity."
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  // Rotate ticker messages
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % tickerAlerts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Update probabilities dynamically based on Bayesian sliders
  useEffect(() => {
    // Basic dynamic probability simulator formula
    const formDiff = (argentinaForm - franceForm) / 150;
    const possessionOffset = (tacticalIndex - 50) / 100;
    const staminaOffset = (staminaIndex - 80) / 200;
    const crowdOffset = (crowdFactor - 50) / 250;
    const weatherOffset = (weatherImpact - 50) / 300;

    let win = 0.45 + formDiff + possessionOffset + staminaOffset + crowdOffset + weatherOffset;
    let loss = 0.30 - formDiff - possessionOffset - (staminaOffset * 0.5) - (crowdOffset * 0.5) - weatherOffset;

    // Boundary constraints
    win = Math.max(0.1, Math.min(0.85, win));
    loss = Math.max(0.1, Math.min(0.85, loss));
    const draw = 1.0 - win - loss;

    setProbabilities({
      win: Number(win.toFixed(3)),
      draw: Number(draw.toFixed(3)),
      loss: Number(loss.toFixed(3))
    });
  }, [argentinaForm, franceForm, tacticalIndex, staminaIndex, crowdFactor, weatherImpact]);

  // Live minute counter
  const [minute, setMinute] = useState(42);
  useEffect(() => {
    const interval = setInterval(() => {
      setMinute(prev => (prev >= 90 ? 1 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      
      {/* Live Cyber Ticker */}
      <div style={{ backgroundColor: 'rgba(0, 255, 135, 0.04)', borderBottom: '1px solid rgba(0, 255, 135, 0.1)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
          <span className="pulse-live" /> AI Live Stream
        </span>
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={tickerIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'inline-block' }}
            >
              {tickerAlerts[tickerIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Premium Glassmorphic Header */}
      <header className="glass-panel" style={{ margin: '20px 28px', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <motion.img 
            src="/logo.png" 
            alt="DeepKick Logo" 
            whileHover={{ scale: 1.1, rotate: 10 }}
            style={{ width: '38px', height: '38px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 255, 135, 0.3)' }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }} className="gradient-text">
              DeepKick
            </h1>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>AI Football Analytics & 2026 World Cup Engine</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={toggleSound}
            className="nav-tab"
            style={{ color: soundEnabled ? 'var(--color-green)' : 'var(--text-muted)' }}
            title={soundEnabled ? "Mute Ambient Sounds" : "Enable Ambient Sounds"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {soundEnabled ? "Sound On" : "Sound Off"}
          </button>
          <button 
            onClick={() => handleTabChange("live")}
            className={`nav-tab ${activeTab === 'live' ? 'active' : ''}`}
          >
            <Flame size={16} /> Live Match
          </button>
          <button 
            onClick={() => handleTabChange("stadium")}
            className={`nav-tab nav-tab-stadium ${activeTab === 'stadium' ? 'active' : ''}`}
          >
            <Landmark size={16} /> Stadium View
          </button>
          <button 
            onClick={() => handleTabChange("bracket")}
            className={`nav-tab nav-tab-bracket ${activeTab === 'bracket' ? 'active' : ''}`}
          >
            <Trophy size={16} /> World Cup Bracket
          </button>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="dashboard-grid">
        <AnimatePresence mode="wait">
          {activeTab === "stadium" ? (
            <motion.div
              key="stadium-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Match Analytics Bar — shared live context */}
              <MatchAnalyticsBar
                minute={minute}
                scoreHome={scoreHome}
                scoreAway={scoreAway}
                xgHome={xgHome}
                xgAway={xgAway}
                winProb={probabilities.win}
                drawProb={probabilities.draw}
                lossProb={probabilities.loss}
              />

              {/* Stadium 3D + Seat Panel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
                {/* 3D Stadium Canvas */}
                <StadiViewStadium
                  minute={minute}
                  scoreHome={scoreHome}
                  scoreAway={scoreAway}
                  matchTitle="ARGENTINA VS SPAIN"
                  homeTeamCode="ARG"
                  awayTeamCode="ESP"
                  minimapCanvasRef={minimapRef}
                  onSeatSelect={(info) => setSelectedSeat(info)}
                />

                {/* Seat Picker Panel */}
                <SeatPickerPanel
                  seatInfo={selectedSeat}
                  minimapRef={minimapRef}
                  onCheckout={(info) => {
                    if (soundEnabled) playWhistleSound();
                  }}
                  onViewAnalytics={() => handleTabChange('live')}
                />
              </div>

              {/* Section info footer */}
              <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Landmark size={18} color="var(--color-gold)" />
                  <span style={{ fontWeight: 800, fontSize: '14px' }}>Estadio Metropolitano · Madrid, Spain</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Capacity: 67,829</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { label: 'Lower Tier', color: 'var(--color-blue)', sections: '101–132' },
                    { label: 'Club Tier', color: 'var(--color-gold)', sections: '201–224' },
                    { label: 'Upper Tier', color: 'var(--text-muted)', sections: '301–332' },
                  ].map(tier => (
                    <div key={tier.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', fontWeight: 700 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: tier.color, display: 'inline-block' }} />
                      {tier.label} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{tier.sections}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : activeTab === "live" ? (
            <motion.div 
              key="live-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              style={{ display: 'grid', gridTemplateColumns: 'inherit', gap: '28px', gridColumn: '1 / -1' }}
            >
              {/* Left Side: 3D view and D3 momentum */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* 3D Pitch canvas container */}
                <div className="glass-panel glass-panel-glow-green" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800 }}>
                      <MapPin size={20} color="var(--color-green)" /> MetLife Stadium Pitch (3D Spatial Telemetry)
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Real-time location stream</span>
                  </div>
                  <Stadium3D />
                </div>

                {/* D3 Momentum Chart */}
                <div className="glass-panel glass-panel-glow-blue" style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800 }}>
                    <TrendingUp size={20} color="var(--color-blue)" /> Dynamic Attack Momentum Vector
                  </h3>
                  <D3MomentumChart minute={minute} />
                </div>

                {/* Bayesian Calibration Sliders */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800 }}>
                    <Compass size={20} color="var(--color-green)" /> Bayesian Inference Calibration
                  </h3>
                  <LiveCalibration 
                    argentinaForm={argentinaForm}
                    setArgentinaForm={setArgentinaForm}
                    franceForm={franceForm}
                    setFranceForm={setFranceForm}
                    tacticalIndex={tacticalIndex}
                    setTacticalIndex={setTacticalIndex}
                    staminaIndex={staminaIndex}
                    setStaminaIndex={setStaminaIndex}
                    crowdFactor={crowdFactor}
                    setCrowdFactor={setCrowdFactor}
                    weatherImpact={weatherImpact}
                    setWeatherImpact={setWeatherImpact}
                    winProb={probabilities.win}
                    drawProb={probabilities.draw}
                    lossProb={probabilities.loss}
                  />
                </div>

                {/* SHAP Radar Chart Explainability */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800 }}>
                    <Activity size={20} color="var(--color-blue)" /> SHAP Explainability Vector
                  </h3>
                  <ShapRadar
                    argentinaForm={argentinaForm}
                    franceForm={franceForm}
                    tacticalIndex={tacticalIndex}
                    staminaIndex={staminaIndex}
                    crowdFactor={crowdFactor}
                    weatherImpact={weatherImpact}
                  />
                </div>

                {/* Passing Network */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <PassingNetwork />
                </div>
              </div>

              {/* Right Side: Prediction Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* Real-time Probability Breakdown */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800 }}>
                    <Sparkles size={20} color="var(--color-green)" /> Live Calibrated Probability
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>🇦🇷 Argentina Win</span>
                        <span style={{ color: 'var(--color-blue)', fontWeight: 800, fontSize: '15px' }}>{(probabilities.win * 100).toFixed(1)}%</span>
                      </div>
                      <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '5px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${probabilities.win * 100}%` }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          style={{ height: '100%', backgroundColor: 'var(--color-blue)', boxShadow: '0 0 10px rgba(0, 229, 255, 0.4)' }} 
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>🤝 Draw Prediction</span>
                        <span style={{ color: 'var(--color-green)', fontWeight: 800, fontSize: '15px' }}>{(probabilities.draw * 100).toFixed(1)}%</span>
                      </div>
                      <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '5px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${probabilities.draw * 100}%` }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          style={{ height: '100%', backgroundColor: 'var(--color-green)', boxShadow: '0 0 10px rgba(0, 255, 135, 0.4)' }} 
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>🇫🇷 France Win</span>
                        <span style={{ color: 'var(--color-purple)', fontWeight: 800, fontSize: '15px' }}>{(probabilities.loss * 100).toFixed(1)}%</span>
                      </div>
                      <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '5px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${probabilities.loss * 100}%` }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          style={{ height: '100%', backgroundColor: 'var(--color-purple)', boxShadow: '0 0 10px rgba(138, 43, 226, 0.4)' }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', padding: '16px', border: '1px solid rgba(0,255,135,0.15)', borderRadius: '10px', backgroundColor: 'rgba(0,255,135,0.02)' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-green)', lineHeight: 1.5, fontWeight: 500 }}>
                      💡 <strong>Model explanation:</strong> High confidence rating on ARGENTINA due to extreme travel fatigue factors on France's defensive line (-18% stamina forecast).
                    </p>
                  </div>
                </div>

                {/* Score & xG Tracker Panel */}
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-pink)' }}>
                      <Flame size={16} className="pulse-live" />
                      <span style={{ fontWeight: 800, fontSize: '13px', letterSpacing: '1px' }}>LIVE ({minute}')</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <div>
                      <Shield size={44} color="var(--color-blue)" />
                      <h4 style={{ margin: '8px 0 4px 0', fontSize: '14px', fontWeight: 800 }}>ARGENTINA</h4>
                    </div>
                    <div style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-1px' }}>2 - 1</div>
                    <div>
                      <Shield size={44} color="var(--color-purple)" />
                      <h4 style={{ margin: '8px 0 4px 0', fontSize: '14px', fontWeight: 800 }}>FRANCE</h4>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <div className="glass-panel" style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={14} color="var(--color-gold)" /> Expected Goals: <strong style={{ color: 'var(--color-green)' }}>1.65</strong> - <strong>0.98</strong>
                    </div>
                  </div>
                </div>

                {/* Tactical Formations Detail */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800 }}>
                    <Users size={20} color="var(--color-blue)" /> AI Formation Detection
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Argentina Formation</span>
                      <strong style={{ color: 'var(--color-blue)' }}>4-3-3 Attacking</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>France Formation</span>
                      <strong style={{ color: 'var(--color-purple)' }}>4-2-3-1 Fluid</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Pressing Intensity (PPDA)</span>
                      <strong>8.4 (High Intensity)</strong>
                    </div>
                  </div>
                </div>

                {/* Model Comparison widget */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <ModelComparison winProb={probabilities.win} drawProb={probabilities.draw} lossProb={probabilities.loss} />
                </div>

                {/* Betting Simulator */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <BettingSimulator winProb={probabilities.win} drawProb={probabilities.draw} lossProb={probabilities.loss} />
                </div>

                {/* Live Commentary log */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <LiveCommentary minute={minute} />
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="bracket-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '28px' }}
            >
              <div className="glass-panel" style={{ padding: '32px', overflowX: 'auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <h2 style={{ margin: 0, fontSize: '30px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                    <Trophy size={32} color="var(--color-gold)" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.3))' }} /> World Cup Knockout Path Visualizer
                  </h2>
                  <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>
                    Monte Carlo tree search forecasts linked to real-time team weights. Click nodes to run match simulators.
                  </p>
                </div>
                <InteractiveBracket />
              </div>

              {/* Monte Carlo Tournament Runner */}
              <MonteCarloRunner />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
