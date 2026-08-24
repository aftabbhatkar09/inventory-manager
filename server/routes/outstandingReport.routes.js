import express from "express";

import { getOutstandingReport } from "../controllers/outstandingReport.controller.js";

const router = express.Router();

router.get("/outstanding-report", getOutstandingReport);

export default router;
