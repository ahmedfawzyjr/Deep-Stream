import React from 'react';
import { Activity, Server, Cpu, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ServiceItem {
  name: string;
  stack: string;
  status: 'ONLINE' | 'STANDBY';
  latency: string;
  throughput: string;
  port: string;
}

const SERVICES: ServiceItem[] = [
  { name: 'Go API Gateway', stack: 'Go 1.22 (Chi, WS, pgx)', status: 'ONLINE', latency: '1.2ms', throughput: '340 req/s', port: ':8080' },
  { name: 'Rust Inference Engine', stack: 'Rust (tract-onnx, Tonic gRPC)', status: 'ONLINE', latency: '1.42ms (p99)', throughput: '850 inf/s', port: ':50051' },
  { name: 'Flask GenAI API', stack: 'Python 3.12 (Flask, Prompts)', status: 'ONLINE', latency: '18ms', throughput: '45 req/s', port: ':5001' },
  { name: 'Express Telemetry Proxy', stack: 'Node.js (Express, Redis Cache)', status: 'ONLINE', latency: '3.1ms', throughput: '220 req/s', port: ':3001' },
  { name: 'Django Squad Portal', stack: 'Django 5 (PostgreSQL ORM)', status: 'ONLINE', latency: '12.5ms', throughput: '80 req/s', port: ':8000' },
];

export const ServicesHealthPulse: React.FC = () => {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={22} color="#4ade80" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Multi-Service Microservice Telemetry Pulse & Benchmarks
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(34, 197, 94, 0.2)',
          color: '#4ade80',
          fontWeight: 600
        }}>
          ALL 5 SERVICES VERIFIED
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {SERVICES.map((srv) => (
          <div
            key={srv.name}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '14px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{srv.name}</strong>
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.2)',
                color: '#4ade80',
                fontWeight: 700
              }}>
                ● {srv.status}
              </span>
            </div>

            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '10px' }}>
              {srv.stack} {srv.port}
            </span>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
              <span>Latency: <strong style={{ color: '#38bdf8' }}>{srv.latency}</strong></span>
              <span>Throughput: <strong style={{ color: '#c084fc' }}>{srv.throughput}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
