import { Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import redisConnection from '../config/redis';
import prisma from '../config/database';
import sesService from '../services/ses.service';
import logger from '../services/logger.service';
import { webhookDispatcherQueue } from '../config/queues';

dotenv.config();

interface EmailSenderJob {
  messageId: string;
}

const worker = new Worker<EmailSenderJob>(
  'email-sender',
  async (job: Job<EmailSenderJob>) => {
    const { messageId } = job.data;

    logger.info(`Processando envio de email`, { messageId, jobId: job.id });

    try {
      // Buscar mensagem
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          ticket: true,
        },
      });

      if (!message) {
        throw new Error(`Mensagem não encontrada: ${messageId}`);
      }

      if (message.direction !== 'OUTBOUND') {
        throw new Error(`Mensagem não é OUTBOUND: ${messageId}`);
      }

      // Enviar email via SES
      const result = await sesService.sendEmail({
        to: message.to_email,
        subject: message.subject,
        bodyText: message.body_text,
        bodyHtml: message.body_html || undefined,
        messageId: message.message_id,
        inReplyTo: message.in_reply_to || undefined,
        references: message.references || undefined,
      });

      // Atualizar mensagem como entregue
      await prisma.message.update({
        where: { id: messageId },
        data: {
          delivered_at: new Date(),
        },
      });

      logger.info(`Email enviado com sucesso`, {
        messageId,
        sesMessageId: result.messageId,
      });

      // Disparar webhook externo
      await webhookDispatcherQueue.add('email.sent', {
        ticketId: message.ticket_id,
        messageId: message.id,
        event: 'email.sent',
      });

      return { success: true, sesMessageId: result.messageId };
    } catch (error: any) {
      logger.error(`Erro ao enviar email`, {
        messageId,
        error: error.message,
      });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  logger.info(`Job completed`, { jobId: job.id });
});

worker.on('failed', (job, err) => {
  logger.error(`Job failed`, {
    jobId: job?.id,
    error: err.message,
  });
});

logger.info('🚀 Email Sender Worker iniciado');

export default worker;
