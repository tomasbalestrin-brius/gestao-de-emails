import { Queue } from 'bullmq';
import redisConnection from './redis';

// Fila para envio de emails
export const emailSenderQueue = new Queue('email-sender', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // 24 horas
    },
    removeOnFail: {
      count: 1000,
    },
  },
});

// Fila para processamento de emails recebidos
export const emailProcessorQueue = new Queue('email-processor', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Fila para disparar webhooks externos
export const webhookDispatcherQueue = new Queue('webhook-dispatcher', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});
