import prisma from '../../config/database';
import {
  TicketQueryDTO,
  UpdateTicketStatusDTO,
  UpdateTicketPriorityDTO,
  UpdateTicketTagsDTO,
} from './dto';

export class TicketsService {
  async getTickets(query: TicketQueryDTO) {
    const { status, priority, search, page, limit, sortBy, sortOrder } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { customer_email: { contains: search, mode: 'insensitive' } },
        { customer_name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.ticket.count({ where });

    // Get tickets
    const tickets = await prisma.ticket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        messages: {
          orderBy: { sent_at: 'desc' },
          take: 1,
          select: {
            id: true,
            direction: true,
            from_email: true,
            from_name: true,
            body_text: true,
            sent_at: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    return {
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTicketById(id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { sent_at: 'asc' },
          include: {
            attachments: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new Error('Ticket não encontrado');
    }

    return ticket;
  }

  async updateTicketStatus(id: string, data: UpdateTicketStatusDTO) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new Error('Ticket não encontrado');
    }

    const updateData: any = {
      status: data.status,
      updated_at: new Date(),
    };

    // Se o status for RESOLVED, adicionar resolved_at
    if (data.status === 'RESOLVED') {
      updateData.resolved_at = new Date();
    }

    // Se o status for REOPENED e já tinha resolved_at, remover
    if (data.status === 'REOPENED') {
      updateData.resolved_at = null;
    }

    return await prisma.ticket.update({
      where: { id },
      data: updateData,
    });
  }

  async updateTicketPriority(id: string, data: UpdateTicketPriorityDTO) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new Error('Ticket não encontrado');
    }

    return await prisma.ticket.update({
      where: { id },
      data: {
        priority: data.priority,
        updated_at: new Date(),
      },
    });
  }

  async updateTicketTags(id: string, data: UpdateTicketTagsDTO) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new Error('Ticket não encontrado');
    }

    return await prisma.ticket.update({
      where: { id },
      data: {
        tags: data.tags,
        updated_at: new Date(),
      },
    });
  }

  async getTicketStats() {
    const [total, byStatus, byPriority] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.ticket.groupBy({
        by: ['priority'],
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export default new TicketsService();
