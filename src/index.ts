import Fastify, { type FastifyInstance } from 'fastify';
import { loadConfig, type AppConfig } from './config.js';
import {
  createPluginRegistry,
  type PluginManifest,
} from './plugins/registry.js';
import { healthRoutes } from './plugins/health.js';

export function buildServer(config?: AppConfig): FastifyInstance {
  const cfg = config ?? loadConfig();
  const app = Fastify({ logger: { level: cfg.LOG_LEVEL } });

  const registry = createPluginRegistry(app, cfg);
  const plugins: PluginManifest[] = [
    { name: 'health', register: healthRoutes },
  ];
  for (const plugin of plugins) registry.register(plugin);

  return app;
}

export async function startServer(): Promise<FastifyInstance> {
  const cfg = loadConfig();
  const app = buildServer(cfg);
  await app.listen({ port: cfg.PORT });
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
