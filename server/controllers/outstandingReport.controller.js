import Transaction from "../models/transaction.model.js";
import Party from "../models/party.model.js";

export const getOutstandingReport = async (req, res) => {
  try {
    const report = await Transaction.aggregate([
      {
        $group: {
          _id: "$party",

          totalCredit: {
            $sum: {
              $cond: [{ $eq: ["$type", "sale"] }, "$totalAmount", 0],
            },
          },

          totalDebit: {
            $sum: {
              $cond: [{ $eq: ["$type", "purchase"] }, "$totalAmount", 0],
            },
          },
        },
      },

      {
        $addFields: {
          balance: {
            $subtract: ["$totalCredit", "$totalDebit"],
          },
        },
      },

      {
        $lookup: {
          from: "parties",
          localField: "_id",
          foreignField: "_id",
          as: "partyDetails",
        },
      },

      {
        $unwind: "$partyDetails",
      },

      {
        $project: {
          _id: 0,

          partyId: "$partyDetails._id",
          partyName: "$partyDetails.name",
          phone: "$partyDetails.phone",
          type: "$partyDetails.type",

          totalCredit: 1,
          totalDebit: 1,
          balance: 1,
        },
      },
    ]);

    console.log(report);

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching outstanding report",
      error: error.message,
    });
  }
};
