import { useNavigate } from "react-router-dom";

import { HashLoader } from "react-spinners";

import { FaPlus } from "react-icons/fa6";

import { useGetAllTransactionsQuery } from "../../redux/transaction/transactionApi";

const TransactionPage = () => {
  const navigate = useNavigate();

  const { data = [], isLoading } = useGetAllTransactionsQuery();

  if (isLoading)
    return (
      <div className="w-full h-full mx-auto flex justify-center items-center">
        <HashLoader color="#4b6fee" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Transactions</h1>

        <button
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => navigate("/transactions/createTransaction")}
        >
          <FaPlus className="h-5 w-5" /> Create Transaction
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        {data.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <div>
            {data.map((txn) => (
              <div
                key={txn._id}
                className="bg-gray-100 rounded-xl shadow p-4 space-y-4 mb-4"
              >
                {/* Header  */}
                <div className="flex justify-between">
                  <p className="font-semibold">
                    Type: {txn.type.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Party Name  */}
                <p className="text-sm">Party: {txn.party?.name || "N/A"}</p>

                {/* Products  */}
                <div className="text-sm">
                  {txn.products.map((p, i) => (
                    <div key={i}>
                      {p.product?.name} → Qty: {p.quantity} × ₹{p.price}
                    </div>
                  ))}
                </div>

                {/* Amount  */}
                <div className="flex justify-between text-sm font-medium">
                  <span>Total Amount: ₹{txn.totalAmount}</span>
                  <span>Paid Amount: ₹{txn.paidAmount}</span>
                  <span>Remaining: ₹{txn.remainingAmount}</span>
                </div>

                {/* Payment Mode  */}
                <p className="text-xs text-gray-500">
                  Payment Mode: {txn.paymentMode}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionPage;
