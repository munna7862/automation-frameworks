import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { createSummaryHandler } from '../utils/summary-handler.js';
import { BASE_URL, getStandardHeaders } from '../config/options.js';

// Custom metrics for granular reporting
const catalogDuration = new Trend('catalog_duration', true);
const searchDuration = new Trend('search_duration', true);
const detailDuration = new Trend('detail_duration', true);
const errorRate = new Rate('api_error_rate');

const P95_THRESHOLD = __ENV.P95_LIMIT || (__ENV.CI ? '500' : '1000');

export const options = {
  vus: parseInt(__ENV.VUS || '5', 10),
  duration: __ENV.DURATION || '5s',
  thresholds: {
    // TC-PERF-001: Catalog Browsing k6 Smoke (< 500ms p95 in CI, with local jitter tolerance)
    http_req_duration: [`p(95)<${P95_THRESHOLD}`, 'p(99)<1200'],
    catalog_duration: [`p(95)<${P95_THRESHOLD}`],
    http_req_failed: ['rate<0.02'],
    api_error_rate: ['rate<0.02']
  }
};

export default function () {
  const sessionId = `k6-smoke-vu-${__VU}`;
  const params = {
    headers: getStandardHeaders(sessionId)
  };

  // 1. Benchmark: Catalog Browsing (GET /api/books)
  const catalogRes = http.get(`${BASE_URL}/api/books`, params);
  const catalogOk = check(catalogRes, {
    'catalog status is 200': (r) => r.status === 200,
    'catalog returns items': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) ? body.length > 0 : body.books && body.books.length > 0;
      } catch {
        return false;
      }
    }
  });
  catalogDuration.add(catalogRes.timings.duration);
  errorRate.add(!catalogOk);

  sleep(0.1);

  // 2. Benchmark: Catalog Search (GET /api/books?q=gatsby)
  const searchRes = http.get(`${BASE_URL}/api/books?q=gatsby`, params);
  const searchOk = check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search returns results': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body !== null;
      } catch {
        return false;
      }
    }
  });
  searchDuration.add(searchRes.timings.duration);
  errorRate.add(!searchOk);

  sleep(0.1);

  // 3. Benchmark: Book Detail View (GET /api/books/1)
  const detailRes = http.get(`${BASE_URL}/api/books/1`, params);
  const detailOk = check(detailRes, {
    'detail status is 200': (r) => r.status === 200,
    'detail contains id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && (body.id === 1 || body.id === '1');
      } catch {
        return false;
      }
    }
  });
  detailDuration.add(detailRes.timings.duration);
  errorRate.add(!detailOk);

  sleep(0.2);
}

export const handleSummary = createSummaryHandler({
  jsonFilename: 'perf-summary-smoke.json',
  htmlFilename: 'performance/report-smoke.html',
  title: 'PR API Smoke Benchmark (5 VUs)'
});
