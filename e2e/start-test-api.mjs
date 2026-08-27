// Boots the real Express app against a throwaway in-memory MongoDB instance,
// seeded with known e2e credentials -- used as Playwright's "api" webServer.
// Never touches the real dev/prod database.
import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const mongod = await MongoMemoryServer.create();

const child = spawn("node", ["server.js"], {
  cwd: path.join(__dirname, "..", "server"),
  env: {
    ...process.env,
    MONGO_URI: mongod.getUri("e2e"),
    JWT_SECRET: "e2e-test-secret-not-for-real-use",
    PORT: "5050",
    CLIENT_ORIGIN: "http://localhost:5174",
    NODE_ENV: "development", // keep cookies Lax/non-Secure for plain http e2e
    ADMIN_USERNAME: "e2e-admin",
    ADMIN_PASSWORD: "e2eAdminPass123",
    STAFF_ADMIN_USERNAME: "demo",
    STAFF_ADMIN_PASSWORD: "demo1234",
  },
  stdio: "inherit",
});

const shutdown = async () => {
  child.kill();
  await mongod.stop();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
child.on("exit", (code) => {
  mongod.stop().then(() => process.exit(code ?? 0));
});
