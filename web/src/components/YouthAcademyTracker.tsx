import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, User, DollarSign, Sparkles } from 'lucide-react';

interface GrowthPoint {
  age: number;
  projected_rating: number;
  estimated_market_value_m: number;
}

interface YouthPrediction {
  player_name: string;
  current_age: number;
  current_rating: number;
  projected_peak_rating: number;
  projected_peak_value_m: number;
  trajectory: GrowthPoint[];
}

export const YouthAcademyTracker: React.FC = () => {
  const [playerName, setPlayerName] = useState('Ethan Nwaneri');
  const [age, setAge] = useState(17);
  const [rating, setRating] = useState(74);
  const [prediction, setPrediction] = useState<YouthPrediction | null>({
    player_name: 'Ethan Nwaneri',
    current_age: 17,
    current_rating: 74,
    projected_peak_rating: 88.5,
    projected_peak_value_m: 62.7,
    trajectory: [
      { age: 17, projected_rating: 77.5, estimated_market_value_m: 38.5 },
      { age: 18, projected_rating: 81.0, estimated_market_value_m: 46.2 },
      { age: 19, projected_rating: 84.5, estimated_market_value_m: 53.9 },
      { age: 20, projected_rating: 88.0, estimated_market_value_m: 61.6 },
      { age: 21, projected_rating: 89.8, estimated_market_value_m: 65.6 },
      { age: 22, projected_rating: 91.6, estimated_market_value_m: 69.5 },
      { age: 23, projected_rating: 93.4, estimated_market_value_m: 73.5 }
    ]
  });

  const fetchPrediction = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/v1/academy/predict-growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName, age, rating })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.growth_prediction) {
          setPrediction(json.growth_prediction);
        }
      }
    } catch {
      // Mock state
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [playerName, age, rating]);

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
          <Award size={22} color="#c084fc" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Youth Academy Talent Growth & Rating Trajectory Predictor
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
          TIME-SERIES FORECASTING
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Youth Player Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #475569', color: '#fff' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Current Age: {age}
          </label>
          <input
            type="range"
            min={16}
            max={20}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Current Overall Rating: {rating}
          </label>
          <input
            type="range"
            min={60}
            max={82}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {prediction && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#1e293b', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Peak Rating Projection (Age 23)</span>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: '#34d399' }}>
                {prediction.projected_peak_rating} OVR
              </strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Peak Market Value</span>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: '#38bdf8' }}>
                €{prediction.projected_peak_value_m}M
              </strong>
            </div>
          </div>

          <h4 style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '10px' }}>
            Year-by-Year Growth Trajectory Curve
          </h4>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '140px', background: '#0f172a', padding: '16px', borderRadius: '10px' }}>
            {prediction.trajectory.map((point) => (
              <div key={point.age} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.7rem', color: '#c084fc', marginBottom: '4px', fontWeight: 700 }}>
                  {point.projected_rating}
                </span>
                <div style={{
                  width: '100%',
                  height: `${(point.projected_rating - 50) * 2}%`,
                  background: 'linear-gradient(180deg, #c084fc 0%, #7e22ce 100%)',
                  borderRadius: '4px'
                }} />
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>
                  Age {point.age}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
