import Transaction from "../models/transaction.model.js";

export const getProductStockById = async (productId) => {
  const transactions = await Transaction.find({
    "products.product": productId,
  });

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
