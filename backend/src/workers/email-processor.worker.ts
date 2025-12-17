import { Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import redisConnection from '../config/redis';
import logger from '../services/logger.service';

dotenv.config();

/**
 * Worker para processar emails recebidos
 *
 * Nota: O processamento principal de emails está sendo feito
 * diretamente no inbound.service.ts quando o webhook é recebido.
 *
 * Este worker pode ser usado para:
 * - Reprocessamento de emails em caso de falha
 * - Processamento assíncrono de emails muito grandes
 * - Análise adicional de conteúdo (spam, categorização, etc)
 */

interface EmailProcessorJob {
  sesMessageId: string;
  rawEmail?: string;
}

const worker = new Worker<EmailProcessorJob>(
  'email-processor',
  async (job: Job<EmailProcessorJob>) => {
    const { sesMessageId } = job.data;

    logger.info(`Processando email`, { sesMessageId, jobId: job.id });

    try {
      // Implementar lógica adicional se necessário
      // Por exemplo: análise de spam, categorização automática, etc.

      return { success: true };
    } catch (error: any) {
      logger.error(`Erro ao processar email`, {
        sesMessageId,
        error: error.message,
      });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);

worker.on('completed', (job) => {
  logger.info(`Email processor job completed`, { jobId: job.id });
});

worker.on('failed', (job, err) => {
  logger.error(`Email processor job failed`, {
    jobId: job?.id,
    error: err.message,
  });
});

logger.info('🚀 Email Processor Worker iniciado');

export default worker;
