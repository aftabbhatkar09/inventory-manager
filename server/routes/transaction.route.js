import express from "express";

import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.post("/createTransaction", createTransaction);
router.get("/getAllTransactions", getAllTransactions);
router.get("/getTransactionById/:id", getTransactionById);
router.put("/editTransaction/:id", updateTransaction);
router.delete("/deleteTransaction/:id", deleteTransaction);

export default router;
