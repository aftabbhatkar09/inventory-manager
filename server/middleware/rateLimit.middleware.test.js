import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";

import { loginRateLimit } from "./rateLimit.middleware.js";

const buildApp = () => {
  const app = express();
  app.post("/login", loginRateLimit, (req, res) => res.json({ ok: true }));
  return app;
};

describe("loginRateLimit", () => {
  it("allows requests under the limit and blocks once it's exceeded", async () => {
    const app = buildApp();
    const statuses = [];

    for (let i = 0; i < 11; i++) {
      const res = await request(app).post("/login").send({});
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 10)).toEqual(Array(10).fill(200));
    expect(statuses[10]).toBe(429);
  });
});
