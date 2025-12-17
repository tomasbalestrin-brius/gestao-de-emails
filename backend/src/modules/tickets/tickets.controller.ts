import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import ticketsService from './tickets.service';
import messagesService from '../messages/messages.service';
import {
  ticketQuerySchema,
  updateTicketStatusSchema,
  updateTicketPrioritySchema,
  updateTicketTagsSchema,
  TicketQueryDTO,
  UpdateTicketStatusDTO,
  UpdateTicketPriorityDTO,
  UpdateTicketTagsDTO,
} from './dto';
import { replyToTicketSchema, ReplyToTicketDTO } from '../messages/dto';
import { authenticate } from '../auth/auth.middleware';

export default async function ticketsRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('preHandler', authenticate);

  // GET /api/tickets - Listar tickets com filtros e paginação
  fastify.get('/', async (
    request: FastifyRequest<{ Querystring: TicketQueryDTO }>,
    reply: FastifyReply
  ) => {
    try {
      const query = ticketQuerySchema.parse(request.query);
      const result = await ticketsService.getTickets(query);
      return reply.status(200).send(result);
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message || 'Erro ao buscar tickets',
      });
    }
  });

  // GET /api/tickets/stats - Estatísticas dos tickets
  fastify.get('/stats', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const stats = await ticketsService.getTicketStats();
      return reply.status(200).send(stats);
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message || 'Erro ao buscar estatísticas',
      });
    }
  });

  // GET /api/tickets/:id - Buscar ticket por ID
  fastify.get('/:id', async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const ticket = await ticketsService.getTicketById(id);
      return reply.status(200).send(ticket);
    } catch (error: any) {
      request.log.error(error);

      if (error.message === 'Ticket não encontrado') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: error.message,
        });
      }

      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message || 'Erro ao buscar ticket',
      });
    }
  });

  // PATCH /api/tickets/:id/status - Atualizar status do ticket
  fastify.patch('/:id/status', async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateTicketStatusDTO;
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const data = updateTicketStatusSchema.parse(request.body);
      const ticket = await ticketsService.updateTicketStatus(id, data);
      return reply.status(200).send(ticket);
    } catch (error: any) {
      request.log.error(error);

      if (error.message === 'Ticket não encontrado') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: error.message,
        });
      }

      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message || 'Erro ao atualizar status',
      });
    }
  });

  // PATCH /api/tickets/:id/priority - Atualizar prioridade do ticket
  fastify.patch('/:id/priority', async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateTicketPriorityDTO;
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const data = updateTicketPrioritySchema.parse(request.body);
      const ticket = await ticketsService.updateTicketPriority(id, data);
      return reply.status(200).send(ticket);
    } catch (error: any) {
      request.log.error(error);

      if (error.message === 'Ticket não encontrado') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: error.message,
        });
      }

      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message || 'Erro ao atualizar prioridade',
      });
    }
  });

  // POST /api/tickets/:id/tags - Atualizar tags do ticket
  fastify.post('/:id/tags', async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateTicketTagsDTO;
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const data = updateTicketTagsSchema.parse(request.body);
      const ticket = await ticketsService.updateTicketTags(id, data);
      return reply.status(200).send(ticket);
    } catch (error: any) {
      request.log.error(error);

      if (error.message === 'Ticket não encontrado') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: error.message,
        });
      }

      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message || 'Erro ao atualizar tags',
      });
    }
  });

  // POST /api/tickets/:id/reply - Responder ticket
  fastify.post('/:id/reply', async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: ReplyToTicketDTO;
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const data = replyToTicketSchema.parse(request.body);

      if (!request.user) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Usuário não autenticado',
        });
      }

      const message = await messagesService.replyToTicket(id, request.user.userId, data);
      return reply.status(201).send(message);
    } catch (error: any) {
      request.log.error(error);

      if (error.message === 'Ticket não encontrado') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: error.message,
        });
      }

      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message || 'Erro ao responder ticket',
      });
    }
  });
}
