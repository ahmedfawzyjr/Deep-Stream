"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sliders, AlertCircle } from 'lucide-react';
import ShapRadar from './ShapRadar';

interface LiveCalibrationProps {
  argentinaForm: number;
  setArgentinaForm: (val: number) => void;
  franceForm: number;
  setFranceForm: (val: number) => void;
  tacticalIndex: number;
  setTacticalIndex: (val: number) => void;
  staminaIndex: number;
  setStaminaIndex: (val: number) => void;
  crowdFactor: number;
  setCrowdFactor: (val: number) => void;
  weatherImpact: number;
  setWeatherImpact: (val: number) => void;
  winProb: number;
  drawProb: number;
  lossProb: number;
}

export default function LiveCalibration({
  argentinaForm,
  setArgentinaForm,
  franceForm,
  setFranceForm,
  tacticalIndex,
  setTacticalIndex,
  staminaIndex,
  setStaminaIndex,
  crowdFactor,
  setCrowdFactor,
  weatherImpact,
  setWeatherImpact,
  winProb,
  drawProb,
  lossProb
}: LiveCalibrationProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      {/* Sliders Control Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={16} color="var(--color-green)" />
          Live Bayesian Parametric Tuning
        </h4>

        {/* Slider 1: Argentina Form */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span>🇦🇷 Argentina Form Rating</span>
            <span style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{argentinaForm}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={argentinaForm}
            onChange={(e) => setArgentinaForm(Number(e.target.value))}
            className="cyber-slider cyber-slider-blue"
          />
        </div>

        {/* Slider 2: France Form */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span>🇫🇷 France Form Rating</span>
            <span style={{ color: 'var(--color-purple)', fontWeight: 700 }}>{franceForm}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={franceForm}
            onChange={(e) => setFranceForm(Number(e.target.value))}
            className="cyber-slider"
          />
        </div>

        {/* Slider 3: Tactical Alignment (Possession) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span>Tactical Dominance (ARG Possession)</span>
            <span style={{ color: 'var(--color-green)', fontWeight: 700 }}>{tacticalIndex}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            value={tacticalIndex}
            onChange={(e) => setTacticalIndex(Number(e.target.value))}
            className="cyber-slider"
          />
        </div>

        {/* Slider 4: Match Fatigue Index */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span>Stamina/Fatigue Level (Argentine Base)</span>
            <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{staminaIndex}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            value={staminaIndex}
            onChange={(e) => setStaminaIndex(Number(e.target.value))}
            className="cyber-slider"
          />
        </div>

        {/* Slider 5: Crowd Noise & Support */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span>Stadion Crowd Support Factor</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{crowdFactor}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={crowdFactor}
            onChange={(e) => setCrowdFactor(Number(e.target.value))}
            className="cyber-slider"
          />
        </div>

        {/* Slider 6: Weather Alignment */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span>Weather & Climate Suitability</span>
            <span style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{weatherImpact}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={weatherImpact}
            onChange={(e) => setWeatherImpact(Number(e.target.value))}
            className="cyber-slider cyber-slider-blue"
          />
        </div>
      </div>

      {/* Live AI Explainability & Output Radar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(255, 255, 255, 0.05)', paddingLeft: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
          <Sparkles size={16} color="var(--color-blue)" />
          SHAP Model Explanation Radar
        </h4>
        <ShapRadar
          argentinaForm={argentinaForm}
          franceForm={franceForm}
          tacticalIndex={tacticalIndex}
          staminaIndex={staminaIndex}
          crowdFactor={crowdFactor}
          weatherImpact={weatherImpact}
        />
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '11px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-blue)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-blue)' }} />
            Argentina Weights
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-purple)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-purple)' }} />
            France Weights
          </span>
        </div>
      </div>
    </div>
  );
}
