import { describe, it, expect } from "vitest";

import Transaction from "../models/transaction.model.js";
import Payment from "../models/payment.model.js";
import { getPartyLedger, getPartyLedgerWithEntries } from "./ledger.util.js";
import { makeProduct, makeParty, makeGodown } from "../test/helpers.js";

describe("getPartyLedger", () => {
  it("treats sale remainingAmount as credit and purchase remainingAmount as debit", async () => {
    const product = await makeProduct();
    const party = await makeParty();
    const godown = await makeGodown();

    await Transaction.create({
      type: "sale",
      party: party._id,
      godown: godown._id,
      products: [{ product: product._id, quantity: 2, price: 100 }],
      totalAmount: 200,
      paidAmount: 50,
      remainingAmount: 150,
    });

    await Transaction.create({
      type: "purchase",
      party: party._id,
      godown: godown._id,
      products: [{ product: product._id, quantity: 1, price: 60 }],
      totalAmount: 60,
      paidAmount: 0,
      remainingAmount: 60,
    });

    const ledger = await getPartyLedger(party._id);

    expect(ledger.totalCredit).toBe(150);
    expect(ledger.totalDebit).toBe(60);
  });

  it("applies payments received/paid and opening balance to the final balance", async () => {
    const party = await makeParty({ openingBalance: 100 });

    await Payment.create({ party: party._id, type: "received", amount: 40 });
    await Payment.create({ party: party._id, type: "paid", amount: 15 });

    const ledger = await getPartyLedger(party._id);

    // balance = openingBalance + totalCredit - totalDebit + paymentsPaid - paymentsReceived
    expect(ledger.paymentsReceived).toBe(40);
    expect(ledger.paymentsPaid).toBe(15);
    expect(ledger.balance).toBe(100 + 0 - 0 + 15 - 40);
  });

  it("defaults openingBalance to 0 when the party has none set", async () => {
    const party = await makeParty();

    const ledger = await getPartyLedger(party._id);

    expect(ledger.openingBalance).toBe(0);
    expect(ledger.balance).toBe(0);
  });
});

describe("getPartyLedgerWithEntries", () => {
  it("orders entries chronologically and ends at the same balance as getPartyLedger", async () => {
    const product = await makeProduct();
    const party = await makeParty({ openingBalance: 50 });
    const godown = await makeGodown();

    const older = await Transaction.create({
      type: "sale",
      party: party._id,
      godown: godown._id,
      products: [{ product: product._id, quantity: 1, price: 100 }],
      totalAmount: 100,
      paidAmount: 100,
      remainingAmount: 0,
      createdAt: new Date("2026-01-01"),
    });

    const newer = await Payment.create({
      party: party._id,
      type: "received",
      amount: 30,
      createdAt: new Date("2026-02-01"),
    });

    const entries = await getPartyLedgerWithEntries(party._id);
    const nonOpening = entries.filter((e) => e.kind !== "opening");

    expect(nonOpening[0]._id.toString()).toBe(older._id.toString());
    expect(nonOpening[1]._id.toString()).toBe(newer._id.toString());

    const summary = await getPartyLedger(party._id);
    const finalEntry = entries[entries.length - 1];

    expect(finalEntry.balance).toBe(summary.balance);
  });

  it("omits the opening-balance row when the party has no opening balance", async () => {
    const party = await makeParty();

    const entries = await getPartyLedgerWithEntries(party._id);

    expect(entries.some((e) => e.kind === "opening")).toBe(false);
  });

  it("includes the opening-balance row first when set", async () => {
    const party = await makeParty({ openingBalance: 500 });

    const entries = await getPartyLedgerWithEntries(party._id);

    expect(entries[0].kind).toBe("opening");
    expect(entries[0].balance).toBe(500);
  });
});
