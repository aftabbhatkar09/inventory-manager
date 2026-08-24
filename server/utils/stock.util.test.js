import { describe, it, expect } from "vitest";

import Transaction from "../models/transaction.model.js";
import StockTransfer from "../models/stockTransfer.model.js";
import {
  getStockMap,
  getProductStockById,
  getGodownStockMap,
  getProductStockInGodown,
} from "./stock.util.js";
import { makeProduct, makeParty, makeGodown } from "../test/helpers.js";

const makeTransaction = async ({ type, product, godown, party, quantity, price = 10 }) =>
  Transaction.create({
    type,
    party: party._id,
    godown: godown?._id,
    products: [{ product: product._id, quantity, price }],
    totalAmount: quantity * price,
  });

describe("getStockMap", () => {
  it("adds purchases and subtracts sales per product", async () => {
    const product = await makeProduct();
    const party = await makeParty();
    const godown = await makeGodown();

    await makeTransaction({ type: "purchase", product, godown, party, quantity: 10 });
    await makeTransaction({ type: "sale", product, godown, party, quantity: 4 });

    const map = await getStockMap();

    expect(map[product._id.toString()]).toBe(6);
  });

  it("keeps stock for different products independent", async () => {
    const productA = await makeProduct();
    const productB = await makeProduct();
    const party = await makeParty();
    const godown = await makeGodown();

    await makeTransaction({ type: "purchase", product: productA, godown, party, quantity: 5 });
    await makeTransaction({ type: "purchase", product: productB, godown, party, quantity: 20 });

    const map = await getStockMap();

    expect(map[productA._id.toString()]).toBe(5);
    expect(map[productB._id.toString()]).toBe(20);
  });
});

describe("getProductStockById", () => {
  it("computes net stock across purchases and sales", async () => {
    const product = await makeProduct();
    const party = await makeParty();
    const godown = await makeGodown();

    await makeTransaction({ type: "purchase", product, godown, party, quantity: 15 });
    await makeTransaction({ type: "sale", product, godown, party, quantity: 6 });

    const stock = await getProductStockById(product._id);

    expect(stock).toBe(9);
  });

  it("excludes the given transaction id (edit-in-progress scenario)", async () => {
    const product = await makeProduct();
    const party = await makeParty();
    const godown = await makeGodown();

    await makeTransaction({ type: "purchase", product, godown, party, quantity: 15 });
    const saleToExclude = await makeTransaction({
      type: "sale",
      product,
      godown,
      party,
      quantity: 6,
    });

    const stock = await getProductStockById(product._id, saleToExclude._id);

    expect(stock).toBe(15);
  });
});

describe("getGodownStockMap", () => {
  it("attributes transaction stock to the transaction's own godown", async () => {
    const product = await makeProduct();
    const party = await makeParty();
    const godownA = await makeGodown();
    const godownB = await makeGodown();

    await makeTransaction({ type: "purchase", product, godown: godownA, party, quantity: 10 });
    await makeTransaction({ type: "purchase", product, godown: godownB, party, quantity: 4 });
    await makeTransaction({ type: "sale", product, godown: godownA, party, quantity: 3 });

    const map = await getGodownStockMap();
    const productMap = map[product._id.toString()];

    expect(productMap[godownA._id.toString()]).toBe(7);
    expect(productMap[godownB._id.toString()]).toBe(4);
  });

  it("skips legacy transactions that have no godown", async () => {
    const product = await makeProduct();
    const party = await makeParty();

    // godown is a required field today, but older documents saved before
    // that constraint existed can still have it missing -- bypass Mongoose
    // validation to simulate one of those pre-existing records.
    await Transaction.collection.insertOne({
      type: "purchase",
      party: party._id,
      products: [{ product: product._id, quantity: 10, price: 5 }],
      totalAmount: 50,
      paidAmount: 0,
      remainingAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const map = await getGodownStockMap();

    expect(map[product._id.toString()]).toBeUndefined();
  });

  it("moves stock between godowns on transfer", async () => {
    const product = await makeProduct();
    const party = await makeParty();
    const godownA = await makeGodown();
    const godownB = await makeGodown();

    await makeTransaction({ type: "purchase", product, godown: godownA, party, quantity: 10 });
    await StockTransfer.create({
      product: product._id,
      fromGodown: godownA._id,
      toGodown: godownB._id,
      quantity: 4,
    });

    const map = await getGodownStockMap();
    const productMap = map[product._id.toString()];

    expect(productMap[godownA._id.toString()]).toBe(6);
    expect(productMap[godownB._id.toString()]).toBe(4);
  });
});

describe("getProductStockInGodown", () => {
  it("only counts transactions and transfers touching that godown", async () => {
    const product = await makeProduct();
    const party = await makeParty();
    const godownA = await makeGodown();
    const godownB = await makeGodown();

    await makeTransaction({ type: "purchase", product, godown: godownA, party, quantity: 10 });
    await makeTransaction({ type: "purchase", product, godown: godownB, party, quantity: 100 });
    await StockTransfer.create({
      product: product._id,
      fromGodown: godownA._id,
      toGodown: godownB._id,
      quantity: 3,
    });

    const stockA = await getProductStockInGodown(product._id, godownA._id);
    const stockB = await getProductStockInGodown(product._id, godownB._id);

    expect(stockA).toBe(7);
    expect(stockB).toBe(103);
  });

  it("excludes the given transaction id when checking available stock for an edit", async () => {
    const product = await makeProduct();
    const party = await makeParty();
    const godown = await makeGodown();

    await makeTransaction({ type: "purchase", product, godown, party, quantity: 10 });
    const saleToExclude = await makeTransaction({
      type: "sale",
      product,
      godown,
      party,
      quantity: 6,
    });

    const stock = await getProductStockInGodown(product._id, godown._id, saleToExclude._id);

    expect(stock).toBe(10);
  });
});
