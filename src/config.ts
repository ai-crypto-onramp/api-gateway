import { z } from 'zod';

const booleanString = z
  .string()
  .transform((v) => v.toLowerCase())
  .pipe(z.enum(['true', 'false']))
  .transform((v) => v === 'true');

const configSchema = z.object({
  PORT: z.coerce.number().int().positive().max(65535).default(8080),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  NODE_ENV: z.enum(['production', 'development', 'test']).default('production'),
  IDENTITY_AUTH_URL: z.string().url(),
  KYC_URL: z.string().url(),
  PRICING_URL: z.string().url(),
  ORCHESTRATOR_URL: z.string().url(),
  RATE_LIMIT_RPS: z.coerce.number().positive().default(10),
  RATE_LIMIT_BURST: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_REDIS_URL: z.string().url(),
  JWT_ISSUER: z.string().min(1),
  JWKS_URL: z.string().url(),
  JWT_AUDIENCE: z.string().min(1),
  PARTNER_API_KEY_HEADER: z.string().min(1).default('X-API-Key'),
  DOWNSTREAM_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  CIRCUIT_BREAKER_THRESHOLD: z.coerce.number().min(0).max(100).default(50),
  CORS_ALLOWED_ORIGINS: z.string().min(1).default('https://app.example.com'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url(),
  OTEL_SERVICE_NAME: z.string().min(1).default('api-gateway'),
  ENABLE_GRAPHQL: booleanString.default('false'),
  WEBHOOK_SIGNING_SECRET: z.string().min(1),
});

export type AppConfig = z.infer<typeof configSchema>;

export type RawEnv = Record<string, string | undefined>;

export class ConfigError extends Error {
  constructor(public readonly issues: { path: string; message: string }[]) {
    const summary = issues.map((i) => `${i.path}: ${i.message}`).join('; ');
    super(`Invalid configuration:\n  - ${summary}`);
    this.name = 'ConfigError';
  }
}

export function loadConfig(env: RawEnv = process.env): AppConfig {
  const parsed = configSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    throw new ConfigError(issues);
  }
  return parsed.data;
}

export const DEFAULT_CONFIG_VALUES: Partial<Record<keyof AppConfig, unknown>> =
  {
    PORT: 8080,
    LOG_LEVEL: 'info',
    NODE_ENV: 'production',
    RATE_LIMIT_RPS: 10,
    RATE_LIMIT_BURST: 20,
    PARTNER_API_KEY_HEADER: 'X-API-Key',
    DOWNSTREAM_TIMEOUT_MS: 5000,
    CIRCUIT_BREAKER_THRESHOLD: 50,
    CORS_ALLOWED_ORIGINS: 'https://app.example.com',
    OTEL_SERVICE_NAME: 'api-gateway',
    ENABLE_GRAPHQL: false,
  };
