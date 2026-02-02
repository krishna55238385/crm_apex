import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json() // Enterprise standard: Always JSON for machine parsing
    ),
    defaultMeta: { service: 'crm-server' },
    transports: [
        // 1. Console - Pretty print for Dev
        new winston.transports.Console({
            format: isProduction
                ? winston.format.json()
                : winston.format.combine(
                    winston.format.colorize(),
                    winston.format.printf(({ level, message, timestamp, stack, correlationId }) => {
                        const cid = correlationId ? `[${correlationId}] ` : '';
                        return `${timestamp} ${level}: ${cid}${stack || message}`;
                    })
                ),
        }),
        // 2. File - Error Logs
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // 3. File - All Logs
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

export default logger;
