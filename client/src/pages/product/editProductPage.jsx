import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import {
  useGetProductByIdQuery,
  useEditProductMutation,
} from "../../redux/product/productApi";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";
const INPUT =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const EditProductForm = ({ product }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editProduct] = useEditProductMutation();

  const [formData, setFormData] = useState({
    name: product.name || "",
    sku: product.sku || "",
    category: product.category || "",
    unit: product.unit || "pcs",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await editProduct({
        id,
        data: formData,
      }).unwrap();

      toast.success("Product updated successfully!");

      navigate("/products");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update product.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Edit Product</h1>

        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <MdOutlineKeyboardBackspace className="h-5 w-5" /> Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8 space-y-5"
      >
        {/* Name */}
        <div>
          <label className={LABEL}>Product Name</label>
          <input
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        {/* SKU */}
        <div>
          <label className={LABEL}>SKU</label>
          <input
            name="sku"
            value={formData.sku || ""}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        {/* Category */}
        <div>
          <label className={LABEL}>Category</label>
          <input
            name="category"
            value={formData.category || ""}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        {/* Unit */}
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

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white py-2.5 rounded-lg transition"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

const EditProductPage = () => {
  const { id } = useParams();

  const { data: product, isLoading } = useGetProductByIdQuery(id);

  if (isLoading) return <p>Loading...</p>;

  return <EditProductForm key={id} product={product} />;
};

export default EditProductPage;
