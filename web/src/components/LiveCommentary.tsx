"use client";

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Flame, Shield, ArrowRightLeft, Info } from 'lucide-react';

interface CommentaryItem {
  min: number;
  type: 'info' | 'goal' | 'threat' | 'substitution';
  text: string;
  team?: 'ARG' | 'FRA';
}

const COMMENTARY_DATA: CommentaryItem[] = [
  { min: 3, type: 'info', text: 'Match starts under dry conditions at MetLife Stadium. Argentina kicking off from left to right.' },
  { min: 9, type: 'threat', team: 'ARG', text: 'Messi releases Di Maria on the left wing. T. Hernandez blocks the low cross.' },
  { min: 14, type: 'goal', team: 'ARG', text: 'GOAL! Lionel Messi converts the penalty with a cool strike into the bottom-left corner! (1-0)' },
  { min: 22, type: 'info', text: 'France starting to assert possession in midfield. Rabiot dictating the tempo.' },
  { min: 32, type: 'substitution', team: 'FRA', text: 'Tactical adjustment: Rabiot receives a yellow card, forcing Deschamps to pull back Tchouameni.' },
  { min: 41, type: 'goal', team: 'ARG', text: 'GOAL! Ángel Di María finishes a lightning-fast counter-attack assisted by Mac Allister! (2-0)' },
  { min: 45, type: 'info', text: 'First half extra time: +3 minutes added by the referee.' },
  { min: 53, type: 'threat', team: 'FRA', text: 'Mbappe bursts past Molina. Shoots from tight angle, Martinez parries it away.' },
  { min: 64, type: 'substitution', team: 'ARG', text: 'Substitution: Tagliafico is replaced by Acuna to reinforce the left flank.' },
  { min: 72, type: 'threat', team: 'FRA', text: 'Griezmann corner kick met by Giroud, header bounces off the crossbar!' },
  { min: 78, type: 'goal', team: 'FRA', text: 'GOAL! Kylian Mbappé drills the penalty kick past Martinez! France is back in the game! (2-1)' },
  { min: 81, type: 'goal', team: 'FRA', text: 'GOAL! Unbelievable volley from Kylian Mbappé after a quick exchange with Thuram! (2-2)' },
  { min: 87, type: 'threat', team: 'ARG', text: 'Messi shoots from 25 yards! Maignan tip-saves it over the bar!' }
];

interface LiveCommentaryProps {
  minute: number;
}

export default function LiveCommentary({ minute }: LiveCommentaryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter commentary that happened up to current minute
  const visibleCommentary = COMMENTARY_DATA.filter(item => item.min <= minute)
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
