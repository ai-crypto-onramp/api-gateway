import { describe, it, expect, afterEach, vi } from "vitest";
import { buildServer, start } from "./index.js";
import type { FastifyInstance } from "fastify";

describe("/healthz", () => {
  const app = buildServer();

  afterEach(async () => {
    await app.close();
  });

  it("returns status ok", async () => {
    const res = await app.inject({ method: "GET", url: "/healthz" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });
});

describe("start", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("listens on the port from the PORT env var", async () => {
    vi.stubEnv("PORT", "0");
    const app = start();
    try {
      await app.ready();
      // Wait for listen to complete so an address is assigned.
      await vi.waitFor(() => {
        expect(app.addresses().length).toBeGreaterThan(0);
      });
      const res = await app.inject({ method: "GET", url: "/healthz" });
      expect(res.statusCode).toBe(200);
    } finally {
      await app.close();
    }
  });

  it("defaults to port 8080 when PORT is unset", async () => {
    vi.stubEnv("PORT", "");
    delete process.env.PORT;
    const listen = vi.fn().mockResolvedValue(undefined);
    const fakeApp = {
      listen,
      log: { error: vi.fn() },
    } as unknown as FastifyInstance;

    const returned = start(fakeApp);

    expect(returned).toBe(fakeApp);
    expect(listen).toHaveBeenCalledWith({ port: 8080, host: "0.0.0.0" });
  });

  it("logs the error and exits when listen fails", async () => {
    const boom = new Error("bind failed");
    const logError = vi.fn();
    const fakeApp = {
      listen: vi.fn().mockRejectedValue(boom),
      log: { error: logError },
    } as unknown as FastifyInstance;
    const exit = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);

    start(fakeApp);

    await vi.waitFor(() => {
      expect(logError).toHaveBeenCalledWith(boom);
      expect(exit).toHaveBeenCalledWith(1);
    });
  });
});
