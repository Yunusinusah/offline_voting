import { useState, useEffect } from "react";
import { Modal } from "../../components/shared/Modal";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { fetchElections } from "../../utils/utils";

// Polling Agents Management Component
export function PollingAgentsManagement() {
  const [agents, setAgents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [elections, setElections] = useState([]);
  const [newAgent, setNewAgent] = useState({
    email: "",
    role: "polling_agent",
    election: "",
    password: "",
  });

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await api.get(`api/auth/users/`);
        if (res.status === 200) {
          console.log("Fetched agents:", res.data);
          setAgents(res.data.results);
        }
      } catch (err) {
        console.error("Error fetching agents:", err);
        toast.error("Failed to load agents");
      }
    };
    const loadElections = async () => {
      try {
        const elections = await fetchElections(BASE_URL);
        setElections(elections);
      } catch (err) {
        console.error("Error fetching elections:", err);
      }
    };

    loadAgents();
    loadElections();
  }, [BASE_URL]);

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
      const response = await api.post(`${BASE_URL}api/auth/users/`, newAgent);

      if (response.status === 201 || response.status === 200) {
        toast.success("Polling agent created successfully");

        // ✅ Add new agent to the list so UI updates immediately
        setAgents((prev) => [...prev, response.data]);

        setNewAgent({
          email: "",
          role: "polling_agent",
          election: "",
          password: "",
        });
        setShowCreateForm(false);
      } else {
        toast.error("Failed to create agent");
      }
    } catch (error) {
      toast.error("Error creating agent");
      console.error(error);
    }
  };

  const deleteAgent = (agentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this agent? This action cannot be undone."
      )
    ) {
      setAgents(agents.filter((agent) => agent.id !== agentId));
    }
  };

  const deactivateAgent = (agentId) => {
    setAgents(
      agents.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              status: agent.status === "active" ? "inactive" : "active",
            }
          : agent
      )
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Polling Agents Management
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500"
        >
          Create New Agent
        </button>
      </div>

      {showCreateForm && (
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Create Polling Agent"
        >
          <div className="bg-white p-6">
            <h3 className="text-lg font-medium mb-4">Create Polling Agent</h3>
            <form onSubmit={createAgent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Agent Email
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
                    Assign to Election
                  </label>
                  <select
                    value={newAgent.election}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, election: e.target.value })
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

      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Polling Station
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Password
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents &&
              agents.map((agent) => (
                <tr key={agent.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {agent.name || agent.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.station || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {agent.password}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        agent.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Reset Password
                    </button>
                    <button
                      onClick={() => deactivateAgent(agent.id)}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                    >
                      {agent.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
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
