import { describe, it, expect } from 'vitest';
import { loadConfig, ConfigError, DEFAULT_CONFIG_VALUES } from './config.js';

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

describe('loadConfig', () => {
  it('applies README defaults for optional vars', () => {
    const cfg = loadConfig(validEnv);
    expect(cfg.PORT).toBe(DEFAULT_CONFIG_VALUES.PORT);
    expect(cfg.LOG_LEVEL).toBe(DEFAULT_CONFIG_VALUES.LOG_LEVEL);
    expect(cfg.NODE_ENV).toBe(DEFAULT_CONFIG_VALUES.NODE_ENV);
    expect(cfg.RATE_LIMIT_RPS).toBe(DEFAULT_CONFIG_VALUES.RATE_LIMIT_RPS);
    expect(cfg.RATE_LIMIT_BURST).toBe(DEFAULT_CONFIG_VALUES.RATE_LIMIT_BURST);
    expect(cfg.PARTNER_API_KEY_HEADER).toBe(
      DEFAULT_CONFIG_VALUES.PARTNER_API_KEY_HEADER,
    );
    expect(cfg.DOWNSTREAM_TIMEOUT_MS).toBe(
      DEFAULT_CONFIG_VALUES.DOWNSTREAM_TIMEOUT_MS,
    );
    expect(cfg.CIRCUIT_BREAKER_THRESHOLD).toBe(
      DEFAULT_CONFIG_VALUES.CIRCUIT_BREAKER_THRESHOLD,
    );
    expect(cfg.CORS_ALLOWED_ORIGINS).toBe(
      DEFAULT_CONFIG_VALUES.CORS_ALLOWED_ORIGINS,
    );
    expect(cfg.OTEL_SERVICE_NAME).toBe(DEFAULT_CONFIG_VALUES.OTEL_SERVICE_NAME);
    expect(cfg.ENABLE_GRAPHQL).toBe(DEFAULT_CONFIG_VALUES.ENABLE_GRAPHQL);
  });

  it('coerces numeric env vars', () => {
    const cfg = loadConfig({
      ...validEnv,
      PORT: '9090',
      RATE_LIMIT_RPS: '25',
      RATE_LIMIT_BURST: '50',
      DOWNSTREAM_TIMEOUT_MS: '3000',
      CIRCUIT_BREAKER_THRESHOLD: '75',
    });
    expect(cfg.PORT).toBe(9090);
    expect(cfg.RATE_LIMIT_RPS).toBe(25);
    expect(cfg.RATE_LIMIT_BURST).toBe(50);
    expect(cfg.DOWNSTREAM_TIMEOUT_MS).toBe(3000);
    expect(cfg.CIRCUIT_BREAKER_THRESHOLD).toBe(75);
  });

  it('parses ENABLE_GRAPHQL boolean', () => {
    expect(
      loadConfig({ ...validEnv, ENABLE_GRAPHQL: 'true' }).ENABLE_GRAPHQL,
    ).toBe(true);
    expect(
      loadConfig({ ...validEnv, ENABLE_GRAPHQL: 'false' }).ENABLE_GRAPHQL,
    ).toBe(false);
  });

  it('rejects invalid enum LOG_LEVEL', () => {
    expect(() => loadConfig({ ...validEnv, LOG_LEVEL: 'verbose' })).toThrow(
      ConfigError,
    );
  });

  it('fails fast with a clear error when required env vars are missing', () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
    try {
      loadConfig({});
    } catch (e) {
      const err = e as ConfigError;
      expect(err.message).toContain('Invalid configuration');
      expect(err.issues.length).toBeGreaterThan(0);
      const names = err.issues.map((i) => i.path);
      expect(names).toContain('IDENTITY_AUTH_URL');
      expect(names).toContain('JWT_ISSUER');
      expect(names).toContain('WEBHOOK_SIGNING_SECRET');
    }
  });

  it('rejects malformed URLs', () => {
    expect(() =>
      loadConfig({ ...validEnv, IDENTITY_AUTH_URL: 'not-a-url' }),
    ).toThrow(ConfigError);
  });

  it('is fully typed (returns AppConfig)', () => {
    const cfg = loadConfig(validEnv);
    expect(typeof cfg.PORT).toBe('number');
    expect(typeof cfg.ENABLE_GRAPHQL).toBe('boolean');
  });
});
