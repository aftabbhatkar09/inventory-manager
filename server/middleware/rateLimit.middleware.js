import rateLimit from "express-rate-limit";

// Factory, not a bare instance -- so tests can build their own independent
// limiter instead of sharing the one the real app uses. Sharing it caused
// flaky failures: rateLimit.middleware.test.js deliberately exhausts a
// limiter to test the 429 behavior, and when that ran in the same worker
// as tests that log in for real (user.routes.test.js), the exhausted
// state leaked across files and broke every real login in CI.
//
// 10 attempts per IP per 15 minutes -- generous for a genuine user who
// mistypes a password a few times, tight enough to make brute-forcing
// the admin login impractical.
export const createLoginRateLimit = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Please try again later." },
  });

export const loginRateLimit = createLoginRateLimit();
