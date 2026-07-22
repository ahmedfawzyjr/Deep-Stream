import React, { useState } from 'react';
import { Cpu, Zap, Activity, ShieldCheck, Database, Server } from 'lucide-react';

export const GRPCTelemetryStreamer: React.FC = () => {

  const [fps, setFps] = useState(60);
  const [packetSize, setPacketSize] = useState(384); // Bytes

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
          <Cpu size={22} color="#38bdf8" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            gRPC Web & Binary Telemetry Protocol Inspector
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
          HTTP/2 BINARY STREAMING
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Target Frame Rate</span>
          <strong style={{ fontSize: '1.2rem', color: '#4ade80' }}>{fps} FPS</strong>
        </div>

        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Packet Payload</span>
          <strong style={{ fontSize: '1.2rem', color: '#38bdf8' }}>{packetSize} Bytes</strong>
        </div>

        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>gRPC Channel</span>
          <strong style={{ fontSize: '1rem', color: '#c084fc' }}>Tonic / HTTP2</strong>
        </div>

        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Security Protocol</span>
          <strong style={{ fontSize: '0.95rem', color: '#facc15' }}>Istio mTLS STRICT</strong>
        </div>
      </div>

      {/* Hex Payload Dump Preview */}
      <div style={{
        background: '#020617',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '12px',
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        color: '#38bdf8'
      }}>
        <div style={{ color: '#94a3b8', marginBottom: '4px' }}>// Raw Binary Protobuf Stream Packet (#0x4F91A2B)</div>
        <code>08 01 12 10 77 63 5F 66 69 6E 61 6C 5F 32 30 32 36 18 DB 8E CE AD 05 28 2A</code>
      </div>
    </div>
  );
};
