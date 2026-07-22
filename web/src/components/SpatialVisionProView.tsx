import React, { useState } from 'react';
import { Glasses, Eye, RotateCw, Sparkles, Layers } from 'lucide-react';

export const SpatialVisionProView: React.FC = () => {
  const [spatialActive, setSpatialActive] = useState(false);
  const [passthrough, setPassthrough] = useState(true);

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(168, 85, 247, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Glasses size={22} color="#c084fc" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Spatial Holographic Pitch Preview (Apple Vision Pro & Meta Quest)
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(168, 85, 247, 0.2)',
          color: '#c084fc',
          fontWeight: 600
        }}>
          SPATIAL COMPUTING
        </span>
      </div>

      <div style={{
        position: 'relative',
        height: '280px',
        borderRadius: '12px',
        background: spatialActive ? 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, #020617 100%)' : '#0f172a',
        border: '1px solid rgba(192, 132, 252, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {spatialActive ? (
          <div style={{ textAlign: 'center', zIndex: 2 }}>
            <div style={{
              width: '200px',
              height: '120px',
              borderRadius: '12px',
              border: '2px stroke #c084fc',
              background: 'rgba(192, 132, 252, 0.15)',
              boxShadow: '0 0 30px rgba(192, 132, 252, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>
                🕶️ VisionOS Spatial Hologram
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#c084fc', background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '12px' }}>
              ✓ 3D Spatial Audio & Tabletop Anchor Locked
            </span>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Sparkles size={40} color="#c084fc" style={{ marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#f8fafc' }}>
              Spatial Holographic Room Projection
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#94a3b8', maxWidth: '420px' }}>
              Project the 3D match pitch into your living room space with spatial audio and real-time player telemetry.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={() => setSpatialActive(!spatialActive)}
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '12px',
          borderRadius: '10px',
          background: spatialActive ? '#dc2626' : 'linear-gradient(135deg, #9333ea, #7e22ce)',
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
        <Glasses size={18} /> {spatialActive ? 'Exit Spatial View' : 'Launch VisionOS Spatial Hologram'}
      </button>
    </div>
  );
};
