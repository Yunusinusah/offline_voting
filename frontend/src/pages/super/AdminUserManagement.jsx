import React, { useState, useEffect } from "react";
import { Modal } from "../../components/shared/Modal";
import api from "../../utils/api";
import { fetchElections } from "../../utils/utils";
import { toast } from "react-toastify";
import { Edit, Trash2 } from "lucide-react";
import InlineLoader from '../../components/shared/InlineLoader';
import TableEmptyState from '../../components/shared/TableEmptyState';

export function AdminUserManagement() {
  const [admins, setAdmins] = useState([]);
  const [elections, setElections] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [newAdmin, setNewAdmin] = useState({
    email: "",
    role: "admin",
    password: "",
    election: "",
    username: "",
  });

  const [editAdmin, setEditAdmin] = useState({
    id: "",
    email: "",
    username: "",
    election: "",
  });

  // Load elections
  useEffect(() => {
    const loadElections = async () => {
      const data = await fetchElections();
      setElections(data);
    };
    loadElections();
    fetchAdmins();
  }, []);

  const [loading, setLoading] = useState(false);

  // Load admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/admin/`);
      setAdmins(response.data.results || []);
    } catch (error) {
      console.error("Error fetching admins", error);
    } finally {
      setLoading(false);
    }
  };

  // Create
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/admin/admin/`, newAdmin);

      if (response.status === 201 || response.status === 200) {
        setAdmins((prev) => [...prev, response.data]);
        toast.success("Admin created successfully");
        setNewAdmin({
          email: "",
          password: "",
          election: "",
          username: "",
        });
        setShowCreateForm(false);
      } else {
        toast.error("Failed to create admin");
      }
    } catch {
      toast.error("Error creating admin");
    }
  };

  // Edit Admin
  const handleEditAdmin = (admin) => {
    setEditAdmin({
      id: admin.id,
      email: admin.email,
      username: admin.username,
      election: admin.election_id || "",
    });
    setShowEditForm(true);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        email: editAdmin.email,
        username: editAdmin.username,
        election: editAdmin.election,
      };

      const response = await api.put(
        `/admin/admin/${editAdmin.id}/`,
        updateData
      );

      if (response.status === 200) {
        setAdmins((prev) =>
          prev.map((admin) =>
            admin.id === editAdmin.id ? { ...admin, ...response.data } : admin
          )
        );
        toast.success("Admin updated successfully");
        setShowEditForm(false);
        setEditAdmin({ id: "", email: "", username: "", election: "" });
      } else {
        toast.error("Failed to update admin");
      }
    } catch {
      toast.error("Error updating admin");
    }
  };

  // Delete Admin
  const handleDeleteAdmin = async (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await api.delete(`/admin/admin/${selectedAdmin.id}/`);
      if (response.status === 204 || response.status === 200) {
        setAdmins((prev) =>
          prev.filter((admin) => admin.id !== selectedAdmin.id)
        );
        toast.success("Admin deleted successfully");
      } else {
        toast.error("Failed to delete admin");
      }
    } catch {
      toast.error("Error deleting admin");
    }
    setShowDeleteConfirm(false);
    setSelectedAdmin(null);
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
                    placeholder="Enter admin email"
                    required
                    value={newAdmin.email}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    required
                    value={newAdmin.username}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, username: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
      {showEditForm && (
        <Modal
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          title="Edit Admin"
        >
          <div className="bg-white p-6 mb-6">
            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editAdmin.email}
                    onChange={(e) =>
                      setEditAdmin({ ...editAdmin, email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={editAdmin.username}
                    onChange={(e) =>
                      setEditAdmin({ ...editAdmin, username: e.target.value })
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
                  value={editAdmin.election}
                  onChange={(e) =>
                    setEditAdmin({ ...editAdmin, election: e.target.value })
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
                  Update Admin
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
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Election
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4}>
                  <InlineLoader message="Loading admins…" />
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <TableEmptyState message="No admins found" suggestion="Create a new admin to begin" />
                </td>
              </tr>
            ) : admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {admin.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {elections.find((e) => e.id === parseInt(admin.election_id))
                    ?.title || "Not assigned"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEditAdmin(admin)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors"
                      title="Edit Admin"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                      title="Delete Admin"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirm Delete"
        >
          <div className="bg-white p-6">
            <h3 className="text-lg font-medium mb-4">Delete Admin</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the admin "{selectedAdmin?.email}
              "? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}