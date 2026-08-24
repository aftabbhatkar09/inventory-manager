import { describe, it, expect, vi, afterEach } from "vitest";

import { validateEnv } from "./validateEnv.js";

describe("validateEnv", () => {
  const originalMongoUri = process.env.MONGO_URI;
  const originalJwtSecret = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.MONGO_URI = originalMongoUri;
    process.env.JWT_SECRET = originalJwtSecret;
    vi.restoreAllMocks();
  });

  it("exits the process when a required variable is missing", () => {
    delete process.env.JWT_SECRET;
    process.env.MONGO_URI = "mongodb://localhost/test";
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    validateEnv();

    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("does not exit when all required variables are present", () => {
    process.env.MONGO_URI = "mongodb://localhost/test";
    process.env.JWT_SECRET = "test-secret";
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {});

    validateEnv();

    expect(exitSpy).not.toHaveBeenCalled();
  });
});
