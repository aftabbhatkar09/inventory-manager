import Transaction from "../models/transaction.model.js";
import StockTransfer from "../models/stockTransfer.model.js";

// Current stock for every product referenced by any transaction.
export const getStockMap = async () => {
  const transactions = await Transaction.find();
  const stockMap = {};

  transactions.forEach((txn) => {
    txn.products.forEach((item) => {
      const productId = item.product.toString();

      if (!stockMap[productId]) {
        stockMap[productId] = 0;
      }

      if (txn.type === "purchase") {
        stockMap[productId] += item.quantity;
      } else if (txn.type === "sale") {
        stockMap[productId] -= item.quantity;
      }
    });
  });

  return stockMap;
};

export const getProductStockById = async (productId, excludeTransactionId = null) => {
  const query = { "products.product": productId };

  if (excludeTransactionId) {
    query._id = { $ne: excludeTransactionId };
  }

  const transactions = await Transaction.find(query);

  let stock = 0;

  transactions.forEach((txn) => {
    txn.products.forEach((item) => {
      if (item.product.toString() === productId.toString()) {
        if (txn.type === "purchase") {
          stock += item.quantity;
        } else if (txn.type === "sale") {
          stock -= item.quantity;
        }
      }
    });
  });

  return stock;
};

// Per-product, per-godown stock breakdown: transactions place/remove stock
// in the godown they're assigned to, transfers move it between godowns.
// Legacy transactions with no godown (from before this feature existed)
// are skipped here -- they still count toward each product's total via
// getStockMap, just not toward any specific godown's breakdown.
export const getGodownStockMap = async () => {
  const [transactions, transfers] = await Promise.all([
    Transaction.find(),
    StockTransfer.find(),
  ]);

  const map = {};

  const adjust = (productId, godownId, delta) => {
    if (!godownId) return;

    if (!map[productId]) {
      map[productId] = {};
    }

    map[productId][godownId] = (map[productId][godownId] || 0) + delta;
  };

  transactions.forEach((txn) => {
    if (!txn.godown) return;

    const godownId = txn.godown.toString();

    txn.products.forEach((item) => {
      const productId = item.product.toString();
      const delta = txn.type === "purchase" ? item.quantity : -item.quantity;

      adjust(productId, godownId, delta);
    });
  });

  transfers.forEach((t) => {
    const productId = t.product.toString();

    adjust(productId, t.fromGodown.toString(), -t.quantity);
    adjust(productId, t.toGodown.toString(), t.quantity);
  });

  return map;
};

// Stock of one product within one specific godown -- used to validate a
// sale against the godown it's actually shipping from, not the company-wide
// total. Optionally excludes one transaction (for edit validation).
export const getProductStockInGodown = async (
  productId,
  godownId,
  excludeTransactionId = null,
) => {
  const txnQuery = { "products.product": productId, godown: godownId };

  if (excludeTransactionId) {
    txnQuery._id = { $ne: excludeTransactionId };
  }

  const [transactions, transfersIn, transfersOut] = await Promise.all([
    Transaction.find(txnQuery),
    StockTransfer.find({ product: productId, toGodown: godownId }),
    StockTransfer.find({ product: productId, fromGodown: godownId }),
  ]);

  let stock = 0;

  transactions.forEach((txn) => {
    txn.products.forEach((item) => {
      if (item.product.toString() === productId.toString()) {
        stock += txn.type === "purchase" ? item.quantity : -item.quantity;
      }
    });
  });

  transfersIn.forEach((t) => {
    stock += t.quantity;
  });

  transfersOut.forEach((t) => {
    stock -= t.quantity;
  });

  return stock;
};
