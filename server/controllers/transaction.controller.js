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
