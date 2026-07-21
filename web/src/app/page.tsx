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
  Landmark,
  Eye,
  Layers
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
import DeepAssistant from '../components/DeepAssistant';
import AudioVoiceControl from '../components/AudioVoiceControl';
import ESPNMatchSelector from '../components/ESPNMatchSelector';

import {
  fetchLiveSoccerMatches,
  fetchMatchPlays,
  ESPNMatch,
  ESPNPlay,
  FALLBACK_MATCHES
} from '../services/espnApi';

import {
  playWhistleSound,
  playClickChime,
  startStadiumAmbient,
  stopStadiumAmbient
} from '../utils/audio';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("stadium"); // Merged primary hub is Stadium View
  const [viewPerspective, setViewPerspective] = useState<'stadium3d' | 'pitch3d'>('stadium3d');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // ESPN API States
  const [matches, setMatches] = useState<ESPNMatch[]>(FALLBACK_MATCHES);
  const [selectedMatch, setSelectedMatch] = useState<ESPNMatch>(FALLBACK_MATCHES[0]);
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [loadingESPN, setLoadingESPN] = useState<boolean>(false);
  const [matchPlays, setMatchPlays] = useState<ESPNPlay[]>([]);

  // Stadium View state
  const [selectedSeat, setSelectedSeat] = useState<SeatInfo | null>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);

  // Sound Handler
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
      if (tab === "stadium") {
        setTimeout(() => {
          playWhistleSound();
        }, 150);
      }
    }
  };

  // Load ESPN Matches
  const loadMatches = async (league: string = selectedLeague) => {
    setLoadingESPN(true);
    try {
      const data = await fetchLiveSoccerMatches(league);
      if (data && data.length > 0) {
        setMatches(data);
        // Retain selected match if still in list, else pick first
        const current = data.find(m => m.id === selectedMatch?.id);
        if (current) {
          setSelectedMatch(current);
        } else {
          setSelectedMatch(data[0]);
        }
      }
    } catch (err) {
      console.warn('ESPN Fetch error:', err);
    } finally {
      setLoadingESPN(false);
    }
  };

  // Initial load + periodic polling for live ESPN scores
  useEffect(() => {
    loadMatches(selectedLeague);
    const interval = setInterval(() => {
      loadMatches(selectedLeague);
    }, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [selectedLeague]);

  // Load play-by-play events whenever selected match changes
  useEffect(() => {
    if (selectedMatch) {
      fetchMatchPlays(selectedMatch.id, selectedMatch.league)
        .then(plays => setMatchPlays(plays))
        .catch(() => setMatchPlays([]));
    }
  }, [selectedMatch?.id]);

  // Bayesian Simulator States
  const [teamAForm, setTeamAForm] = useState<number>(85);
  const [teamBForm, setTeamBForm] = useState<number>(81);
  const [tacticalIndex, setTacticalIndex] = useState<number>(55);
  const [staminaIndex, setStaminaIndex] = useState<number>(88);
  const [crowdFactor, setCrowdFactor] = useState<number>(75);
  const [weatherImpact, setWeatherImpact] = useState<number>(68);

  // Derived probabilities
  const winProb = selectedMatch?.probabilities.win ?? 0.49;
  const drawProb = selectedMatch?.probabilities.draw ?? 0.27;
  const lossProb = selectedMatch?.probabilities.loss ?? 0.24;

  // Minute counter auto-advance
  const minute = selectedMatch?.minute ?? 42;

  // Dynamic Ticker Alert Messages based on selected ESPN match
  const tickerAlerts = [
    `🔥 REAL-TIME STREAM: ${selectedMatch?.name ?? 'Live Match'} live score updated from ESPN endpoint.`,
    `🏟️ VENUE TELEMETRY: ${selectedMatch?.venueName ?? 'Stadium'} hosting ${selectedMatch?.homeTeam.displayName} vs ${selectedMatch?.awayTeam.displayName}.`,
    `📊 xG CALIBRATION: ${selectedMatch?.homeTeam.displayName} xG at ${selectedMatch?.homeTeam.xg ?? 1.65} vs ${selectedMatch?.awayTeam.displayName} xG at ${selectedMatch?.awayTeam.xg ?? 0.98}.`,
    `📍 SEAT PICKER: Hover or click any seat in 3D Stadium perspective to inspect 360 camera vantage points.`,
    `💡 TACTICAL AI: Pressing intensity index calculated at 8.4 (High Overload) for ${selectedMatch?.homeTeam.displayName}.`
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % tickerAlerts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [tickerAlerts.length]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      
      {/* Live Cyber Ticker */}
      <div style={{ backgroundColor: 'rgba(0, 255, 135, 0.04)', borderBottom: '1px solid rgba(0, 255, 135, 0.1)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
          <span className="pulse-live" /> ESPN Live Stream
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
      <header className="glass-panel main-header" style={{ padding: '16px 24px' }}>
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
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Unified AI Football Engine & Real ESPN Live Stream</span>
          </div>
        </div>
        
        <div className="header-actions">
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
            onClick={() => handleTabChange("stadium")}
            className={`nav-tab nav-tab-stadium ${activeTab === 'stadium' ? 'active' : ''}`}
          >
            <Landmark size={16} /> Stadium View & Live Match
          </button>
          <button 
            onClick={() => handleTabChange("bracket")}
            className={`nav-tab nav-tab-bracket ${activeTab === 'bracket' ? 'active' : ''}`}
          >
            <Trophy size={16} /> World Cup Bracket
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-grid">
        <AnimatePresence mode="wait">
          {activeTab === "stadium" ? (
            <motion.div
              key="stadium-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              {/* ESPN Match Selector Header */}
              <ESPNMatchSelector
                selectedMatch={selectedMatch}
                matches={matches}
                onSelectMatch={(m) => setSelectedMatch(m)}
                onRefresh={() => loadMatches(selectedLeague)}
                selectedLeague={selectedLeague}
                onSelectLeague={(leg) => setSelectedLeague(leg)}
                loading={loadingESPN}
              />

              {/* Shared Live Analytics Bar */}
              <MatchAnalyticsBar
                minute={minute}
                scoreHome={selectedMatch.homeTeam.score}
                scoreAway={selectedMatch.awayTeam.score}
                xgHome={selectedMatch.homeTeam.xg ?? 1.65}
                xgAway={selectedMatch.awayTeam.xg ?? 0.98}
                winProb={winProb}
                drawProb={drawProb}
                lossProb={lossProb}
                homeTeam={selectedMatch.homeTeam.displayName}
                awayTeam={selectedMatch.awayTeam.displayName}
                homeFlag={selectedMatch.homeTeam.flagEmoji}
                awayFlag={selectedMatch.awayTeam.flagEmoji}
                homeLogo={selectedMatch.homeTeam.logo}
                awayLogo={selectedMatch.awayTeam.logo}
                venueName={selectedMatch.venueName}
              />

              {/* View Perspective Toggle Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Eye size={18} color="var(--color-green)" />
                  <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Visual Telemetry Mode
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setViewPerspective('stadium3d')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: viewPerspective === 'stadium3d' ? '1px solid var(--color-green)' : '1px solid rgba(255,255,255,0.1)',
                      background: viewPerspective === 'stadium3d' ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: viewPerspective === 'stadium3d' ? 'var(--color-green)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Landmark size={14} /> 3D Stadium Seats View
                  </button>

                  <button
                    onClick={() => setViewPerspective('pitch3d')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: viewPerspective === 'pitch3d' ? '1px solid var(--color-blue)' : '1px solid rgba(255,255,255,0.1)',
                      background: viewPerspective === 'pitch3d' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: viewPerspective === 'pitch3d' ? 'var(--color-blue)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <MapPin size={14} /> 3D Tactical Pitch View
                  </button>
                </div>
              </div>

              {/* Main 3D Perspective Panel */}
              {viewPerspective === 'stadium3d' ? (
                <div className="stadium-view-grid">
                  {/* Procedural 3D Stadium Canvas */}
                  <StadiViewStadium
                    minute={minute}
                    scoreHome={selectedMatch.homeTeam.score}
                    scoreAway={selectedMatch.awayTeam.score}
                    matchTitle={selectedMatch.name.toUpperCase()}
                    homeTeamCode={selectedMatch.homeTeam.abbreviation}
                    awayTeamCode={selectedMatch.awayTeam.abbreviation}
                    minimapCanvasRef={minimapRef}
                    onSeatSelect={(info) => setSelectedSeat(info)}
                  />

                  {/* Interactive Seat Picker Panel */}
                  <SeatPickerPanel
                    seatInfo={selectedSeat}
                    minimapRef={minimapRef}
                    onCheckout={(info) => {
                      if (soundEnabled) playWhistleSound();
                    }}
                    onViewAnalytics={() => setViewPerspective('pitch3d')}
                  />
                </div>
              ) : (
                <div className="glass-panel glass-panel-glow-green" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800 }}>
                      <MapPin size={20} color="var(--color-green)" /> {selectedMatch.venueName} (3D Tactical Pitch Telemetry)
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Real-time location stream</span>
                  </div>
                  <Stadium3D />
                </div>
              )}

              {/* Multilingual Stadium Voice & Soundboard */}
              <AudioVoiceControl />

              {/* Analytics Grid: Left & Right Split */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
                
                {/* Left Column: Tactical Vectors & Explainability */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
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
                      argentinaForm={teamAForm}
                      setArgentinaForm={setTeamAForm}
                      franceForm={teamBForm}
                      setFranceForm={setTeamBForm}
                      tacticalIndex={tacticalIndex}
                      setTacticalIndex={setTacticalIndex}
                      staminaIndex={staminaIndex}
                      setStaminaIndex={setStaminaIndex}
                      crowdFactor={crowdFactor}
                      setCrowdFactor={setCrowdFactor}
                      weatherImpact={weatherImpact}
                      setWeatherImpact={setWeatherImpact}
                      winProb={winProb}
                      drawProb={drawProb}
                      lossProb={lossProb}
                    />
                  </div>

                  {/* SHAP Radar Chart */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800 }}>
                      <Activity size={20} color="var(--color-blue)" /> SHAP Explainability Vector
                    </h3>
                    <ShapRadar
                      argentinaForm={teamAForm}
                      franceForm={teamBForm}
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

                {/* Right Column: Probabilities, Plays & AI Assistant */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Win Probability Breakdown */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800 }}>
                      <Sparkles size={20} color="var(--color-green)" /> Live Win Probability breakdown
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {selectedMatch.homeTeam.flagEmoji} {selectedMatch.homeTeam.displayName} Win
                          </span>
                          <span style={{ color: 'var(--color-blue)', fontWeight: 800, fontSize: '15px' }}>{(winProb * 100).toFixed(1)}%</span>
                        </div>
                        <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '5px', overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${winProb * 100}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            style={{ height: '100%', backgroundColor: 'var(--color-blue)', boxShadow: '0 0 10px rgba(0, 229, 255, 0.4)' }} 
                          />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>🤝 Draw Prediction</span>
                          <span style={{ color: 'var(--color-green)', fontWeight: 800, fontSize: '15px' }}>{(drawProb * 100).toFixed(1)}%</span>
                        </div>
                        <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '5px', overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${drawProb * 100}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            style={{ height: '100%', backgroundColor: 'var(--color-green)', boxShadow: '0 0 10px rgba(0, 255, 135, 0.4)' }} 
                          />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {selectedMatch.awayTeam.flagEmoji} {selectedMatch.awayTeam.displayName} Win
                          </span>
                          <span style={{ color: 'var(--color-purple)', fontWeight: 800, fontSize: '15px' }}>{(lossProb * 100).toFixed(1)}%</span>
                        </div>
                        <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '5px', overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${lossProb * 100}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            style={{ height: '100%', backgroundColor: 'var(--color-purple)', boxShadow: '0 0 10px rgba(138, 43, 226, 0.4)' }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Model Comparison widget */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <ModelComparison winProb={winProb} drawProb={drawProb} lossProb={lossProb} />
                  </div>

                  {/* Betting Simulator */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <BettingSimulator winProb={winProb} drawProb={drawProb} lossProb={lossProb} />
                  </div>

                  {/* Live ESPN Commentary & Play-by-Play */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <LiveCommentary
                      minute={minute}
                      plays={matchPlays}
                      homeCode={selectedMatch.homeTeam.abbreviation}
                      awayCode={selectedMatch.awayTeam.abbreviation}
                    />
                  </div>

                  {/* DeepAssistant GenAI Chatbot */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <DeepAssistant matchName={selectedMatch.name} />
                  </div>

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
