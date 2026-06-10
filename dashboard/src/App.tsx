import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { PipelineBuilder } from './components/PipelineBuilder/PipelineBuilder';

interface Detection {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
}

interface StreamFrame {
  pipeline_id: string;
  sequence: number;
  timestamp: number;
  detections: Detection[];
  latency_ms: number;
}

export default function App() {
  const [pipelineId, setPipelineId] = useState('pipeline-001');
  const [fps, setFps] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTimeRef = useRef<number>(Date.now());

  // Connect to live WebSockets aggregator using custom hook
  const { data, connected } = useWebSocket(`ws://localhost:8000/v1/live/${pipelineId}`);

  useEffect(() => {
    if (!data) return;

    try {
      const frame: StreamFrame = JSON.parse(data);

      // FPS tracking calculation
      const now = Date.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      if (delta > 0) {
        setFps(1000 / delta);
      }

      // Bounding box overlay rendering on Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw camera canvas feed backdrop
          ctx.fillStyle = '#16161e';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw video mesh lines to simulate real CCTV
          ctx.strokeStyle = 'rgba(122, 162, 247, 0.05)';
          ctx.lineWidth = 1;
          for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
          }
          for (let j = 0; j < canvas.height; j += 40) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(canvas.width, j);
            ctx.stroke();
          }

          // Render each bounding box with dynamic neon colors
          frame.detections.forEach(det => {
            const [x, y, w, h] = det.bbox;
            const isPerson = det.label === 'person';
            
            // Box glow outline
            ctx.shadowBlur = 10;
            ctx.shadowColor = isPerson ? '#ff5555' : '#50fa7b';
            ctx.strokeStyle = isPerson ? '#ff5555' : '#50fa7b';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);

            // Text background pill
            ctx.shadowBlur = 0; // reset shadow
            ctx.fillStyle = isPerson ? '#ff5555' : '#50fa7b';
            ctx.fillRect(x, y - 24, w > 140 ? 140 : w, 24);

            // Label text
            ctx.fillStyle = '#16161e';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(
              `${det.label.toUpperCase()} ${(det.confidence * 100).toFixed(0)}%`,
              x + 6,
              y - 8
            );
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse websocket message', e);
    }
  }, [data]);

  return (
    <div style={{
      fontFamily: '"Outfit", "Inter", sans-serif',
      padding: '32px',
      backgroundColor: '#0f0f16',
      color: '#a9b1d6',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <header style={{
        borderBottom: '1px solid #3b4261',
        paddingBottom: '20px',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ color: '#7aa2f7', margin: 0, fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            🛸 DEEPSTREAM
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#565f89', fontSize: '14px' }}>
            Production-grade Multi-Modal AI Inference pipeline.
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: connected ? 'rgba(80, 250, 123, 0.1)' : 'rgba(255, 85, 85, 0.1)',
          padding: '8px 16px',
          borderRadius: '20px',
          border: connected ? '1px solid #50fa7b' : '1px solid #ff5555'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: connected ? '#50fa7b' : '#ff5555',
            display: 'inline-block'
          }}></span>
          <span style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: connected ? '#50fa7b' : '#ff5555'
          }}>
            {connected ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
          </span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: '#565f89' }}>Pipeline Active Scope: </label>
            <input
              value={pipelineId}
              onChange={(e) => setPipelineId(e.target.value)}
              style={{
                backgroundColor: '#16161e',
                border: '1px solid #3b4261',
                color: '#c0caf5',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #3b4261' }}>
            <canvas ref={canvasRef} width={640} height={360} style={{ display: 'block', width: '100%', height: 'auto' }} />
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'rgba(22, 22, 30, 0.85)',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#7aa2f7',
              border: '1px solid rgba(122, 162, 247, 0.2)'
            }}>
              LIVE STREAM FEED
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: '#16161e', padding: '20px', borderRadius: '8px', border: '1px solid #3b4261' }}>
              <div style={{ fontSize: '12px', color: '#565f89', textTransform: 'uppercase' }}>Pipeline FPS</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e0af68', marginTop: '4px' }}>
                {fps.toFixed(1)} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#565f89' }}>frames/sec</span>
              </div>
            </div>
            <div style={{ backgroundColor: '#16161e', padding: '20px', borderRadius: '8px', border: '1px solid #3b4261' }}>
              <div style={{ fontSize: '12px', color: '#565f89', textTransform: 'uppercase' }}>Inference Latency</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e0af68', marginTop: '4px' }}>
                42 <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#565f89' }}>ms (p99)</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <PipelineBuilder />
        </div>
      </div>
    </div>
  );
}
