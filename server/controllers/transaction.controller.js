import Transaction from "../models/transaction.model.js";
import { getProductStockById } from "../utils/stock.util.js";

// Create transaction
export const createTransaction = async (req, res) => {
  try {
    const { type, party, products, paidAmount = 0, paymentMode } = req.body;

    if (!type || !party || !products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Type, party and products are required" });
    }

    // Stock validation before sale
    if (type === "sale") {
      for (const item of products) {
        const availableStock = await getProductStockById(item.product);

        if (item.quantity > availableStock) {
          return res
            .status(400)
            .json({ message: `Not enough stock of product ${item.product}` });
        }
      }
    }

    let totalAmount = 0;

    products.forEach((item) => {
      totalAmount += item.quantity * item.price;
    });

    const remainingAmount = totalAmount - paidAmount;

    const transaction = new Transaction({
      type,
      party,
      products,
      totalAmount,
      paidAmount,
      remainingAmount,
      paymentMode,
    });

    const saved = await transaction.save();

    res.status(201).json(saved);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating transaction", error: error.message });
  }
};

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("party")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching transactions", error: error.message });
  }
};

// Get transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("party")
      .populate("products.product");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching transaction", error: error.message });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, party, products, paidAmount = 0, paymentMode } = req.body;

    if (!type || !party || !products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Type, party and products are required" });
    }

    // Stock validation before sale, excluding this transaction's own quantities
    if (type === "sale") {
      for (const item of products) {
        const availableStock = await getProductStockById(item.product, id);

        if (item.quantity > availableStock) {
          return res
            .status(400)
            .json({ message: `Not enough stock of product ${item.product}` });
        }
      }
    }

    let totalAmount = 0;

    products.forEach((item) => {
      totalAmount += item.quantity * item.price;
    });

    const remainingAmount = totalAmount - paidAmount;

    const updated = await Transaction.findByIdAndUpdate(
      id,
      {
        type,
        party,
        products,
        totalAmount,
        paidAmount,
        remainingAmount,
        paymentMode,
      },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating transaction", error: error.message });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Transaction.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting transaction", error: error.message });
  }
};
