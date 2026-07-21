"use client";

import React, { useEffect, useState } from 'react';
import { Flame, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchAnalyticsBarProps {
  minute: number;
  scoreHome: number;
  scoreAway: number;
  xgHome?: number;
  xgAway?: number;
  winProb?: number;
  drawProb?: number;
  lossProb?: number;
  homeTeam?: string;
  awayTeam?: string;
  homeFlag?: string;
  awayFlag?: string;
  homeLogo?: string;
  awayLogo?: string;
  venueName?: string;
}

export default function MatchAnalyticsBar({
  minute,
  scoreHome,
  scoreAway,
  xgHome = 1.65,
  xgAway = 0.98,
  winProb = 0.49,
  drawProb = 0.27,
  lossProb = 0.24,
  homeTeam = 'ARGENTINA',
  awayTeam = 'SPAIN',
  homeFlag = '\u{1F1E6}\u{1F1F7}',
  awayFlag = '\u{1F1EA}\u{1F1F8}',
  homeLogo,
  awayLogo,
  venueName,
}: MatchAnalyticsBarProps) {
  const [goalFlash, setGoalFlash] = useState(false);
  const [prevScore, setPrevScore] = useState({ home: scoreHome, away: scoreAway });

  useEffect(() => {
    if (scoreHome !== prevScore.home || scoreAway !== prevScore.away) {
      setGoalFlash(true);
      setPrevScore({ home: scoreHome, away: scoreAway });
      const t = setTimeout(() => setGoalFlash(false), 2800);
      return () => clearTimeout(t);
    }
  }, [scoreHome, scoreAway]);

  return (
    <div className="match-analytics-bar" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Goal Flash overlay */}
      <AnimatePresence>
        {goalFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(0,255,135,0.18), rgba(251,191,36,0.12))',
              borderRadius: '14px', pointerEvents: 'none', zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>

      {/* Left: Home team */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {homeLogo ? (
          <img src={homeLogo} alt={homeTeam} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '20px' }}>{homeFlag}</span>
        )}
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {homeTeam}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-blue)', fontWeight: 800 }}>
            {(winProb * 100).toFixed(0)}% win
          </div>
        </div>
      </div>

      {/* Center: Score + Minute */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="pulse-live" />
          <span style={{ fontSize: '12px', color: 'var(--color-pink)', fontWeight: 800, letterSpacing: '1px' }}>
            LIVE {minute}'
          </span>
          {venueName && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>• {venueName}</span>}
        </div>
        <motion.div
          className="match-score-display"
          animate={goalFlash ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.6 }}
          style={{ color: goalFlash ? 'var(--color-gold)' : 'var(--text-primary)', transition: 'color 0.3s' }}
        >
          {scoreHome} – {scoreAway}
        </motion.div>
        <div className="match-xg-badge">
          <Zap size={11} color="var(--color-gold)" />
          xG {xgHome.toFixed(2)} — {xgAway.toFixed(2)}
        </div>
      </div>

      {/* Right: Away team */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', minWidth: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {awayTeam}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-purple)', fontWeight: 800 }}>
            {(lossProb * 100).toFixed(0)}% win
          </div>
        </div>
        {awayLogo ? (
          <img src={awayLogo} alt={awayTeam} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '20px' }}>{awayFlag}</span>
        )}
      </div>

      {/* Win probability bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: '28px', right: '28px', height: '3px',
        background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', zIndex: 2,
      }}>
        <motion.div
          animate={{ width: `${winProb * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-blue), var(--color-green))', borderRadius: '2px' }}
        />
      </div>
    </div>
  );
}
