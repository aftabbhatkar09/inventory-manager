import { useParams, useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import {
  useGetPartyLedgerQuery,
  useGetPartyLedgerEntriesQuery,
} from "../../redux/party/partyApi";

const TYPE_LABELS = {
  sale: "Sale",
  purchase: "Purchase",
  opening: "Opening",
  received: "Payment In",
  paid: "Payment Out",
};

const StatTile = ({ label, value, tone = "default" }) => {
  const toneClass =
    tone === "good"
      ? "text-green-600"
      : tone === "bad"
        ? "text-red-600"
        : "text-gray-900";

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${toneClass}`}>{value}</p>
    </div>
  );
};

const PartyLedgerPage = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const { data: summary, isLoading, error } = useGetPartyLedgerQuery(id);
  const { data: entries = [] } = useGetPartyLedgerEntriesQuery(id);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full w-full">
        <HashLoader />
      </div>
    );

  if (error) return <p className="text-red-600">Error fetching party ledger.</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Party Ledger</h1>
        <button
          onClick={() => navigate("/parties")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <MdOutlineKeyboardBackspace className="h-5 w-5" /> Back
        </button>
      </div>

      {/* Summary  */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatTile label="Opening Balance" value={`₹${summary?.openingBalance}`} />
        <StatTile label="Total Credit" value={`₹${summary?.totalCredit}`} />
        <StatTile label="Total Debit" value={`₹${summary?.totalDebit}`} />
        <StatTile
          label="Payments Received"
          value={`₹${summary?.paymentsReceived}`}
        />
        <StatTile label="Payments Paid" value={`₹${summary?.paymentsPaid}`} />
        <StatTile
          label="Balance"
          value={`₹${summary?.balance}`}
          tone={summary?.balance >= 0 ? "good" : "bad"}
        />
      </div>

      {/* Ledger Entries */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <h2 className="font-semibold px-4 pt-4 pb-2">Ledger Entries</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Details</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold">Paid</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Remaining
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Balance
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No ledger entries yet.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {entry.date
                        ? new Date(entry.date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {TYPE_LABELS[entry.type] || entry.type}
                    </td>
                    <td className="px-4 py-3">{entry.description}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      ₹{entry.totalAmount}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      ₹{entry.paidAmount}
                    </td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums ${
                        entry.kind !== "transaction"
                          ? "text-gray-300"
                          : entry.remainingAmount < 0
                            ? "text-green-600"
                            : entry.type === "sale"
                              ? "text-green-600"
                              : entry.type === "purchase"
                                ? "text-red-600"
                                : ""
                      }`}
                    >
                      {entry.kind !== "transaction" ? (
                        "—"
                      ) : entry.remainingAmount < 0 ? (
                        <>Advance ₹{Math.abs(entry.remainingAmount)}</>
                      ) : (
                        <>
                          {entry.type === "sale"
                            ? "+"
                            : entry.type === "purchase"
                              ? "-"
                              : ""}
                          ₹{entry.remainingAmount}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      ₹{entry.balance}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartyLedgerPage;
