import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setToken, setUser, verifyVoter } from "../../utils/auth";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;
const SECRET_WORD = "showMeAdmin";

export default function VoterLoginPage() {
  const [formData, setFormData] = useState({
    student_id: "",
    code: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // call backend OTP verify
      const { token, role, user } = await verifyVoter({ student_id: formData.student_id, code: formData.code });
      if (!token) {
        toast.error("Invalid server response");
        return;
      }
      setToken(token);
      setUser({ role: role || 'voter', voter_id: formData.student_id, ...(user || {}) });
      navigate("/vote");
      toast.success("Login successful");
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center text-white">
          <h2 className="text-2xl font-bold">University Student Election</h2>
          <p className="mt-1 text-indigo-100 text-sm">
            Exercise your right to vote for student representatives
          </p>
        </div>

        <div className="p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Id</label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
                placeholder="S12345"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
              <div className="relative">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  placeholder="Enter the 6-digit code"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-75"
            >
              {isLoading ? "Signing In..." : "Sign in to Vote"}
            </button>
            {formData.student_id && formData.student_id.trim() === SECRET_WORD ? (
              <Link to="/admin/login" className="text-sm text-indigo-600 hover:underline block text-center">
                Go to admin login
              </Link>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
