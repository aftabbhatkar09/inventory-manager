import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import { useLoginMutation } from "../../redux/auth/authApi";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";
const INPUT =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-6">
          Inventory Manager
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-300 p-6 md:p-8 space-y-5"
        >
          <div>
            <label className={LABEL}>Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoFocus
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={INPUT}
            />
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
