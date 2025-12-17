import pino from 'pino';

export const logger = pino({
  transport: process.env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  level: process.env.LOG_LEVEL || 'info',
});

export default logger;
