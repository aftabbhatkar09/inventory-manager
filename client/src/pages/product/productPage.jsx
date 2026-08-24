import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { HashLoader } from "react-spinners";

import { TbEdit } from "react-icons/tb";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import useDebouncedValue from "../../hooks/useDebouncedValue";

import {
  useGetProductsPagedQuery,
  useDeleteProductMutation,
} from "../../redux/product/productApi";

const PAGE_SIZE = 10;

const ProductPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const {
    data = { data: [], total: 0, totalPages: 1 },
    isLoading,
    isFetching,
    isError,
  } = useGetProductsPagedQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });
  const [deleteProduct] = useDeleteProductMutation();

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

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
  if (isError) return <p className="text-red-600">Error loading products.</p>;

  const products = data.data;

  return (
    <div className="space-y-6">
      {/* Header  */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Products</h1>

        <button
          onClick={() => navigate("/products/createProduct")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <FaPlus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={handleSearchChange}
        placeholder="Search by name, SKU, or category"
      />

      {/* Product List  */}
      <div
        className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-300 divide-y divide-gray-300 overflow-hidden transition-opacity ${isFetching ? "opacity-60" : ""}`}
      >
        {products.length === 0 ? (
          <p className="text-sm text-gray-500 py-10 text-center">
            {search ? "No products match your search." : "No products yet."}
          </p>
        ) : (
          products.map((product) => (
            <div
              key={product._id}
              className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 hover:bg-gray-50 transition-colors"
            >
              {/* Left  */}
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>

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
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    navigate(`/products/editProduct/${product._id}`)
                  }
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Edit product"
                >
                  <TbEdit className="text-green-600 h-5 w-5" />
                </button>

                <button
                  onClick={() => handleDelete(product._id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Delete product"
                >
                  <MdOutlineDeleteForever className="text-red-600 h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        page={data.page || page}
        totalPages={data.totalPages}
        onChange={setPage}
      />
    </div>
  );
};

export default ProductPage;
