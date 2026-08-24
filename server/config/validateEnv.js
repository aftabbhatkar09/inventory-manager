const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET"];

// Fails fast at boot with a clear message instead of letting the app start
// and only surface the problem on the first request that needs the
// missing variable (e.g. a confusing 500 on the first login attempt).
export const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `Missing required environment variable(s): ${missing.join(", ")}. Set them in server/.env before starting.`,
    );
    process.exit(1);
  }
};
