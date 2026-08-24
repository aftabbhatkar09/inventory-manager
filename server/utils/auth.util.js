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
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Provisions a single admin account from env vars the first time the app
// runs against a fresh database. Only ever creates a user if none exist --
// won't overwrite credentials someone has already logged in with.
export const ensureAdminUser = async () => {
  // Backfill: any account created before roles existed was, by definition,
  // the sole admin -- promote it rather than leaving `role` unset, which
  // would fail every role check.
  await User.updateMany(
    { role: { $exists: false } },
    { $set: { role: "super_admin" } },
  );

  const existingCount = await User.countDocuments();

  if (existingCount > 0) return;

  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.warn(
      "No users exist and ADMIN_USERNAME/ADMIN_PASSWORD are not set in .env -- nobody will be able to log in.",
    );
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await User.create({ username: ADMIN_USERNAME, passwordHash, role: "super_admin" });

  console.log(`Created initial super admin user "${ADMIN_USERNAME}" from .env`);
};
