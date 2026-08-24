import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/user.model.js";

export const signToken = (user) =>
  jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

export const COOKIE_NAME = "token";

// Client and server share a site in local dev (both are "localhost", just
// different ports) but not in production (e.g. a Vercel domain talking to
// a Render domain) -- cross-site cookies require SameSite=None, which in
// turn requires Secure. Computed per-call, not cached at import time, so
// it reflects whatever NODE_ENV the process actually has at request time.
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

// Creates one user from env vars if that username doesn't exist yet.
// Idempotent per-username, so safe to call on every boot.
const ensureUserFromEnv = async (usernameVar, passwordVar, role) => {
  const username = process.env[usernameVar];
  const password = process.env[passwordVar];

  if (!username || !password) return;

  const normalized = username.trim().toLowerCase();
  const existing = await User.findOne({ username: normalized });

  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({ username, passwordHash, role });

  console.log(`Created ${role} user "${username}" from .env`);
};

// Provisions the initial account(s) from env vars. The super admin only
// gets auto-created the first time the app runs against a fresh database
// (so it never overwrites credentials someone has already logged in with);
// the second, regular admin account is optional and can be added any time
// by setting STAFF_ADMIN_USERNAME/STAFF_ADMIN_PASSWORD -- it's created the
// next time the server boots, and only if that username doesn't exist yet.
export const ensureAdminUser = async () => {
  // Backfill: any account created before roles existed was, by definition,
  // the sole admin -- promote it rather than leaving `role` unset, which
  // would fail every role check.
  await User.updateMany(
    { role: { $exists: false } },
    { $set: { role: "super_admin" } },
  );

  const existingCount = await User.countDocuments();

  if (existingCount === 0) {
    const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      console.warn(
        "No users exist and ADMIN_USERNAME/ADMIN_PASSWORD are not set in .env -- nobody will be able to log in.",
      );
    } else {
      await ensureUserFromEnv("ADMIN_USERNAME", "ADMIN_PASSWORD", "super_admin");
    }
  }

  await ensureUserFromEnv("STAFF_ADMIN_USERNAME", "STAFF_ADMIN_PASSWORD", "admin");
};
