import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

import { useGetPartiesQuery } from "../../redux/party/partyApi";
import { useGetProductsQuery } from "../../redux/product/productApi";
import {
  useGetTransactionByIdQuery,
  useEditTransactionMutation,
} from "../../redux/transaction/transactionApi";

const EditTransactionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: transaction, isLoading } = useGetTransactionByIdQuery(id);
  const { data: parties } = useGetPartiesQuery();
  const { data: products } = useGetProductsQuery();
  const [editTransaction, { isLoading: isUpdating }] =
    useEditTransactionMutation();

  const [formData, setFormData] = useState({
    type: "purchase",
    party: "",
    products: [{ product: "", quantity: "", price: "" }],
    paidAmount: "",
    paymentMode: "cash",
  });

  // Fill form when transaction data comes
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        party: transaction.party?._id || "",
        products: transaction.products.map((item) => ({
          product: item.product?._id || "",
          quantity: item.quantity,
          price: item.price,
        })),
        paidAmount: transaction.paidAmount,
        paymentMode: transaction.paymentMode,
      });
    }
  }, [transaction]);

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

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">Edit Transaction</h1>

        <button
          onClick={() => navigate("/transactions")}
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <MdOutlineKeyboardBackspace className="h-6 w-6" /> Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-4"
      >
        {/* Type */}
        <div>
          <label className="text-sm">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          >
            <option value="sale">Sale</option>
            <option value="purchase">Purchase</option>
          </select>
        </div>

        {/* Party */}
        <div>
          <label className="text-sm">Party</label>
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
        </div>

        {/* Product  */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Products</label>

          {formData.products.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
            >
              {/* Product  */}
              <select
                value={item.product}
                onChange={(e) =>
                  handleProductChange(index, "product", e.target.value)
                }
                className="border p-2 rounded"
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
                className="border p-2 rounded"
              ></input>

              {/* Price  */}
              <input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) =>
                  handleProductChange(index, "price", e.target.value)
                }
                className="border p-2 rounded"
              ></input>

              {/* Remove Button  */}
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="bg-gray-50 flex items-center justify-center w-12 rounded hover:cursor-pointer"
              >
                <MdOutlineDeleteForever className="text-red-600 h-10 w-10" />
              </button>
            </div>
          ))}

          {/* Add Row */}
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 text-md font-semibold bg-gray-100 px-3 py-2 rounded"
          >
            <FaPlus className="h-5 w-5 text-green-600" /> Add Product
          </button>
        </div>

        {/* Total  */}
        <div className="font-semibold text-right">Total: ₹{totalAmount}</div>

        {/* Paid Amount  */}
        <div>
          <label className="text-sm">Paid Amount</label>
          <input
            type="number"
            placeholder="Paid Amount"
            name="paidAmount"
            value={formData.paidAmount}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          ></input>
        </div>

        {/* Payment Mode  */}
        <div>
          <label className="text-sm">Payment Mode</label>
          <select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="cash">Cash</option>
            <option value="upi">Upi</option>
            <option value="cheque">Cheque</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        {/* Submit Button   */}
        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-blue-600 text-md font-semibold hover:bg-blue-700 text-white py-2 md:py-3 rounded"
        >
          {isUpdating ? "Updating..." : "Update Transaction"}
        </button>
      </form>
    </div>
  );
};

export default EditTransactionPage;
