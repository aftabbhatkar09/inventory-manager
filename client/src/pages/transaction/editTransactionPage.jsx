import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

import { useGetPartiesQuery } from "../../redux/party/partyApi";
import { useGetProductsQuery } from "../../redux/product/productApi";
import { useGetGodownsQuery } from "../../redux/godown/godownApi";
import {
  useGetTransactionByIdQuery,
  useEditTransactionMutation,
} from "../../redux/transaction/transactionApi";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";
const INPUT =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const EditTransactionForm = ({ transaction }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: parties } = useGetPartiesQuery();
  const { data: products } = useGetProductsQuery();
  const { data: godowns } = useGetGodownsQuery();
  const [editTransaction, { isLoading: isUpdating }] =
    useEditTransactionMutation();

  const [formData, setFormData] = useState({
    type: transaction.type,
    party: transaction.party?._id || "",
    godown: transaction.godown?._id || "",
    products: transaction.products.map((item) => ({
      product: item.product?._id || "",
      quantity: item.quantity,
      price: item.price,
    })),
    paidAmount: transaction.paidAmount,
    paymentMode: transaction.paymentMode,
  });

  // Handle normal fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Changing the transaction type changes which parties are valid, so
    // drop the current party selection rather than silently keeping a
    // customer selected for a purchase (or vice versa).
    if (name === "type") {
      setFormData({ ...formData, type: value, party: "" });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // Sale -> customers, purchase -> suppliers. A party can be both.
  const filteredParties = parties?.filter((p) =>
    formData.type === "sale"
      ? p.type.includes("customer")
      : p.type.includes("supplier"),
  );

  // Handle product row changes
  const handleProductChange = (index, field, value) => {
    const updated = [...formData.products];
    updated[index][field] = value;
    setFormData({ ...formData, products: updated });
  };

  // Add new product row
  const addRow = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        { product: "", quantity: "", price: "" },
      ],
    });
  };

  // Remove product row
  const removeRow = (index) => {
    const updated = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updated });
  };

  // Calculate total amount
  const totalAmount = formData.products.length
    ? formData.products.reduce((acc, item) => {
        return acc + (Number(item.quantity) || 0) * (Number(item.price) || 0);
      }, 0)
    : 0;

  const validate = () => {
    if (!formData.type) {
      toast.error("Transaction type is required");
      return false;
    }

    if (!formData.party) {
      toast.error("Please select a party");
      return false;
    }

    if (!formData.godown) {
      toast.error("Please select a godown");
      return false;
    }

    if (!formData.products.length) {
      toast.error("At least one product is required");
      return false;
    }

    for (let i = 0; i < formData.products.length; i++) {
      const item = formData.products[i];

      if (!item.product) {
        toast.error(`Select at least one product in row ${i + 1}`);
        return false;
      }

      if (!item.quantity || item.quantity <= 0) {
        toast.error(`Quantity must be greater than 0 ${i + 1}`);
        return false;
      }

      if (!item.price || item.price <= 0) {
        toast.error(`Price must be greater than 0 ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (Number(formData.paidAmount) > totalAmount) {
      const overpaid = Number(formData.paidAmount) - totalAmount;
      if (
        !confirm(
          `Paid amount exceeds the total by ₹${overpaid}. This will be recorded as an advance. Continue?`,
        )
      ) {
        return;
      }
    }

    try {
      await editTransaction({
        id,
        data: {
          ...formData,
          totalAmount,
        },
      }).unwrap();

      toast.success("Transaction updated successfully");

      navigate("/transactions");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update transaction");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Edit Transaction</h1>

        <button
          onClick={() => navigate("/transactions")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <MdOutlineKeyboardBackspace className="h-5 w-5" /> Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Type */}
          <div>
            <label className={LABEL}>Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={INPUT}
            >
              <option value="sale">Sale</option>
              <option value="purchase">Purchase</option>
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
          </div>

          {/* Godown */}
          <div>
            <label className={LABEL}>
              Godown{" "}
              {formData.type === "sale"
                ? "(shipping from)"
                : "(receiving into)"}
            </label>
            <select
              name="godown"
              value={formData.godown}
              onChange={handleChange}
              className={INPUT}
            >
              <option value="">Select Godown</option>
              {godowns?.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product  */}
        <div>
          <label className={LABEL}>Products</label>

          <div className="space-y-2">
            {formData.products.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-center bg-gray-50 rounded-lg p-2"
              >
                {/* Product  */}
                <select
                  value={item.product}
                  onChange={(e) =>
                    handleProductChange(index, "product", e.target.value)
                  }
                  className={`${INPUT} bg-white`}
                >
                  <option value="">Select Product</option>
                  {products?.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>

                {/* Quantity  */}
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleProductChange(index, "quantity", e.target.value)
                  }
                  className={`${INPUT} bg-white`}
                />

                {/* Price  */}
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) =>
                    handleProductChange(index, "price", e.target.value)
                  }
                  className={`${INPUT} bg-white`}
                />

                {/* Remove Button  */}
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="p-2.5 rounded-lg hover:bg-gray-200 transition justify-self-end md:justify-self-auto"
                  aria-label="Remove product row"
                >
                  <MdOutlineDeleteForever className="text-red-600 h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Row */}
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition mt-2"
          >
            <FaPlus className="h-4 w-4 text-green-600" /> Add Product
          </button>
        </div>

        {/* Total  */}
        <div className="flex justify-end text-sm">
          <span className="text-gray-500 mr-2">Total</span>
          <span className="font-semibold text-gray-900">₹{totalAmount}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Paid Amount  */}
          <div>
            <label className={LABEL}>Paid Amount</label>
            <input
              type="number"
              placeholder="Paid Amount"
              name="paidAmount"
              value={formData.paidAmount}
              onChange={handleChange}
              className={INPUT}
            />
          </div>

          {/* Payment Mode  */}
          <div>
            <label className={LABEL}>Payment Mode</label>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              className={INPUT}
            >
              <option value="cash">Cash</option>
              <option value="upi">Upi</option>
              <option value="cheque">Cheque</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* Submit Button   */}
        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white py-2.5 md:py-3 rounded-lg transition disabled:opacity-60"
        >
          {isUpdating ? "Updating..." : "Update Transaction"}
        </button>
      </form>
    </div>
  );
};

const EditTransactionPage = () => {
  const { id } = useParams();

  const { data: transaction, isLoading } = useGetTransactionByIdQuery(id);

  if (isLoading) return <p>Loading...</p>;

  return <EditTransactionForm key={id} transaction={transaction} />;
};

export default EditTransactionPage;
