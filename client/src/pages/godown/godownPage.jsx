import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { HashLoader } from "react-spinners";

import { TbEdit } from "react-icons/tb";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

import {
  useGetGodownsQuery,
  useDeleteGodownByIdMutation,
} from "../../redux/godown/godownApi";

const GodownPage = () => {
  const navigate = useNavigate();

  const { data: godowns = [], isLoading, isError } = useGetGodownsQuery();
  const [deleteGodown] = useDeleteGodownByIdMutation();

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this godown?")) {
      try {
        await deleteGodown(id).unwrap();
        toast.success("Godown deleted successfully");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete godown");
      }
    }
  };

  if (isLoading)
    return (
      <div className="w-full h-full mx-auto flex justify-center items-center">
        <HashLoader color="#4b6fee" />
      </div>
    );
  if (isError) return <p className="text-red-600">Error loading godowns.</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Godowns</h1>

        <button
          onClick={() => navigate("/godowns/createGodown")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <FaPlus className="h-4 w-4" /> Add Godown
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-300 divide-y divide-gray-300 overflow-hidden">
        {godowns.length === 0 ? (
          <p className="text-sm text-gray-500 py-10 text-center">
            No godowns yet.
          </p>
        ) : (
          godowns.map((godown) => (
            <div
              key={godown._id}
              className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{godown.name}</p>
                <p className="text-sm text-gray-500">
                  {godown.address || "No address"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate(`/godowns/stock/${godown._id}`)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  View Stock
                </button>

                <button
                  onClick={() => navigate(`/godowns/editGodown/${godown._id}`)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Edit godown"
                >
                  <TbEdit className="text-green-600 h-5 w-5" />
                </button>

                <button
                  onClick={() => handleDelete(godown._id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Delete godown"
                >
                  <MdOutlineDeleteForever className="text-red-600 h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GodownPage;
