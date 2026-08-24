import express from "express";

import { login, logout, me } from "../controllers/auth.controller.js";
import { loginRateLimit } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/login", loginRateLimit, login);
router.post("/logout", logout);
router.get("/me", me);

export default router;
