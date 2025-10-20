import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().required().description('URL de conexión a la base de datos PostgreSQL'),

  // Variables de Supabase
  SUPABASE_URL: Joi.string().uri().required().description('URL del proyecto Supabase'),
  SUPABASE_ANON_KEY: Joi.string().required().description('Clave anónima de Supabase'),
  SUPABASE_SERVICE_KEY: Joi.string().optional().description('Clave de servicio de Supabase (opcional)'),

  // Variables de la aplicación
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173').description('URL del frontend para CORS'),
  THROTTLE_TTL: Joi.number().default(60000).description('Tiempo de ventana para rate limiting (ms)'),
  THROTTLE_LIMIT: Joi.number().default(20).description('Límite de requests por ventana'),
});
