import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { errorHandler } from './middleware/error-handler';
import { corsOptions } from './middleware/cors';
import logger from './services/logger.service';

// Importar rotas
import authRoutes from './modules/auth/auth.controller';
import ticketsRoutes from './modules/tickets/tickets.controller';
import webhookRoutes from './modules/webhooks/inbound.controller';
import healthRoutes from './modules/health/health.controller';
// import adminRoutes from './modules/admin/admin.controller';

export async function buildApp() {
  const app = Fastify({
    logger: logger,
    bodyLimit: 10485760, // 10MB
  });

  // Registrar plugins
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, corsOptions);

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Registrar rotas
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(ticketsRoutes, { prefix: '/api/tickets' });
  await app.register(webhookRoutes, { prefix: '/webhooks' });
  // await app.register(adminRoutes, { prefix: '/api/admin' });

  return app;
}

export default buildApp;
