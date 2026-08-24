import { useState } from "react";
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

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";
const INPUT =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const EditPaymentForm = ({ payment }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: parties } = useGetPartiesQuery();
  const [editPaymentById, { isLoading: isUpdating }] =
    useEditPaymentByIdMutation();

  const [formData, setFormData] = useState({
    type: payment.type,
    party: payment.party?._id || "",
    amount: payment.amount,
    paymentMode: payment.paymentMode,
    note: payment.note || "",
  });

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Edit Payment</h1>

        <button
          onClick={() => navigate("/payments")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <MdOutlineKeyboardBackspace className="h-5 w-5" /> Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8 space-y-5"
      >
        {/* Type */}
        <div>
          <label className={LABEL}>Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={INPUT}
          >
            <option value="received">Received (from customer)</option>
            <option value="paid">Paid (to supplier)</option>
          </select>
        </div>

        {/* Party */}
        <div>
          <label className={LABEL}>Party</label>
          <select
            name="party"
            value={formData.party}
            onChange={handleChange}
            className={INPUT}
          >
            <option value="">Select Party</option>
            {filteredParties?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          {ledger && formData.party && (
            <p className="text-xs text-gray-500 mt-1.5">
              Current balance:{" "}
              <span
                className={
                  ledger.balance >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                ₹{ledger.balance}
              </span>{" "}
              {ledger.balance >= 0 ? "(they owe you)" : "(you owe them)"}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className={LABEL}>Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        {/* Payment Mode */}
        <div>
          <label className={LABEL}>Payment Mode</label>
          <select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            className={INPUT}
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
          <label className={LABEL}>Note (optional)</label>
          <input
            name="note"
            value={formData.note}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {isUpdating ? "Updating..." : "Update Payment"}
        </button>
      </form>
    </div>
  );
};

const EditPaymentPage = () => {
  const { id } = useParams();

  const { data: payment, isLoading } = useGetPaymentByIdQuery(id);

  if (isLoading) return <p>Loading...</p>;

  return <EditPaymentForm key={id} payment={payment} />;
};

export default EditPaymentPage;
