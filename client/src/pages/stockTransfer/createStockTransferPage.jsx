import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import { useGetProductsQuery } from "../../redux/product/productApi";
import {
  useGetGodownsQuery,
  useGetGodownStockQuery,
} from "../../redux/godown/godownApi";
import { useCreateTransferMutation } from "../../redux/stockTransfer/stockTransferApi";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";
const INPUT =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const CreateStockTransferPage = () => {
  const navigate = useNavigate();

  const { data: products } = useGetProductsQuery();
  const { data: godowns } = useGetGodownsQuery();
  const [createTransfer, { isLoading }] = useCreateTransferMutation();

  const [formData, setFormData] = useState({
    product: "",
    fromGodown: "",
    toGodown: "",
    quantity: "",
    note: "",
  });

  const { data: fromGodownStock } = useGetGodownStockQuery(
    formData.fromGodown,
    { skip: !formData.fromGodown },
  );

  const availableQuantity = fromGodownStock?.find(
    (row) => row.productId === formData.product,
  )?.quantity;

  const selectedProduct = products?.find((p) => p._id === formData.product);

  // Only offer godowns that actually hold this product -- no point picking
  // a source that has zero of it.
  const fromGodowns = selectedProduct
    ? godowns?.filter((g) =>
        selectedProduct.godownStock?.some((gs) => gs.godownId === g._id),
      )
    : godowns;

  // A godown can't be both source and destination -- keep it out of the
  // "To" list entirely rather than letting it be picked and rejected later.
  const toGodowns = godowns?.filter((g) => g._id !== formData.fromGodown);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Changing the product may invalidate the current source godown (if it
    // doesn't hold this product), which in turn may invalidate the
    // destination -- clear both rather than leave a stale selection.
    if (name === "product") {
      const stillValid = products
        ?.find((p) => p._id === value)
        ?.godownStock?.some((gs) => gs.godownId === formData.fromGodown);

      setFormData({
        ...formData,
        product: value,
        fromGodown: stillValid ? formData.fromGodown : "",
        toGodown: stillValid ? formData.toGodown : "",
      });
      return;
    }

    // Changing the source godown may invalidate the current destination
    // (if it was the same godown), so drop it rather than leave a hidden
    // invalid selection in place.
    if (name === "fromGodown") {
      setFormData({
        ...formData,
        fromGodown: value,
        toGodown: formData.toGodown === value ? "" : formData.toGodown,
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    if (!formData.product) {
      toast.error("Please select a product");
      return false;
    }

    if (!formData.fromGodown || !formData.toGodown) {
      toast.error("Please select both source and destination godowns");
      return false;
    }

    if (formData.fromGodown === formData.toGodown) {
      toast.error("Source and destination godown must be different");
      return false;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createTransfer(formData).unwrap();

      toast.success("Stock transferred successfully");

      navigate("/stock-transfers");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to transfer stock");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Transfer Stock</h1>

        <button
          onClick={() => navigate("/stock-transfers")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <MdOutlineKeyboardBackspace className="h-5 w-5" /> Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8 space-y-5"
      >
        {/* Product */}
        <div>
          <label className={LABEL}>Product</label>
          <select
            name="product"
            value={formData.product}
            onChange={handleChange}
            className={INPUT}
          >
            <option value="">Select Product</option>
            {products?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* From Godown */}
        <div>
          <label className={LABEL}>From Godown</label>
          <select
            name="fromGodown"
            value={formData.fromGodown}
            onChange={handleChange}
            className={INPUT}
          >
            <option value="">Select Source Godown</option>
            {fromGodowns?.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
          {formData.product && fromGodowns?.length === 0 && (
            <p className="text-xs text-red-600 mt-1.5">
              No godown currently has stock of this product.
            </p>
          )}
          {formData.fromGodown && formData.product && (
            <p className="text-xs text-gray-500 mt-1.5">
              Available: {availableQuantity ?? 0}
            </p>
          )}
        </div>

        {/* To Godown */}
        <div>
          <label className={LABEL}>To Godown</label>
          <select
            name="toGodown"
            value={formData.toGodown}
            onChange={handleChange}
            className={INPUT}
          >
            <option value="">Select Destination Godown</option>
            {toGodowns?.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className={LABEL}>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
            className={INPUT}
          />
        </div>

        {/* Note */}
        <div>
          <label className={LABEL}>Note (optional)</label>
          <input
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="e.g. restocking branch"
            className={INPUT}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white py-2.5 md:py-3 rounded-lg transition disabled:opacity-60"
        >
          {isLoading ? "Transferring..." : "Transfer Stock"}
        </button>
      </form>
    </div>
  );
};

export default CreateStockTransferPage;
