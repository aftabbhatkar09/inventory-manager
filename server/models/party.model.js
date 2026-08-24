import mongoose from "mongoose";

const partySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    // Multi type support: buyer, seller, both
    type: {
      type: [String],
      enum: ["customer", "supplier"],
      required: true,
      validate: {
        validator: (val) => Array.isArray(val) && val.length > 0,
        message: "At least one type is required",
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Party = mongoose.model("Party", partySchema);

export default Party;
