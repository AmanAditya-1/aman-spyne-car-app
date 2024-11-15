import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Management API',
      version: '1.0.0',
      description: 'API documentation for the Car Management application',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Car Management API server',
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

export const specs = swaggerJsdoc(options);