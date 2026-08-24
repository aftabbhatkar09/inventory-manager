import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import {
  useGetGodownByIdQuery,
  useEditGodownByIdMutation,
} from "../../redux/godown/godownApi";

const EditGodownPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: godown, isLoading } = useGetGodownByIdQuery(id);
  const [editGodownById, { isLoading: isUpdating }] =
    useEditGodownByIdMutation();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  useEffect(() => {
    if (godown) {
      setFormData({
        name: godown.name || "",
        address: godown.address || "",
      });
    }
  }, [godown]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    if (!formData.name) {
      toast.error("Godown name is required");
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
      await editGodownById({ id, data: formData }).unwrap();

      toast.success("Godown updated successfully!");

      navigate("/godowns");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update godown.");
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">Edit Godown</h1>

        <button
          onClick={() => navigate("/godowns")}
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <MdOutlineKeyboardBackspace className="h-6 w-6" /> Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <div>
          <label className="text-sm text-gray-600">Godown Name</label>
          <input
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Address</label>
          <input
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-md font-semibold text-white py-2 rounded"
        >
          {isUpdating ? "Updating..." : "Update Godown"}
        </button>
      </form>
    </div>
  );
};

export default EditGodownPage;
