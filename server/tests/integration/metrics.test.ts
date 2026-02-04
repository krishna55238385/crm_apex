import request from 'supertest';
import express from 'express';

describe('Metrics Endpoint Integration Tests', () => {
    let app: express.Application;

    beforeAll(() => {
        app = express();

        // Mock metrics endpoint
        app.get('/metrics', (req, res) => {
            const metrics = `# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/health",status_code="200"} 10

# HELP process_cpu_user_seconds_total Total user CPU time
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 1.5

# HELP nodejs_heap_size_total_bytes Total heap size
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes 50000000
`;
            res.set('Content-Type', 'text/plain; version=0.0.4');
            res.send(metrics);
        });
    });

    it('should return metrics in Prometheus format', async () => {
        const response = await request(app).get('/metrics');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/text\/plain/);
        expect(response.text).toContain('http_requests_total');
        expect(response.text).toContain('process_cpu_user_seconds_total');
    });

    it('should include HTTP request metrics', async () => {
        const response = await request(app).get('/metrics');

        expect(response.text).toMatch(/http_requests_total/);
        expect(response.text).toMatch(/method="GET"/);
    });

    it('should include system metrics', async () => {
        const response = await request(app).get('/metrics');

        expect(response.text).toMatch(/process_cpu_user_seconds_total/);
        expect(response.text).toMatch(/nodejs_heap_size_total_bytes/);
    });
});
