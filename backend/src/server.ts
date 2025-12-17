import dotenv from 'dotenv';
import { buildApp } from './app';
import logger from './services/logger.service';

// Carregar variáveis de ambiente
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({ port: PORT, host: HOST });

    logger.info(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
    logger.info(`📊 Health check disponível em http://${HOST}:${PORT}/health`);
    logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  } catch (err) {
    logger.error('❌ Erro ao iniciar servidor:', err);
    process.exit(1);
  }
}

start();
