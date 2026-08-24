import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import { useCreateProductMutation } from "../../redux/product/productApi";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";
const INPUT =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const CreateProductPage = () => {
  const navigate = useNavigate();

  const [createProduct, { isLoading }] = useCreateProductMutation();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "pcs",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!formData.name) {
      toast.error("Product name is required");
      return false;
    }

    if (!formData.sku) {
      toast.error("SKU is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e, stay = false) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createProduct(formData).unwrap();

      toast.success("Product created successfully!");

      if (stay) {
        setFormData({
          name: "",
          sku: "",
          category: "",
          unit: "pcs",
        });
      } else {
        navigate("/products");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create product.");
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header  */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Create Product</h1>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <MdOutlineKeyboardBackspace className="h-5 w-5" /> Back
        </button>
      </div>

      {/* FORM  */}
      <form
        onSubmit={(e) => handleSubmit(e, false)}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8 space-y-5"
      >
        <h2 className="text-base font-semibold text-gray-900">
          Product Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={LABEL}>Product Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL}>SKU</label>
            <input
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="Enter SKU"
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL}>Category</label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Enter category"
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL}>Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className={INPUT}
            >
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="ltr">ltr</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Save Product"}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={(e) => handleSubmit(e, true)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            Save & Add Another
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductPage;
