import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Create a Registry to register the metrics
export const register = new Registry();

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register],
});

export const httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

export const activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    registers: [register],
});

export const databaseQueryDuration = new Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1],
    registers: [register],
});

export const jobQueueSize = new Gauge({
    name: 'job_queue_size',
    help: 'Number of jobs in the queue',
    labelNames: ['queue_name', 'status'],
    registers: [register],
});

export const redisConnectionStatus = new Gauge({
    name: 'redis_connection_status',
    help: 'Redis connection status (1 = connected, 0 = disconnected)',
    registers: [register],
});

console.log('✅ Prometheus metrics initialized');
