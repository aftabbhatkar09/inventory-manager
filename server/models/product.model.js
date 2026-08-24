import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      default: "",
    },
    unit: {
      type: String,
      enum: ["pcs", "kg", "ltr"],
      default: "pcs",
    },
    isDeleted: {
      type: Boolean,
      default: false, // soft delete
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
