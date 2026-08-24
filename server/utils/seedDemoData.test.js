import { describe, it, expect } from "vitest";

import Product from "../models/product.model.js";
import Party from "../models/party.model.js";
import Transaction from "../models/transaction.model.js";
import Godown from "../models/godown.model.js";
import StockTransfer from "../models/stockTransfer.model.js";
import User from "../models/user.model.js";
import { seedDemoData } from "./seedDemoData.js";

describe("seedDemoData", () => {
  it("populates products, parties, godowns, transactions, and a stock transfer", async () => {
    const counts = await seedDemoData();

    expect(await Product.countDocuments()).toBe(counts.products);
    expect(await Party.countDocuments()).toBe(counts.parties);
    expect(await Godown.countDocuments()).toBe(counts.godowns);
    expect(await Transaction.countDocuments()).toBe(counts.transactions);
    expect(await StockTransfer.countDocuments()).toBe(counts.stockTransfers);
  });

  it("is safe to run repeatedly -- no duplicate accumulation", async () => {
    await seedDemoData();
    const counts = await seedDemoData();

    expect(await Product.countDocuments()).toBe(counts.products);
    expect(await Transaction.countDocuments()).toBe(counts.transactions);
  });

  it("never touches the User collection", async () => {
    await User.create({
      username: "untouched",
      passwordHash: "irrelevant-hash",
      role: "super_admin",
    });

    await seedDemoData();

    expect(await User.findOne({ username: "untouched" })).not.toBeNull();
  });
});
