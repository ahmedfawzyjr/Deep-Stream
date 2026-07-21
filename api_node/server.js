const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory NoSQL cache simulation (Redis / MongoDB fallback)
const telemetryCache = new Map();

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'api_node_express',
        uptime: process.uptime()
    });
});

app.get('/api/telemetry/live', (req, res) => {
    if (telemetryCache.has('latest')) {
        return res.json(telemetryCache.get('latest'));
    }

    const payload = {
        timestamp: Date.now(),
        match_id: "wc2026-final",
        pitch_pos: { ball: [12.4, 0.5, -4.2], stamina_avg: 88.5 },
        nosql_cache: "HIT_SIMULATED"
    };
    telemetryCache.set('latest', payload);
    res.json(payload);
});

app.post('/api/telemetry/ingest', (req, res) => {
    const data = req.body;
    telemetryCache.set('latest', { ...data, timestamp: Date.now() });
    res.status(201).json({ status: 'ingested', records: 1 });
});

app.listen(PORT, () => {
    console.log(`⚡ Express Gateway running on port ${PORT}`);
});
