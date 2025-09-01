import React, { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("elections");
  const [elections, setElections] = useState([]);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL || "";

  const handleLogout = () => {
    localStorage.removeItem("election_token");
    localStorage.removeItem("user");
    navigate("/admin/login");

  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Super Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              {
                id: "elections",
                label: "Election Management",
                href: "/super-admin/",
              },
              {
                id: "admins",
                label: "Admin Users",
                href: "/super-admin/admin-user-management",
              },
              {
                id: "settings",
                label: "System Settings",
                href: "/super-admin/system-settings",
              },
              {
                id: "results",
                label: "Global Results",
                href: "/super-admin/global-results-view",
              },
            ].map((tab) => (
              <Link
                key={tab.id}
                to={tab.href}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pass elections down through Outlet context */}
        <Outlet context={{ elections, setElections }} />
      </main>
    </div>
  );
}
