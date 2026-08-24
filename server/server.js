import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import productRoutes from "./routes/product.route.js";
import partyRoutes from "./routes/party.routes.js";
import transactionRoutes from "./routes/transaction.route.js";
import outstandingReportRoutes from "./routes/outstandingReport.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", outstandingReportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Server PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
