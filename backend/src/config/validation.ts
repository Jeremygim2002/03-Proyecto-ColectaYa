import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().required().description('URL de conexión a la base de datos PostgreSQL'),
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Clave secreta para firmar tokens JWT (mínimo 32 caracteres)'),
  JWT_EXPIRES_IN: Joi.string().default('1h').description('Tiempo de expiración del token JWT'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3001').description('URL del frontend para CORS'),
  THROTTLE_TTL: Joi.number().default(60000).description('Tiempo de ventana para rate limiting (ms)'),
  THROTTLE_LIMIT: Joi.number().default(100).description('Límite de requests por ventana'),
});
