// Wipes Product/Party/Transaction/Payment/Godown/StockTransfer and reloads a
// fresh, internally-consistent dataset for manual testing: run with
// `npm run seed` from server/.
import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import Product from "./models/product.model.js";
import Party from "./models/party.model.js";
import Transaction from "./models/transaction.model.js";
import Payment from "./models/payment.model.js";
import Godown from "./models/godown.model.js";
import StockTransfer from "./models/stockTransfer.model.js";

dotenv.config();

const productsSeed = [
  { name: "Notebook", sku: "NB-001", category: "Stationery", unit: "pcs" },
  { name: "Steel Bolt", sku: "BOLT-002", category: "Hardware", unit: "pcs" },
  { name: "Cooking Oil", sku: "OIL-003", category: "Grocery", unit: "ltr" },
  { name: "Cement Bag", sku: "CEM-004", category: "Construction", unit: "kg" },
  { name: "LED Bulb", sku: "LED-005", category: "Electrical", unit: "pcs" },
];

const godownsSeed = [
  { name: "Main Warehouse", address: "Plot 14, MIDC Industrial Area" },
  { name: "Branch Store", address: "Shop 3, Station Road" },
];

const partiesSeed = [
  { name: "Rahul Traders", phone: "9820011111", type: ["customer"], openingBalance: 0 },
  { name: "Sunrise Suppliers", phone: "9820022222", type: ["supplier"], openingBalance: -2000 },
  { name: "Metro Hardware", phone: "9820033333", type: ["customer", "supplier"], openingBalance: 500 },
  { name: "Amit Enterprises", phone: "9820044444", type: ["customer"], openingBalance: 1000 },
  { name: "Global Traders", phone: "9820055555", type: ["supplier"], openingBalance: 0 },
  { name: "City Mart", phone: "9820066666", type: ["customer"], openingBalance: 0 },
];

// `monthsAgo` relative to today, so re-running the seed later always lands
// inside the dashboard's rolling "last 6 months" window.
const dateFor = (monthsAgo, day) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(day);
  d.setHours(10, 0, 0, 0);
  return d;
};

const line = (product, quantity, price) => ({
  product: product._id,
  quantity,
  price,
});

const run = async () => {
  await connectDB();

  console.log(
    "Clearing existing products, parties, transactions, payments, godowns, and stock transfers...",
  );
  await Promise.all([
    Product.deleteMany({}),
    Party.deleteMany({}),
    Transaction.deleteMany({}),
    Payment.deleteMany({}),
    Godown.deleteMany({}),
    StockTransfer.deleteMany({}),
  ]);

  console.log("Seeding products...");
  const [notebook, bolt, oil, cement, bulb] =
    await Product.insertMany(productsSeed);

  console.log("Seeding parties...");
  const [rahul, sunrise, metro, amit, global, city] =
    await Party.insertMany(partiesSeed);

  console.log("Seeding godowns...");
  const [mainWarehouse, branchStore] = await Godown.insertMany(godownsSeed);

  console.log("Seeding transactions...");

  // Every product is purchased before it is sold, in chronological order,
  // so stock never goes negative at any point in this history.
  const transactionsSeed = [
    // Month -5 (5 months ago)
    {
      type: "purchase",
      party: sunrise._id,
      products: [line(notebook, 200, 10), line(bolt, 500, 2)],
      paidAmount: 1500,
      paymentMode: "bank",
      createdAt: dateFor(5, 5),
    },
    {
      type: "sale",
      party: rahul._id,
      products: [line(notebook, 50, 15)],
      paidAmount: 750,
      paymentMode: "cash",
      createdAt: dateFor(5, 12),
    },

    // Month -4
    {
      type: "purchase",
      party: global._id,
      products: [line(oil, 300, 80), line(cement, 1000, 5)],
      paidAmount: 20000,
      paymentMode: "bank",
      createdAt: dateFor(4, 4),
    },
    {
      type: "sale",
      party: amit._id,
      products: [line(bolt, 100, 3), line(oil, 20, 100)],
      paidAmount: 2300,
      paymentMode: "upi",
      createdAt: dateFor(4, 18),
    },

    // Month -3
    {
      type: "purchase",
      party: sunrise._id,
      products: [line(bulb, 400, 8)],
      paidAmount: 1000,
      paymentMode: "cheque",
      createdAt: dateFor(3, 6),
    },
    {
      type: "sale",
      party: city._id,
      products: [line(notebook, 30, 15), line(cement, 50, 8)],
      paidAmount: 850,
      paymentMode: "cash",
      createdAt: dateFor(3, 14),
    },
    {
      type: "sale",
      party: metro._id,
      products: [line(oil, 40, 100)],
      paidAmount: 2000,
      paymentMode: "upi",
      createdAt: dateFor(3, 22),
    },

    // Month -2
    {
      type: "purchase",
      party: global._id,
      products: [line(bolt, 300, 2)],
      paidAmount: 600,
      paymentMode: "bank",
      createdAt: dateFor(2, 3),
    },
    {
      type: "sale",
      party: rahul._id,
      products: [line(bulb, 60, 12), line(bolt, 50, 3)],
      paidAmount: 500,
      paymentMode: "cash",
      createdAt: dateFor(2, 20),
    },

    // Month -1
    {
      type: "purchase",
      party: sunrise._id,
      products: [line(cement, 500, 5)],
      paidAmount: 2500,
      paymentMode: "bank",
      createdAt: dateFor(1, 8),
    },
    {
      type: "sale",
      party: amit._id,
      products: [line(notebook, 40, 15), line(oil, 10, 100)],
      paidAmount: 1600,
      paymentMode: "upi",
      createdAt: dateFor(1, 25),
    },

    // This month
    {
      type: "purchase",
      party: global._id,
      products: [line(bulb, 100, 8)],
      paidAmount: 300,
      paymentMode: "cash",
      createdAt: dateFor(0, 5),
    },
    {
      type: "sale",
      party: city._id,
      products: [line(bolt, 80, 3), line(cement, 30, 8)],
      paidAmount: 480,
      paymentMode: "card",
      createdAt: dateFor(0, 15),
    },
  ];

  for (const txn of transactionsSeed) {
    const totalAmount = txn.products.reduce(
      (sum, p) => sum + p.quantity * p.price,
      0,
    );
    const remainingAmount = totalAmount - txn.paidAmount;

    // All seeded transactions land in the Main Warehouse -- the stock
    // transfer below demonstrates moving some of it to the Branch Store.
    await Transaction.create({
      ...txn,
      godown: mainWarehouse._id,
      totalAmount,
      remainingAmount,
    });
  }

  console.log("Seeding a stock transfer...");
  await StockTransfer.create({
    product: notebook._id,
    fromGodown: mainWarehouse._id,
    toGodown: branchStore._id,
    quantity: 20,
    note: "Restocking branch store",
    createdAt: dateFor(0, 20),
  });

  console.log("Seed complete:");
  console.log(`  ${productsSeed.length} products`);
  console.log(`  ${partiesSeed.length} parties`);
  console.log(`  ${godownsSeed.length} godowns`);
  console.log(`  ${transactionsSeed.length} transactions`);
  console.log(`  1 stock transfer`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
