/**
 * BuggyBooks k6 Virtual User Topologies & Global Configuration
 *
 * Defines staged VU ramp-up profiles, SLAs, and response time thresholds
 * for smoke, average load, stress, spike, and soak testing.
 */

// Target backend URL: defaults to Render staging unless overridden by BASE_URL
export const BASE_URL = __ENV.BASE_URL || 'https://buggy-books.onrender.com';

/**
 * Reusable Virtual User Topologies
 */
export const topologies = {
  // Fast PR Smoke Gate (< 60s feedback, 5 VUs)
  smoke: {
    vus: parseInt(__ENV.VUS || '5', 10),
    duration: __ENV.DURATION || '10s',
    thresholds: {
      http_req_duration: ['p(95)<500', 'p(99)<1000'],
      catalog_duration: ['p(95)<500'],
      http_req_failed: ['rate<0.02']
    }
  },

  // Standard Average Load Benchmark (20 VUs)
  average: {
    stages: [
      { duration: '5s', target: 20 },
      { duration: '10s', target: 20 },
      { duration: '5s', target: 0 }
    ],
    thresholds: {
      http_req_duration: ['p(95)<800', 'p(99)<1500'],
      http_req_failed: ['rate<0.02']
    }
  },

  // Saturation & Concurrency Stress (50 VUs)
  stress: {
    stages: [
      { duration: '5s', target: 20 },
      { duration: '10s', target: 50 },
      { duration: '10s', target: 50 },
      { duration: '5s', target: 0 }
    ],
    thresholds: {
      http_req_duration: ['p(95)<1200', 'p(99)<2500'],
      http_req_failed: ['rate<0.05']
    }
  },

  // Sudden Traffic Surge Spike Profile (80 VUs)
  spike: {
    stages: [
      { duration: '2s', target: 10 },
      { duration: '3s', target: 80 },
      { duration: '5s', target: 80 },
      { duration: '5s', target: 0 }
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000'],
      http_req_failed: ['rate<0.05']
    }
  },

  // Endurance & Memory Soak Profile (Steady 15 VUs)
  soak: {
    stages: [
      { duration: '5s', target: 15 },
      { duration: '30s', target: 15 },
      { duration: '5s', target: 0 }
    ],
    thresholds: {
      http_req_duration: ['p(95)<1000'],
      http_req_failed: ['rate<0.02']
    }
  }
};

/**
 * Standard HTTP Request Headers
 *
 * @param {string} sessionId Unique test session identifier for isolation
 * @param {boolean} bypassChaos Whether to bypass artificial chaos rate-limits and delays
 * @returns {Object} Request headers object
 */
export function getStandardHeaders(sessionId = 'k6-perf-vu', bypassChaos = true) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-test-session-id': sessionId
  };

  if (bypassChaos) {
    headers['x-bypass-rate-limit'] = 'true';
    headers['x-bypass-csrf'] = 'true';
  }

  return headers;
}
