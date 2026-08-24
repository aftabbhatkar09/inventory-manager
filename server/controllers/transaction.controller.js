import Transaction from "../models/transaction.model.js";
import Product from "../models/product.model.js";
import Party from "../models/party.model.js";
import Godown from "../models/godown.model.js";
import { getProductStockInGodown } from "../utils/stock.util.js";
import {
  assertExists,
  assertOneOf,
  assertPositiveNumber,
  assertNonNegativeNumber,
  handleControllerError,
} from "../utils/validate.util.js";

const buildStockError = async (item, availableStock) => {
  const product = await Product.findById(item.product);
  const name = product?.name || item.product;

  return `Not enough stock of "${name}" (available: ${availableStock}, requested: ${item.quantity})`;
};

// Confirms every foreign key and number in a transaction payload is real
// and in range before it ever reaches the database -- a bad party/godown/
// product id fails with a clear message instead of a raw CastError, and a
// negative or zero quantity/price can't slip through even if someone
// bypasses the UI and calls the API directly.
const validateTransactionPayload = async ({ type, party, godown, products, paidAmount }) => {
  assertOneOf(type, ["sale", "purchase"], "Type");
  await assertExists(Party, party, "Party");
  await assertExists(Godown, godown, "Godown");

  for (const item of products) {
    await assertExists(Product, item.product, "Product");
    assertPositiveNumber(item.quantity, "Quantity");
    assertNonNegativeNumber(item.price, "Price");
  }

  if (paidAmount !== undefined) {
    assertNonNegativeNumber(paidAmount, "Paid amount");
  }
};

// Create transaction
export const createTransaction = async (req, res) => {
  try {
    const { type, party, godown, products, paidAmount = 0, paymentMode } =
      req.body;

    if (!type || !party || !godown || !products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Type, party, godown and products are required" });
    }

    await validateTransactionPayload({ type, party, godown, products, paidAmount });

    // Stock validation before sale -- checked against the specific godown
    // this sale is shipping from, not the company-wide total.
    if (type === "sale") {
      for (const item of products) {
        const availableStock = await getProductStockInGodown(
          item.product,
          godown,
        );

        if (item.quantity > availableStock) {
          return res
            .status(400)
            .json({ message: await buildStockError(item, availableStock) });
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
      godown,
      products,
      totalAmount,
      paidAmount,
      remainingAmount,
      paymentMode,
    });

    const saved = await transaction.save();

    res.status(201).json(saved);
  } catch (error) {
    handleControllerError(res, error, "Error creating transaction");
  }
};

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("party")
      .populate("godown")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching transactions", error: error.message });
  }
};

// Get Transactions page (search + pagination). Search spans joined fields
// (party/godown/product name) via aggregation to find matching, sorted,
// paginated ids -- then a normal populate() query fetches the actual
// documents so the response shape matches getAllTransactions exactly.
export const getTransactionsPaged = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const search = (req.query.search || "").trim();

    const basePipeline = [
      {
        $lookup: {
          from: "parties",
          localField: "party",
          foreignField: "_id",
          as: "partyDoc",
        },
      },
      {
        $lookup: {
          from: "godowns",
          localField: "godown",
          foreignField: "_id",
          as: "godownDoc",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDocs",
        },
      },
    ];

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      basePipeline.push({
        $match: {
          $or: [
            { type: regex },
            { paymentMode: regex },
            { "partyDoc.name": regex },
            { "godownDoc.name": regex },
            { "productDocs.name": regex },
          ],
        },
      });
    }

    const [countResult, idRows] = await Promise.all([
      Transaction.aggregate([...basePipeline, { $count: "total" }]),
      Transaction.aggregate([
        ...basePipeline,
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $project: { _id: 1 } },
      ]),
    ]);

    const total = countResult[0]?.total || 0;
    const ids = idRows.map((row) => row._id);

    const transactions = await Transaction.find({ _id: { $in: ids } })
      .populate("party")
      .populate("godown")
      .populate("products.product");

    const byId = new Map(transactions.map((t) => [t._id.toString(), t]));
    const data = ids.map((id) => byId.get(id.toString())).filter(Boolean);

    res.json({ data, total, page, totalPages: Math.max(Math.ceil(total / limit), 1) });
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
      .populate("godown")
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
    const { type, party, godown, products, paidAmount = 0, paymentMode } =
      req.body;

    if (!type || !party || !godown || !products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Type, party, godown and products are required" });
    }

    await validateTransactionPayload({ type, party, godown, products, paidAmount });

    // Stock validation before sale, excluding this transaction's own
    // quantities, checked against the godown it's shipping from.
    if (type === "sale") {
      for (const item of products) {
        const availableStock = await getProductStockInGodown(
          item.product,
          godown,
          id,
        );

        if (item.quantity > availableStock) {
          return res
            .status(400)
            .json({ message: await buildStockError(item, availableStock) });
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
        godown,
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
    handleControllerError(res, error, "Error updating transaction");
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
