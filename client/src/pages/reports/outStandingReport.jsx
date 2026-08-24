import { useGetOutStandingReportQuery } from "../../redux/report/reportApi";

const OutStandingReport = () => {
  const { data, isLoading, isError } = useGetOutStandingReportQuery();
  //   console.log(data);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Something went wrong</p>;
  }
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Outstanding Report</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-md border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Party Name</th>
              <th className="border p-2 text-left">Phone</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-right">Opening</th>
              <th className="border p-2 text-right">Credit</th>
              <th className="border p-2 text-right">Debit</th>
              <th className="border p-2 text-right">Receivable</th>
              <th className="border p-2 text-right">Payable</th>
            </tr>
          </thead>

          <tbody>
            {data?.length === 0 ? (
              <div className="p-4">
                <p>No outstanding data found</p>
              </div>
            ) : (
              data?.map((party) => (
                <tr
                  key={party.partyId}
                  className="odd:bg-white even:bg-gray-50"
                >
                  <td className="border p-2 text-left">{party.partyName}</td>
                  <td className="border p-2 text-left">{party.phone}</td>
                  <td className="border p-2 text-left">
                    {party.type.join(", ")}
                  </td>
                  <td className="border p-2 text-right">
                    ₹{party.openingBalance.toLocaleString()}
                  </td>
                  <td className="border p-2 text-right">
                    ₹{party.totalCredit.toLocaleString()}
                  </td>
                  <td className="border p-2 text-right">
                    ₹{party.totalDebit.toLocaleString()}
                  </td>
                  <td className="border p-2 text-right font-semibold text-green-600">
                    {party.balance > 0
                      ? `₹${party.balance.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="border p-2 text-right font-semibold text-red-600">
                    {party.balance < 0
                      ? `₹${Math.abs(party.balance).toLocaleString()}`
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default OutStandingReport;
