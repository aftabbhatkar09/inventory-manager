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

// Mount after requireAuth -- relies on req.user already being set.
export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Super admin access required" });
  }

  next();
};
