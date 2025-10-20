import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],

      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('🔗 Prisma conectado exitosamente con connection pooling optimizado');

      // Configurar event listeners
      this.$on('warn' as never, (event: { message: string }) => {
        this.logger.warn(`Base de datos: ${event.message}`);
      });

      this.$on('error' as never, (event: { message: string }) => {
        this.logger.error(`Error de base de datos: ${event.message}`);
      });
    } catch (error) {
      this.logger.error('❌ Error conectando a la base de datos:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('🔌 Prisma desconectado correctamente');
    } catch (error) {
      this.logger.error('Error al desconectar Prisma:', error);
    }
  }

  // Método para health check de la base de datos
  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      await this.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Health check falló:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date(),
      };
    }
  }

  // Método para obtener estadísticas de conexión
  async getConnectionStats() {
    try {
      const stats = await this.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database();
      `;
      return stats;
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas de conexión:', error);
      return null;
    }
  }
}
