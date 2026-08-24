import { vi } from "vitest";
import Product from "../models/product.model.js";
import Party from "../models/party.model.js";
import Godown from "../models/godown.model.js";

let sku = 0;

export const makeProduct = (overrides = {}) =>
  Product.create({ name: "Product", sku: `SKU-${++sku}`, ...overrides });

export const makeParty = (overrides = {}) =>
  Party.create({ name: "Party", type: ["customer"], ...overrides });

export const makeGodown = (overrides = {}) =>
  Godown.create({ name: "Godown", ...overrides });

export const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};
