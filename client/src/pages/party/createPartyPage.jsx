import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import { useCreatePartyMutation } from "../../redux/party/partyApi";

const CreatePartyPage = () => {
  const navigate = useNavigate();

  const [createParty, { isLoading }] = useCreatePartyMutation();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: [],
    openingBalance: 0,
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

  const handleSubmit = async (e, stay = false) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createParty(formData).unwrap();

      toast.success("Party created successfully");

      if (stay) {
        // resets form for next entry
        setFormData({
          name: "",
          type: [],
          phone: "",
          email: "",
          address: "",
          openingBalance: 0,
        });
      } else {
        // Go back to list page
        navigate("/parties");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create party");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold mb-4">Create Party</h1>

        <button
          onClick={() => navigate("/parties")}
          className=" flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <MdOutlineKeyboardBackspace className="h-6 w-6" />
          Back
        </button>
      </div>

      <form
        onSubmit={(e) => handleSubmit(e, false)}
        className="bg-white p-6 rounded-xl shadow-md space-4"
      >
        {/* Name  */}
        <div>
          <label className="text-sm text-gray-600">Party name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* Phone  */}
        <div>
          <label className="text-sm text-gray-600">Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* Email  */}
        <div>
          <label className="text-sm text-gray-600">Party email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-sm text-gray-600">Address</label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* Opening Balance  */}
        <div>
          <label className="text-sm text-gray-600">
            Opening Balance (positive = they owe you, negative = you owe
            them)
          </label>
          <input
            type="number"
            name="openingBalance"
            value={formData.openingBalance}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* Type  */}
        <div className="flex items-center gap-6">
          <label className="text-sm text-gray-600">Type :</label>

          <div className="flex gap-4 mt-2">
            <label>
              <input
                type="checkbox"
                checked={formData.type.includes("customer")}
                onChange={() => handleTypeChange("customer")}
                className="mr-1 mb-2"
              />
              Customer
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.type.includes("supplier")}
                onChange={() => handleTypeChange("supplier")}
                className="mr-1 mb-2"
              />
              Supplier
            </label>
          </div>
        </div>

        {/* Buttons  */}
        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-md font-semibold hover:bg-blue-700 text-white py-2 rounded"
          >
            {isLoading ? "Saving..." : "Save Party"}
          </button>
          <button
            onClick={(e) => handleSubmit(e, true)}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-md font-semibold hover:bg-gray-300 text-gray-800 py-2 rounded"
          >
            Save & Add Another
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePartyPage;
