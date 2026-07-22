import React, { useState } from 'react';
import { FileText, Sparkles, AlertTriangle, ShieldCheck, Download, RefreshCw } from 'lucide-react';

export const OpponentScoutingReport: React.FC = () => {
  const [targetTeam, setTargetTeam] = useState('France');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<{
    team: string;
    pressingStyle: string;
    weakness: string;
    keyThreat: string;
    counterStrategy: string;
    winProb: number;
  } | null>({
    team: 'France',
    pressingStyle: 'High transition verticality with rapid wing overload (Ppda: 8.4)',
    weakness: 'Half-spaces behind attacking fullbacks during 60-75th minute transitions',
    keyThreat: 'Kylian Mbappé fast counter-attack down the left channel',
    counterStrategy: 'Double-pivot midfield screen with low-block wingback coverage',
    winProb: 54.2
  });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:5001/api/v1/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Scout report for ${targetTeam}` })
      });
      if (res.ok) {
        setReport({
          team: targetTeam,
          pressingStyle: `${targetTeam} exhibits aggressive high-block pressing with fast transition vectors.`,
          weakness: `Vulnerable to over-the-top diagonal long balls against high defensive line.`,
          keyThreat: `Central playmaker attacking half-spaces during build-up play.`,
          counterStrategy: `Control possession tempo (60%+ target) and exploit wide spaces.`,
          winProb: 58.5
        });
      }
    } catch {
      // Keep state
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={22} color="#60a5fa" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            AI Opponent Scouting Auto-Report Generator
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(59, 130, 246, 0.2)',
          color: '#60a5fa',
          fontWeight: 600
        }}>
          GENAI TACTICAL COPILOT
        </span>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <select
          value={targetTeam}
          onChange={(e) => setTargetTeam(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#fff',
            fontSize: '0.9rem'
          }}
        >
          <option value="France">🇫🇷 France (National Team)</option>
          <option value="Chelsea">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Chelsea FC</option>
          <option value="Real Madrid">🇪🇸 Real Madrid</option>
          <option value="Bayern Munich">🇩🇪 Bayern Munich</option>
        </select>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
          Generate Report
        </button>
      </div>

      {report && (
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '18px'
        }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
              Scouting Breakdown: {report.team}
            </h4>
            <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 700 }}>
              Estimated Win Prob: {report.winProb}%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Pressing & Build-Up</span>
              <p style={{ margin: 0, color: '#e2e8f0' }}>{report.pressingStyle}</p>
            </div>

            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: '#f87171', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Defensive Vulnerability</span>
              <p style={{ margin: 0, color: '#e2e8f0' }}>{report.weakness}</p>
            </div>

            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: '#facc15', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Key Threat Vector</span>
              <p style={{ margin: 0, color: '#e2e8f0' }}>{report.keyThreat}</p>
            </div>

            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: '#34d399', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Recommended Counter</span>
              <p style={{ margin: 0, color: '#e2e8f0' }}>{report.counterStrategy}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
