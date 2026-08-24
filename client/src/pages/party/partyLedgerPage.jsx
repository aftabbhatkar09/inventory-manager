import { useParams, useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import {
  useGetPartyLedgerQuery,
  useGetPartyLedgerEntriesQuery,
} from "../../redux/party/partyApi";

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

  if (error) return <p>Error Fetching Party Ledger</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Party Ledger</h1>
        <button
          onClick={() => navigate("/parties")}
          className=" flex items-center gap-2 text-md font-semibold bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <MdOutlineKeyboardBackspace className="h-6 w-6" /> Back
        </button>
      </div>

      {/* Summary  */}
      <div className="bg-white p-4 rounded shadow flex justify-between space-y-3 flex-wrap gap-2">
        <p>
          <strong>Opening Balance: </strong> ₹{summary?.openingBalance}
        </p>

        <p>
          <strong>Total Credit: </strong> ₹{summary?.totalCredit}
        </p>

        <p>
          <strong>Total Debit: </strong> ₹{summary?.totalDebit}
        </p>

        <p>
          <strong>Balance:</strong>{" "}
          <span
            className={
              summary?.balance >= 0 ? "text-green-600" : "text-red-600"
            }
          >
            ₹{summary?.balance}
          </span>
        </p>
      </div>

      {/* Ledger Entries */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Ledger Entries</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left">Date</th>
              <th className="text-left">Type</th>
              <th className="text-left">Details</th>
              <th className="text-right">Total</th>
              <th className="text-right">Paid</th>
              <th className="text-right">Remaining</th>
              <th className="text-right">Balance</th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry) => (
              <tr key={entry._id} className="border-b">
                <td>
                  {entry.date ? new Date(entry.date).toLocaleDateString() : "-"}
                </td>
                <td className="capitalize">{entry.type}</td>
                <td>{entry.description}</td>
                <td className="text-right">₹{entry.totalAmount}</td>
                <td className="text-right">₹{entry.paidAmount}</td>
                <td
                  className={`text-right ${
                    entry.remainingAmount < 0
                      ? "text-green-600"
                      : entry.type === "sale"
                        ? "text-green-600"
                        : entry.type === "purchase"
                          ? "text-red-600"
                          : ""
                  }`}
                >
                  {entry.remainingAmount < 0 ? (
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
                <td className="text-right">₹{entry.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartyLedgerPage;
