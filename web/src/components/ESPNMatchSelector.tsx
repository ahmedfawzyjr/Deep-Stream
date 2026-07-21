"use client";

import React from 'react';
import { RefreshCw, Flame, Globe, ChevronDown, Check, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ESPNMatch, LEAGUES } from '../services/espnApi';

interface ESPNMatchSelectorProps {
  selectedMatch: ESPNMatch | null;
  matches: ESPNMatch[];
  onSelectMatch: (match: ESPNMatch) => void;
  onRefresh: () => void;
  selectedLeague: string;
  onSelectLeague: (leagueId: string) => void;
  loading: boolean;
}

export default function ESPNMatchSelector({
  selectedMatch,
  matches,
  onSelectMatch,
  onRefresh,
  selectedLeague,
  onSelectLeague,
  loading
}: ESPNMatchSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(0, 255, 135, 0.2)' }}>
      {/* Top Controls Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Left: Section Title & Live Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0, 255, 135, 0.1)', border: '1px solid rgba(0, 255, 135, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-live" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-green)', letterSpacing: '0.5px' }}>
              REAL-TIME ESPN STREAM
            </span>
          </div>

          {/* League Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {LEAGUES.map((l) => (
              <button
                key={l.id}
                onClick={() => onSelectLeague(l.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: selectedLeague === l.id ? '1px solid var(--color-green)' : '1px solid rgba(255,255,255,0.08)',
                  background: selectedLeague === l.id ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: selectedLeague === l.id ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Refresh button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Fetch latest ESPN scores"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} style={{ color: 'var(--color-green)' }} />
          {loading ? 'Fetching ESPN...' : 'Sync Live Data'}
        </button>
      </div>

      {/* Main Match Switcher Dropdown / Cards */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            padding: '12px 18px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          {selectedMatch ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {selectedMatch.homeTeam.logo ? (
                  <img src={selectedMatch.homeTeam.logo} alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />
                ) : (
                  <span>{selectedMatch.homeTeam.flagEmoji}</span>
                )}
                <span style={{ fontWeight: 800, fontSize: '15px' }}>{selectedMatch.homeTeam.displayName}</span>
              </div>

              <div style={{ padding: '3px 10px', borderRadius: '6px', background: 'rgba(0,255,135,0.15)', border: '1px solid rgba(0,255,135,0.3)', color: 'var(--color-green)', fontWeight: 800, fontSize: '14px' }}>
                {selectedMatch.homeTeam.score} - {selectedMatch.awayTeam.score}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '15px' }}>{selectedMatch.awayTeam.displayName}</span>
                {selectedMatch.awayTeam.logo ? (
                  <img src={selectedMatch.awayTeam.logo} alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />
                ) : (
                  <span>{selectedMatch.awayTeam.flagEmoji}</span>
                )}
              </div>

              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto', marginRight: '12px', fontWeight: 600 }}>
                {selectedMatch.leagueName} • {selectedMatch.venueName} ({selectedMatch.statusDetail})
              </span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Select ESPN Match...</span>
          )}

          <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                zIndex: 100,
                background: '#0D1117',
                border: '1px solid rgba(0, 255, 135, 0.25)',
                borderRadius: '12px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
                maxHeight: '340px',
                overflowY: 'auto',
                padding: '8px'
              }}
            >
              {matches.map((m) => {
                const isSelected = selectedMatch?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      onSelectMatch(m);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(0, 255, 135, 0.12)' : 'transparent',
                      border: isSelected ? '1px solid rgba(0, 255, 135, 0.3)' : '1px solid transparent',
                      marginBottom: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '130px' }}>
                        {m.homeTeam.logo ? <img src={m.homeTeam.logo} style={{ width: 20, height: 20, objectFit: 'contain' }} alt="" /> : null}
                        <span style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.homeTeam.displayName}</span>
                      </div>

                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-gold)', width: '45px', textAlign: 'center' }}>
                        {m.homeTeam.score} - {m.awayTeam.score}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '130px' }}>
                        {m.awayTeam.logo ? <img src={m.awayTeam.logo} style={{ width: 20, height: 20, objectFit: 'contain' }} alt="" /> : null}
                        <span style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.awayTeam.displayName}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {m.statusState === 'in' ? <span style={{ color: 'var(--color-pink)', fontWeight: 800 }}>LIVE {m.clockDisplay}</span> : m.statusDetail}
                      </span>
                      {isSelected && <Check size={16} color="var(--color-green)" />}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
