import StockTransfer from "../models/stockTransfer.model.js";
import Product from "../models/product.model.js";
import Godown from "../models/godown.model.js";
import { getProductStockInGodown } from "../utils/stock.util.js";
import {
  assertExists,
  assertPositiveNumber,
  handleControllerError,
} from "../utils/validate.util.js";

// Create stock transfer
export const createStockTransfer = async (req, res) => {
  try {
    const { product, fromGodown, toGodown, quantity, note } = req.body;

    if (!product || !fromGodown || !toGodown || !quantity) {
      return res.status(400).json({
        message: "Product, source/destination godown, and a positive quantity are required",
      });
    }

    if (fromGodown === toGodown) {
      return res
        .status(400)
        .json({ message: "Source and destination godown must be different" });
    }

    await assertExists(Product, product, "Product");
    await assertExists(Godown, fromGodown, "Source godown");
    await assertExists(Godown, toGodown, "Destination godown");
    assertPositiveNumber(quantity, "Quantity");

    const availableStock = await getProductStockInGodown(product, fromGodown);

    if (quantity > availableStock) {
      return res.status(400).json({
        message: `Not enough stock in the source godown (available: ${availableStock}, requested: ${quantity})`,
      });
    }

    const transfer = new StockTransfer({
      product,
      fromGodown,
      toGodown,
      quantity,
      note,
    });

    const saved = await transfer.save();

    res.status(201).json(saved);
  } catch (error) {
    handleControllerError(res, error, "Error creating stock transfer");
  }
};

// Get all stock transfers
export const getAllStockTransfers = async (req, res) => {
  try {
    const transfers = await StockTransfer.find()
      .populate("product")
      .populate("fromGodown")
      .populate("toGodown")
      .sort({ createdAt: -1 });

    res.json(transfers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stock transfers", error: error.message });
  }
};

// Delete stock transfer
export const deleteStockTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await StockTransfer.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Stock transfer not found" });
    }

    res.json({ message: "Stock transfer deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting stock transfer", error: error.message });
  }
};
