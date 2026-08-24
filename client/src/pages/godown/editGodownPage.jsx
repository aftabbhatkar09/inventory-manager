import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import {
  useGetGodownByIdQuery,
  useEditGodownByIdMutation,
} from "../../redux/godown/godownApi";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";
const INPUT =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const EditGodownForm = ({ godown }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editGodownById, { isLoading: isUpdating }] =
    useEditGodownByIdMutation();

  const [formData, setFormData] = useState({
    name: godown.name || "",
    address: godown.address || "",
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Edit Godown</h1>

        <button
          onClick={() => navigate("/godowns")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <MdOutlineKeyboardBackspace className="h-5 w-5" /> Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8 space-y-5"
      >
        <div>
          <label className={LABEL}>Godown Name</label>
          <input
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        <div>
          <label className={LABEL}>Address</label>
          <input
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {isUpdating ? "Updating..." : "Update Godown"}
        </button>
      </form>
    </div>
  );
};

const EditGodownPage = () => {
  const { id } = useParams();

  const { data: godown, isLoading } = useGetGodownByIdQuery(id);

  if (isLoading) return <p>Loading...</p>;

  return <EditGodownForm key={id} godown={godown} />;
};

export default EditGodownPage;
