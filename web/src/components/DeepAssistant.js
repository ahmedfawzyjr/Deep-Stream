import React, { useState } from 'react';

export default function DeepAssistant({ matchName = 'Argentina vs France' }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `👋 Hello! I am DeepAssistant AI. Ask me about match tactics for ${matchName}, 3D stadium telemetry, or ONNX model predictions!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5001/api/v1/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.text, match_name: matchName }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.response || 'Insight generated.' }]);
    } catch (err) {
      // Fallback response for offline / offline development mode
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `[DeepAssistant AI Sim for ${matchName}]: Analyzed query '${userMsg.text}'. Tactical pressing index is at 87% with high offensive overload in the final third.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '16px', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
        <span style={{ fontSize: '18px' }}>🤖</span>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#38bdf8' }}>DeepAssistant — GenAI Tactical Chatbot</h3>
      </div>

      <div style={{ height: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? '#0284c7' : '#1f2937',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '8px',
              maxWidth: '80%',
              fontSize: '13px'
            }}
          >
            {m.text}
          </div>
        ))}
        {loading && <div style={{ fontSize: '12px', color: '#9ca3af' }}>Thinking...</div>}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask tactical AI question..."
          style={{
            flex: 1,
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '13px'
          }}
        />
        <button
          type="submit"
          style={{
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 14px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
