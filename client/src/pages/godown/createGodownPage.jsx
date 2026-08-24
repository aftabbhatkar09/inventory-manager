import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import { useCreateGodownMutation } from "../../redux/godown/godownApi";

const CreateGodownPage = () => {
  const navigate = useNavigate();

  const [createGodown, { isLoading }] = useCreateGodownMutation();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!formData.name) {
      toast.error("Godown name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e, stay = false) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createGodown(formData).unwrap();

      toast.success("Godown created successfully!");

      if (stay) {
        setFormData({ name: "", address: "" });
      } else {
        navigate("/godowns");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create godown.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Create Godown</h1>
        <button
          onClick={() => navigate("/godowns")}
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <MdOutlineKeyboardBackspace className="h-6 w-6" /> Back
        </button>
      </div>

      <form
        onSubmit={(e) => handleSubmit(e, false)}
        className="bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <div>
          <label className="text-sm text-gray-600">Godown Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter godown name"
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Address</label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-md font-semibold text-white py-2 rounded"
          >
            {isLoading ? "Saving..." : "Save Godown"}
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

export default CreateGodownPage;
