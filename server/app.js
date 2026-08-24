import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

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

const app = express();

// Middleware
app.use(helmet());
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

// Anything that didn't match a route above
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Safety net for anything a controller's own try/catch didn't handle --
// a thrown error, a malformed JSON body from express.json(), etc.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.status ? err.message : "Internal server error" });
});

export default app;
