import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { HashLoader } from "react-spinners";

import { TbEdit } from "react-icons/tb";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

import SearchInput from "../../components/SearchInput";

import {
  useGetPaymentsQuery,
  useDeletePaymentByIdMutation,
} from "../../redux/payment/paymentApi";

const PaymentPage = () => {
  const navigate = useNavigate();

  const { data = [], isLoading } = useGetPaymentsQuery();
  const [deletePaymentById] = useDeletePaymentByIdMutation();
  const [search, setSearch] = useState("");

  const filteredData = data.filter((payment) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      payment.party?.name,
      payment.type,
      payment.paymentMode,
      payment.note,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      try {
        await deletePaymentById(id).unwrap();
        toast.success("Payment deleted successfully");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete payment");
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
        <h1 className="text-xl font-bold">Payments</h1>

        <button
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => navigate("/payments/createPayment")}
        >
          <FaPlus className="h-5 w-5" /> Record Payment
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by party, mode, or note"
      />

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        {filteredData.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">
            {search ? "No payments match your search." : "No payments recorded yet."}
          </p>
        ) : (
          filteredData.map((payment) => (
            <div
              key={payment._id}
              className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 border p-3 rounded-lg hover:shadow transition"
            >
              <div>
                <p className="font-medium">
                  {payment.party?.name || "N/A"}{" "}
                  <span
                    className={
                      payment.type === "received"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {payment.type === "received" ? "Received" : "Paid"}: ₹
                    {payment.amount}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  {payment.paymentMode} ·{" "}
                  {new Date(payment.createdAt).toLocaleDateString()}
                  {payment.note ? ` · ${payment.note}` : ""}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/payments/editPayment/${payment._id}`)
                  }
                >
                  <TbEdit className="text-green-600 h-6 w-6 hover:text-green-700" />
                </button>

                <button onClick={() => handleDelete(payment._id)}>
                  <MdOutlineDeleteForever className="text-red-600 h-6 w-6 hover:text-red-700" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
