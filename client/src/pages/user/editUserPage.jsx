import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import {
  useGetUserByIdQuery,
  useEditUserByIdMutation,
} from "../../redux/user/userApi";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";
const INPUT =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const EditUserForm = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editUserById, { isLoading: isUpdating }] = useEditUserByIdMutation();

  const [formData, setFormData] = useState({
    username: user.username || "",
    password: "",
    role: user.role || "admin",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return false;
    }

    if (formData.password && formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const data = {
      username: formData.username,
      role: formData.role,
    };

    if (formData.password) {
      data.password = formData.password;
    }

    try {
      await editUserById({ id, data }).unwrap();

      toast.success("User updated successfully");

      navigate("/users");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update user");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Edit User</h1>

        <button
          onClick={() => navigate("/users")}
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
          <label className={LABEL}>Username</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={INPUT}
          />
        </div>

        <div>
          <label className={LABEL}>New Password (leave blank to keep current)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            className={INPUT}
          />
        </div>

        <div>
          <label className={LABEL}>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={INPUT}
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <p className="text-xs text-gray-500 mt-1.5">
            Super Admins can manage other user accounts. Admins have full
            access to everything else.
          </p>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {isUpdating ? "Updating..." : "Update User"}
        </button>
      </form>
    </div>
  );
};

const EditUserPage = () => {
  const { id } = useParams();

  const { data: user, isLoading } = useGetUserByIdQuery(id);

  if (isLoading) return <p>Loading...</p>;

  return <EditUserForm key={id} user={user} />;
};

export default EditUserPage;
