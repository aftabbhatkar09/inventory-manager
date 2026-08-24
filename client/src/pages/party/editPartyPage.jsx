import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import {
  useGetPartyByIdQuery,
  useEditPartyByIdMutation,
} from "../../redux/party/partyApi";

const EditPartyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: party, isLoading, error } = useGetPartyByIdQuery(id);
  const [editPartyById, { isLoading: isUpdating }] = useEditPartyByIdMutation();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: [],
  });

  useEffect(() => {
    if (party) {
      setFormData({
        name: party.name || "",
        phone: party.phone || "",
        email: party.email || "",
        address: party.address || "",
        type: party.type || [],
      });
    }
  }, [party]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value) => {
    setFormData((prev) => {
      const exists = prev.type.includes(value);

      return {
        ...prev,
        type: exists
          ? prev.type.filter((t) => t !== value)
          : [...prev.type, value],
      };
    });
  };

  const validate = () => {
    if (!formData.name) {
      toast.error("Party name is required");
      return false;
    }

    if (formData.type.length === 0) {
      toast.error("Select at least one party type");
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
      await editPartyById({ id, data: formData }).unwrap();

      toast.success("Party updated successfully");

      navigate("/parties");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update party");
    }
  };

  if (isLoading) return <p>Loading ...</p>;
  if (error) return <p>Error fetching party details</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">Edit Party</h1>
        <button
          className=" flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => navigate("/parties")}
        >
          <MdOutlineKeyboardBackspace className="h-6 w-6" /> Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 space-y-4 rounded shadow"
      >
        {/* Name  */}
        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 mt-1"
          />
        </div>

        {/* Phone  */}
        <div>
          <label className="text-sm text-gray-600">Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border p-2 mt-1"
          />
        </div>

        {/* Email  */}
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2 mt-1"
          />
        </div>

        {/* Address  */}
        <div>
          <label className="text-sm text-gray-600">Address</label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border p-2 mt-1"
          />
        </div>

        {/* Type  */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={formData.type.includes("customer")}
              onChange={() => handleTypeChange("customer")}
            />
            Customer{" "}
          </label>

          <label className="ml-4">
            <input
              type="checkbox"
              checked={formData.type.includes("supplier")}
              onChange={() => handleTypeChange("supplier")}
            />
            Supplier
          </label>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-blue-600 text-md font-semibold text-white hover:bg-blue-700 hover:cursor-pointer py-2 rounded"
        >
          {isUpdating ? "Updating..." : "Update Party"}
        </button>
      </form>
    </div>
  );
};

export default EditPartyPage;
