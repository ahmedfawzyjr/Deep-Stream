"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, CheckCircle, Flame, BarChart3 } from 'lucide-react';

interface ModelComparisonProps {
  winProb: number;
  drawProb: number;
  lossProb: number;
}

export default function ModelComparison({ winProb, drawProb, lossProb }: ModelComparisonProps) {
  // Mock individual model predictions based slightly on target calibrated odds
  const models = [
    {
      name: "Ensemble Aggregator",
      type: "Bayesian Calibrated",
      win: winProb,
      draw: drawProb,
      loss: lossProb,
      brier: "0.14",
      roi: "+8.4%"
    },
    {
      name: "XGBoost Classifier",
      type: "Tabular Features",
      win: Math.min(0.85, Math.max(0.1, winProb + 0.04)),
      draw: Math.min(0.85, Math.max(0.1, drawProb - 0.02)),
      loss: Math.min(0.85, Math.max(0.1, lossProb - 0.02)),
      brier: "0.19",
      roi: "+5.1%"
    },
    {
      name: "LSTM Time-Series",
      type: "Live Sequence",
      win: Math.min(0.85, Math.max(0.1, winProb - 0.05)),
      draw: Math.min(0.85, Math.max(0.1, drawProb + 0.03)),
      loss: Math.min(0.85, Math.max(0.1, lossProb + 0.02)),
      brier: "0.17",
      roi: "+6.9%"
    },
    {
      name: "Transformer Tactics",
      type: "Spatial-Temporal",
      win: Math.min(0.85, Math.max(0.1, winProb - 0.01)),
      draw: Math.min(0.85, Math.max(0.1, drawProb - 0.01)),
      loss: Math.min(0.85, Math.max(0.1, lossProb + 0.02)),
      brier: "0.15",
      roi: "+7.8%"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Cpu size={16} color="var(--color-blue)" />
        ML Model Architecture Prediction Comparison
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {models.map((mod, idx) => (
          <div 
            key={mod.name}
            className="glass-panel" 
            style={{ 
              padding: '14px 18px',
              borderLeft: `4px solid ${idx === 0 ? 'var(--color-green)' : 'rgba(255,255,255,0.1)'}`,
              backgroundColor: idx === 0 ? 'rgba(0, 255, 135, 0.02)' : 'rgba(255,255,255,0.01)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <strong style={{ fontSize: '13.5px', color: '#ffffff' }}>{mod.name}</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {mod.type}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                <span>Brier: <strong style={{ color: 'var(--color-blue)' }}>{mod.brier}</strong></span>
                <span>ROI: <strong style={{ color: 'var(--color-green)' }}>{mod.roi}</strong></span>
              </div>
            </div>

            {/* Win/Draw/Loss horizontal bar stack */}
            <div style={{ height: '6px', width: '100%', display: 'flex', borderRadius: '3px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div style={{ width: `${mod.win * 100}%`, backgroundColor: 'var(--color-blue)', transition: 'width 0.4s ease' }} title={`ARG Win: ${(mod.win * 100).toFixed(0)}%`} />
              <div style={{ width: `${mod.draw * 100}%`, backgroundColor: 'var(--color-green)', transition: 'width 0.4s ease' }} title={`Draw: ${(mod.draw * 100).toFixed(0)}%`} />
              <div style={{ width: `${mod.loss * 100}%`, backgroundColor: 'var(--color-purple)', transition: 'width 0.4s ease' }} title={`FRA Win: ${(mod.loss * 100).toFixed(0)}%`} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <span>ARG: {(mod.win * 100).toFixed(0)}%</span>
              <span>Draw: {(mod.draw * 100).toFixed(0)}%</span>
              <span>FRA: {(mod.loss * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
