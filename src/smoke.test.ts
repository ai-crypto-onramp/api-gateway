import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { buildServer } from './index.js';
import { loadConfig } from './config.js';
import type { FastifyInstance } from 'fastify';

const validEnv = {
  IDENTITY_AUTH_URL: 'http://identity-auth.internal:8080',
  KYC_URL: 'http://onboarding-kyc.internal:8080',
  PRICING_URL: 'http://pricing-quote.internal:8080',
  ORCHESTRATOR_URL: 'http://transaction-orchestrator.internal:8080',
  RATE_LIMIT_REDIS_URL: 'redis://rate-limit.internal:6379',
  JWT_ISSUER: 'https://auth.example.com',
  JWKS_URL: 'https://auth.example.com/.well-known/jwks.json',
  JWT_AUDIENCE: 'onramp-sdk',
  OTEL_EXPORTER_OTLP_ENDPOINT: 'http://otel-collector.internal:4318',
  WEBHOOK_SIGNING_SECRET: 'test-secret',
};

describe('smoke (supertest)', () => {
  let app: FastifyInstance;
  let url: string;

  beforeAll(async () => {
    app = buildServer(loadConfig(validEnv));
    await app.ready();
    const address = await app.listen({ port: 0, host: '127.0.0.1' });
    url = `http://127.0.0.1:${address.replace(/.*:(\d+).*/, '$1')}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /healthz -> 200', async () => {
    const res = await request(url).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /readyz -> 200', async () => {
    const res = await request(url).get('/readyz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ready' });
  });
});
