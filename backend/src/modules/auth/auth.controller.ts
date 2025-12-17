import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import authService from './auth.service';
import { loginSchema, registerSchema, LoginDTO, RegisterDTO } from './dto';
import { authenticate } from './auth.middleware';

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/login
  fastify.post('/login', async (
    request: FastifyRequest<{ Body: LoginDTO }>,
    reply: FastifyReply
  ) => {
    try {
      // Validar dados
      const data = loginSchema.parse(request.body);

      // Fazer login
      const result = await authService.login(data);

      return reply.status(200).send(result);
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message || 'Erro ao fazer login',
      });
    }
  });

  // POST /auth/register
  fastify.post('/register', async (
    request: FastifyRequest<{ Body: RegisterDTO }>,
    reply: FastifyReply
  ) => {
    try {
      // Validar dados
      const data = registerSchema.parse(request.body);

      // Registrar usuário
      const result = await authService.register(data);

      return reply.status(201).send(result);
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message || 'Erro ao registrar usuário',
      });
    }
  });

  // GET /auth/me (protegida)
  fastify.get('/me', {
    preHandler: [authenticate],
  }, async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      if (!request.user) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Usuário não autenticado',
        });
      }

      const user = await authService.getCurrentUser(request.user.userId);

      return reply.status(200).send(user);
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message || 'Erro ao buscar usuário',
      });
    }
  });
}
