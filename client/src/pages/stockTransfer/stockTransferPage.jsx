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
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => navigate("/stock-transfers/createTransfer")}
        >
          <FaPlus className="h-5 w-5" /> Transfer Stock
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        {data.length === 0 ? (
          <p>No stock transfers yet.</p>
        ) : (
          data.map((t) => (
            <div
              key={t._id}
              className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 border p-3 rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {t.product?.name} · Qty: {t.quantity}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  {t.fromGodown?.name} <FaArrowRight className="inline" />{" "}
                  {t.toGodown?.name}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(t.createdAt).toLocaleDateString()}
                  {t.note ? ` · ${t.note}` : ""}
                </p>
              </div>

              <button onClick={() => handleDelete(t._id)}>
                <MdOutlineDeleteForever className="text-red-600 h-6 w-6 hover:text-red-700" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StockTransferPage;
