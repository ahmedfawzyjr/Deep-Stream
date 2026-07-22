import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  TrendingUp, 
  MapPin, 
  Sparkles, 
  Activity, 
  RefreshCw, 
  Shield, 
  Users,
  Search
} from 'lucide-react';
import { TacticalScenarioSimulator } from './components/TacticalScenarioSimulator';
import { PlayerSimilarityScout } from './components/PlayerSimilarityScout';
import { PredictiveFantasyCard } from './components/PredictiveFantasyCard';
import { StadiumARView } from './components/StadiumARView';
import { FatigueInjuryPredictor } from './components/FatigueInjuryPredictor';
import { TacticalBoard3D } from './components/TacticalBoard3D';
import { OpponentScoutingReport } from './components/OpponentScoutingReport';
import { ServicesHealthPulse } from './components/ServicesHealthPulse';
import { RefereeConsistencyScorecard } from './components/RefereeConsistencyScorecard';
import { YouthAcademyTracker } from './components/YouthAcademyTracker';
import { StadiumDigitalTwin } from './components/StadiumDigitalTwin';
import { BiomechanicalStressViewer } from './components/BiomechanicalStressViewer';
import { AlphaZeroPassRecommender } from './components/AlphaZeroPassRecommender';
import { PlayerStockMarket } from './components/PlayerStockMarket';
import { SpatialVisionProView } from './components/SpatialVisionProView';
import PassingNetwork from './components/PassingNetwork';
import AudioVoiceControl from './components/AudioVoiceControl';






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

export default function App() {
  const [matchId, setMatchId] = useState<string>("wc_final_2026");
  const [activeTab, setActiveTab] = useState<string>("live");
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [matchState, setMatchState] = useState<MatchState>({
    match_id: "wc_final_2026",
    win_probability: 0.48,
    draw_probability: 0.28,
    loss_probability: 0.24,
    minute: 42,
    xg: { team_a: 1.45, team_b: 0.92 },
    momentum: 45
  });


  // Dual-mode WebSocket with simulation fallback
  useEffect(() => {
    let socket: WebSocket | null = null;
    let simInterval: NodeJS.Timeout | null = null;

    const startSimulation = () => {
      if (simInterval) clearInterval(simInterval);
      simInterval = setInterval(() => {
        setMatchState(prev => {
          const delta = (Math.random() - 0.5) * 0.04;
          let win = Math.max(0.1, Math.min(0.8, prev.win_probability + delta));
          let loss = Math.max(0.1, Math.min(0.8, prev.loss_probability - delta));
          const draw = 1.0 - win - loss;

          return {
            ...prev,
            win_probability: Number(win.toFixed(3)),
            draw_probability: Number(draw.toFixed(3)),
            loss_probability: Number(loss.toFixed(3)),
            minute: prev.minute >= 90 ? 1 : prev.minute + 1,
            xg: {
              team_a: Number((prev.xg.team_a + Math.random() * 0.05).toFixed(2)),
              team_b: Number((prev.xg.team_b + Math.random() * 0.03).toFixed(2))
            },
            momentum: Math.round((win - loss) * 100)
          };
        });
      }, 1500);
    };

    const connectWS = () => {
      try {
        const wsUrl = `ws://localhost:8080/v1/ws/matches/${matchId}/live`;
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setWsConnected(true);
          if (simInterval) {
            clearInterval(simInterval);
            simInterval = null;
          }
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setMatchState(prev => ({
              ...prev,
              win_probability: data.home_win_prob ?? prev.win_probability,
              draw_probability: data.draw_prob ?? prev.draw_probability,
              loss_probability: data.away_win_prob ?? prev.loss_probability,
              minute: data.minute ?? prev.minute,
              xg: data.xg ?? prev.xg,
              momentum: data.momentum ?? Math.round(((data.home_win_prob ?? prev.win_probability) - (data.away_win_prob ?? prev.loss_probability)) * 100)
            }));
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e);
          }
        };

        socket.onclose = () => {
          setWsConnected(false);
          startSimulation();
        };

        socket.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        setWsConnected(false);
        startSimulation();
      }
    };

    connectWS();
    startSimulation(); // Always start simulation as a base/fallback

    return () => {
      if (socket) socket.close();
      if (simInterval) clearInterval(simInterval);
    };
  }, [matchId]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070a13', color: '#f3f4f6' }}>
      
      {/* Navigation Header */}
      <header className="glass-panel" style={{ margin: '16px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>⚽</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }} className="gradient-text">
                DeepKick
              </h1>
              <span style={{ 
                fontSize: '11px', 
                padding: '2px 8px', 
                borderRadius: '12px', 
                backgroundColor: wsConnected ? 'rgba(0, 255, 135, 0.1)' : 'rgba(255, 165, 0, 0.1)', 
                color: wsConnected ? 'var(--color-green)' : 'orange',
                border: wsConnected ? '1px solid rgba(0, 255, 135, 0.2)' : '1px solid rgba(255, 165, 0, 0.2)',
                fontWeight: 600
              }}>
                {wsConnected ? 'Live Connection' : 'Simulated Feed'}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AI Football Analytics & World Cup Engine</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab("live")}
            style={{ 
              background: activeTab === "live" ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeTab === "live" ? 'var(--color-green)' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            Live Match Center
          </button>
          <button 
            onClick={() => setActiveTab("simulator")}
            style={{ 
              background: activeTab === "simulator" ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: activeTab === "simulator" ? '#60a5fa' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            ⚡ Tactical Simulator
          </button>
          <button 
            onClick={() => setActiveTab("scout")}
            style={{ 
              background: activeTab === "scout" ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: activeTab === "scout" ? '#c084fc' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            🔍 AI Scout Engine
          </button>
          <button 
            onClick={() => setActiveTab("fantasy")}
            style={{ 
              background: activeTab === "fantasy" ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
              color: activeTab === "fantasy" ? '#facc15' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            🏆 Live Fantasy
          </button>
          <button 
            onClick={() => setActiveTab("ar")}
            style={{ 
              background: activeTab === "ar" ? 'rgba(14, 165, 233, 0.2)' : 'transparent',
              color: activeTab === "ar" ? '#38bdf8' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            🥽 WebAR View
          </button>
          <button 
            onClick={() => setActiveTab("fatigue")}
            style={{ 
              background: activeTab === "fatigue" ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              color: activeTab === "fatigue" ? '#f87171' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            🛡️ Fatigue & Risk
          </button>
          <button 
            onClick={() => setActiveTab("board3d")}
            style={{ 
              background: activeTab === "board3d" ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
              color: activeTab === "board3d" ? '#4ade80' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            ✏️ 3D Board
          </button>
          <button 
            onClick={() => setActiveTab("referee")}
            style={{ 
              background: activeTab === "referee" ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
              color: activeTab === "referee" ? '#facc15' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            ⚖️ AI Referee
          </button>
          <button 
            onClick={() => setActiveTab("academy")}
            style={{ 
              background: activeTab === "academy" ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: activeTab === "academy" ? '#c084fc' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            🎓 Youth Academy
          </button>
          <button 
            onClick={() => setActiveTab("twin")}
            style={{ 
              background: activeTab === "twin" ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeTab === "twin" ? '#38bdf8' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            🏟️ Digital Twin
          </button>
          <button 
            onClick={() => setActiveTab("biomechanics")}
            style={{ 
              background: activeTab === "biomechanics" ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              color: activeTab === "biomechanics" ? '#ef4444' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            🧠 Biomechanics
          </button>
          <button 
            onClick={() => setActiveTab("alphazero")}
            style={{ 
              background: activeTab === "alphazero" ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
              color: activeTab === "alphazero" ? '#4ade80' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            🎯 AlphaZero Pass
          </button>
          <button 
            onClick={() => setActiveTab("stocks")}
            style={{ 
              background: activeTab === "stocks" ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
              color: activeTab === "stocks" ? '#facc15' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            💰 Player Stocks
          </button>
          <button 
            onClick={() => setActiveTab("visionpro")}
            style={{ 
              background: activeTab === "visionpro" ? 'rgba(192, 132, 252, 0.2)' : 'transparent',
              color: activeTab === "visionpro" ? '#c084fc' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            🕶️ Vision Pro Spatial
          </button>
          <button 
            onClick={() => setActiveTab("bracket")}
            style={{ 
              background: activeTab === "bracket" ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeTab === "bracket" ? 'var(--color-green)' : '#9ca3af',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}>
            World Cup Bracket
          </button>
        </div>
      </header>







      {/* Main Content Area */}
      <main className="dashboard-grid">
        
        {activeTab === "live" ? (
          <>
            {/* Left Column: Match Analytics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Scorecard */}
              <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: 'red' }}>
                  <Flame size={16} />
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>LIVE ({matchState.minute}')</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '12px' }}>
                  <div>
                    <Shield size={48} color="var(--color-blue)" />
                    <h3 style={{ margin: '8px 0 4px 0' }}>ARGENTINA</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Home</p>
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: 800 }}>2 - 1</div>
                  <div>
                    <Shield size={48} color="var(--color-purple)" />
                    <h3 style={{ margin: '8px 0 4px 0' }}>FRANCE</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Away</p>
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <div className="glass-panel" style={{ padding: '6px 12px', fontSize: '14px', borderRadius: '8px' }}>
                    xG: <strong style={{ color: 'var(--color-green)' }}>{matchState.xg.team_a}</strong> - <strong>{matchState.xg.team_b}</strong>
                  </div>
                  <div className="glass-panel" style={{ padding: '6px 12px', fontSize: '14px', borderRadius: '8px' }}>
                    Possession: <strong style={{ color: 'var(--color-blue)' }}>58%</strong> - <strong>42%</strong>
                  </div>
                </div>
              </div>

              {/* Real-time Momentum Graph */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={20} color="var(--color-green)" /> Attack Momentum Vector
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live updates</span>
                </div>

                {/* Simulated Momentum Graph */}
                <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {Array.from({ length: 40 }).map((_, idx) => {
                    const heightVal = Math.abs(Math.sin((idx + matchState.minute) * 0.3) * 80) + 10;
                    const isPositive = Math.sin((idx + matchState.minute) * 0.3) > 0;
                    return (
                      <div 
                        key={idx}
                        style={{
                          flex: 1,
                          height: `${heightVal}px`,
                          backgroundColor: isPositive ? 'var(--color-green)' : 'var(--color-purple)',
                          opacity: idx === 39 ? 1 : 0.4,
                          borderRadius: '2px',
                          transition: 'height 0.3s ease'
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <span>-40 min</span>
                  <span>Now</span>
                </div>
              </div>

              {/* Heat Map Overlay */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={20} color="var(--color-green)" /> Player Spatio-Temporal Heatmap
                </h3>
                
                <div className="pitch-bg" style={{ height: '260px' }}>
                  <div className="pitch-line-center"></div>
                  <div className="pitch-circle"></div>
                  
                  {/* Glowing Hotspots */}
                  <div style={{
                    position: 'absolute', top: '35%', left: '70%',
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,255,135,0.6) 0%, transparent 70%)',
                    filter: 'blur(4px)'
                  }} />
                  <div style={{
                    position: 'absolute', top: '60%', left: '45%',
                    width: '90px', height: '90px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,229,255,0.5) 0%, transparent 70%)',
                    filter: 'blur(4px)'
                  }} />
                  <div style={{
                    position: 'absolute', top: '20%', left: '25%',
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,0,128,0.4) 0%, transparent 70%)',
                    filter: 'blur(4px)'
                  }} />
                </div>
              </div>

            </div>

            {/* Right Column: AI Predictions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Bayesian Calibration Win Probabilities */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="var(--color-green)" /> Multi-Model Probability
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                      <span>Argentina Win</span>
                      <span style={{ color: 'var(--color-green)', fontWeight: 700 }}>{(matchState.win_probability * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${matchState.win_probability * 100}%`, height: '100%', backgroundColor: 'var(--color-green)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                      <span>Draw</span>
                      <span style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{(matchState.draw_probability * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${matchState.draw_probability * 100}%`, height: '100%', backgroundColor: 'var(--color-blue)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                      <span>France Win</span>
                      <span style={{ color: 'var(--color-purple)', fontWeight: 700 }}>{(matchState.loss_probability * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${matchState.loss_probability * 100}%`, height: '100%', backgroundColor: 'var(--color-purple)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', padding: '12px', border: '1px solid rgba(0,255,135,0.2)', borderRadius: '8px', backgroundColor: 'rgba(0,255,135,0.03)' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-green)', lineHeight: 1.4 }}>
                    💡 <strong>Ensemble Aggregator:</strong> High confidence rating on ARGENTINA due to extreme travel fatigue factors on France's defensive line (-18% stamina forecast).
                  </p>
                </div>
              </div>

              {/* Tactical Overview */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="var(--color-blue)" /> AI Formation Detection
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Argentina</span>
                    <strong style={{ color: 'var(--color-blue)' }}>4-3-3 Attacking</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>France</span>
                    <strong style={{ color: 'var(--color-purple)' }}>4-2-3-1 Fluid</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>PPDA (Pressing Intensity)</span>
                    <strong>8.4 (High Intensity)</strong>
                  </div>
                </div>
              </div>

            </div>
          </>
        ) : activeTab === "simulator" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TacticalScenarioSimulator
              currentWinProb={matchState.win_probability}
              onApplyScenario={(newProb) => {
                setMatchState(prev => ({
                  ...prev,
                  win_probability: Number(newProb.toFixed(3)),
                  draw_probability: Number(((1 - newProb) * 0.55).toFixed(3)),
                  loss_probability: Number(((1 - newProb) * 0.45).toFixed(3))
                }));
              }}
            />
            <PassingNetwork />
          </div>
        ) : activeTab === "scout" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PlayerSimilarityScout />
            <OpponentScoutingReport />
            <ServicesHealthPulse />
          </div>

        ) : activeTab === "fantasy" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PredictiveFantasyCard />
          </div>
        ) : activeTab === "ar" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <StadiumARView />
          </div>
        ) : activeTab === "fatigue" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <FatigueInjuryPredictor currentMinute={matchState.minute} />
          </div>
        ) : activeTab === "board3d" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TacticalBoard3D />
          </div>
        ) : activeTab === "referee" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <RefereeConsistencyScorecard />
          </div>
        ) : activeTab === "academy" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <YouthAcademyTracker />
          </div>
        ) : activeTab === "twin" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <StadiumDigitalTwin />
          </div>
        ) : activeTab === "biomechanics" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <BiomechanicalStressViewer />
          </div>
        ) : activeTab === "alphazero" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AlphaZeroPassRecommender />
          </div>
        ) : activeTab === "stocks" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PlayerStockMarket />
          </div>
        ) : activeTab === "visionpro" ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SpatialVisionProView />
          </div>
        ) : (




          /* Bracket Tab */
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>🏆 World Cup 2026 Prediction Bracket</h2>
                <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>Monte Carlo tree search path forecasts based on 1M simulated runs</p>
              </div>

              {/* Tournament Tree layout */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '24px' }}>
                {/* Round of 16 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                  <h4 style={{ color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>Round of 16</h4>
                  <div className="glass-panel" style={{ padding: '16px', width: '200px' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>🇦🇷 Argentina <span style={{ float: 'right', color: 'var(--color-green)' }}>82%</span></div>
                    <div style={{ paddingTop: '6px' }}>🇺🇸 USA <span style={{ float: 'right', opacity: 0.5 }}>18%</span></div>
                  </div>
                  <div className="glass-panel" style={{ padding: '16px', width: '200px' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>🇫🇷 France <span style={{ float: 'right', color: 'var(--color-green)' }}>65%</span></div>
                    <div style={{ paddingTop: '6px' }}>🇸🇳 Senegal <span style={{ float: 'right', opacity: 0.5 }}>35%</span></div>
                  </div>
                </div>

                {/* Quarter Finals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '96px' }}>
                  <h4 style={{ color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>Quarter Finals</h4>
                  <div className="glass-panel" style={{ padding: '16px', width: '200px', border: '1px solid var(--color-green)' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>🇦🇷 Argentina <span style={{ float: 'right', color: 'var(--color-green)' }}>54%</span></div>
                    <div style={{ paddingTop: '6px' }}>🇫🇷 France <span style={{ float: 'right', opacity: 0.5 }}>46%</span></div>
                  </div>
                </div>

                {/* Winner */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Trophy size={48} color="gold" style={{ filter: 'drop-shadow(0 0 12px gold)' }} />
                  <h4 style={{ color: 'gold', margin: '8px 0 0 0', fontWeight: 800 }}>PROJECTED CHAMPION</h4>
                  <span style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>ARGENTINA 🇦🇷</span>
                </div>
              </div>

            </div>
          </div>
        )}


      </main>
    </div>
  );
}
