import React, { useState } from 'react';
import { Activity, Flame, Zap, Gauge, Compass } from 'lucide-react';

export const IoTSmartBallViewer: React.FC = () => {
  const [velocityKmh, setVelocityKmh] = useState(124.2);
  const [spinRpm, setSpinRpm] = useState(520);

  const magnusCurveCm = Number(((spinRpm / 100) * 8.5).toFixed(1));
  const impactForceN = Math.round((velocityKmh / 3.6) * 42);

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(250, 204, 21, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flame size={22} color="#facc15" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            IoT Smart Ball & Boot Micro-Sensor Dynamics
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(250, 204, 21, 0.2)',
          color: '#facc15',
          fontWeight: 600
        }}>
          1000Hz SENSOR FEED
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
          <Gauge size={20} color="#facc15" style={{ margin: '0 auto 4px auto' }} />
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Strike Speed</span>
          <strong style={{ fontSize: '1.3rem', color: '#f8fafc' }}>{velocityKmh} km/h</strong>
        </div>

        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
          <Compass size={20} color="#38bdf8" style={{ margin: '0 auto 4px auto' }} />
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Ball Spin Rate</span>
          <strong style={{ fontSize: '1.3rem', color: '#38bdf8' }}>{spinRpm} RPM</strong>
        </div>

        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
          <Zap size={20} color="#4ade80" style={{ margin: '0 auto 4px auto' }} />
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Magnus Curve</span>
          <strong style={{ fontSize: '1.3rem', color: '#4ade80' }}>+{magnusCurveCm} cm</strong>
        </div>

        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
          <Activity size={20} color="#ef4444" style={{ margin: '0 auto 4px auto' }} />
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Foot Impact Force</span>
          <strong style={{ fontSize: '1.3rem', color: '#ef4444' }}>{impactForceN} N</strong>
        </div>
      </div>
    </div>
  );
};
