import Payment from "../models/payment.model.js";
import Party from "../models/party.model.js";
import {
  assertExists,
  assertOneOf,
  assertPositiveNumber,
  handleControllerError,
} from "../utils/validate.util.js";

// Create payment
export const createPayment = async (req, res) => {
  try {
    const { party, type, amount, paymentMode, note } = req.body;

    if (!party || !type || !amount) {
      return res
        .status(400)
        .json({ message: "Party, type and a positive amount are required" });
    }

    await assertExists(Party, party, "Party");
    assertOneOf(type, ["received", "paid"], "Type");
    assertPositiveNumber(amount, "Amount");

    const payment = new Payment({ party, type, amount, paymentMode, note });
    const saved = await payment.save();

    res.status(201).json(saved);
  } catch (error) {
    handleControllerError(res, error, "Error creating payment");
  }
};

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("party")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching payments", error: error.message });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("party");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching payment", error: error.message });
  }
};

// Update payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { party, type, amount, paymentMode, note } = req.body;

    if (!party || !type || !amount) {
      return res
        .status(400)
        .json({ message: "Party, type and a positive amount are required" });
    }

    await assertExists(Party, party, "Party");
    assertOneOf(type, ["received", "paid"], "Type");
    assertPositiveNumber(amount, "Amount");

    const updated = await Payment.findByIdAndUpdate(
      id,
      { party, type, amount, paymentMode, note },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(updated);
  } catch (error) {
    handleControllerError(res, error, "Error updating payment");
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Payment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting payment", error: error.message });
  }
};
