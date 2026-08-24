import express from "express";

import { requireDemoSecret, resetDemoData } from "../controllers/demo.controller.js";

const router = express.Router();

router.post("/reset", requireDemoSecret, resetDemoData);

export default router;
