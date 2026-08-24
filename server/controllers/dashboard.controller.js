import Product from "../models/product.model.js";
import Party from "../models/party.model.js";
import Transaction from "../models/transaction.model.js";
import { getStockMap } from "../utils/stock.util.js";
import { getOutstandingSummary } from "../utils/report.util.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const [productCount, parties, products, outstanding] = await Promise.all([
      Product.countDocuments({ isDeleted: false }),
      Party.find({ isDeleted: false }),
      Product.find({ isDeleted: false }),
      getOutstandingSummary(),
    ]);

    const totalCustomers = parties.filter((p) =>
      p.type.includes("customer"),
    ).length;
    const totalSuppliers = parties.filter((p) =>
      p.type.includes("supplier"),
    ).length;

    const stockMap = await getStockMap();
    const totalStockUnits = products.reduce(
      (sum, p) => sum + (stockMap[p._id.toString()] || 0),
      0,
    );

    const totalReceivable = outstanding.reduce(
      (sum, p) => sum + Math.max(p.balance, 0),
      0,
    );
    const totalPayable = outstanding.reduce(
      (sum, p) => sum + Math.max(-p.balance, 0),
      0,
    );

    res.json({
      totalProducts: productCount,
      totalParties: parties.length,
      totalCustomers,
      totalSuppliers,
      totalStockUnits,
      totalReceivable,
      totalPayable,
      netPosition: totalReceivable - totalPayable,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard summary",
      error: error.message,
    });
  }
};

// Sales vs purchases for the last `months` calendar months (default 6),
// including months with zero transactions so the chart axis stays continuous.
export const getMonthlyTrend = async (req, res) => {
  try {
    const months = 6;

    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    start.setMonth(start.getMonth() - (months - 1));

    const raw = await Transaction.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            type: "$type",
          },
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const result = [];
    const cursor = new Date(start);

    for (let i = 0; i < months; i++) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth() + 1;

      const sales = raw.find(
        (r) => r._id.year === year && r._id.month === month && r._id.type === "sale",
      );
      const purchases = raw.find(
        (r) =>
          r._id.year === year && r._id.month === month && r._id.type === "purchase",
      );

      result.push({
        month: cursor.toLocaleString("en-US", { month: "short", year: "numeric" }),
        sales: sales?.total || 0,
        purchases: purchases?.total || 0,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching monthly trend",
      error: error.message,
    });
  }
};
