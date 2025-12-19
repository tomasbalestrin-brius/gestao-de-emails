import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { buildApp } from '../../../app';
import { FastifyInstance } from 'fastify';

describe('Health Check Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return basic health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeDefined();
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed',
      });

      expect([200, 207, 503]).toContain(response.statusCode);
      const body = JSON.parse(response.body);
      expect(body.status).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.version).toBeDefined();
      expect(body.uptime).toBeDefined();
      expect(body.services).toBeDefined();
      expect(body.services.database).toBeDefined();
      expect(body.services.redis).toBeDefined();
      expect(body.services.memory).toBeDefined();
    });

    it('should include database status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed',
      });

      const body = JSON.parse(response.body);
      expect(body.services.database.status).toBeDefined();
      expect(['up', 'down']).toContain(body.services.database.status);
    });

    it('should include redis status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed',
      });

      const body = JSON.parse(response.body);
      expect(body.services.redis.status).toBeDefined();
      expect(['up', 'down']).toContain(body.services.redis.status);
    });

    it('should include memory status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed',
      });

      const body = JSON.parse(response.body);
      expect(body.services.memory.status).toBeDefined();
      expect(body.services.memory.used).toBeDefined();
      expect(body.services.memory.total).toBeDefined();
      expect(body.services.memory.percentage).toBeDefined();
      expect(typeof body.services.memory.percentage).toBe('number');
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/ready',
      });

      expect([200, 503]).toContain(response.statusCode);
      const body = JSON.parse(response.body);
      expect(body.status).toBeDefined();
    });
  });

  describe('GET /health/live', () => {
    it('should always return alive status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/live',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('alive');
    });
  });
});
