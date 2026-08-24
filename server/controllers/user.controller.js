import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import {
  assertOneOf,
  assertMinLength,
  ValidationError,
  handleControllerError,
} from "../utils/validate.util.js";

const ROLES = ["super_admin", "admin"];
const SAFE_FIELDS = "-passwordHash";

const countSuperAdmins = () => User.countDocuments({ role: "super_admin" });

const normalizeUsername = (username) => username.trim().toLowerCase();

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(SAFE_FIELDS).sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(SAFE_FIELDS);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username?.trim() || !password || !role) {
      return res
        .status(400)
        .json({ message: "Username, password and role are required" });
    }

    assertOneOf(role, ROLES, "Role");
    assertMinLength(password, 8, "Password");

    const existing = await User.findOne({ username: normalizeUsername(username) });

    if (existing) {
      throw new ValidationError("Username already in use");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, role });

    const { passwordHash: _omit, ...safeUser } = user.toObject();

    res.status(201).json(safeUser);
  } catch (error) {
    handleControllerError(res, error, "Error creating user");
  }
};

// Update user (username, role, and optionally reset the password)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    if (!username?.trim() || !role) {
      return res.status(400).json({ message: "Username and role are required" });
    }

    assertOneOf(role, ROLES, "Role");

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const normalized = normalizeUsername(username);

    if (normalized !== user.username) {
      const existing = await User.findOne({ username: normalized });

      if (existing) {
        throw new ValidationError("Username already in use");
      }
    }

    // Guard against locking everyone out by demoting the last super admin.
    if (user.role === "super_admin" && role !== "super_admin") {
      const remaining = await countSuperAdmins();

      if (remaining <= 1) {
        throw new ValidationError("At least one super admin must remain");
      }
    }

    user.username = username;
    user.role = role;

    if (password) {
      assertMinLength(password, 8, "Password");
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.save();

    const { passwordHash: _omit, ...safeUser } = user.toObject();

    res.json(safeUser);
  } catch (error) {
    handleControllerError(res, error, "Error updating user");
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Guard against locking everyone out by deleting the last super admin.
    if (user.role === "super_admin") {
      const remaining = await countSuperAdmins();

      if (remaining <= 1) {
        return res
          .status(400)
          .json({ message: "At least one super admin must remain" });
      }
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};
