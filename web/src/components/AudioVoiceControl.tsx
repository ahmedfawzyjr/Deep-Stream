"use client";

import React, { useState } from 'react';
import { Volume2, Mic, ShieldAlert, Flag, Megaphone, Radio } from 'lucide-react';
import { 
  playRefereeWhistle, 
  playPlayerShout, 
  speakCommentary, 
  type VoiceLanguage, 
  type RefereeWhistleType 
} from '../utils/audio';

const LANGUAGES: { code: VoiceLanguage; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

export default function AudioVoiceControl() {
  const [selectedLang, setSelectedLang] = useState<VoiceLanguage>('en');

  const handleWhistle = (type: RefereeWhistleType) => {
    playRefereeWhistle(type);
  };

  const handleShout = (type: 'pass' | 'shoot' | 'goal' | 'foul' | 'corner' | 'offside') => {
    playPlayerShout(type, selectedLang);
  };

  const handleLiveCommentary = () => {
    const text = selectedLang === 'es' ? "¡Ataca Argentina por la banda izquierda! ¡Gran pase filtrado!" :
                 selectedLang === 'fr' ? "Attaque rapide de l'équipe de France dans la surface !" :
                 selectedLang === 'de' ? "Starker Angriff über den linken Flügel!" :
                 selectedLang === 'ar' ? "هجمة مرتدة سريعة في منتصف الملعب!" :
                 selectedLang === 'ja' ? "素晴らしいパスがフォワードに送られました！" :
                 "Dangerous counter-attack unfolding down the left flank!";
    speakCommentary(text, selectedLang);
  };

  return (
    <div style={{ background: '#0d1527', borderRadius: '14px', border: '1px solid rgba(0, 229, 255, 0.15)', padding: '20px', color: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Megaphone size={20} color="var(--color-blue)" />
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>Multilingual Stadium Voice & Soundboard</h3>
        </div>
        
        {/* Language selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Radio size={14} color="var(--color-green)" />
          <select 
            value={selectedLang} 
            onChange={(e) => setSelectedLang(e.target.value as VoiceLanguage)}
            style={{
              background: '#1a243b',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Referee Whistles Section */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={14} /> Referee Whistle Variations
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button onClick={() => handleWhistle('short')} style={btnStyle('rgba(255,255,255,0.06)', '#e2e8f0')}>
            ⚡ Short Blow
          </button>
          <button onClick={() => handleWhistle('double')} style={btnStyle('rgba(0, 229, 255, 0.1)', '#38bdf8')}>
            ⏸️ Halftime Blow
          </button>
          <button onClick={() => handleWhistle('long')} style={btnStyle('rgba(138, 43, 226, 0.1)', '#c084fc')}>
            🏁 Fulltime Blow
          </button>
          <button onClick={() => handleWhistle('yellow')} style={btnStyle('rgba(251, 191, 36, 0.15)', '#fbbf24')}>
            🟨 Yellow Card Whistle
          </button>
          <button onClick={() => handleWhistle('red')} style={btnStyle('rgba(244, 63, 94, 0.15)', '#f43f5e')}>
            🟥 Red Card Whistle
          </button>
        </div>
      </div>

      {/* Player Vocal Shouts Section */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mic size={14} /> On-Pitch Player Shouts ({LANGUAGES.find(l => l.code === selectedLang)?.flag} {LANGUAGES.find(l => l.code === selectedLang)?.label})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button onClick={() => handleShout('pass')} style={btnStyle('rgba(0, 255, 135, 0.08)', '#4ade80')}>
            👟 "Pass!"
          </button>
          <button onClick={() => handleShout('shoot')} style={btnStyle('rgba(0, 255, 135, 0.12)', '#22c55e')}>
            ⚽ "Shoot!"
          </button>
          <button onClick={() => handleShout('goal')} style={btnStyle('rgba(251, 191, 36, 0.15)', '#f59e0b')}>
            🔊 "Goal!"
          </button>
          <button onClick={() => handleShout('foul')} style={btnStyle('rgba(244, 63, 94, 0.12)', '#fb7185')}>
            🛑 "Ref, Foul!"
          </button>
          <button onClick={() => handleShout('corner')} style={btnStyle('rgba(0, 229, 255, 0.08)', '#38bdf8')}>
            🚩 "Corner!"
          </button>
          <button onClick={() => handleShout('offside')} style={btnStyle('rgba(138, 43, 226, 0.12)', '#a855f7')}>
            🖐️ "Offside!"
          </button>
          <button onClick={handleLiveCommentary} style={btnStyle('linear-gradient(135deg, #0284c7, #0d9488)', '#ffffff')}>
            🎙️ Live Audio Commentary
          </button>
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    color: color,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'transform 0.1s, opacity 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  };
}
