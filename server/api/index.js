// Vercel serverless entry point. server.js (app.listen + a persistent
// process) is for traditional/local hosting -- this is the equivalent for
// a per-request function: connect (reusing a cached connection across warm
// invocations, see config/db.js) and seed once per cold start, then hand
// the request to the same Express app either way.
import app from "../app.js";
import connectDB from "../config/db.js";
import { ensureAdminUser } from "../utils/auth.util.js";

let seeded = false;

const ensureReady = async () => {
  await connectDB();

  if (!seeded) {
    await ensureAdminUser();
    seeded = true;
  }
};

export default async function handler(req, res) {
  await ensureReady();

  return app(req, res);
}
