import type { FastifyPluginCallback } from 'fastify';
import type { PluginOptions } from './registry.js';

export const healthRoutes: FastifyPluginCallback<PluginOptions> = (
  app,
  _opts,
  done,
) => {
  app.get('/healthz', async () => {
    return { status: 'ok' };
  });

  app.get('/readyz', async () => {
    return { status: 'ready' };
  });

  done();
};
