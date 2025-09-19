import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { getUser, logout } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

export default function GenerateVoterPassword() {
  const [student_id, setStudentId] = useState("");
  const [otp, setOtp] = useState(null);
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!student_id) {
      toast.error("Please enter a Student ID");
      return;
    }
    try {
      setLoading(true);
      setOtp(null);
      setVoter(null);

      // Call backend endpoint to generate OTP for the voter
      const user = getUser();
      if (!user) {
        toast.error("Not authenticated as polling agent");
        setLoading(false);
        return;
      }

      const response = await api.post(`/auth/voter/generate/`, {student_id});
      if (response.status === 200) {
        const { otp: generatedOtp, voter_id } = response.data;
        setVoter({ student_id: voter_id || student_id });
        setOtp(generatedOtp || null);
        toast.success("OTP generated successfully");
      } else {
        toast.error("Failed to generate OTP");
      }
    } catch {
    // } catch(error) {
      // toast.error(error.response?.data?.error || "Error generating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
          <button 
            className="absolute top-4 right-4 text-white bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-colors duration-200 flex items-center text-sm"
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">
              Generate Voter Password
            </h2>
            <p className="text-blue-100 mt-2 text-sm">
              Create secure passwords for student voters
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Enter Student ID"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  value={student_id}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors duration-200 min-w-[120px] shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        ></path>
                      </svg>
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {voter && otp && (
            <div className="p-5 border border-gray-200 rounded-xl bg-gray-50 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Generated Credentials
                </h3>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    Student ID:
                  </p>
                  <p className="font-semibold text-gray-900 text-lg bg-white p-3 rounded-lg border border-gray-200">
                    {voter.student_id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    Generated Password:
                  </p>
                  <div className="flex items-center justify-between mt-1 p-3 bg-white rounded-lg border border-gray-300">
                    <p className="font-mono font-bold text-green-700 text-lg tracking-wide">
                      {otp}
                    </p>
                    <button 
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      onClick={() => {
                        navigator.clipboard.writeText(otp);
                        toast.success("Password copied to clipboard!");
                      }}
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 flex items-start">
                  <svg
                    className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>Please provide this password to the voter. It will be needed for voting authentication.</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}