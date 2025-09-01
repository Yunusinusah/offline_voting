import React, { useState, useEffect } from "react";
import { Modal } from "../../components/shared/Modal";
import api from "../../utils/api";
import { fetchElections } from "../../utils/utils";
import { toast } from "react-toastify";

export function AdminUserManagement() {
  const [admins, setAdmins] = useState([]);
  const [elections, setElections] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [newAdmin, setNewAdmin] = useState({
    email: "",
    role: "admin",
    password: "",
    election: "",
  });

  const BASE_URL = import.meta.env.VITE_API_URL;

  // Load elections
  useEffect(() => {
    const loadElections = async () => {
      const data = await fetchElections(BASE_URL);
      setElections(data);
    };
    loadElections();
    fetchAdmins();
  }, []);

  // Load admins
  const fetchAdmins = async () => {
    try {
      const response = await api.get(`${BASE_URL}api/auth/users/`);
      setAdmins(response.data.results || []);
    } catch (error) {
      console.error("Error fetching admins", error);
    }
  };

  // Create
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`${BASE_URL}api/auth/users/`, newAdmin);

      if (response.status === 201 || response.status === 200) {
        toast.success("Admin created successfully");
        setNewAdmin({
          email: "",
          role: "admin",
          password: "",
          election: "",
        });
        setShowCreateForm(false);
        fetchAdmins();
      } else {
        toast.error("Failed to create admin");
      }
    } catch (error) {
      toast.error("Error creating admin");
      console.error(error);
    }
  };

  // Edit
  const handleEditAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(
        `http://localhost:8000/api/auth/users/${selectedAdmin.id}/`,
        selectedAdmin
      );
      if (response.status === 200) {
        toast.success("Admin updated successfully");
        setShowEditForm(false);
        setSelectedAdmin(null);
        fetchAdmins();
      } else {
        toast.error("Failed to update admin");
      }
    } catch (error) {
      toast.error("Error updating admin");
      console.error(error);
    }
  };

  // Delete/Deactivate
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this admin?"))
      return;
    try {
      const response = await api.delete(`${BASE_URL}api/auth/users/${id}/`);
      if (response.success) {
        toast.success("Admin deactivated successfully");
        fetchAdmins();
      } else {
        toast.error("Failed to deactivate admin");
      }
    } catch (error) {
      toast.error("Error deactivating admin");
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Admin User Management
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500"
        >
          Create New Admin
        </button>
      </div>

      {/* ✅ Create Admin Modal */}
      {showCreateForm && (
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Create New Admin"
        >
          <div className="bg-white p-6 mb-6">
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdmin.email}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={newAdmin.role}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, role: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="admin">Election Admin (EC)</option>
                    <option value="polling_agent">Polling Agent</option>
                    <option value="superadmin">
                      System Admin (Super Admin)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdmin.password}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, password: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assign to Election
                </label>
                <select
                  value={newAdmin.election}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, election: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">-- Select Election --</option>
                  {elections.map((election) => (
                    <option key={election.id} value={election.id}>
                      {election.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500"
                >
                  Create Admin
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* ✅ Edit Admin Modal */}
      {showEditForm && selectedAdmin && (
        <Modal
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          title="Edit Admin"
        >
          <div className="bg-white p-6 mb-6">
            <form onSubmit={handleEditAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedAdmin.email}
                    onChange={(e) =>
                      setSelectedAdmin({
                        ...selectedAdmin,
                        email: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={selectedAdmin.role}
                  onChange={(e) =>
                    setSelectedAdmin({ ...selectedAdmin, role: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="admin">Election Admin (EC)</option>
                  <option value="polling_agent">Polling Agent</option>
                  <option value="superadmin">System Admin (Super Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assign to Election
                </label>
                <select
                  value={selectedAdmin.election}
                  onChange={(e) =>
                    setSelectedAdmin({
                      ...selectedAdmin,
                      election: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">-- Select Election --</option>
                  {elections.map((election) => (
                    <option key={election.id} value={election.id}>
                      {election.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* ✅ Admin table */}
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Election
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.election || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      admin.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {admin.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => {
                      setSelectedAdmin(admin);
                      setShowEditForm(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
