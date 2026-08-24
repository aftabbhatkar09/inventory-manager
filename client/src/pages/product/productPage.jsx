import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { HashLoader } from "react-spinners";

import { TbEdit } from "react-icons/tb";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

import SearchInput from "../../components/SearchInput";

import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../../redux/product/productApi";

const ProductPage = () => {
  const navigate = useNavigate();

  const { data: products = [], isLoading, isError } = useGetProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error("Failed to delete product: " + error.message);
      }
    }
  };

  if (isLoading)
    return (
      <div className="w-full h-full mx-auto flex justify-center items-center">
        <HashLoader color="#4b6fee" />
      </div>
    );
  if (isError) return <p>Error loading products</p>;

  return (
    <div className="space-y-6">
      {/* Header  */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Products</h1>

        <button
          onClick={() => navigate("/products/createProduct")}
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <FaPlus className="h-5 w-5" /> Add Product
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by name, SKU, or category"
      />

      {/* Product List  */}
      <div className="bg-gray-50 rounded-xl shadow-md p-4">
        {filteredProducts.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">
            {search ? "No products match your search." : "No products yet."}
          </p>
        ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 border p-3 rounded-lg hover:shadow transition"
            >
              {/* Left  */}
              <div>
                <p className="font-medium">{product.name}</p>

                <p className="text-sm text-gray-500">
                  {product.category || "N/A"}
                </p>

                <p className="text-sm text-gray-400">Stock: {product.stock}</p>

                {product.godownStock?.length > 0 && (
                  <p className="text-xs text-gray-400">
                    {product.godownStock
                      .map((g) => `${g.godownName}: ${g.quantity}`)
                      .join(" · ")}
                  </p>
                )}
              </div>

              {/* Right  */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <button
                  onClick={() =>
                    navigate(`/products/editProduct/${product._id}`)
                  }
                >
                  <TbEdit className="text-green-600 h-6 w-6" />
                </button>

                <button onClick={() => handleDelete(product._id)}>
                  <MdOutlineDeleteForever className="text-red-600 h-6 w-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
