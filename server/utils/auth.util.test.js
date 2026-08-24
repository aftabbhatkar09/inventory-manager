import { describe, it, expect, afterEach } from "vitest";

import User from "../models/user.model.js";
import { ensureAdminUser } from "./auth.util.js";

const ENV_KEYS = [
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
  "STAFF_ADMIN_USERNAME",
  "STAFF_ADMIN_PASSWORD",
];

describe("ensureAdminUser", () => {
  const original = {};

  ENV_KEYS.forEach((key) => {
    original[key] = process.env[key];
  });

  afterEach(() => {
    ENV_KEYS.forEach((key) => {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    });
  });

  it("creates a super_admin from ADMIN_USERNAME/ADMIN_PASSWORD on a fresh database", async () => {
    process.env.ADMIN_USERNAME = "boss";
    process.env.ADMIN_PASSWORD = "password123";
    delete process.env.STAFF_ADMIN_USERNAME;
    delete process.env.STAFF_ADMIN_PASSWORD;

    await ensureAdminUser();

    const user = await User.findOne({ username: "boss" });
    expect(user.role).toBe("super_admin");
  });

  it("creates no user when ADMIN_USERNAME/ADMIN_PASSWORD are unset on a fresh database", async () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.STAFF_ADMIN_USERNAME;
    delete process.env.STAFF_ADMIN_PASSWORD;

    await ensureAdminUser();

    expect(await User.countDocuments()).toBe(0);
  });

  it("also provisions a regular admin from STAFF_ADMIN_USERNAME/STAFF_ADMIN_PASSWORD", async () => {
    process.env.ADMIN_USERNAME = "boss2";
    process.env.ADMIN_PASSWORD = "password123";
    process.env.STAFF_ADMIN_USERNAME = "staffer";
    process.env.STAFF_ADMIN_PASSWORD = "password123";

    await ensureAdminUser();

    const superAdmin = await User.findOne({ username: "boss2" });
    const admin = await User.findOne({ username: "staffer" });

    expect(superAdmin.role).toBe("super_admin");
    expect(admin.role).toBe("admin");
  });

  it("does not re-run the super_admin bootstrap once a user already exists", async () => {
    await User.create({
      username: "existing",
      passwordHash: "irrelevant-hash",
      role: "admin",
    });

    process.env.ADMIN_USERNAME = "should-not-appear";
    process.env.ADMIN_PASSWORD = "password123";
    delete process.env.STAFF_ADMIN_USERNAME;
    delete process.env.STAFF_ADMIN_PASSWORD;

    await ensureAdminUser();

    expect(await User.findOne({ username: "should-not-appear" })).toBeNull();
  });

  it("is idempotent -- running twice does not create a duplicate staff admin", async () => {
    process.env.ADMIN_USERNAME = "boss3";
    process.env.ADMIN_PASSWORD = "password123";
    process.env.STAFF_ADMIN_USERNAME = "staffer2";
    process.env.STAFF_ADMIN_PASSWORD = "password123";

    await ensureAdminUser();
    await ensureAdminUser();

    expect(await User.countDocuments({ username: "staffer2" })).toBe(1);
  });

  it("backfills a pre-role user to super_admin", async () => {
    await User.collection.insertOne({
      username: "legacy",
      passwordHash: "irrelevant-hash",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.STAFF_ADMIN_USERNAME;
    delete process.env.STAFF_ADMIN_PASSWORD;

    await ensureAdminUser();

    const legacy = await User.findOne({ username: "legacy" });
    expect(legacy.role).toBe("super_admin");
  });
});
