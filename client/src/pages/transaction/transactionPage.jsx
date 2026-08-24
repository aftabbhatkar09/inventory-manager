import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { HashLoader } from "react-spinners";

import { TbEdit } from "react-icons/tb";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

import SearchInput from "../../components/SearchInput";

import {
  useGetAllTransactionsQuery,
  useDeleteTransactionMutation,
} from "../../redux/transaction/transactionApi";

const TransactionPage = () => {
  const navigate = useNavigate();

  const { data = [], isLoading } = useGetAllTransactionsQuery();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [search, setSearch] = useState("");

  const filteredData = data.filter((txn) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      txn.type,
      txn.party?.name,
      txn.godown?.name,
      txn.paymentMode,
      ...txn.products.map((p) => p.product?.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id).unwrap();
        toast.success("Transaction deleted successfully");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete transaction");
      }
    }
  };

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

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by party, product, godown, or type"
      />

      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        {filteredData.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">
            {search
              ? "No transactions match your search."
              : "No transactions found."}
          </p>
        ) : (
          <div>
            {filteredData.map((txn) => (
              <div
                key={txn._id}
                className="bg-gray-100 rounded-xl shadow p-4 space-y-4 mb-4"
              >
                {/* Header  */}
                <div className="flex justify-between items-center">
                  <p className="font-semibold">
                    Type: {txn.type.toUpperCase()}
                  </p>

                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </p>

                    <button
                      onClick={() =>
                        navigate(`/transactions/editTransaction/${txn._id}`)
                      }
                    >
                      <TbEdit className="text-green-600 h-6 w-6 hover:text-green-700" />
                    </button>

                    <button onClick={() => handleDelete(txn._id)}>
                      <MdOutlineDeleteForever className="text-red-600 h-6 w-6 hover:text-red-700" />
                    </button>
                  </div>
                </div>

                {/* Party Name  */}
                <p className="text-sm">Party: {txn.party?.name || "N/A"}</p>
                <p className="text-sm">Godown: {txn.godown?.name || "N/A"}</p>

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
                  {txn.remainingAmount < 0 ? (
                    <span className="text-green-600">
                      Advance: ₹{Math.abs(txn.remainingAmount)}
                    </span>
                  ) : (
                    <span>Remaining: ₹{txn.remainingAmount}</span>
                  )}
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
