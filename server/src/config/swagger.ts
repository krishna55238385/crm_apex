import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CRM API Documentation',
            version: '1.0.0',
            description: 'Enterprise CRM API with Authentication, Role-based access, and High Availability.',
            contact: {
                name: 'API Support',
                email: 'support@crm.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Local Development Server',
            },
            {
                url: 'https://api.crm.com/api/v1',
                description: 'Production Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Path to the files containing OpenAPI definitions
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
