import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import logger from '../../services/logger.service';

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    memory: MemoryStatus;
  };
}

interface ServiceStatus {
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}

interface MemoryStatus {
  status: 'up' | 'down';
  used: string;
  total: string;
  percentage: number;
}

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'up',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await redis.ping();
    return {
      status: 'up',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function checkMemory(): MemoryStatus {
  const used = process.memoryUsage();
  const total = used.heapTotal;
  const usedHeap = used.heapUsed;
  const percentage = (usedHeap / total) * 100;

  return {
    status: percentage < 90 ? 'up' : 'down',
    used: `${Math.round(usedHeap / 1024 / 1024)}MB`,
    total: `${Math.round(total / 1024 / 1024)}MB`,
    percentage: Math.round(percentage),
  };
}

export default async function healthRoutes(app: FastifyInstance) {
  // Health check básico (rápido)
  app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  });

  // Health check detalhado
  app.get('/health/detailed', async (request: FastifyRequest, reply: FastifyReply) => {
    const [database, redisCheck, memory] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      Promise.resolve(checkMemory()),
    ]);

    const allServicesUp = database.status === 'up' && redisCheck.status === 'up' && memory.status === 'up';
    const someServicesDown = database.status === 'down' || redisCheck.status === 'down' || memory.status === 'down';

    const response: HealthCheckResponse = {
      status: allServicesUp ? 'healthy' : someServicesDown ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor(process.uptime()),
      services: {
        database,
        redis: redisCheck,
        memory,
      },
    };

    // Retornar status HTTP apropriado
    const statusCode = response.status === 'healthy' ? 200 : response.status === 'degraded' ? 207 : 503;
    return reply.code(statusCode).send(response);
  });

  // Readiness probe (para Kubernetes)
  app.get('/health/ready', async (request: FastifyRequest, reply: FastifyReply) => {
    const [database, redisCheck] = await Promise.all([
      checkDatabase(),
      checkRedis(),
    ]);

    const ready = database.status === 'up' && redisCheck.status === 'up';

    if (ready) {
      return reply.code(200).send({ status: 'ready' });
    } else {
      return reply.code(503).send({
        status: 'not ready',
        database: database.status,
        redis: redisCheck.status,
      });
    }
  });

  // Liveness probe (para Kubernetes)
  app.get('/health/live', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.code(200).send({ status: 'alive' });
  });
}
