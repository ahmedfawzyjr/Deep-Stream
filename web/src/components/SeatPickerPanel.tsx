"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Star, Heart, ChevronRight, TrendingUp, MapPin, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SeatInfo {
  section: number;
  tier: string;
  row: number;
  seat: number;
  score: number;
  price: number;
  avail: boolean;
  previewUrl?: string;
  benefits?: string[];
}

interface SeatPickerPanelProps {
  seatInfo: SeatInfo | null;
  minimapRef?: React.RefObject<HTMLCanvasElement>;
  onCheckout?: (info: SeatInfo) => void;
  onViewAnalytics?: () => void;
  onResetCamera?: () => void;
}

const DEFAULT_SEAT: SeatInfo = {
  section: 125,
  tier: 'Lower Tier',
  row: 12,
  seat: 18,
  score: 87,
  price: 168,
  avail: true,
  benefits: ['Padded seat', 'Great view', 'Food & drink voucher'],
};

const TIER_BENEFITS: Record<string, string[]> = {
  'Lower Tier': ['Padded seat', 'Great view', 'Food & drink voucher'],
  'Club Tier': ['Lounge access', 'Halftime table service', 'Padded club seat'],
  'Upper Tier': ['Full pitch view', 'Budget friendly', 'Fast concourse access'],
};

function scoreLabel(s: number): string {
  if (s >= 90) return 'Excellent view';
  if (s >= 80) return 'Great view';
  if (s >= 70) return 'Good view';
  if (s >= 58) return 'Fair view';
  return 'Restricted view';
}

export default function SeatPickerPanel({
  seatInfo,
  minimapRef,
  onCheckout,
  onViewAnalytics,
  onResetCamera,
}: SeatPickerPanelProps) {
  const info = seatInfo || DEFAULT_SEAT;
  const [confirmed, setConfirmed] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const handleCheckout = () => {
    if (confirmed) return;
    setConfirmed(true);
    onCheckout?.(info);
    setCardKey(k => k + 1);
  };

  const benefits = TIER_BENEFITS[info.tier] || info.benefits || DEFAULT_SEAT.benefits!;

  return (
    <div className="sv-seat-panel">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="sv-seat-label">
          <Star size={12} />
          <span>{confirmed ? 'SEAT CONFIRMED' : seatInfo ? 'SELECTED SEAT' : 'FEATURED SEAT'}</span>
        </div>
        <button
          onClick={() => setIsFav(f => !f)}
          style={{
            width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center',
            background: isFav ? 'var(--color-pink)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
            transition: 'background 0.2s, transform 0.1s',
            transform: isFav ? 'scale(1.1)' : 'scale(1)',
          }}
          title={isFav ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart size={15} fill={isFav ? '#141414' : 'none'} color={isFav ? '#141414' : 'var(--color-pink)'} />
        </button>
      </div>

      {/* Section / Tier */}
      <div>
        <motion.div
          key={cardKey + '-section'}
          className="sv-seat-section"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Section {info.section}
        </motion.div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>
          {info.tier} &nbsp;·&nbsp; Block {info.section}
        </div>
      </div>

      {/* Row / Seat / Price Grid */}
      <motion.div
        key={cardKey + '-grid'}
        className="sv-seat-grid"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="sv-cell">
          <div className="sv-k">Row</div>
          <div className="sv-v">{info.row}</div>
        </div>
        <div className="sv-cell">
          <div className="sv-k">Seat</div>
          <div className="sv-v">{info.seat}</div>
        </div>
        <div className="sv-cell">
          <div className="sv-k">Price</div>
          <div className="sv-v" style={{ color: 'var(--color-gold)' }}>
            €{info.price} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'inherit' }}>/seat</span>
          </div>
        </div>
      </motion.div>

      {/* Seat View Preview */}
      <div className="sv-preview">
        {info.previewUrl ? (
          <img src={info.previewUrl} alt="View from selected seat" className="ready" />
        ) : (
          <div className="sv-ph">
            <div style={{ textAlign: 'center' }}>
              <MapPin size={20} color="var(--text-muted)" style={{ marginBottom: 6 }} />
              <div>Click a seat to preview</div>
            </div>
          </div>
        )}
        <div className="sv-pill tl">★ {scoreLabel(info.score)}</div>
        <div className="sv-pill br">360°</div>
      </div>

      {/* Benefits */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {benefits.map((b, i) => (
          <div key={i} className="sv-benefit">
            <Check size={14} color="var(--color-green)" style={{ flexShrink: 0 }} />
            <span>{b}</span>
            <div className="sv-check">
              <Check size={20} color="var(--color-green)" />
            </div>
          </div>
        ))}
      </div>

      {/* Minimap */}
      <canvas ref={minimapRef} className="sv-minimap" width={560} height={240} aria-label="Stadium overview map" />

      {/* Checkout */}
      <button
        className={`sv-checkout-btn ${confirmed ? 'done' : ''}`}
        onClick={handleCheckout}
        disabled={!info.avail}
      >
        {confirmed ? 'Seat secured ✓' : info.avail ? 'Grab seat' : 'Unavailable'}
        {!confirmed && info.avail && <ChevronRight size={17} />}
      </button>

      {/* View Analytics Link */}
      {onViewAnalytics && (
        <button
          onClick={onViewAnalytics}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'rgba(0,229,255,0.06)', color: 'var(--color-blue)',
            fontSize: 13, fontWeight: 700,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.06)')}
        >
          <TrendingUp size={15} />
          View Match Analytics
          <ChevronRight size={13} />
        </button>
      )}

      {/* Secure notice */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Concept demo · no real ticket sales
      </div>
    </div>
  );
}
