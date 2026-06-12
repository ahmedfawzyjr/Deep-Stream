import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp-up to 100 users
    { duration: '1m', target: 1000 },  // Scale up to 1000 concurrent websocket connections / users
    { duration: '30s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(99)<20'],   // 99% of requests should be below 20ms
    http_req_failed: ['rate<0.01'],    // HTTP errors should be less than 1%
  },
};

const BASE_URL = 'http://localhost:8080/v1';
const WS_URL = 'ws://localhost:8080/v1';

export default function () {
  const matchId = `match_${Math.floor(Math.random() * 100)}`;
  
  // 1. Test Prediction API endpoint
  const predictRes = http.get(`${BASE_URL}/match/${matchId}/predict`);
  check(predictRes, {
    'prediction status is 200': (r) => r.status === 200,
    'prediction duration is fast': (r) => r.timings.duration < 20,
  });

  // 2. Test Player Form API endpoint
  const formRes = http.get(`${BASE_URL}/player/p_10/form`);
  check(formRes, {
    'player form status is 200': (r) => r.status === 200,
  });

  // 3. Test Live Match WebSocket Connection (1,000+ concurrent target)
  const url = `${WS_URL}/match/${matchId}/live`;
  const response = ws.connect(url, {}, function (socket) {
    socket.on('open', () => {
      // Keep connection open for 5 seconds to simulate user watching the match
      socket.setTimeout(() => {
        socket.close();
      }, 5000);
    });

    socket.on('message', (data) => {
      const parsed = JSON.parse(data);
      check(parsed, {
        'websocket message has match_id': (d) => d.match_id !== undefined,
        'websocket message has win probability': (d) => d.win_probability !== undefined,
      });
    });

    socket.on('close', () => {
      // Connection closed
    });

    socket.on('error', (e) => {
      console.error('WebSocket error: ', e.error());
    });
  });

  check(response, {
    'websocket handshake successful': (r) => r && r.status === 101,
  });

  sleep(1);
}
