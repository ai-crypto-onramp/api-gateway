import { describe, it, expect, afterEach } from 'vitest';
import { buildServer } from './index.js';
import { loadConfig } from './config.js';

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

const config = loadConfig(validEnv);

describe('/healthz', () => {
  const app = buildServer(config);

  afterEach(async () => {
    await app.close();
  });

  it('returns status ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });
});

describe('/readyz', () => {
  const app = buildServer(config);

  afterEach(async () => {
    await app.close();
  });

  it('returns status ready', async () => {
    const res = await app.inject({ method: 'GET', url: '/readyz' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ready' });
  });
});
