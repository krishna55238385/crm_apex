import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export const initSentry = () => {
    if (!process.env.SENTRY_DSN) {
        console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',

        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Profiling
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
            nodeProfilingIntegration(),
        ],

        // Release tracking
        release: process.env.npm_package_version,

        // Filter sensitive data
        beforeSend(event: Sentry.ErrorEvent) {
            // Remove sensitive headers
            if (event.request?.headers) {
                delete event.request.headers['authorization'];
                delete event.request.headers['cookie'];
            }
            return event;
        },
    });

    console.log('✅ Sentry initialized for error tracking');
};

export { Sentry };
