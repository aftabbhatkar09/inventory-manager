import Transactions from "../models/transaction.model.js";

export const getPartyLedger = async (partyId) => {
  const transactions = await Transactions.find({ party: partyId });

  let totalCredit = 0;
  let totalDebit = 0;

  transactions.forEach((txn) => {
    if (txn.type === "sale") {
      totalCredit = +txn.totalAmount - txn.paidAmount;
    } else if (txn.type === "purchase") {
      totalDebit += txn.totalAmount - txn.paidAmount;
    }
  });

  const balance = totalCredit - totalDebit;

  return {
    totalCredit,
    totalDebit,
    balance,
  };
};

export const getPartyLedgerWithEntries = async (partyId) => {
  const transactions = await Transactions.find({ party: partyId })
    .populate("products.product")
    .sort({
      createdAt: 1,
    });

  let runningBalance = 0;

  const entries = [];

  transactions.forEach((txn) => {
    txn.products.forEach((item) => {
      const amount = item.quantity * item.price;

      if (txn.type === "sale") {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }

      entries.push({
        _id: txn._id,
        date: txn.createdAt,
        type: txn.type,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        amount,
        balance: runningBalance,
      });
    });
  });

  return entries;
};
