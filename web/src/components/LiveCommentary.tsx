"use client";

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Flame, Shield, ArrowRightLeft, Info } from 'lucide-react';

import { ESPNPlay } from '../services/espnApi';

interface CommentaryItem {
  min: number;
  type: 'info' | 'goal' | 'threat' | 'substitution';
  text: string;
  team?: string;
}

const DEFAULT_COMMENTARY: CommentaryItem[] = [
  { min: 3, type: 'info', text: 'Match starts under dry conditions. Kicking off from left to right.' },
  { min: 9, type: 'threat', text: 'Low cross into the penalty box, defensive line parries away.' },
  { min: 14, type: 'goal', text: 'GOAL! Cool strike into the bottom corner after high pressing turnover! (1-0)' },
  { min: 22, type: 'info', text: 'Possession battle in midfield dictating match tempo.' },
  { min: 32, type: 'substitution', text: 'Tactical adjustment: Yellow card issued for late challenge.' },
  { min: 41, type: 'goal', text: 'GOAL! Lightning-fast counter-attack finishes in the top right corner! (2-0)' },
  { min: 45, type: 'info', text: 'First half extra time: +3 minutes added by the referee.' },
  { min: 53, type: 'threat', text: 'Striker bursts past defense from tight angle, goalkeeper parries away!' },
  { min: 64, type: 'substitution', text: 'Substitution: Flank defender replaced to reinforce defensive shape.' },
  { min: 72, type: 'threat', text: 'Corner kick header bounces off the crossbar!' },
  { min: 78, type: 'goal', text: 'GOAL! Drilled penalty kick into the side netting! (2-1)' },
  { min: 81, type: 'goal', text: 'GOAL! Unbelievable volley after a quick wall-pass exchange! (2-2)' },
  { min: 87, type: 'threat', text: 'Long-range shot from 25 yards! Goalkeeper tips over the bar!' }
];

interface LiveCommentaryProps {
  minute: number;
  plays?: ESPNPlay[];
  homeCode?: string;
  awayCode?: string;
}

export default function LiveCommentary({ minute, plays, homeCode = 'HOME', awayCode = 'AWAY' }: LiveCommentaryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Map ESPN plays to commentary items if present
  let items: CommentaryItem[] = [];
  if (plays && plays.length > 0) {
    items = plays.map(p => {
      const minNum = parseInt(p.clock.replace("'", '')) || minute;
      const isGoal = p.scoreValue && p.scoreValue > 0 || p.text.toLowerCase().includes('goal');
      const isSub = p.text.toLowerCase().includes('substitution') || p.text.toLowerCase().includes('replaces');
      const isCard = p.text.toLowerCase().includes('yellow card') || p.text.toLowerCase().includes('red card');
      
      let type: 'info' | 'goal' | 'threat' | 'substitution' = 'info';
      if (isGoal) type = 'goal';
      else if (isSub || isCard) type = 'substitution';
      else if (p.text.toLowerCase().includes('shot') || p.text.toLowerCase().includes('miss')) type = 'threat';

      return {
        min: minNum,
        type,
        text: p.text
      };
    });
  } else {
    items = DEFAULT_COMMENTARY;
  }

  // Filter commentary that happened up to current minute
  const visibleCommentary = items.filter(item => item.min <= minute)
    .sort((a, b) => b.min - a.min); // Newest first

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Keep focus at the top (newest first)
    }
  }, [visibleCommentary.length]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'goal': return <Flame size={14} color="var(--color-green)" />;
      case 'threat': return <Flame size={14} color="var(--color-blue)" />;
      case 'substitution': return <ArrowRightLeft size={14} color="var(--color-gold)" />;
      default: return <Info size={14} color="var(--text-muted)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '240px' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={16} color="var(--color-green)" />
        AI Spatial Live Commentary
      </h4>

      <div 
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '6px'
        }}
      >
        <AnimatePresence>
          {visibleCommentary.map((item, idx) => (
            <motion.div
              key={`${item.min}-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: item.type === 'goal' ? 'rgba(0, 255, 135, 0.04)' : 'rgba(255,255,255,0.02)',
                border: item.type === 'goal' ? '1px solid rgba(0, 255, 135, 0.15)' : '1px solid rgba(255,255,255,0.04)',
                fontSize: '12.5px',
                alignItems: 'flex-start'
              }}
            >
              <span style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 'bold',
                color: item.type === 'goal' ? 'var(--color-green)' : 'var(--text-secondary)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '2px 6px',
                borderRadius: '4px',
                minWidth: '28px',
                textAlign: 'center'
              }}>
                {item.min}'
              </span>
              
              <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center' }}>
                <span style={{ marginTop: '2px' }}>{getIcon(item.type)}</span>
                <span style={{ color: item.type === 'goal' ? '#ffffff' : 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {item.text}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
