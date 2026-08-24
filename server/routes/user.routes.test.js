import { describe, it, expect } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";

import app from "../app.js";
import User from "../models/user.model.js";

const createUserDirect = async ({ username, password = "password123", role }) =>
  User.create({ username, passwordHash: await bcrypt.hash(password, 10), role });

const loginAs = async (username, password = "password123") => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ username, password });

  return res.headers["set-cookie"];
};

describe("user management routes", () => {
  it("rejects requests with no session cookie", async () => {
    const res = await request(app).get("/api/users/getAllUsers");

    expect(res.status).toBe(401);
  });

  it("returns the caller's role from /api/auth/me", async () => {
    await createUserDirect({ username: "role-check", role: "super_admin" });
    const cookie = await loginAs("role-check");

    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);

    expect(res.body.role).toBe("super_admin");
  });

  it("rejects an admin (non-super-admin) from managing users", async () => {
    await createUserDirect({ username: "regular-admin", role: "admin" });
    const cookie = await loginAs("regular-admin");

    const res = await request(app)
      .get("/api/users/getAllUsers")
      .set("Cookie", cookie);

    expect(res.status).toBe(403);
  });

  it("allows a super admin to list users without exposing password hashes", async () => {
    await createUserDirect({ username: "boss", role: "super_admin" });
    const cookie = await loginAs("boss");

    const res = await request(app)
      .get("/api/users/getAllUsers")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.every((u) => !("passwordHash" in u))).toBe(true);
  });

  it("lets a super admin create a new admin user", async () => {
    await createUserDirect({ username: "boss2", role: "super_admin" });
    const cookie = await loginAs("boss2");

    const res = await request(app)
      .post("/api/users/createUser")
      .set("Cookie", cookie)
      .send({ username: "new-admin", password: "password123", role: "admin" });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("admin");
    expect(res.body.passwordHash).toBeUndefined();
  });

  it("rejects creating a user with a duplicate username", async () => {
    await createUserDirect({ username: "boss3", role: "super_admin" });
    await createUserDirect({ username: "taken", role: "admin" });
    const cookie = await loginAs("boss3");

    const res = await request(app)
      .post("/api/users/createUser")
      .set("Cookie", cookie)
      .send({ username: "taken", password: "password123", role: "admin" });

    expect(res.status).toBe(400);
  });

  it("prevents deleting the last remaining super admin", async () => {
    const onlySuperAdmin = await createUserDirect({
      username: "lonely-boss",
      role: "super_admin",
    });
    const cookie = await loginAs("lonely-boss");

    const res = await request(app)
      .delete(`/api/users/deleteUser/${onlySuperAdmin._id}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("prevents a super admin from deleting their own account", async () => {
    const self = await createUserDirect({ username: "boss4", role: "super_admin" });
    const cookie = await loginAs("boss4");

    const res = await request(app)
      .delete(`/api/users/deleteUser/${self._id}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/own account/);
  });

  it("prevents demoting the last super admin to admin", async () => {
    const onlySuperAdmin = await createUserDirect({
      username: "sole-boss",
      role: "super_admin",
    });
    const cookie = await loginAs("sole-boss");

    const res = await request(app)
      .put(`/api/users/editUser/${onlySuperAdmin._id}`)
      .set("Cookie", cookie)
      .send({ username: "sole-boss", role: "admin" });

    expect(res.status).toBe(400);
  });
});
