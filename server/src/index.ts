import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

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
app.use(helmet());
app.use(express.json());

import { correlationMiddleware } from './middlewares/correlation';
app.use(correlationMiddleware);

import { requestLogger } from './middlewares/requestLogger';
app.use(requestLogger);

import { limiter } from './middlewares/rateLimiter';
app.use(limiter);

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
