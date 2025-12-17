import { FastifyRequest, FastifyReply } from 'fastify';
import authService from './auth.service';
import { JwtPayload } from '../../types';

// Declaração de tipo para o Fastify Request
declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Token de autenticação não fornecido',
      });
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Formato de token inválido',
      });
    }

    const token = parts[1];

    // Verificar token
    const decoded = await authService.verifyToken(token);

    // Adicionar informações do usuário ao request
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token inválido ou expirado',
    });
  }
}

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Autenticação necessária',
      });
    }

    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Você não tem permissão para acessar este recurso',
      });
    }
  };
}
