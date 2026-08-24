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
    // Balance carried forward from before this party existed in the system.
    // Positive = they owe the business (receivable), negative = the business owes them (payable).
    openingBalance: {
      type: Number,
      default: 0,
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
