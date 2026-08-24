import { describe, it, expect } from "vitest";
import mongoose from "mongoose";

import {
  createTransaction,
  updateTransaction,
} from "./transaction.controller.js";
import { makeProduct, makeParty, makeGodown, mockRes } from "../test/helpers.js";

describe("createTransaction", () => {
  it("rejects a payload missing required fields", async () => {
    const res = mockRes();

    await createTransaction({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("rejects a product id that doesn't exist", async () => {
    const party = await makeParty();
    const godown = await makeGodown();
    const res = mockRes();

    await createTransaction(
      {
        body: {
          type: "purchase",
          party: party._id,
          godown: godown._id,
          products: [{ product: new mongoose.Types.ObjectId(), quantity: 1, price: 10 }],
        },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("computes totalAmount and remainingAmount from line items", async () => {
    const product = await makeProduct();
    const party = await makeParty();
    const godown = await makeGodown();
    const res = mockRes();

    await createTransaction(
      {
        body: {
          type: "purchase",
          party: party._id,
          godown: godown._id,
          products: [{ product: product._id, quantity: 3, price: 50 }],
          paidAmount: 100,
        },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(201);
    const saved = res.json.mock.calls[0][0];
    expect(saved.totalAmount).toBe(150);
    expect(saved.remainingAmount).toBe(50);
  });

  it("blocks a sale that exceeds available stock in the godown", async () => {
    const product = await makeProduct();
    const party = await makeParty();
    const godown = await makeGodown();
    const res = mockRes();

    await createTransaction(
      {
        body: {
          type: "sale",
          party: party._id,
          godown: godown._id,
          products: [{ product: product._id, quantity: 5, price: 10 }],
        },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.message).toMatch(/Not enough stock/);
  });

  it("allows a sale once matching stock has been purchased", async () => {
    const product = await makeProduct();
    const party = await makeParty();
    const godown = await makeGodown();

    await createTransaction(
      {
        body: {
          type: "purchase",
          party: party._id,
          godown: godown._id,
          products: [{ product: product._id, quantity: 10, price: 10 }],
        },
      },
      mockRes(),
    );

    const saleRes = mockRes();

    await createTransaction(
      {
        body: {
          type: "sale",
          party: party._id,
          godown: godown._id,
          products: [{ product: product._id, quantity: 10, price: 15 }],
        },
      },
      saleRes,
    );

    expect(saleRes.status).toHaveBeenCalledWith(201);
  });
});

describe("updateTransaction", () => {
  it("excludes the transaction's own quantity when re-validating stock on edit", async () => {
    const product = await makeProduct();
    const party = await makeParty();
    const godown = await makeGodown();

    const purchaseRes = mockRes();
    await createTransaction(
      {
        body: {
          type: "purchase",
          party: party._id,
          godown: godown._id,
          products: [{ product: product._id, quantity: 10, price: 10 }],
        },
      },
      purchaseRes,
    );

    const saleRes = mockRes();
    await createTransaction(
      {
        body: {
          type: "sale",
          party: party._id,
          godown: godown._id,
          products: [{ product: product._id, quantity: 10, price: 15 }],
        },
      },
      saleRes,
    );
    const sale = saleRes.json.mock.calls[0][0];

    // Re-saving the same sale with the same quantity must not double-count
    // its own stock usage against itself.
    const updateRes = mockRes();
    await updateTransaction(
      {
        params: { id: sale._id.toString() },
        body: {
          type: "sale",
          party: party._id,
          godown: godown._id,
          products: [{ product: product._id, quantity: 10, price: 20 }],
        },
      },
      updateRes,
    );

    expect(updateRes.status).not.toHaveBeenCalled();
    const updated = updateRes.json.mock.calls[0][0];
    expect(updated.totalAmount).toBe(200);
  });
});
