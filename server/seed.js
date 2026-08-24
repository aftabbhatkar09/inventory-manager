// Wipes Product/Party/Transaction/Payment/Godown/StockTransfer and reloads a
// fresh, internally-consistent dataset for manual testing: run with
// `npm run seed` from server/.
import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { seedDemoData } from "./utils/seedDemoData.js";

dotenv.config();

const run = async () => {
  await connectDB();

  console.log(
    "Clearing existing products, parties, transactions, payments, godowns, and stock transfers...",
  );

  const counts = await seedDemoData();

  console.log("Seed complete:");
  console.log(`  ${counts.products} products`);
  console.log(`  ${counts.parties} parties`);
  console.log(`  ${counts.godowns} godowns`);
  console.log(`  ${counts.transactions} transactions`);
  console.log(`  ${counts.stockTransfers} stock transfer(s)`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
