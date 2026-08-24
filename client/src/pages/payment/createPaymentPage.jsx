import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import {
  useGetPartiesQuery,
  useGetPartyLedgerQuery,
} from "../../redux/party/partyApi";
import { useCreatePaymentMutation } from "../../redux/payment/paymentApi";

const CreatePaymentPage = () => {
  const navigate = useNavigate();

  const { data: parties } = useGetPartiesQuery();
  const [createPayment, { isLoading }] = useCreatePaymentMutation();

  const [formData, setFormData] = useState({
    type: "received",
    party: "",
    amount: "",
    paymentMode: "cash",
    note: "",
  });

  const { data: ledger } = useGetPartyLedgerQuery(formData.party, {
    skip: !formData.party,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Changing the payment type changes which parties are valid, so drop
    // the current party selection rather than silently keeping a customer
    // selected for a supplier payment (or vice versa).
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

  // Warn (don't block) if this payment goes beyond what's actually
  // outstanding for the party -- same pattern as the overpayment warning
  // already used on transactions.
  const confirmIfOverpaying = () => {
    const amount = Number(formData.amount);
    const balance = ledger?.balance ?? 0;

    if (formData.type === "received") {
      const owedToUs = balance > 0 ? balance : 0;

      if (amount > owedToUs) {
        const excess = amount - owedToUs;
        return confirm(
          `This party currently owes ₹${owedToUs}. ₹${excess} of this payment exceeds that and will be recorded as an advance. Continue?`,
        );
      }
    } else {
      const owedToThem = balance < 0 ? Math.abs(balance) : 0;

      if (amount > owedToThem) {
        const excess = amount - owedToThem;
        return confirm(
          `You currently owe this party ₹${owedToThem}. ₹${excess} of this payment exceeds that and will be recorded as an advance. Continue?`,
        );
      }
    }

    return true;
  };

  const handleSubmit = async (e, stay = false) => {
    e.preventDefault();

    if (!validate()) return;
    if (!confirmIfOverpaying()) return;

    try {
      await createPayment(formData).unwrap();

      toast.success("Payment recorded successfully");

      if (stay) {
        setFormData({
          type: formData.type,
          party: "",
          amount: "",
          paymentMode: "cash",
          note: "",
        });
      } else {
        navigate("/payments");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to record payment");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">Record Payment</h1>

        <button
          onClick={() => navigate("/payments")}
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <MdOutlineKeyboardBackspace className="h-6 w-6" /> Back
        </button>
      </div>

      <form
        onSubmit={(e) => handleSubmit(e, false)}
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
            placeholder="Enter amount"
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
            placeholder="e.g. settling last month's balance"
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-md font-semibold text-white py-2 rounded"
          >
            {isLoading ? "Saving..." : "Save Payment"}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={(e) => handleSubmit(e, true)}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-md font-semibold py-2 rounded"
          >
            Save & Add Another
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePaymentPage;
