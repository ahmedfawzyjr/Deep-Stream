"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BadgePercent, HelpCircle, DollarSign, Calculator } from 'lucide-react';

interface BettingSimulatorProps {
  winProb: number;
  drawProb: number;
  lossProb: number;
}

export default function BettingSimulator({ winProb, drawProb, lossProb }: BettingSimulatorProps) {
  const [stake, setStake] = useState<string>("50");
  const [outcome, setOutcome] = useState<'win' | 'draw' | 'loss'>('win');

  // Convert probability to decimal odds (e.g. 0.5 probability = 2.00 odds)
  const argOdds = Number((1 / Math.max(0.01, winProb)).toFixed(2));
  const drawOdds = Number((1 / Math.max(0.01, drawProb)).toFixed(2));
  const fraOdds = Number((1 / Math.max(0.01, lossProb)).toFixed(2));

  const activeOdds = outcome === 'win' ? argOdds : outcome === 'draw' ? drawOdds : fraOdds;
  const stakeVal = Number(stake) || 0;
  const potentialPayout = (stakeVal * activeOdds).toFixed(2);
  const potentialProfit = (stakeVal * activeOdds - stakeVal).toFixed(2);

  // Convert decimal to fractional odds roughly (simple helper)
  const getFractional = (decimal: number) => {
    if (decimal <= 1) return "1/1";
    const numerator = Math.round((decimal - 1) * 100);
    const denominator = 100;
    const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
    const divisor = gcd(numerator, denominator);
    return `${numerator / divisor}/${denominator / divisor}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BadgePercent size={16} color="var(--color-gold)" />
        Live Calibrated Odds & Stake Payout Calculator
      </h4>

      {/* Odds Board */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        {/* Argentina */}
        <div 
          onClick={() => setOutcome('win')}
          style={{
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: outcome === 'win' ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255,255,255,0.02)',
            border: outcome === 'win' ? '1px solid var(--color-blue)' : '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>ARG Win</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-blue)' }}>{argOdds}</div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>({getFractional(argOdds)})</div>
        </div>

        {/* Draw */}
        <div 
          onClick={() => setOutcome('draw')}
          style={{
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: outcome === 'draw' ? 'rgba(0, 255, 135, 0.08)' : 'rgba(255,255,255,0.02)',
            border: outcome === 'draw' ? '1px solid var(--color-green)' : '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Draw</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-green)' }}>{drawOdds}</div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>({getFractional(drawOdds)})</div>
        </div>

        {/* France */}
        <div 
          onClick={() => setOutcome('loss')}
          style={{
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: outcome === 'loss' ? 'rgba(138, 43, 226, 0.08)' : 'rgba(255,255,255,0.02)',
            border: outcome === 'loss' ? '1px solid var(--color-purple)' : '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>FRA Win</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-purple)' }}>{fraOdds}</div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>({getFractional(fraOdds)})</div>
        </div>
      </div>

      {/* Stake Calculator */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Simulated Stake:</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '8px', color: 'var(--color-green)' }}>$</span>
            <input 
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              style={{
                width: '80px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                padding: '6px 6px 6px 18px',
                color: '#ffffff',
                fontWeight: 'bold',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Total Return</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>${potentialPayout}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Profit</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-green)' }}>+${potentialProfit}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
