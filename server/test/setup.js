import { afterAll, afterEach, beforeAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// The whole suite needs a JWT secret to sign/verify tokens. Locally this
// was silently supplied by dotenv.config() (called from app.js on import)
// loading the real server/.env -- which doesn't exist in CI, where .env is
// correctly gitignored. Tests must not depend on a developer's local .env.
process.env.JWT_SECRET ??= "test-jwt-secret-for-vitest-only";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}, 60000);

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
