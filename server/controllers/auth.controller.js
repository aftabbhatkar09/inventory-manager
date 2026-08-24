import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { signToken, verifyToken, COOKIE_NAME, COOKIE_OPTIONS } from "../utils/auth.util.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = signToken(user);

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    res.json({ username: user.username });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Logged out" });
};

export const me = (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = verifyToken(token);
    res.json({ username: decoded.username });
  } catch (error) {
    res.status(401).json({ message: "Session expired" });
  }
};
