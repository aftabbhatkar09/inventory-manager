import express from "express";

import {
  createStockTransfer,
  getAllStockTransfers,
  deleteStockTransfer,
} from "../controllers/stockTransfer.controller.js";

const router = express.Router();

router.post("/createTransfer", createStockTransfer);
router.get("/getAllTransfers", getAllStockTransfers);
router.delete("/deleteTransfer/:id", deleteStockTransfer);

export default router;
