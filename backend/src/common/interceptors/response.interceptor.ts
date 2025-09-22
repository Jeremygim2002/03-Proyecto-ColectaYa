import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface Response<T> {
  data: T;
  message?: string;
  timestamp: string;
  path: string;
  method: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const path = request.url;

    return next.handle().pipe(
      map((data: T) => ({
        data,
        message: this.getSuccessMessage(method),
        timestamp: new Date().toISOString(),
        path,
        method,
      })),
    );
  }

  private getSuccessMessage(method: string): string {
    const messages: Record<string, string> = {
      GET: 'Datos obtenidos exitosamente',
      POST: 'Recurso creado exitosamente',
      PUT: 'Recurso actualizado exitosamente',
      PATCH: 'Recurso actualizado exitosamente',
      DELETE: 'Recurso eliminado exitosamente',
    };

    return messages[method] || 'Operación exitosa';
  }
}
