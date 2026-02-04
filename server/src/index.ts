import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env file
// In development (ts-node): __dirname = /server/src -> go up 2 levels to root
// In production (node): __dirname = /server/dist -> go up 2 levels to root
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Initialize Sentry FIRST (before any other imports)
import { initSentry, Sentry } from './config/sentry';
initSentry();

// import { connectDB } from './config/db'; // Removed legacy connection

import http from 'http';
import { initSocket } from './services/socketService';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;


import router from './routes/index';
// import router from './routes/apiRoutes'; // Legacy
// import apiRoutes from './routes/apiRoutes'; // Removed, now part of main router
// import webhookRoutes from './routes/webhookRoutes'; // Removed, now part of main router

// Middleware
const corsOptions = {
    origin: ['http://localhost:9002', 'http://127.0.0.1:9002', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
// app.options('*', cors(corsOptions)); // Removed: crashes Express 5, and app.use(cors()) handles preflights already

// Response compression (before other middlewares)
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6, // Compression level (0-9)
}));

// Enhanced security headers
import { securityHeaders } from './config/security';
app.use(securityHeaders);

app.use(express.json());

// Input sanitization (before other middlewares)
import { sanitizeInput, requestSizeLimiter } from './middlewares/validation';
app.use(sanitizeInput);
app.use(requestSizeLimiter(10 * 1024 * 1024)); // 10MB limit

// Sentry request handler (must be first middleware)
import { setupExpressErrorHandler } from '@sentry/node';

import { correlationMiddleware } from './middlewares/correlation';
app.use(correlationMiddleware);

import { requestLogger } from './middlewares/requestLogger';
app.use(requestLogger);

// Metrics middleware
import { metricsMiddleware } from './middlewares/metrics';
app.use(metricsMiddleware);

// Enhanced rate limiting
import { perUserLimiter } from './middlewares/rateLimiter';
app.use(perUserLimiter);

// Database Connection
// Database Connection managed by Prisma Client automatically.

// Initialize Services
import { initScheduler } from './services/scheduler';
import { backupService } from './services/backupService';
initScheduler();
backupService.scheduleBackups();

// Initialize Socket.IO
initSocket(server);

// Routes
// Routes
app.use('/api/v1', router);

// Swagger Docs
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Legacy redirect for backward compatibility (Optional)
// app.use('/api', (req, res) => res.redirect(307, '/api/v1' + req.url));

// Metrics endpoint (before error handler)
import { register } from './config/prometheus';
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Sentry error handler (must be after routes, before other error handlers)
setupExpressErrorHandler(app);

import { errorHandler } from './middlewares/errorHandler';
app.use(errorHandler);

// Base Route
app.get('/', (req, res) => {
    res.send('CRM Backend Server is Running (Modular Architecture)');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});



server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});
