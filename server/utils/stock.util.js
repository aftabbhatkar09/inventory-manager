import Transaction from "../models/transaction.model.js";

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
