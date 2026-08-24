import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import {
  useGetPartiesQuery,
  useGetPartyLedgerQuery,
} from "../../redux/party/partyApi";
import {
  useGetPaymentByIdQuery,
  useEditPaymentByIdMutation,
} from "../../redux/payment/paymentApi";

const EditPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: payment, isLoading } = useGetPaymentByIdQuery(id);
  const { data: parties } = useGetPartiesQuery();
  const [editPaymentById, { isLoading: isUpdating }] =
    useEditPaymentByIdMutation();

  const [formData, setFormData] = useState({
    type: "received",
    party: "",
    amount: "",
    paymentMode: "cash",
    note: "",
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        type: payment.type,
        party: payment.party?._id || "",
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        note: payment.note || "",
      });
    }
  }, [payment]);

  const { data: ledger } = useGetPartyLedgerQuery(formData.party, {
    skip: !formData.party,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setFormData({ ...formData, type: value, party: "" });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // Received -> customers, paid -> suppliers. A party can be both.
  const filteredParties = parties?.filter((p) =>
    formData.type === "received"
      ? p.type.includes("customer")
      : p.type.includes("supplier"),
  );

  const validate = () => {
    if (!formData.party) {
      toast.error("Please select a party");
      return false;
    }

    if (!formData.amount || formData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await editPaymentById({ id, data: formData }).unwrap();

      toast.success("Payment updated successfully");

      navigate("/payments");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update payment");
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">Edit Payment</h1>

        <button
          onClick={() => navigate("/payments")}
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <MdOutlineKeyboardBackspace className="h-6 w-6" /> Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        {/* Type */}
        <div>
          <label className="text-sm text-gray-600">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          >
            <option value="received">Received (from customer)</option>
            <option value="paid">Paid (to supplier)</option>
          </select>
        </div>

        {/* Party */}
        <div>
          <label className="text-sm text-gray-600">Party</label>
          <select
            name="party"
            value={formData.party}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          >
            <option value="">Select Party</option>
            {filteredParties?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          {ledger && formData.party && (
            <p className="text-xs text-gray-500 mt-1">
              Current balance:{" "}
              <span className={ledger.balance >= 0 ? "text-green-600" : "text-red-600"}>
                ₹{ledger.balance}
              </span>{" "}
              {ledger.balance >= 0 ? "(they owe you)" : "(you owe them)"}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm text-gray-600">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* Payment Mode */}
        <div>
          <label className="text-sm text-gray-600">Payment Mode</label>
          <select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="card">Card</option>
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="text-sm text-gray-600">Note (optional)</label>
          <input
            name="note"
            value={formData.note}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-md font-semibold text-white py-2 rounded"
        >
          {isUpdating ? "Updating..." : "Update Payment"}
        </button>
      </form>
    </div>
  );
};

export default EditPaymentPage;
