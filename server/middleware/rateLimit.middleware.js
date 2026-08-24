import rateLimit from "express-rate-limit";

// 10 attempts per IP per 15 minutes -- generous for a genuine user who
// mistypes a password a few times, tight enough to make brute-forcing
// the admin login impractical.
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});
