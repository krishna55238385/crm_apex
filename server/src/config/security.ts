import helmet from 'helmet';

// Enhanced security headers configuration
export const securityHeaders = helmet({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Adjust based on your needs
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },

    // HTTP Strict Transport Security
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },

    // X-Frame-Options
    frameguard: {
        action: 'deny',
    },

    // X-Content-Type-Options
    noSniff: true,

    // X-XSS-Protection
    xssFilter: true,

    // Referrer-Policy
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
    },

    // Permissions-Policy (formerly Feature-Policy)
    permittedCrossDomainPolicies: {
        permittedPolicies: 'none',
    },

    // Hide X-Powered-By header
    hidePoweredBy: true,

    // DNS Prefetch Control
    dnsPrefetchControl: {
        allow: false,
    },

    // IE No Open
    ieNoOpen: true,

    // Cross-Origin-Embedder-Policy
    crossOriginEmbedderPolicy: false, // Set to true if needed

    // Cross-Origin-Opener-Policy
    crossOriginOpenerPolicy: {
        policy: 'same-origin',
    },

    // Cross-Origin-Resource-Policy
    crossOriginResourcePolicy: {
        policy: 'same-origin',
    },

    // Origin-Agent-Cluster
    originAgentCluster: true,
});

console.log('✅ Enhanced security headers configured');
