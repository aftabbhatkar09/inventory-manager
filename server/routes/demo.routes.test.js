import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";

import app from "../app.js";
import Product from "../models/product.model.js";

describe("POST /api/demo/reset", () => {
  const originalSecret = process.env.DEMO_RESET_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.DEMO_RESET_SECRET;
    else process.env.DEMO_RESET_SECRET = originalSecret;
  });

  it("pretends not to exist when DEMO_RESET_SECRET is unset", async () => {
    delete process.env.DEMO_RESET_SECRET;

    const res = await request(app).post("/api/demo/reset");

    expect(res.status).toBe(404);
  });

  it("rejects a missing or wrong secret with 401", async () => {
    process.env.DEMO_RESET_SECRET = "correct-secret";

    const noAuth = await request(app).post("/api/demo/reset");
    const wrongAuth = await request(app)
      .post("/api/demo/reset")
      .set("Authorization", "Bearer wrong-secret");

    expect(noAuth.status).toBe(401);
    expect(wrongAuth.status).toBe(401);
  });

  it("reseeds demo data when the correct secret is provided", async () => {
    process.env.DEMO_RESET_SECRET = "correct-secret";

    const res = await request(app)
      .post("/api/demo/reset")
      .set("Authorization", "Bearer correct-secret");

    expect(res.status).toBe(200);
    expect(await Product.countDocuments()).toBe(res.body.counts.products);
  });
});
