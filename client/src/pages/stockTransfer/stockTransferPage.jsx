import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { HashLoader } from "react-spinners";

import { MdOutlineDeleteForever } from "react-icons/md";
import { FaPlus, FaArrowRight } from "react-icons/fa6";

import {
  useGetAllTransfersQuery,
  useDeleteTransferByIdMutation,
} from "../../redux/stockTransfer/stockTransferApi";

const StockTransferPage = () => {
  const navigate = useNavigate();

  const { data = [], isLoading } = useGetAllTransfersQuery();
  const [deleteTransfer] = useDeleteTransferByIdMutation();

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this stock transfer?")) {
      try {
        await deleteTransfer(id).unwrap();
        toast.success("Stock transfer deleted successfully");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete transfer");
      }
    }
  };

  if (isLoading)
    return (
      <div className="w-full h-full mx-auto flex justify-center items-center">
        <HashLoader color="#4b6fee" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Stock Transfers</h1>

        <button
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
          onClick={() => navigate("/stock-transfers/createTransfer")}
        >
          <FaPlus className="h-4 w-4" /> Transfer Stock
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-300 divide-y divide-gray-300 overflow-hidden">
        {data.length === 0 ? (
          <p className="text-sm text-gray-500 py-10 text-center">
            No stock transfers yet.
          </p>
        ) : (
          data.map((t) => (
            <div
              key={t._id}
              className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {t.product?.name} · Qty: {t.quantity}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  {t.fromGodown?.name}{" "}
                  <FaArrowRight className="inline text-gray-400 h-3 w-3" />{" "}
                  {t.toGodown?.name}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(t.createdAt).toLocaleDateString()}
                  {t.note ? ` · ${t.note}` : ""}
                </p>
              </div>

              <button
                onClick={() => handleDelete(t._id)}
                className="p-2 rounded-lg hover:bg-gray-100 transition self-start md:self-center"
                aria-label="Delete stock transfer"
              >
                <MdOutlineDeleteForever className="text-red-600 h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StockTransferPage;
