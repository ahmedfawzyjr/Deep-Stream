import http from 'k6/http';
use_import_path_placeholder::ignore;
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<200'], // 99% of requests must complete below 200ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4ODEzNjI4OTl9.U4kxsO4tFOzWfd9HlsYd-ujEaH6RqAUuFbrTfLmnyps';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
  };

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JWT_TOKEN}`,
  };

  // 1. GET /v1/matches
  const resMatches = http.get(`${BASE_URL}/v1/matches`, { headers });
  check(resMatches, {
    'get matches status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // Parse matches list and pick first match ID if available
  let matchId = '123e4567-e89b-12d3-a456-426614174000'; // Fallback
  try {
    const matches = JSON.parse(resMatches.body);
    if (Array.isArray(matches) && matches.length > 0) {
      matchId = matches[0].id;
    }
  } catch (e) {
    // Ignore JSON parse error if body is empty or malformed during initial loads
  }

  // 2. POST /v1/matches/{id}/predict
  const resPredict = http.post(`${BASE_URL}/v1/matches/${matchId}/predict`, '{}', { headers: authHeaders });
  check(resPredict, {
    'predict match status is 201': (r) => r.status === 201 || r.status === 200,
  });

  sleep(1);
}
