import Transactions from "../models/transaction.model.js";
import Party from "../models/party.model.js";

export const getPartyLedger = async (partyId) => {
  const party = await Party.findById(partyId);
  const transactions = await Transactions.find({ party: partyId });

  let totalCredit = 0;
  let totalDebit = 0;

  transactions.forEach((txn) => {
    if (txn.type === "sale") {
      totalCredit += txn.remainingAmount;
    } else if (txn.type === "purchase") {
      totalDebit += txn.remainingAmount;
    }
  });

  const openingBalance = party?.openingBalance || 0;
  const balance = openingBalance + totalCredit - totalDebit;

  return {
    openingBalance,
    totalCredit,
    totalDebit,
    balance,
  };
};

// One entry per transaction (not per product line), with the running balance
// driven by remainingAmount so it always agrees with getPartyLedger's summary.
export const getPartyLedgerWithEntries = async (partyId) => {
  const party = await Party.findById(partyId);
  const transactions = await Transactions.find({ party: partyId })
    .populate("products.product")
    .sort({
      createdAt: 1,
    });

  let runningBalance = party?.openingBalance || 0;

  const entries = [];

  if (runningBalance !== 0) {
    entries.push({
      _id: "opening-balance",
      date: party?.createdAt,
      type: "opening",
      description: "Opening Balance",
      totalAmount: runningBalance,
      paidAmount: 0,
      remainingAmount: runningBalance,
      balance: runningBalance,
    });
  }

  transactions.forEach((txn) => {
    if (txn.type === "sale") {
      runningBalance += txn.remainingAmount;
    } else {
      runningBalance -= txn.remainingAmount;
    }

    entries.push({
      _id: txn._id,
      date: txn.createdAt,
      type: txn.type,
      description: txn.products
        .map((item) => `${item.product?.name || "Unknown product"} x${item.quantity}`)
        .join(", "),
      totalAmount: txn.totalAmount,
      paidAmount: txn.paidAmount,
      remainingAmount: txn.remainingAmount,
      balance: runningBalance,
    });
  });

  return entries;
};
