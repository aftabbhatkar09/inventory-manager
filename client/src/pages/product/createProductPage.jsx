import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import { useCreateProductMutation } from "../../redux/product/productApi";

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header  */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Create Product</h1>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <MdOutlineKeyboardBackspace className="h-6 w-6" /> Back
        </button>
      </div>

      {/* FORM  */}
      <form
        onSubmit={(e) => handleSubmit(e, false)}
        className="bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <h2 className="text-lg font-semibold">Add Products</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Product Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">SKU</label>
            <input
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="Enter SKU"
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Category</label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Enter category"
              className="w-full border p-2 rounded mt-1"
            />
          </div>

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
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-md font-semibold text-white py-2 rounded"
          >
            {isLoading ? "Saving..." : "Save Product"}
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

export default CreateProductPage;
