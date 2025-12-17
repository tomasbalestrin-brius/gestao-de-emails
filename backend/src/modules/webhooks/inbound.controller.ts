import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import inboundService from './inbound.service';
import { snsNotificationSchema, SNSNotification } from './validators';
import { validateSNSMessage, confirmSNSSubscription } from '../../utils/validators';
import { SESMessage } from '../../types';
import logger from '../../services/logger.service';

export default async function webhookRoutes(fastify: FastifyInstance) {
  // POST /webhooks/inbound-email - Receber notificação SNS do SES
  fastify.post('/inbound-email', async (
    request: FastifyRequest<{ Body: SNSNotification }>,
    reply: FastifyReply
  ) => {
    try {
      logger.info('Webhook inbound recebido', {
        headers: request.headers,
        bodyType: typeof request.body,
      });

      // Validar estrutura SNS
      const notification = snsNotificationSchema.parse(request.body);

      // Validar assinatura SNS
      const isValid = await validateSNSMessage(notification);
      if (!isValid) {
        logger.warn('Mensagem SNS inválida');
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Mensagem SNS inválida',
        });
      }

      // Se for confirmação de subscrição, confirmar
      if (notification.Type === 'SubscriptionConfirmation') {
        if (notification.SubscribeURL) {
          const confirmed = await confirmSNSSubscription(notification.SubscribeURL);
          if (confirmed) {
            logger.info('Subscrição SNS confirmada');
            return reply.status(200).send({ message: 'Subscription confirmed' });
          } else {
            logger.error('Erro ao confirmar subscrição SNS');
            return reply.status(500).send({
              statusCode: 500,
              error: 'Internal Server Error',
              message: 'Erro ao confirmar subscrição',
            });
          }
        }
      }

      // Se for notificação, processar email
      if (notification.Type === 'Notification') {
        // Parsear mensagem SES
        const sesMessage: SESMessage = JSON.parse(notification.Message);

        // Processar email
        const result = await inboundService.processInboundEmail(sesMessage);

        return reply.status(200).send({
          success: true,
          ticketId: result.ticketId,
          messageId: result.messageId,
        });
      }

      return reply.status(200).send({ message: 'OK' });
    } catch (error: any) {
      logger.error('Erro ao processar webhook inbound', {
        error: error.message,
        stack: error.stack,
      });

      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erro ao processar webhook',
      });
    }
  });

  // Health check para testar o webhook
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'webhooks' };
  });
}
