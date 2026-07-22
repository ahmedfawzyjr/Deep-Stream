import React, { useState } from 'react';
import { Volume2, ShieldCheck, AlertCircle, Play } from 'lucide-react';

export const VARVerdictAudio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [verdictText, setVerdictText] = useState('VAR VERDICT: ONSIDE BY 4 CENTIMETERS');

  const speakVerdict = () => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(verdictText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Volume2 size={22} color="#4ade80" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Automated VAR Verdict Audio Announcement System
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(34, 197, 94, 0.2)',
          color: '#4ade80',
          fontWeight: 600
        }}>
          AUDIO SYNTHESIZER
        </span>
      </div>

      <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={26} color="#4ade80" />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>3D Spatial Verification</span>
            <strong style={{ fontSize: '1.1rem', color: '#4ade80' }}>{verdictText}</strong>
          </div>
        </div>

        <button
          onClick={speakVerdict}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            background: isPlaying ? '#dc2626' : '#22c55e',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem'
          }}
        >
          <Play size={16} /> {isPlaying ? 'Announcing...' : 'Play Audio Verdict'}
        </button>
      </div>
    </div>
  );
};
