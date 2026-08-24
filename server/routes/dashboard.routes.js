import express from "express";

import {
  getDashboardSummary,
  getMonthlyTrend,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/summary", getDashboardSummary);
router.get("/monthly-trend", getMonthlyTrend);

export default router;
