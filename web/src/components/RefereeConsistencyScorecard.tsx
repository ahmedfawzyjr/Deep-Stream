import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, XCircle, ShieldAlert, Award, FileText } from 'lucide-react';

interface DecisionLog {
  minute: number;
  type: string;
  correct: boolean;
  ifab_rule: string;
  var_review: boolean;
}

interface RefereeEval {
  referee_name: string;
  overall_accuracy_pct: number;
  var_consistency_pct: number;
  bias_index: string;
  total_decisions: number;
  correct_decisions: number;
  decision_log: DecisionLog[];
}

export const RefereeConsistencyScorecard: React.FC = () => {
  const [refereeName, setRefereeName] = useState('Szymon Marciniak');
  const [evalData, setEvalData] = useState<RefereeEval | null>({
    referee_name: 'Szymon Marciniak',
    overall_accuracy_pct: 94.2,
    var_consistency_pct: 96.5,
    bias_index: 'NEUTRAL (0.02 delta)',
    total_decisions: 5,
    correct_decisions: 4,
    decision_log: [
      { minute: 23, type: 'Penalty Kick', correct: true, ifab_rule: 'Rule 12 - Foul inside penalty box', var_review: false },
      { minute: 45, type: 'Yellow Card', correct: true, ifab_rule: 'Rule 12 - Reckless tackle', var_review: false },
      { minute: 64, type: 'VAR Penalty Overturn', correct: true, ifab_rule: 'Rule 12 - No ball contact', var_review: true },
      { minute: 81, type: 'Offside Call', correct: true, ifab_rule: 'Rule 11 - Millimeter offside', var_review: true },
      { minute: 88, type: 'Yellow Card', correct: false, ifab_rule: 'Rule 12 - Simulated dive', var_review: false },
    ]
  });

  const fetchEval = async (refName: string) => {
    try {
      const res = await fetch('http://localhost:5001/api/v1/referee/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referee_name: refName })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.referee_evaluation) {
          setEvalData(json.referee_evaluation);
        }
      }
    } catch {
      // Mock state
    }
  };

  useEffect(() => {
    fetchEval(refereeName);
  }, [refereeName]);

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(234, 179, 8, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scale size={22} color="#facc15" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            AI Referee Decision Consistency & Bias Scorecard
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(234, 179, 8, 0.2)',
          color: '#facc15',
          fontWeight: 600
        }}>
          IFAB RULE EVALUATOR
        </span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
          Select Referee Profile
        </label>
        <select
          value={refereeName}
          onChange={(e) => setRefereeName(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            background: '#1e293b',
            border: '1px solid #475569',
            color: '#fff',
            fontSize: '0.9rem'
          }}
        >
          <option value="Szymon Marciniak">🇵🇱 Szymon Marciniak (UEFA Elite)</option>
          <option value="Anthony Taylor">🇬🇧 Anthony Taylor (Premier League)</option>
          <option value="Daniele Orsato">🇮🇹 Daniele Orsato (Serie A)</option>
          <option value="Clement Turpin">🇫🇷 Clément Turpin (Ligue 1)</option>
        </select>
      </div>

      {evalData && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Decision Accuracy</span>
              <strong style={{ fontSize: '1.3rem', color: '#34d399' }}>{evalData.overall_accuracy_pct}%</strong>
            </div>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>VAR Consistency</span>
              <strong style={{ fontSize: '1.3rem', color: '#38bdf8' }}>{evalData.var_consistency_pct}%</strong>
            </div>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Team Bias Index</span>
              <strong style={{ fontSize: '1rem', color: '#facc15' }}>{evalData.bias_index}</strong>
            </div>
          </div>

          <h4 style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '10px' }}>
            Match Decision Audit Log
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {evalData.decision_log.map((log, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#1e293b',
                  border: '1px solid ' + (log.correct ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.4)'),
                  padding: '10px 14px',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {log.correct ? <CheckCircle2 size={18} color="#4ade80" /> : <XCircle size={18} color="#ef4444" />}
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#f8fafc', display: 'block' }}>
                      {log.minute}' - {log.type} {log.var_review && '🖥️ (VAR Confirmed)'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {log.ifab_rule}
                    </span>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: log.correct ? '#4ade80' : '#f87171'
                }}>
                  {log.correct ? 'CORRECT CALL' : 'ERRONEOUS CALL'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
