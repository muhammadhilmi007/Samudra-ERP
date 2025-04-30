/**
 * Samudra Paket ERP - Application Configuration
 * Central configuration for the application
 */

const config = {
  app: {
    name: 'Samudra Paket ERP',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    apiPrefix: '/api',
  },

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/samudra-paket',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    accessExpiresIn: '1h',
    refreshExpiresIn: '7d',
  },

  email: {
    from: process.env.EMAIL_FROM || 'noreply@samudrapaket.com',
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  },

  security: {
    bcryptSaltRounds: 10,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 minutes in milliseconds
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },
};

module.exports = config;
