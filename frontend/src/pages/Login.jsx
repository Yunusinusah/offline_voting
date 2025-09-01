import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as auth from "../utils/auth";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // api client will use VITE_API_URL as its base
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // setTimeout(() => {
    //   const voter = {
    //     user: {
    //       email: "admin@gmail.com",
    //       role: formData.password,
    //     },
    //     token: "sdjfsd9fsdxj9dxddx9x",
    //   }
    //   setUser(voter.user);
    //   setToken(voter.token);
    //   navigate(`/vote`)
    // }, 3000)

    try {
      const { token, role, user } = await auth.loginAdmin({ username: formData.email, password: formData.password });
      // auth.loginAdmin already saved token and user to localStorage via saveAuth
      if (!token || !role) {
        toast.error("Invalid server response");
        return;
      }

      // also expose a lightweight user object for UI components
      auth.setUser({ role, email: formData.email, ...user });

      if (role === "admin") navigate("/admin");
      else if (role === "superadmin") navigate("/super-admin");
      else navigate("/");

      toast.success("Login successful");
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || error.message || "Invalid credentials or server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
          <h2 className="text-2xl font-bold">Admin Portal</h2>
          <p className="text-blue-100 mt-1 text-sm">
            Sign in to manage the election system
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleChange}
                name="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                  placeholder="Enter your password"
                  className="w-full pr-12 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium flex items-center justify-center disabled:opacity-75"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
