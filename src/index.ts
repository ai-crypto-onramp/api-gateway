import Fastify, { type FastifyInstance } from "fastify";

export function buildServer(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.get("/healthz", async () => {
    return { status: "ok" };
  });

  return app;
}

export function start(app: FastifyInstance = buildServer()): FastifyInstance {
  const port = Number(process.env.PORT ?? 8080);
  app.listen({ port, host: "0.0.0.0" }).catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}