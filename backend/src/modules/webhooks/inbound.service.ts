import prisma from '../../config/database';
import { parseRawEmail, extractCustomerName, stripEmailSignature } from '../../utils/email-parser';
import { SESMessage } from '../../types';
import r2Service from '../../services/r2.service';
import { validateFileType, validateFileSize, sanitizeFilename } from '../../utils/validators';
import logger from '../../services/logger.service';
import { webhookDispatcherQueue } from '../../config/queues';

export class InboundService {
  async processInboundEmail(sesMessage: SESMessage) {
    try {
      // Decodificar conteúdo do email
      const rawEmail = Buffer.from(sesMessage.content, 'base64');

      // Parsear email
      const parsed = await parseRawEmail(rawEmail);

      logger.info('Email recebido', {
        from: parsed.from.address,
        subject: parsed.subject,
        messageId: parsed.messageId,
      });

      // Verificar se é uma resposta (tem In-Reply-To)
      let ticket;

      if (parsed.inReplyTo) {
        // Buscar ticket existente pelo message ID
        ticket = await prisma.ticket.findFirst({
          where: {
            OR: [
              { email_message_id: parsed.inReplyTo },
              {
                messages: {
                  some: {
                    message_id: parsed.inReplyTo,
                  },
                },
              },
            ],
          },
        });

        if (ticket) {
          // Reabrir ticket se estiver resolvido
          if (ticket.status === 'RESOLVED') {
            await prisma.ticket.update({
              where: { id: ticket.id },
              data: {
                status: 'REOPENED',
                last_message_at: new Date(),
                updated_at: new Date(),
              },
            });
          } else {
            await prisma.ticket.update({
              where: { id: ticket.id },
              data: {
                last_message_at: new Date(),
                updated_at: new Date(),
              },
            });
          }
        }
      }

      // Se não encontrou ticket existente, criar novo
      if (!ticket) {
        const customerName = extractCustomerName(parsed.from.address, parsed.from.name);

        ticket = await prisma.ticket.create({
          data: {
            customer_email: parsed.from.address,
            customer_name: customerName,
            subject: parsed.subject,
            status: 'NEW',
            priority: 'MEDIUM',
            email_message_id: parsed.messageId,
            email_references: parsed.references?.join(' '),
          },
        });

        logger.info('Novo ticket criado', { ticketId: ticket.id });
      }

      // Processar anexos
      const attachments = [];
      for (const att of parsed.attachments) {
        // Validar tipo e tamanho
        if (!validateFileType(att.contentType)) {
          logger.warn('Tipo de arquivo não permitido', {
            filename: att.filename,
            contentType: att.contentType,
          });
          continue;
        }

        if (!validateFileSize(att.size)) {
          logger.warn('Arquivo muito grande', {
            filename: att.filename,
            size: att.size,
          });
          continue;
        }

        // Upload para R2
        const sanitizedFilename = sanitizeFilename(att.filename);
        const { key, url } = await r2Service.uploadFile(
          att.content,
          sanitizedFilename,
          att.contentType
        );

        attachments.push({
          filename: att.filename,
          content_type: att.contentType,
          size: att.size,
          r2_key: key,
          r2_url: url,
        });
      }

      // Criar mensagem INBOUND
      const message = await prisma.message.create({
        data: {
          ticket_id: ticket.id,
          direction: 'INBOUND',
          from_email: parsed.from.address,
          from_name: parsed.from.name || null,
          to_email: parsed.to[0]?.address || '',
          subject: parsed.subject,
          body_text: parsed.text || '',
          body_html: parsed.html || null,
          stripped_text: parsed.text ? stripEmailSignature(parsed.text) : null,
          message_id: parsed.messageId,
          in_reply_to: parsed.inReplyTo || null,
          references: parsed.references?.join(' ') || null,
          has_attachments: attachments.length > 0,
          attachment_count: attachments.length,
          sent_at: parsed.date,
          delivered_at: new Date(),
          attachments: {
            create: attachments,
          },
        },
      });

      logger.info('Mensagem criada', {
        messageId: message.id,
        ticketId: ticket.id,
      });

      // Adicionar à fila BullMQ para disparar webhook externo
      const webhookEvent = parsed.inReplyTo ? 'email.received' : 'ticket.created';
      await webhookDispatcherQueue.add(webhookEvent, {
        event: webhookEvent,
        ticketId: ticket.id,
        messageId: message.id,
      });

      return { success: true, ticketId: ticket.id, messageId: message.id };
    } catch (error: any) {
      logger.error('Erro ao processar email inbound', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

export default new InboundService();
