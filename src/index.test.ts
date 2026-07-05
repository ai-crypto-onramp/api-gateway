import { describe, it, expect, afterEach } from "vitest";
import { buildServer } from "./index.js";

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