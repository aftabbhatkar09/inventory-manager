import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
    },
    // received = money coming in (typically from a customer)
    // paid = money going out (typically to a supplier)
    type: {
      type: String,
      enum: ["received", "paid"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentMode: {
      type: String,
      enum: ["cash", "upi", "bank", "cheque", "card"],
      default: "cash",
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
