import { useState, useEffect } from "react";
import { Modal } from "../../components/shared/Modal";
import { Trash2, Plus } from "lucide-react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import InlineLoader from '../../components/shared/InlineLoader';
import TableEmptyState from '../../components/shared/TableEmptyState';

// Polling Agents Management Component
export function PollingAgentsManagement() {
  const [agents, setAgents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [newAgent, setNewAgent] = useState({
    username: "",
    role: "polling_agent",
    email: "",
    password: "",
  });

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        const res = await api.get(`admin/polling_agent/`);
        if (res.status === 200) {
          setAgents(res.data.results || []);
        }
      } catch (err) {
        console.error("Error fetching agents:", err);
        toast.error("Failed to load agents");
      }
      finally { setLoading(false); }
    };

    loadAgents();
  }, []);

  const [loading, setLoading] = useState(false);

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAgent({ ...newAgent, password });
  };

  const createAgent = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("admin/polling_agent", newAgent);

      if (response.status === 201 || response.status === 200) {
        toast.success("Polling agent created successfully");
        setAgents((prev) => [...prev, response.data]);
        setNewAgent({
          username: "",
          role: "polling_agent",
          email: "",
          password: "",
        });
        setShowCreateForm(false);
      } else {
        toast.error("Failed to create agent");
      }
    } catch {
      toast.error("Error creating agent");
    }
  };

  const handleDeleteAgent = (agent) => {
    setSelectedAgent(agent);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`admin/polling_agent/${selectedAgent.id}`);
      if (res.status === 200 || res.status === 204) {
        toast.success("Agent deleted successfully");
        setAgents((prev) => prev.filter((agent) => agent.id !== selectedAgent.id));
      } else {
        toast.error("Failed to delete agent");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting agent");
    }
    setShowDeleteConfirm(false);
    setSelectedAgent(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Polling Agents Management
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Create New Agent</span>
        </button>
      </div>

      {/* Create Agent Modal */}
      {showCreateForm && (
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Create Polling Agent"
        >
          <div className="bg-white p-6">
            <h3 className="text-lg font-medium mb-4">Create Polling Agent</h3>
            <form onSubmit={createAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={newAgent.username}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, username: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter agent username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newAgent.email}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter agent email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={newAgent.password}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, password: e.target.value })
                    }
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Agent password"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-500"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500"
                >
                  Create Agent
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirm Delete"
        >
          <div className="bg-white p-6">
            <h3 className="text-lg font-medium mb-4">Delete Polling Agent</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the polling agent "{selectedAgent?.username}"? 
              This action cannot be undone.
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

      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <InlineLoader message="Loading agents…" />
                </td>
              </tr>
            ) : agents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <TableEmptyState message="No polling agents found" suggestion="Create a polling agent to get started" />
                </td>
              </tr>
            ) : agents.map((agent) => (
                <tr key={agent.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {agent.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleDeleteAgent(agent)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete Agent"
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
    </div>
  );
}