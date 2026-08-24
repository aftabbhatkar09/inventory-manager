import { getOutstandingSummary } from "../utils/report.util.js";

export const getOutstandingReport = async (req, res) => {
  try {
    const report = await getOutstandingSummary();

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching outstanding report",
      error: error.message,
    });
  }
};
