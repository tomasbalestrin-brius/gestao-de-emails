import { FastifyRequest } from 'fastify';

export const corsOptions = {
  origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
    ];

    // Permitir requests sem origin (Postman, curl, etc)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
