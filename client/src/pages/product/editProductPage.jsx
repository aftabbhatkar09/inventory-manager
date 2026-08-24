import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import {
  useGetProductByIdQuery,
  useEditProductMutation,
} from "../../redux/product/productApi";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading } = useGetProductByIdQuery(id);
  const [editProduct] = useEditProductMutation();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "pcs",
  });

  // Fill form when data comes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || "",
        unit: product.unit || "pcs",
      });
    }
  }, [product]);

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

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">Edit Products</h1>

        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <MdOutlineKeyboardBackspace className="h-6 w-6" /> Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        {/* Name */}
        <div>
          <label className="text-sm text-gray-600">Product Name</label>
          <input
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="text-sm text-gray-600">SKU</label>
          <input
            name="sku"
            value={formData.sku || ""}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm text-gray-600">Category</label>
          <input
            name="category"
            value={formData.category || ""}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Unit */}
        <div>
          <label className="text-sm text-gray-600">Unit</label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          >
            <option value="pcs">pcs</option>
            <option value="kg">kg</option>
            <option value="ltr">ltr</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-md font-semibold text-white py-2 rounded"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
