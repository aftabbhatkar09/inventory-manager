import Party from "../models/party.model.js";

// Per-party outstanding summary, starting from Party (not Transaction) so a
// party with only an opening balance and no transactions yet still appears.
//
// balance = openingBalance
//         + totalCredit (unpaid from sales)   - totalDebit (unpaid from purchases)
//         + paymentsPaid (money we handed out) - paymentsReceived (money we collected)
export const getOutstandingSummary = async () => {
  const report = await Party.aggregate([
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "party",
        as: "transactions",
      },
    },
    {
      $lookup: {
        from: "payments",
        localField: "_id",
        foreignField: "party",
        as: "payments",
      },
    },
    {
      $addFields: {
        totalCredit: {
          $sum: {
            $map: {
              input: "$transactions",
              as: "t",
              in: {
                $cond: [
                  { $eq: ["$$t.type", "sale"] },
                  "$$t.remainingAmount",
                  0,
                ],
              },
            },
          },
        },
        totalDebit: {
          $sum: {
            $map: {
              input: "$transactions",
              as: "t",
              in: {
                $cond: [
                  { $eq: ["$$t.type", "purchase"] },
                  "$$t.remainingAmount",
                  0,
                ],
              },
            },
          },
        },
        paymentsReceived: {
          $sum: {
            $map: {
              input: "$payments",
              as: "p",
              in: {
                $cond: [{ $eq: ["$$p.type", "received"] }, "$$p.amount", 0],
              },
            },
          },
        },
        paymentsPaid: {
          $sum: {
            $map: {
              input: "$payments",
              as: "p",
              in: { $cond: [{ $eq: ["$$p.type", "paid"] }, "$$p.amount", 0] },
            },
          },
        },
        openingBalance: { $ifNull: ["$openingBalance", 0] },
      },
    },
    {
      $addFields: {
        balance: {
          $add: [
            "$openingBalance",
            { $subtract: ["$totalCredit", "$totalDebit"] },
            { $subtract: ["$paymentsPaid", "$paymentsReceived"] },
          ],
        },
      },
    },
    {
      $project: {
        _id: 0,
        partyId: "$_id",
        partyName: "$name",
        phone: 1,
        type: 1,
        openingBalance: 1,
        totalCredit: 1,
        totalDebit: 1,
        paymentsReceived: 1,
        paymentsPaid: 1,
        balance: 1,
      },
    },
    { $sort: { partyName: 1 } },
  ]);

  return report;
};
