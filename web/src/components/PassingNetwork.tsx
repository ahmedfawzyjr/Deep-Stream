"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Users, Eye, EyeOff } from 'lucide-react';

interface PlayerNode {
  id: number;
  name: string;
  number: number;
  x: number; // 0 to 100 on the pitch layout
  y: number; // 0 to 100 on the pitch layout
  passes: number;
  completion: number;
  role: string;
}

interface PassLink {
  from: number;
  to: number;
  count: number;
}

const PLAYERS: PlayerNode[] = [
  { id: 1, name: "E. Martínez", number: 23, x: 10, y: 50, passes: 24, completion: 78, role: "Goalkeeper" },
  { id: 2, name: "N. Molina", number: 26, x: 32, y: 15, passes: 48, completion: 85, role: "Right Back" },
  { id: 3, name: "C. Romero", number: 13, x: 28, y: 38, passes: 56, completion: 92, role: "Center Back" },
  { id: 4, name: "N. Otamendi", number: 19, x: 28, y: 62, passes: 61, completion: 90, role: "Center Back" },
  { id: 5, name: "N. Tagliafico", number: 3, x: 32, y: 85, passes: 42, completion: 83, role: "Left Back" },
  { id: 6, name: "R. De Paul", number: 7, x: 52, y: 28, passes: 72, completion: 89, role: "Central Midfielder" },
  { id: 7, name: "Enzo Fernández", number: 24, x: 48, y: 50, passes: 85, completion: 94, role: "Defensive Midfielder" },
  { id: 8, name: "A. Mac Allister", number: 20, x: 52, y: 72, passes: 68, completion: 91, role: "Central Midfielder" },
  { id: 9, name: "Lionel Messi", number: 10, x: 70, y: 30, passes: 59, completion: 88, role: "Right Winger / Playmaker" },
  { id: 10, name: "J. Álvarez", number: 9, x: 82, y: 50, passes: 31, completion: 81, role: "Center Forward" },
  { id: 11, name: "Á. Di María", number: 11, x: 70, y: 70, passes: 45, completion: 86, role: "Left Winger" },
];

const PASS_LINKS: PassLink[] = [
  // CBs to GK
  { from: 1, to: 3, count: 8 },
  { from: 1, to: 4, count: 10 },
  // CBs exchange
  { from: 3, to: 4, count: 18 },
  // CBs to FBs
  { from: 3, to: 2, count: 15 },
  { from: 4, to: 5, count: 14 },
  // CBs to Enzo (DM)
  { from: 3, to: 7, count: 22 },
  { from: 4, to: 7, count: 25 },
  // Enzo to De Paul and Mac Allister
  { from: 7, to: 6, count: 20 },
  { from: 7, to: 8, count: 21 },
  // De Paul to Molina / Messi
  { from: 6, to: 2, count: 18 },
  { from: 6, to: 9, count: 26 },
  // Mac Allister to Tagliafico / Di Maria
  { from: 8, to: 5, count: 12 },
  { from: 8, to: 11, count: 19 },
  // Midfielders to Alvarez
  { from: 7, to: 10, count: 9 },
  { from: 6, to: 10, count: 8 },
  { from: 8, to: 10, count: 11 },
  // Messi to Alvarez / Di Maria
  { from: 9, to: 10, count: 14 },
  { from: 9, to: 11, count: 15 },
  { from: 11, to: 10, count: 10 },
  // De Paul and Enzo to Messi
  { from: 7, to: 9, count: 28 },
];

export default function PassingNetwork() {
  const [hoveredPlayer, setHoveredPlayer] = useState<PlayerNode | null>(null);
  const [showValues, setShowValues] = useState<boolean>(true);
  const [showXTGrid, setShowXTGrid] = useState<boolean>(false);

  // Filter links related to the hovered player
  const getLinkColor = (link: PassLink) => {
    if (!hoveredPlayer) return 'rgba(0, 255, 135, 0.2)';
    if (link.from === hoveredPlayer.id || link.to === hoveredPlayer.id) {
      return 'rgba(0, 229, 255, 0.85)'; // cyan highlighted link
    }
    return 'rgba(255, 255, 255, 0.05)';
  };

  const getLinkWidth = (count: number) => {
    return Math.max(1, count / 4);
  };

  // Expected Threat 4x3 spatial grid values
  const XT_GRID = [
    [0.02, 0.05, 0.12, 0.28],
    [0.03, 0.08, 0.18, 0.42],
    [0.02, 0.06, 0.14, 0.31]
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={16} color="var(--color-green)" />
          Tactical Passing Network & Spatial xT Threat Overlay
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setShowXTGrid(!showXTGrid)}
            style={{
              backgroundColor: showXTGrid ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
              border: '1px solid ' + (showXTGrid ? '#38bdf8' : 'rgba(255,255,255,0.1)'),
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              color: showXTGrid ? '#38bdf8' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: 600
            }}
          >
            🎯 {showXTGrid ? "Hide xT Grid" : "Show xT Threat Heatmap"}
          </button>
          <button 
            onClick={() => setShowValues(!showValues)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {showValues ? <EyeOff size={12} /> : <Eye size={12} />}
            {showValues ? "Hide Volume" : "Show Volume"}
          </button>
        </div>
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '20px', minHeight: '320px' }}>
        
        {/* SVG Football Pitch Passing Network */}
        <div style={{
          position: 'relative',
          backgroundColor: '#071615',
          backgroundImage: 'radial-gradient(circle, #0e2925 0%, #030a08 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 255, 135, 0.1)',
          overflow: 'hidden',
          aspectRatio: '16/10'
        }}>
          {/* Pitch markings */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: '50%',
            width: '1px', backgroundColor: 'rgba(255,255,255,0.06)'
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '100px', height: '100px',
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)',
            transform: 'translate(-50%, -50%)', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '4px', height: '4px',
            borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)',
            transform: 'translate(-50%, -50%)', pointerEvents: 'none'
          }} />
          
          {/* Penalty boxes */}
          <div style={{
            position: 'absolute', top: '20%', bottom: '20%', left: 0,
            width: '16%', border: '1px solid rgba(255,255,255,0.06)', borderLeft: 'none', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', top: '20%', bottom: '20%', right: 0,
            width: '16%', border: '1px solid rgba(255,255,255,0.06)', borderRight: 'none', pointerEvents: 'none'
          }} />

          {/* SVG Canvas for Links & Nodes */}
          <svg style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <defs>
              <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-blue)" />
                <stop offset="100%" stopColor="var(--color-green)" />
              </linearGradient>
            </defs>

            {/* Render Expected Threat (xT) Grid if toggled */}
            {showXTGrid && (
              <g opacity="0.65">
                {XT_GRID.map((row, rIdx) =>
                  row.map((val, cIdx) => {
                    const widthPct = 25;
                    const heightPct = 33.33;
                    const x = cIdx * widthPct;
                    const y = rIdx * heightPct;
                    const alpha = Math.min(0.8, val * 1.8);
                    const color = val > 0.25 ? `rgba(244, 63, 94, ${alpha})` : val > 0.1 ? `rgba(56, 189, 248, ${alpha})` : `rgba(30, 41, 59, ${alpha})`;

                    return (
                      <g key={`xt-${rIdx}-${cIdx}`}>
                        <rect
                          x={`${x}%`}
                          y={`${y}%`}
                          width={`${widthPct}%`}
                          height={`${heightPct}%`}
                          fill={color}
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="0.5"
                        />
                        <text
                          x={`${x + widthPct / 2}%`}
                          y={`${y + heightPct / 2}%`}
                          fill="#ffffff"
                          fontSize="10px"
                          fontWeight="bold"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                        >
                          xT +{val}
                        </text>
                      </g>
                    );
                  })
                )}
              </g>
            )}


            {/* Render Links */}
            {PASS_LINKS.map((link, idx) => {
              const fromPlayer = PLAYERS.find(p => p.id === link.from);
              const toPlayer = PLAYERS.find(p => p.id === link.to);
              if (!fromPlayer || !toPlayer) return null;

              // Convert percentage layout coordinates to pixel estimations
              const x1 = `${fromPlayer.x}%`;
              const y1 = `${fromPlayer.y}%`;
              const x2 = `${toPlayer.x}%`;
              const y2 = `${toPlayer.y}%`;

              const color = getLinkColor(link);
              const strokeWidth = getLinkWidth(link.count);

              return (
                <g key={`link-${idx}`}>
                  <line 
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                  />
                  {showValues && hoveredPlayer && (link.from === hoveredPlayer.id || link.to === hoveredPlayer.id) && (
                    <text
                      x={`${(fromPlayer.x + toPlayer.x) / 2}%`}
                      y={`${(fromPlayer.y + toPlayer.y) / 2 - 2}%`}
                      fill="var(--color-blue)"
                      fontSize="9px"
                      fontWeight="bold"
                      textAnchor="middle"
                      style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
                    >
                      {link.count}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {PLAYERS.map((player) => {
              const isHovered = hoveredPlayer?.id === player.id;
              const hasFocus = hoveredPlayer === null || isHovered;

              return (
                <g 
                  key={`node-${player.id}`}
                  onMouseEnter={() => setHoveredPlayer(player)}
                  onMouseLeave={() => setHoveredPlayer(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer glow aura for focused node */}
                  {isHovered && (
                    <circle 
                      cx={`${player.x}%`}
                      cy={`${player.y}%`}
                      r="16"
                      fill="none"
                      stroke="var(--color-blue)"
                      strokeWidth="2"
                      style={{ opacity: 0.8 }}
                    />
                  )}
                  {/* Player circle */}
                  <circle 
                    cx={`${player.x}%`}
                    cy={`${player.y}%`}
                    r="10"
                    fill={isHovered ? "var(--color-blue)" : "rgba(23, 42, 69, 0.95)"}
                    stroke={isHovered ? "#ffffff" : "var(--color-green)"}
                    strokeWidth="1.5"
                    style={{ transition: 'fill 0.2s, stroke 0.2s, r 0.2s' }}
                  />
                  {/* Player Number */}
                  <text
                    x={`${player.x}%`}
                    y={`${player.y + 1}%`}
                    fill={isHovered ? "#000000" : "#ffffff"}
                    fontSize="9px"
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    style={{ userSelect: 'none', transition: 'fill 0.2s' }}
                  >
                    {player.number}
                  </text>
                  {/* Player Name Tag (small hover popup) */}
                  <text
                    x={`${player.x}%`}
                    y={`${player.y - 14}%`}
                    fill={isHovered ? "#ffffff" : "var(--text-secondary)"}
                    fontSize="8.5px"
                    fontWeight={isHovered ? "bold" : "normal"}
                    textAnchor="middle"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))', userSelect: 'none', transition: 'fill 0.2s' }}
                  >
                    {player.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Player Stats Panel Card */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            {hoveredPlayer ? (
              <motion.div
                key={hoveredPlayer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-blue)' }}>#{hoveredPlayer.number}</span>
                    <strong style={{ fontSize: '14px', color: '#ffffff' }}>{hoveredPlayer.name}</strong>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{hoveredPlayer.role}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Passes</div>
                    <strong style={{ fontSize: '15px', color: '#ffffff' }}>{hoveredPlayer.passes}</strong>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completion</div>
                    <strong style={{ fontSize: '15px', color: 'var(--color-green)' }}>{hoveredPlayer.completion}%</strong>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '4px' }}>
                  💡 Hover nodes to visualize targeted channels and chemical combinations. Enzo Fernández is the main distribution engine.
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', padding: '16px 0' }}
              >
                <Users size={28} color="var(--text-muted)" style={{ margin: '0 auto 10px auto' }} />
                <span>Hover over player nodes to analyze pass paths and completion metrics.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
