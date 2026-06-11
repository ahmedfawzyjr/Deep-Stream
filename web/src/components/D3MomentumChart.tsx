"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HelpCircle, RefreshCw } from 'lucide-react';

interface D3MomentumChartProps {
  minute: number;
}

type ChartMetric = 'momentum' | 'xg' | 'ppda';

interface MatchEvent {
  min: number;
  type: 'goal' | 'card-yellow' | 'card-red' | 'penalty';
  team: 'ARG' | 'FRA';
  desc: string;
}

const EVENTS: MatchEvent[] = [
  { min: 14, type: 'goal', team: 'ARG', desc: 'Lionel Messi penalty conversion (1-0)' },
  { min: 32, type: 'card-yellow', team: 'FRA', desc: 'Adrien Rabiot tactical foul' },
  { min: 41, type: 'goal', team: 'ARG', desc: 'Ángel Di María counter-attack strike (2-0)' },
  { min: 64, type: 'card-yellow', team: 'ARG', desc: 'Rodrigo De Paul aggressive press' },
  { min: 78, type: 'goal', team: 'FRA', desc: 'Kylian Mbappé penalty conversion (2-1)' },
  { min: 81, type: 'goal', team: 'FRA', desc: 'Kylian Mbappé stellar volley (2-2)' }
];

export default function D3MomentumChart({ minute }: D3MomentumChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [metric, setMetric] = useState<ChartMetric>('momentum');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string; visible: boolean }>({
    x: 0,
    y: 0,
    content: '',
    visible: false
  });

  useEffect(() => {
    if (!svgRef.current) return;

    // Generate dynamic mock data path based on match minutes
    const dataPoints = 90;
    const data = Array.from({ length: dataPoints }, (_, i) => {
      const x = i + 1;
      let y = 50; // Neutral baseline

      if (metric === 'momentum') {
        // Sine wave base + specific event impact offsets
        y = 50 + Math.sin(x * 0.15 + minute * 0.05) * 25 + Math.cos(x * 0.4) * 12;
        // Dampen future minutes beyond current live time
        if (x > minute) {
          y = 50 + (y - 50) * 0.15; 
        }
      } else if (metric === 'xg') {
        // Step increases at goals
        let argXG = 0;
        let fraXG = 0;
        if (x >= 14) argXG += 0.76;
        if (x >= 41) argXG += 0.52;
        if (x >= 78) fraXG += 0.76;
        if (x >= 81) fraXG += 0.38;
        // Argentina - France difference (offset from 50)
        y = 50 + (argXG - fraXG) * 20;
      } else {
        // PPDA (Pressing Intensity - lower is more intense)
        y = 50 + Math.sin(x * 0.2) * 15 + (x % 5 === 0 ? 12 : -5);
      }

      return { x, y: Math.max(5, Math.min(95, y)) };
    });

    const width = 700;
    const height = 180;
    const margin = { top: 15, right: 20, bottom: 25, left: 35 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    // Scales
    const xScale = d3.scaleLinear()
      .domain([1, 90])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(9).tickFormat(d => `${d}'`))
      .call(g => g.select(".domain").attr("stroke", "rgba(255, 255, 255, 0.1)"))
      .call(g => g.selectAll(".tick text").attr("fill", "var(--text-muted)").style("font-size", "10px"))
      .call(g => g.selectAll(".tick line").attr("stroke", "rgba(255, 255, 255, 0.05)"));

    // Gradients
    const defs = svg.append("defs");
    
    // Argentina Gradient (Top Area)
    const argGrad = defs.append("linearGradient")
      .attr("id", "arg-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    argGrad.append("stop").attr("offset", "0%").attr("stop-color", "var(--color-blue)").attr("stop-opacity", 0.35);
    argGrad.append("stop").attr("offset", "100%").attr("stop-color", "var(--color-blue)").attr("stop-opacity", 0.0);

    // France Gradient (Bottom Area)
    const fraGrad = defs.append("linearGradient")
      .attr("id", "fra-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    fraGrad.append("stop").attr("offset", "0%").attr("stop-color", "var(--color-purple)").attr("stop-opacity", 0.0);
    fraGrad.append("stop").attr("offset", "100%").attr("stop-color", "var(--color-purple)").attr("stop-opacity", 0.35);

    // Grid center line (zero line)
    svg.append("line")
      .attr("x1", margin.left)
      .attr("y1", yScale(50))
      .attr("x2", width - margin.right)
      .attr("y2", yScale(50))
      .attr("stroke", "rgba(255, 255, 255, 0.2)")
      .attr("stroke-dasharray", "3,3");

    // Area generators
    const areaArg = d3.area<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y0(yScale(50))
      .y1(d => yScale(Math.max(50, d.y)))
      .curve(d3.curveMonotoneX);

    const areaFra = d3.area<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y0(yScale(50))
      .y1(d => yScale(Math.min(50, d.y)))
      .curve(d3.curveMonotoneX);

    // Render Areas
    svg.append("path")
      .datum(data)
      .attr("fill", "url(#arg-gradient)")
      .attr("d", areaArg);

    svg.append("path")
      .datum(data)
      .attr("fill", "url(#fra-gradient)")
      .attr("d", areaFra);

    // Line generator
    const line = d3.line<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Render core path
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 255, 255, 0.4)")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Color code line pieces by team
    svg.append("path")
      .datum(data.filter(d => d.y >= 50))
      .attr("fill", "none")
      .attr("stroke", "var(--color-blue)")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg.append("path")
      .datum(data.filter(d => d.y <= 50))
      .attr("fill", "none")
      .attr("stroke", "var(--color-purple)")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Live vertical indicator line
    svg.append("line")
      .attr("x1", xScale(minute))
      .attr("y1", margin.top)
      .attr("x2", xScale(minute))
      .attr("y2", height - margin.bottom)
      .attr("stroke", "var(--color-green)")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "2,2");

    // Event Nodes
    EVENTS.forEach(ev => {
      // Don't render events that haven't happened yet
      if (ev.min > minute) return;

      const x = xScale(ev.min);
      const y = ev.team === 'ARG' ? yScale(75) : yScale(25);
      
      const nodeColor = ev.type === 'goal' 
        ? 'var(--color-green)' 
        : ev.type === 'card-red' 
          ? 'var(--color-pink)' 
          : 'var(--color-gold)';

      const group = svg.append("g")
        .attr("transform", `translate(${x}, ${y})`)
        .style("cursor", "pointer")
        .on("mouseenter", (e) => {
          const container = containerRef.current;
          if (container) {
            const rect = container.getBoundingClientRect();
            setTooltip({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top - 40,
              content: `[${ev.min}'] ${ev.desc}`,
              visible: true
            });
          }
        })
        .on("mouseleave", () => {
          setTooltip(prev => ({ ...prev, visible: false }));
        });

      // Node background circles
      group.append("circle")
        .attr("r", 7)
        .attr("fill", "#0f172a")
        .attr("stroke", nodeColor)
        .attr("stroke-width", 1.5);

      // Icon placeholder label inside circle
      group.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#ffffff")
        .style("font-size", "8px")
        .style("font-weight", "800")
        .text(ev.type === 'goal' ? '⚽' : ev.type === 'card-yellow' ? '🟨' : '🟥');
    });

  }, [minute, metric]);

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      
      {/* Tab Selectors */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['momentum', 'xg', 'ppda'] as ChartMetric[]).map(met => (
            <button
              key={met}
              onClick={() => setMetric(met)}
              style={{
                background: metric === met ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: metric === met ? 'var(--color-green)' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {met === 'ppda' ? 'Pressing (PPDA)' : met === 'xg' ? 'Expected Goals (xG)' : 'Momentum'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <RefreshCw size={10} className="pulse-live" />
          <span>Interactive timeline</span>
        </div>
      </div>

      {/* D3 Canvas */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg 
          ref={svgRef} 
          viewBox="0 0 700 180" 
          style={{ width: '100%', height: '180px', display: 'block' }}
        />
      </div>

      {/* Floating HTML Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            background: '#0f172a',
            border: '1px solid var(--color-green)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#f8fafc',
            pointerEvents: 'none',
            zIndex: 100,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
