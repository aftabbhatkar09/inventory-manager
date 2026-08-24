import mongoose from "mongoose";

const stockTransferSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    fromGodown: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Godown",
      required: true,
    },
    toGodown: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Godown",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const StockTransfer = mongoose.model("StockTransfer", stockTransferSchema);

export default StockTransfer;
