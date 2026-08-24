import { verifyToken, COOKIE_NAME } from "../utils/auth.util.js";

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ message: "Session expired, please log in again" });
  }
};
