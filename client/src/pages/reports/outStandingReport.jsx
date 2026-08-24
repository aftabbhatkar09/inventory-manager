import { HashLoader } from "react-spinners";

import { useGetOutStandingReportQuery } from "../../redux/report/reportApi";

const OutStandingReport = () => {
  const { data = [], isLoading, isError } = useGetOutStandingReportQuery();

  if (isLoading)
    return (
      <div className="w-full h-full mx-auto flex justify-center items-center">
        <HashLoader color="#4b6fee" />
      </div>
    );

  if (isError) return <p className="text-red-600">Something went wrong.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Outstanding Report</h1>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-semibold">
                  Party Name
                </th>
                <th className="px-4 py-3 text-left font-semibold">Phone</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Opening
                </th>
                <th className="px-4 py-3 text-right font-semibold">Credit</th>
                <th className="px-4 py-3 text-right font-semibold">Debit</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Paid In
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Paid Out
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Receivable
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Payable
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No outstanding data found.
                  </td>
                </tr>
              ) : (
                data.map((party) => (
                  <tr
                    key={party.partyId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {party.partyName}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {party.phone}
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">
                      {party.type.join(", ")}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      ₹{party.openingBalance.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      ₹{party.totalCredit.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      ₹{party.totalDebit.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      ₹{party.paymentsReceived.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      ₹{party.paymentsPaid.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {party.balance > 0 ? (
                        <span className="text-green-600">
                          ₹{party.balance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {party.balance < 0 ? (
                        <span className="text-red-600">
                          ₹{Math.abs(party.balance).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
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

export default OutStandingReport;
