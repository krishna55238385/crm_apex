import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
    stages: [
        { duration: '30s', target: 10 },  // Ramp up to 10 users
        { duration: '1m', target: 10 },   // Stay at 10 users
        { duration: '30s', target: 50 },  // Ramp up to 50 users
        { duration: '2m', target: 50 },   // Stay at 50 users
        { duration: '30s', target: 0 },   // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
        http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
        errors: ['rate<0.01'],
    },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    // Test 1: Health endpoint
    let healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, {
        'health status is 200': (r) => r.status === 200,
        'health response is OK': (r) => r.json('status') === 'OK',
    }) || errorRate.add(1);

    sleep(1);

    // Test 2: Metrics endpoint
    let metricsRes = http.get(`${BASE_URL}/metrics`);
    check(metricsRes, {
        'metrics status is 200': (r) => r.status === 200,
        'metrics has content': (r) => r.body.length > 0,
    }) || errorRate.add(1);

    sleep(1);

    // Test 3: API docs
    let docsRes = http.get(`${BASE_URL}/api-docs`);
    check(docsRes, {
        'docs status is 200 or 301': (r) => r.status === 200 || r.status === 301,
    }) || errorRate.add(1);

    sleep(2);
}

// Lifecycle hooks
export function setup() {
    console.log('Starting load test...');
    console.log(`Target: ${BASE_URL}`);
}

export function teardown(data) {
    console.log('Load test completed!');
}
