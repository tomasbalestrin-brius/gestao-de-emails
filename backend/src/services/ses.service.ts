import { SendEmailCommand, SendRawEmailCommand } from '@aws-sdk/client-ses';
import sesClient from '../config/ses';
import logger from './logger.service';

export class SESService {
  async sendEmail(params: {
    to: string;
    subject: string;
    bodyText: string;
    bodyHtml?: string;
    from?: string;
    fromName?: string;
    replyTo?: string;
    messageId?: string;
    inReplyTo?: string;
    references?: string;
  }) {
    const fromAddress = params.from || process.env.EMAIL_FROM || 'suporte@seudominio.com.br';
    const fromName = params.fromName || process.env.EMAIL_FROM_NAME || 'Suporte';
    const source = `${fromName} <${fromAddress}>`;

    try {
      const command = new SendEmailCommand({
        Source: source,
        Destination: {
          ToAddresses: [params.to],
        },
        Message: {
          Subject: {
            Data: params.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Text: {
              Data: params.bodyText,
              Charset: 'UTF-8',
            },
            Html: params.bodyHtml ? {
              Data: params.bodyHtml,
              Charset: 'UTF-8',
            } : undefined,
          },
        },
        ReplyToAddresses: params.replyTo ? [params.replyTo] : [fromAddress],
      });

      const response = await sesClient.send(command);

      logger.info('Email enviado com sucesso', {
        messageId: response.MessageId,
        to: params.to,
      });

      return {
        success: true,
        messageId: response.MessageId,
      };
    } catch (error: any) {
      logger.error('Erro ao enviar email via SES', {
        error: error.message,
        to: params.to,
      });
      throw error;
    }
  }

  async sendRawEmail(rawMessage: string) {
    try {
      const command = new SendRawEmailCommand({
        RawMessage: {
          Data: Buffer.from(rawMessage),
        },
      });

      const response = await sesClient.send(command);

      logger.info('Email RAW enviado com sucesso', {
        messageId: response.MessageId,
      });

      return {
        success: true,
        messageId: response.MessageId,
      };
    } catch (error: any) {
      logger.error('Erro ao enviar email RAW via SES', {
        error: error.message,
      });
      throw error;
    }
  }

  async testConnection() {
    try {
      // Testar enviando um email de teste para o próprio remetente
      await this.sendEmail({
        to: process.env.EMAIL_FROM || 'suporte@seudominio.com.br',
        subject: 'Teste de Conexão SES',
        bodyText: 'Este é um email de teste para verificar a conexão com o Amazon SES.',
      });

      return { success: true, message: 'Conexão com SES OK' };
    } catch (error: any) {
      logger.error('Erro ao testar conexão SES', { error: error.message });
      return { success: false, message: error.message };
    }
  }
}

export default new SESService();
