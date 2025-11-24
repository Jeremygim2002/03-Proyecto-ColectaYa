import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseInterceptor, LoggingInterceptor } from './common/interceptors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: allow a whitelist of origins and respond correctly to preflight requests
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173', // ✅ Desarrollo HTTP
    'https://localhost:5173', // ✅ Desarrollo HTTPS (por si usas basicSsl)
    'https://03-proyecto-colecta-ya.vercel.app',
    'https://portafolio-backend-eryj3.ondigitalocean.app',
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (e.g. server-to-server or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // For debugging, log rejected origin and deny CORS without throwing an exception
      console.warn(`CORS: rejected origin ${origin}`);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });

  // ✅ Helmet configurado para NO interferir con CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // ✅ NUEVO
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }, // ✅ NUEVO
    }),
  );
  app.use(compression());

  // Interceptores globales ( Logging primero, Response después)
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());

  // Pipes (Validación global)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //ignora propiedades extra
      forbidNonWhitelisted: true, //lanza error de whitelist
      transform: true, //convierte tipos de datos autmatucaemente
    }),
  );

  // Filtros globales para manejo de errores
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Swagger
  const config = new DocumentBuilder().setTitle('ColectaYa API').setVersion('1.0').addBearerAuth().build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);

  // ✅ Log para debug
  console.log(`🚀 Backend running on: ${await app.getUrl()}`);
  console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
}

void bootstrap();
