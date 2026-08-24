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
  if (isError) return <p>Error loading godowns</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Godowns</h1>

        <button
          onClick={() => navigate("/godowns/createGodown")}
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <FaPlus className="h-5 w-5" /> Add Godown
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl shadow-md p-4">
        <div className="space-y-3">
          {godowns.map((godown) => (
            <div
              key={godown._id}
              className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 border p-3 rounded-lg hover:shadow transition"
            >
              <div>
                <p className="font-medium">{godown.name}</p>
                <p className="text-sm text-gray-500">
                  {godown.address || "No address"}
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <button
                  onClick={() => navigate(`/godowns/stock/${godown._id}`)}
                  className="text-blue-600 hover:text-blue-700 text-md font-semibold"
                >
                  View Stock
                </button>

                <button
                  onClick={() => navigate(`/godowns/editGodown/${godown._id}`)}
                >
                  <TbEdit className="text-green-600 h-6 w-6" />
                </button>

                <button onClick={() => handleDelete(godown._id)}>
                  <MdOutlineDeleteForever className="text-red-600 h-6 w-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GodownPage;
