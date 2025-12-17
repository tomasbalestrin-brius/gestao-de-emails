import prisma from '../../config/database';
import { ReplyToTicketDTO } from './dto';
import { randomUUID } from 'crypto';

export class MessagesService {
  async replyToTicket(ticketId: string, userId: string, data: ReplyToTicketDTO) {
    // Buscar ticket
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
      throw new Error('Ticket não encontrado');
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Gerar message ID único
    const messageId = `<${randomUUID()}@${process.env.EMAIL_DOMAIN}>`;

    // Pegar a última mensagem para o In-Reply-To
    const lastMessage = ticket.messages[0];
    const inReplyTo = lastMessage?.message_id || ticket.email_message_id;

    // Criar mensagem OUTBOUND (pendente de envio)
    const message = await prisma.message.create({
      data: {
        ticket_id: ticketId,
        direction: 'OUTBOUND',
        from_email: process.env.EMAIL_FROM || 'suporte@seudominio.com.br',
        from_name: user.name,
        to_email: ticket.customer_email,
        subject: `Re: ${ticket.subject}`,
        body_text: data.body_text,
        body_html: data.body_html,
        message_id: messageId,
        in_reply_to: inReplyTo,
        references: ticket.email_references
          ? `${ticket.email_references} ${inReplyTo}`
          : inReplyTo,
        sent_at: new Date(),
      },
    });

    // Atualizar ticket
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'WAITING',
        last_message_at: new Date(),
        updated_at: new Date(),
      },
    });

    // TODO: Adicionar à fila BullMQ para envio via SES
    // await emailQueue.add('send-email', { messageId: message.id });

    return message;
  }

  async getMessagesByTicketId(ticketId: string) {
    return await prisma.message.findMany({
      where: { ticket_id: ticketId },
      orderBy: { sent_at: 'asc' },
      include: {
        attachments: true,
      },
    });
  }
}

export default new MessagesService();
