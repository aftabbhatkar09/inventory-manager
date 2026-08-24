import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { ensureAdminUser } from "./utils/auth.util.js";
import { requireAuth } from "./middleware/auth.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.route.js";
import partyRoutes from "./routes/party.routes.js";
import transactionRoutes from "./routes/transaction.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import godownRoutes from "./routes/godown.routes.js";
import stockTransferRoutes from "./routes/stockTransfer.routes.js";
import outstandingReportRoutes from "./routes/outstandingReport.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

dotenv.config();

connectDB().then(ensureAdminUser);

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", requireAuth, productRoutes);
app.use("/api/parties", requireAuth, partyRoutes);
app.use("/api/transactions", requireAuth, transactionRoutes);
app.use("/api/payments", requireAuth, paymentRoutes);
app.use("/api/godowns", requireAuth, godownRoutes);
app.use("/api/stock-transfers", requireAuth, stockTransferRoutes);
app.use("/api/reports", requireAuth, outstandingReportRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Server PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
