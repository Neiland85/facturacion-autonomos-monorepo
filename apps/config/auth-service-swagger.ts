import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API - TributariApp',
      version: '1.0.0',
      description: 'API de autenticación y autorización para autónomos - Sistema TributariApp',
      contact: {
        name: 'TributariApp Support',
        email: 'support@tributariapp.com'
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
      }
    },
    servers: [
      {
        url: 'http://localhost:3003',
        description: 'Development server',
      },
      {
        url: 'https://auth.tributariapp.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'JWT token almacenado en cookie httpOnly'
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token en header Authorization'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            name: {
              type: 'string',
              description: 'Nombre completo del usuario'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user',
              description: 'Rol del usuario en el sistema'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Estado de activación de la cuenta'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la cuenta'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          },
          required: ['id', 'email', 'name']
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Contraseña del usuario'
            },
            remember: {
              type: 'boolean',
              default: false,
              description: 'Recordar sesión por 30 días'
            }
          },
          required: ['email', 'password']
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Contraseña (mínimo 8 caracteres)'
            },
            name: {
              type: 'string',
              minLength: 2,
              description: 'Nombre completo del usuario'
            },
            acceptTerms: {
              type: 'boolean',
              default: true,
              description: 'Aceptación de términos y condiciones'
            }
          },
          required: ['email', 'password', 'name']
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa'
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo de la respuesta'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta (opcional)'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp de la respuesta'
            }
          },
          required: ['success', 'message', 'timestamp']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mensaje de error descriptivo'
            },
            error: {
              type: 'string',
              description: 'Código de error'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['success', 'message', 'error', 'timestamp']
        }
      }
    },
    security: [{
      cookieAuth: []
    }],
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación y registro'
      },
      {
        name: 'Users',
        description: 'Gestión de usuarios'
      },
      {
        name: 'Health',
        description: 'Verificación de estado del servicio'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/routes/*.js',
    './src/controllers/*.ts',
    './src/controllers/*.js'
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: any) => {
  // Swagger UI options
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'arta'
      },
      tryItOutEnabled: true,
      requestInterceptor: (req: any) => {
        // Add any custom request interceptors here
        return req;
      },
      responseInterceptor: (res: any) => {
        // Add any custom response interceptors here
        return res;
      }
    }
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

  app.get('/swagger.json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  // Health endpoint for API docs
  app.get('/api/health', (req: any, res: any) => {
    res.json({
      success: true,
      message: 'Auth Service is running',
      service: 'auth-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      docs: {
        swagger: '/api-docs',
        json: '/swagger.json'
      }
    });
  });
};
