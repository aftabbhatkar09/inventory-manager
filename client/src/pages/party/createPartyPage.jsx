import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import { useCreatePartyMutation } from "../../redux/party/partyApi";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";
const INPUT =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Create Party</h1>

        <button
          onClick={() => navigate("/parties")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <MdOutlineKeyboardBackspace className="h-5 w-5" />
          Back
        </button>
      </div>

      <form
        onSubmit={(e) => handleSubmit(e, false)}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8 space-y-5"
      >
        {/* Name  */}
        <div>
          <label className={LABEL}>Party Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        {/* Phone  */}
        <div>
          <label className={LABEL}>Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        {/* Email  */}
        <div>
          <label className={LABEL}>Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        {/* Address */}
        <div>
          <label className={LABEL}>Address</label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        {/* Opening Balance  */}
        <div>
          <label className={LABEL}>
            Opening Balance (positive = they owe you, negative = you owe
            them)
          </label>
          <input
            type="number"
            name="openingBalance"
            value={formData.openingBalance}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        {/* Type  */}
        <div>
          <label className={LABEL}>Type</label>

          <div className="flex gap-3">
            <label className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer has-checked:border-blue-500 has-checked:bg-blue-50 has-checked:text-blue-700 transition">
              <input
                type="checkbox"
                checked={formData.type.includes("customer")}
                onChange={() => handleTypeChange("customer")}
                className="accent-blue-600"
              />
              Customer
            </label>

            <label className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer has-checked:border-blue-500 has-checked:bg-blue-50 has-checked:text-blue-700 transition">
              <input
                type="checkbox"
                checked={formData.type.includes("supplier")}
                onChange={() => handleTypeChange("supplier")}
                className="accent-blue-600"
              />
              Supplier
            </label>
          </div>
        </div>

        {/* Buttons  */}
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Save Party"}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isLoading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            Save & Add Another
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePartyPage;
