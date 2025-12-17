import { Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import axios from 'axios';
import redisConnection from '../config/redis';
import prisma from '../config/database';
import logger from '../services/logger.service';
import { WebhookEvent } from '../types';

dotenv.config();

interface WebhookDispatcherJob {
  event: string;
  ticketId: string;
  messageId?: string;
}

const worker = new Worker<WebhookDispatcherJob>(
  'webhook-dispatcher',
  async (job: Job<WebhookDispatcherJob>) => {
    const { event, ticketId, messageId } = job.data;

    logger.info(`Disparando webhook`, { event, ticketId, jobId: job.id });

    try {
      // Buscar webhooks ativos para este evento
      const webhooks = await prisma.webhookConfig.findMany({
        where: {
          is_active: true,
          events: {
            has: event,
          },
        },
      });

      if (webhooks.length === 0) {
        logger.info(`Nenhum webhook ativo para o evento`, { event });
        return { success: true, webhookCount: 0 };
      }

      // Buscar ticket com mensagem mais recente
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          messages: {
            orderBy: { sent_at: 'desc' },
            take: 1,
          },
        },
      });

      if (!ticket) {
        throw new Error(`Ticket não encontrado: ${ticketId}`);
      }

      // Montar payload
      const payload: WebhookEvent = {
        event,
        timestamp: new Date().toISOString(),
        ticket: {
          id: ticket.id,
          status: ticket.status,
          priority: ticket.priority,
          customer: {
            name: ticket.customer_name || undefined,
            email: ticket.customer_email,
          },
          subject: ticket.subject,
          latest_message: ticket.messages[0] ? {
            from: ticket.messages[0].from_email,
            body: ticket.messages[0].stripped_text || ticket.messages[0].body_text,
            date: ticket.messages[0].sent_at.toISOString(),
          } : undefined,
          tags: ticket.tags,
        },
      };

      // Disparar para todos os webhooks
      const results = await Promise.allSettled(
        webhooks.map(async (webhook) => {
          const startTime = Date.now();

          try {
            const response = await axios.post(webhook.url, payload, {
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'EmailSupport-Webhook/1.0',
                ...(webhook.headers as Record<string, string> || {}),
              },
              timeout: webhook.timeout_ms,
            });

            const duration = Date.now() - startTime;

            // Log de sucesso
            await prisma.webhookLog.create({
              data: {
                webhook_config_id: webhook.id,
                event,
                payload: payload as any,
                status_code: response.status,
                response_body: JSON.stringify(response.data).substring(0, 1000),
                duration_ms: duration,
                attempt_number: 1,
              },
            });

            logger.info(`Webhook disparado com sucesso`, {
              webhookId: webhook.id,
              statusCode: response.status,
              duration,
            });

            return { success: true, webhookId: webhook.id };
          } catch (error: any) {
            const duration = Date.now() - startTime;

            // Log de erro
            await prisma.webhookLog.create({
              data: {
                webhook_config_id: webhook.id,
                event,
                payload: payload as any,
                status_code: error.response?.status || null,
                response_body: error.response?.data
                  ? JSON.stringify(error.response.data).substring(0, 1000)
                  : null,
                error_message: error.message,
                duration_ms: duration,
                attempt_number: 1,
              },
            });

            logger.error(`Erro ao disparar webhook`, {
              webhookId: webhook.id,
              error: error.message,
            });

            throw error;
          }
        })
      );

      const successCount = results.filter((r) => r.status === 'fulfilled').length;

      return {
        success: true,
        webhookCount: webhooks.length,
        successCount,
      };
    } catch (error: any) {
      logger.error(`Erro ao processar webhooks`, {
        event,
        ticketId,
        error: error.message,
      });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

worker.on('completed', (job) => {
  logger.info(`Webhook job completed`, { jobId: job.id });
});

worker.on('failed', (job, err) => {
  logger.error(`Webhook job failed`, {
    jobId: job?.id,
    error: err.message,
  });
});

logger.info('🚀 Webhook Dispatcher Worker iniciado');

export default worker;
