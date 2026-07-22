import React, { useState } from 'react';
import { Layers, Thermometer, Zap, Users, Shield, Cpu } from 'lucide-react';

export const StadiumDigitalTwin: React.FC = () => {
  const [activeTier, setActiveTier] = useState<'lower' | 'club' | 'upper'>('lower');

  const tiers = [
    { id: 'lower', name: 'Lower Tier (Seats 1-20,000)', temp: '24.2°C', throughput: '8,400 fans/hr', energy: '420 kW' },
    { id: 'club', name: 'Club VIP Tier (Seats 20,001-35,000)', temp: '21.5°C', throughput: '4,200 fans/hr', energy: '680 kW' },
    { id: 'upper', name: 'Upper Tier (Seats 35,001-50,000+)', temp: '26.8°C', throughput: '9,800 fans/hr', energy: '350 kW' },
  ];

  const currentTierData = tiers.find(t => t.id === activeTier) || tiers[0];

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(56, 189, 248, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={22} color="#38bdf8" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Stadium Digital Twin Environment & Heat Sensors
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(56, 189, 248, 0.2)',
          color: '#38bdf8',
          fontWeight: 600
        }}>
          50,000+ INSTANCED SEATS
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {tiers.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTier(t.id as any)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              background: activeTier === t.id ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
              color: activeTier === t.id ? '#38bdf8' : '#94a3b8',
              border: '1px solid ' + (activeTier === t.id ? '#38bdf8' : '#334155'),
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
        <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px' }}>
          <Thermometer size={20} color="#f97316" style={{ margin: '0 auto 6px auto' }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Sector Temp</span>
          <strong style={{ fontSize: '1.2rem', color: '#f8fafc' }}>{currentTierData.temp}</strong>
        </div>

        <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px' }}>
          <Users size={20} color="#34d399" style={{ margin: '0 auto 6px auto' }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Gate Throughput</span>
          <strong style={{ fontSize: '1.2rem', color: '#34d399' }}>{currentTierData.throughput}</strong>
        </div>

        <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px' }}>
          <Zap size={20} color="#facc15" style={{ margin: '0 auto 6px auto' }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Power Draw</span>
          <strong style={{ fontSize: '1.2rem', color: '#facc15' }}>{currentTierData.energy}</strong>
        </div>
      </div>
    </div>
  );
};
