import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import { MdOutlineInventory2, MdPerson, MdLockOutline } from "react-icons/md";

import { useLoginMutation } from "../../redux/auth/authApi";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";
const INPUT =
  "w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("Username and password are required");
      return;
    }

    try {
      await login(formData).unwrap();

      toast.success("Welcome back!");

      navigate(location.state?.from || "/", { replace: true });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to log in");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Brand panel  */}
      <div className="md:w-2/5 bg-gray-900 text-white flex flex-col items-center justify-center gap-4 p-10 py-14 md:py-10">
        <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center">
          <MdOutlineInventory2 className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-center">
          Inventory Manager
        </h1>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          Products, parties, transactions, payments, and stock across all
          your godowns -- in one place.
        </p>
      </div>

      {/* Form panel  */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white rounded-2xl shadow-sm ring-1 ring-gray-300 p-6 md:p-8 space-y-5"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Log In</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Sign in to continue
            </p>
          </div>

          <div>
            <label className={LABEL}>Username</label>
            <div className="relative">
              <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                autoFocus
                className={INPUT}
              />
            </div>
          </div>

          <div>
            <label className={LABEL}>Password</label>
            <div className="relative">
              <MdLockOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={INPUT}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
