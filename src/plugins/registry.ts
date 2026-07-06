import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import type { AppConfig } from '../config.js';

export type PluginOptions = { config: AppConfig };
export type PluginManifest = {
  name: string;
  register: FastifyPluginCallback<PluginOptions>;
};

export function createPluginRegistry(
  app: FastifyInstance,
  config: AppConfig,
): { register: (manifest: PluginManifest) => void } {
  const registered = new Set<string>();

  return {
    register(manifest) {
      if (registered.has(manifest.name)) {
        throw new Error(`Plugin "${manifest.name}" already registered`);
      }
      registered.add(manifest.name);
      app.register(manifest.register, { config });
    },
  };
}
