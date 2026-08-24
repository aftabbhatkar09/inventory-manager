import express from "express";

import {
  createTransaction,
  getAllTransactions,
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.post("/createTransaction", createTransaction);
router.get("/getAllTransactions", getAllTransactions);

export default router;
