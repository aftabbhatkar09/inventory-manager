import Transactions from "../models/transaction.model.js";
import Payments from "../models/payment.model.js";
import Party from "../models/party.model.js";

export const getPartyLedger = async (partyId) => {
  const party = await Party.findById(partyId);
  const transactions = await Transactions.find({ party: partyId });
  const payments = await Payments.find({ party: partyId });

  let totalCredit = 0;
  let totalDebit = 0;

  transactions.forEach((txn) => {
    if (txn.type === "sale") {
      totalCredit += txn.remainingAmount;
    } else if (txn.type === "purchase") {
      totalDebit += txn.remainingAmount;
    }
  });

  let paymentsReceived = 0;
  let paymentsPaid = 0;

  payments.forEach((p) => {
    if (p.type === "received") {
      paymentsReceived += p.amount;
    } else if (p.type === "paid") {
      paymentsPaid += p.amount;
    }
  });

  const openingBalance = party?.openingBalance || 0;
  const balance =
    openingBalance + totalCredit - totalDebit + paymentsPaid - paymentsReceived;

  return {
    openingBalance,
    totalCredit,
    totalDebit,
    paymentsReceived,
    paymentsPaid,
    balance,
  };
};

// One row per transaction/payment (not per product line), in chronological
// order, with the running balance driven by remainingAmount and payment
// amounts so it always agrees with getPartyLedger's summary.
export const getPartyLedgerWithEntries = async (partyId) => {
  const party = await Party.findById(partyId);
  const transactions = await Transactions.find({ party: partyId }).populate(
    "products.product",
  );
  const payments = await Payments.find({ party: partyId });

  const events = [
    ...transactions.map((txn) => ({
      _id: txn._id,
      date: txn.createdAt,
      kind: "transaction",
      type: txn.type,
      description: txn.products
        .map((item) => `${item.product?.name || "Unknown product"} x${item.quantity}`)
        .join(", "),
      totalAmount: txn.totalAmount,
      paidAmount: txn.paidAmount,
      remainingAmount: txn.remainingAmount,
    })),
    ...payments.map((p) => ({
      _id: p._id,
      date: p.createdAt,
      kind: "payment",
      type: p.type,
      description:
        p.note || `${p.paymentMode} payment ${p.type === "received" ? "received" : "made"}`,
      totalAmount: p.amount,
      paidAmount: p.amount,
      remainingAmount: 0,
    })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  let runningBalance = party?.openingBalance || 0;

  const entries = [];

  if (runningBalance !== 0) {
    entries.push({
      _id: "opening-balance",
      date: party?.createdAt,
      kind: "opening",
      type: "opening",
      description: "Opening Balance",
      totalAmount: runningBalance,
      paidAmount: 0,
      remainingAmount: runningBalance,
      balance: runningBalance,
    });
  }

  events.forEach((event) => {
    if (event.kind === "transaction") {
      runningBalance +=
        event.type === "sale" ? event.remainingAmount : -event.remainingAmount;
    } else {
      runningBalance += event.type === "paid" ? event.totalAmount : -event.totalAmount;
    }

    entries.push({ ...event, balance: runningBalance });
  });

  return entries;
};
