import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Activity, Sparkles } from 'lucide-react';

interface StockItem {
  symbol: string;
  name: string;
  base_price_m: number;
  current_price_m: number;
  delta_pct: number;
  trend: string;
  in_match_events: string;
}

export const PlayerStockMarket: React.FC = () => {
  const [stocks, setStocks] = useState<StockItem[]>([
    { symbol: '$MESSI', name: 'Lionel Messi', base_price_m: 45.0, current_price_m: 48.5, delta_pct: 7.8, trend: 'BULLISH 📈', in_match_events: '1 Goal, 1 Assist' },
    { symbol: '$MBAPPE', name: 'Kylian Mbappé', base_price_m: 180.0, current_price_m: 184.2, delta_pct: 2.3, trend: 'BULLISH 📈', in_match_events: '1 Goal' },
    { symbol: '$SAKA', name: 'Bukayo Saka', base_price_m: 130.0, current_price_m: 133.5, delta_pct: 2.7, trend: 'BULLISH 📈', in_match_events: '4 Key Passes' },
    { symbol: '$WIRTZ', name: 'Florian Wirtz', base_price_m: 110.0, current_price_m: 114.8, delta_pct: 4.4, trend: 'BULLISH 📈', in_match_events: '2 Assists' },
    { symbol: '$RODRI', name: 'Rodri', base_price_m: 120.0, current_price_m: 121.5, delta_pct: 1.25, trend: 'STABLE 🟢', in_match_events: '96% Pass Acc' },
  ]);

  const fetchStocks = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/v1/finance/player-stocks');
      if (res.ok) {
        const json = await res.json();
        if (json.stock_ticker) {
          setStocks(json.stock_ticker);
        }
      }
    } catch {
      // Mock state
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

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
          <DollarSign size={22} color="#facc15" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Real-Time Player Stock Market & Dynamic Valuation Index
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
          LIVE FINANCIAL INDEX
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {stocks.map((item) => (
          <div
            key={item.symbol}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '1rem', color: '#facc15' }}>{item.symbol}</strong>
                <span style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{item.name}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Live Drivers: {item.in_match_events}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <strong style={{ fontSize: '1.1rem', color: '#4ade80' }}>
                €{item.current_price_m}M
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                <TrendingUp size={12} /> +{item.delta_pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
