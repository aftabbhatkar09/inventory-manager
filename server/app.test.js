import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "./app.js";

describe("unmatched routes", () => {
  it("returns a JSON 404 instead of Express's default HTML page", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Not found" });
  });
});

describe("global error handler", () => {
  it("turns a malformed JSON body into a clean 400 instead of crashing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{not valid json");

    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
  });
});

describe("routes requiring auth", () => {
  it("rejects requests with no session cookie", async () => {
    const res = await request(app).get("/api/products");

    expect(res.status).toBe(401);
  });
});
