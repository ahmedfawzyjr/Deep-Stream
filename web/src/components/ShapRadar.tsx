"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ShapRadarProps {
  argentinaForm: number;
  franceForm: number;
  tacticalIndex: number; // 0 to 100
  staminaIndex: number;  // 0 to 100
  crowdFactor: number;   // 0 to 100
  weatherImpact: number; // 0 to 100
}

export default function ShapRadar({
  argentinaForm,
  franceForm,
  tacticalIndex,
  staminaIndex,
  crowdFactor,
  weatherImpact
}: ShapRadarProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Define features
    const features = [
      { name: "Current Form", argVal: argentinaForm, fraVal: franceForm },
      { name: "Tactics", argVal: tacticalIndex, fraVal: 100 - tacticalIndex },
      { name: "Stamina/Stamina", argVal: staminaIndex, fraVal: Math.max(20, 120 - staminaIndex) },
      { name: "Crowd Support", argVal: crowdFactor, fraVal: 100 - crowdFactor },
      { name: "Climate Fit", argVal: weatherImpact, fraVal: 95 - weatherImpact },
      { name: "Historical Bias", argVal: 72, fraVal: 55 }
    ];

    const width = 320;
    const height = 320;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous contents

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Scales
    const rScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, radius]);

    // Draw grid concentric circles
    const levels = 4;
    for (let level = 1; level <= levels; level++) {
      const r = (radius / levels) * level;
      g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "rgba(255, 255, 255, 0.05)")
        .attr("stroke-width", 1);

      // Add scale value labels
      g.append("text")
        .attr("x", 4)
        .attr("y", -r + 3)
        .attr("fill", "rgba(255, 255, 255, 0.25)")
        .style("font-size", "8px")
        .text((100 / levels) * level);
    }

    // Angle calculator
    const angleSlice = (Math.PI * 2) / features.length;

    // Draw axes
    features.forEach((feature, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = rScale(100) * Math.cos(angle);
      const y = rScale(100) * Math.sin(angle);

      // Axis line
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "rgba(255, 255, 255, 0.1)")
        .attr("stroke-width", 1);

      // Axis Label
      const labelX = rScale(100 + 20) * Math.cos(angle);
      const labelY = rScale(100 + 10) * Math.sin(angle);
      let textAnchor = "middle";
      if (Math.cos(angle) > 0.1) textAnchor = "start";
      else if (Math.cos(angle) < -0.1) textAnchor = "end";

      g.append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("fill", "rgba(255, 255, 255, 0.6)")
        .style("font-size", "10px")
        .style("font-weight", "600")
        .attr("text-anchor", textAnchor)
        .attr("dy", "0.35em")
        .text(feature.name);
    });

    // Radar line generator
    const radarLine = d3.lineRadial<{ val: number; angle: number }>()
      .radius(d => rScale(d.val))
      .angle(d => d.angle)
      .curve(d3.curveLinearClosed);

    // Prepare data for Teams
    const argentinaData = features.map((f, i) => ({
      val: f.argVal,
      angle: i * angleSlice
    }));

    const franceData = features.map((f, i) => ({
      val: f.fraVal,
      angle: i * angleSlice
    }));

    // Draw Argentina polygon
    g.append("path")
      .datum(argentinaData)
      .attr("d", radarLine as any)
      .attr("fill", "rgba(0, 229, 255, 0.18)")
      .attr("stroke", "var(--color-blue)")
      .attr("stroke-width", 2)
      .style("opacity", 0.95);

    // Draw France polygon
    g.append("path")
      .datum(franceData)
      .attr("d", radarLine as any)
      .attr("fill", "rgba(138, 43, 226, 0.18)")
      .attr("stroke", "var(--color-purple)")
      .attr("stroke-width", 2)
      .style("opacity", 0.95);

    // Add points for Argentina
    argentinaData.forEach(d => {
      const angle = d.angle - Math.PI / 2;
      g.append("circle")
        .attr("cx", rScale(d.val) * Math.cos(angle))
        .attr("cy", rScale(d.val) * Math.sin(angle))
        .attr("r", 4)
        .attr("fill", "var(--color-blue)")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1);
    });

    // Add points for France
    franceData.forEach(d => {
      const angle = d.angle - Math.PI / 2;
      g.append("circle")
        .attr("cx", rScale(d.val) * Math.cos(angle))
        .attr("cy", rScale(d.val) * Math.sin(angle))
        .attr("r", 4)
        .attr("fill", "var(--color-purple)")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1);
    });

  }, [argentinaForm, franceForm, tacticalIndex, staminaIndex, crowdFactor, weatherImpact]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
      <svg 
        ref={svgRef} 
        width={320} 
        height={320} 
        viewBox="0 0 320 320" 
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  );
}
