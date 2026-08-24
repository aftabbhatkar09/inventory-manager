import express from "express";

import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/createPayment", createPayment);
router.get("/getAllPayments", getAllPayments);
router.get("/getPaymentById/:id", getPaymentById);
router.put("/editPayment/:id", updatePayment);
router.delete("/deletePayment/:id", deletePayment);

export default router;
