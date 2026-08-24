import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["purchase", "sale"],
      required: true,
    },

    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    remainingAmount: {
      type: Number,
      default: 0,
    },

    paymentMode: {
      type: String,
      enum: ["cash", "upi", "bank", "cheque", "card"],
      default: "cash",
    },
  },
  { timestamps: true },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
