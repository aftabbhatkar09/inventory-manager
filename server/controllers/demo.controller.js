import { seedDemoData } from "../utils/seedDemoData.js";

// Not mounted behind requireAuth -- this is triggered by an external
// scheduler (see .github/workflows/reset-demo.yml), not a logged-in user.
// If DEMO_RESET_SECRET isn't set, the route pretends not to exist rather
// than exposing an always-401 endpoint, so a normal (non-demo) deployment
// doesn't advertise a reset lever at all.
export const requireDemoSecret = (req, res, next) => {
  const secret = process.env.DEMO_RESET_SECRET;

  if (!secret) {
    return res.status(404).json({ message: "Not found" });
  }

  const header = req.headers.authorization || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (provided !== secret) {
    return res.status(401).json({ message: "Invalid or missing demo reset secret" });
  }

  next();
};

export const resetDemoData = async (req, res) => {
  try {
    const counts = await seedDemoData();

    res.json({ message: "Demo data reset", counts });
  } catch (error) {
    res.status(500).json({ message: "Error resetting demo data", error: error.message });
  }
};
