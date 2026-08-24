import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { HashLoader } from "react-spinners";

import { TbEdit } from "react-icons/tb";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import useDebouncedValue from "../../hooks/useDebouncedValue";

import {
  useGetTransactionsPagedQuery,
  useDeleteTransactionMutation,
} from "../../redux/transaction/transactionApi";

const TYPE_BADGE = {
  sale: "bg-blue-50 text-blue-700",
  purchase: "bg-orange-50 text-orange-700",
};

const PAGE_SIZE = 8;

const TransactionPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const {
    data = { data: [], total: 0, totalPages: 1 },
    isLoading,
    isFetching,
  } = useGetTransactionsPagedQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });
  const [deleteTransaction] = useDeleteTransactionMutation();

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

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

  const transactions = data.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Transactions</h1>

        <button
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
          onClick={() => navigate("/transactions/createTransaction")}
        >
          <FaPlus className="h-4 w-4" /> Create Transaction
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={handleSearchChange}
        placeholder="Search by party, product, godown, or type"
      />

      <div
        className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-300 divide-y divide-gray-300 overflow-hidden transition-opacity ${isFetching ? "opacity-60" : ""}`}
      >
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500 py-10 text-center">
            {search
              ? "No transactions match your search."
              : "No transactions found."}
          </p>
        ) : (
          transactions.map((txn) => (
            <div
              key={txn._id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              {/* Header  */}
              <div className="flex justify-between items-start gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${TYPE_BADGE[txn.type] || "bg-gray-100 text-gray-600"}`}
                  >
                    {txn.type}
                  </span>
                  <p className="font-medium text-gray-900">
                    {txn.party?.name || "N/A"}
                  </p>
                  <span className="text-xs text-gray-400">
                    · {txn.godown?.name || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <p className="text-xs text-gray-400 mr-2">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </p>

                  <button
                    onClick={() =>
                      navigate(`/transactions/editTransaction/${txn._id}`)
                    }
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                    aria-label="Edit transaction"
                  >
                    <TbEdit className="text-green-600 h-5 w-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(txn._id)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                    aria-label="Delete transaction"
                  >
                    <MdOutlineDeleteForever className="text-red-600 h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Products  */}
              <div className="text-sm text-gray-500 mt-2 space-y-0.5">
                {txn.products.map((p, i) => (
                  <div key={i}>
                    {p.product?.name} · Qty {p.quantity} × ₹{p.price}
                  </div>
                ))}
              </div>

              {/* Amount  */}
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mt-3 pt-3 border-t border-gray-100">
                <span className="text-gray-500">
                  Total:{" "}
                  <span className="font-medium text-gray-900">
                    ₹{txn.totalAmount}
                  </span>
                </span>
                <span className="text-gray-500">
                  Paid:{" "}
                  <span className="font-medium text-gray-900">
                    ₹{txn.paidAmount}
                  </span>
                </span>
                {txn.remainingAmount < 0 ? (
                  <span className="text-green-600 font-medium">
                    Advance: ₹{Math.abs(txn.remainingAmount)}
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Remaining:{" "}
                    <span className="font-medium text-gray-900">
                      ₹{txn.remainingAmount}
                    </span>
                  </span>
                )}
                <span className="text-gray-400 capitalize ml-auto">
                  {txn.paymentMode}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        page={data.page || page}
        totalPages={data.totalPages}
        onChange={setPage}
      />
    </div>
  );
};

export default TransactionPage;
