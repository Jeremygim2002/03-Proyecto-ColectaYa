import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorMap: Record<string, { status: number; message: string }> = {
      P2002: {
        status: HttpStatus.CONFLICT,
        message: 'Ya existe un registro con estos datos únicos',
      },
      P2025: {
        status: HttpStatus.NOT_FOUND,
        message: 'Registro no encontrado',
      },
      P2003: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Violación de restricción de clave foránea',
      },
      P2014: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Los datos proporcionados violan una restricción',
      },
    };

    const error = errorMap[exception.code] || {
      status: HttpStatus.BAD_REQUEST,
      message: 'Error de base de datos',
    };

    response.status(error.status).json({
      statusCode: error.status,
      message: error.message,
      error: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}
