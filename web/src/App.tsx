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
  Users 
} from 'lucide-react';

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
  const [matchState, setMatchState] = useState<MatchState>({
    match_id: "wc_final_2026",
    win_probability: 0.48,
    draw_probability: 0.28,
    loss_probability: 0.24,
    minute: 42,
    xg: { team_a: 1.45, team_b: 0.92 },
    momentum: 45
  });

  // Simulated WebSocket feed
  useEffect(() => {
    const interval = setInterval(() => {
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

    return () => clearInterval(interval);
  }, [matchId]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070a13', color: '#f3f4f6' }}>
      
      {/* Navigation Header */}
      <header className="glass-panel" style={{ margin: '16px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>⚽</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }} className="gradient-text">
              DeepKick
            </h1>
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
