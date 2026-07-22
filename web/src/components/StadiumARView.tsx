import React, { useState } from 'react';
import { Smartphone, Camera, Eye, RotateCw, Maximize2, Layers } from 'lucide-react';

export const StadiumARView: React.FC = () => {
  const [arActive, setArActive] = useState(false);
  const [surfaceDetected, setSurfaceDetected] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);

  const toggleARMode = () => {
    if (!arActive) {
      setArActive(true);
      setTimeout(() => setSurfaceDetected(true), 1200);
    } else {
      setArActive(false);
      setSurfaceDetected(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(14, 165, 233, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Smartphone size={22} color="#38bdf8" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            WebAR Tabletop 3D Stadium Projection (WebXR Engine)
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(14, 165, 233, 0.2)',
          color: '#38bdf8',
          fontWeight: 600
        }}>
          AUGMENTED REALITY
        </span>
      </div>

      <div style={{
        position: 'relative',
        height: '320px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: arActive ? '#020617' : 'radial-gradient(circle, #0f172a 0%, #020617 100%)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {arActive ? (
          <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* AR Camera Simulated Feed */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(45deg, rgba(14,165,233,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(14,165,233,0.05) 25%, transparent 25%)',
              backgroundSize: '30px 30px',
              opacity: 0.8
            }} />

            {surfaceDetected ? (
              <div style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
                textAlign: 'center',
                zIndex: 2
              }}>
                {/* 3D Holographic Stadium Wireframe */}
                <div style={{
                  width: '220px',
                  height: '140px',
                  borderRadius: '12px',
                  border: '2px solid #38bdf8',
                  background: 'rgba(14, 165, 233, 0.15)',
                  boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto'
                }}>
                  <div style={{
                    width: '180px',
                    height: '100px',
                    border: '1px stroke #4ade80',
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: '6px'
                  }} />
                  <span style={{ position: 'absolute', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
                    🏟️ StadiView AR Hologram
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#4ade80', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '12px' }}>
                  ✓ Surface Locked • Tabletop Plane Tracking Active
                </span>
              </div>
            ) : (
              <div style={{ textAlign: 'center', zIndex: 2 }}>
                <Camera size={36} color="#38bdf8" className="animate-pulse" style={{ marginBottom: '10px' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
                  Scanning physical surface... Move camera slowly.
                </p>
              </div>
            )}

            {/* AR Controls Overlay */}
            {surfaceDetected && (
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                right: '12px',
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                zIndex: 3
              }}>
                <button
                  onClick={() => setScale(prev => Math.min(1.5, prev + 0.1))}
                  style={{ background: 'rgba(30, 41, 59, 0.85)', color: '#fff', border: '1px solid #475569', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  <Maximize2 size={14} /> Zoom +
                </button>
                <button
                  onClick={() => setRotation(prev => (prev + 45) % 360)}
                  style={{ background: 'rgba(30, 41, 59, 0.85)', color: '#fff', border: '1px solid #475569', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  <RotateCw size={14} /> Rotate 45°
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Layers size={42} color="#38bdf8" style={{ marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#f8fafc' }}>
              Project 3D Stadium on Tabletop Surface
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#94a3b8', maxWidth: '400px' }}>
              Use your device camera to view real-time match telemetry and spatial player movements projected on your desk in Augmented Reality.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={toggleARMode}
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '12px',
          borderRadius: '10px',
          background: arActive ? '#dc2626' : 'linear-gradient(135deg, #0284c7, #0369a1)',
          color: '#fff',
          border: 'none',
          fontWeight: 700,
          fontSize: '0.95rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <Eye size={18} /> {arActive ? 'Exit WebAR Mode' : 'Launch Tabletop WebAR Mode'}
      </button>
    </div>
  );
};
