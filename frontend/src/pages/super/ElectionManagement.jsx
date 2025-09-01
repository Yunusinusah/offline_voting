import { useState, useEffect } from "react";
import { Modal } from "../../components/shared/Modal";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { fetchElections } from "../../utils/utils";

// Election Management Component
export function ElectionManagement() {
  const [elections, setElections] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);

  const [newElection, setNewElection] = useState({
    title: "",
    start_time: "",
    end_time: "",
    is_active: false,
  });

  const [editElection, setEditElection] = useState({
    title: "",
    start_time: "",
    end_time: "",
    is_active: false,
  });

  const handleEdit = (election) => {
    setSelectedElection(election);
    setEditElection({
      title: election.title,
      start_time: election.start_time,
      end_time: election.end_time,
      is_active: election.is_active,
    });
    setShowEditForm(true);
  };

  const handleDelete = (election) => {
    setSelectedElection(election);
    setShowDeleteConfirm(true);
  };

  useEffect(() => {
    const loadElections = async () => {
      const elections = await fetchElections(BASE_URL);
      setElections(elections);
    };
    loadElections();
  }, []);

  const confirmDelete = async () => {
    try {
      const response = await api.delete(
        `/api/elections/elections/${selectedElection.id}/`
      );
      if (response.status === 200 || response.status === 204) {
        toast.success("Election deleted successfully");
        setShowDeleteConfirm(false);
        setSelectedElection(null);
        fetchElections(BASE_URL);
      }
    } catch (error) {
      toast.error("Error deleting election");
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(`/api/elections/elections/`, newElection);

      if (response.status === 201 || response.status === 200) {
        toast.success("Election created successfully");
        setNewElection({
          title: "",
          start_time: "",
          end_time: "",
          is_active: false,
        });
        setShowCreateForm(false);
        fetchElections(BASE_URL);
      } else {
        toast.error("Failed to create election");
      }
    } catch (error) {
      toast.error("Error creating election");
      console.error(error);
    }
  };

  const handleUpdateElection = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put(
        `/api/elections/elections/${selectedElection.id}/`,
        editElection
      );

      if (response.status === 200) {
        toast.success("Election updated successfully");
        setEditElection({
          title: "",
          start_time: "",
          end_time: "",
          is_active: false,
        });
        setShowEditForm(false);
        setSelectedElection(null);
        fetchElections(BASE_URL);
      } else {
        toast.error("Failed to update election");
      }
    } catch (error) {
      toast.error("Error updating election");
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Election Management
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500"
        >
          Create New Election
        </button>
      </div>

      {showCreateForm && (
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Create New Election"
        >
          <div className="bg-white p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Create New Election</h3>
            <form onSubmit={handleCreateElection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Election Name
                </label>
                <input
                  type="text"
                  required
                  value={newElection.title}
                  onChange={(e) =>
                    setNewElection({ ...newElection, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter election name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newElection.start_time}
                    onChange={(e) =>
                      setNewElection({
                        ...newElection,
                        start_time: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newElection.end_time}
                    onChange={(e) =>
                      setNewElection({
                        ...newElection,
                        end_time: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={newElection.is_active}
                    onChange={(e) =>
                      setNewElection({
                        ...newElection,
                        is_active: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Active Election
                  </span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500"
                >
                  Create Election
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
      {showEditForm && (
        <Modal
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          title="Edit Election"
        >
          <div className="bg-white p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Edit Election</h3>
            <form onSubmit={handleUpdateElection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Election Name
                </label>
                <input
                  type="text"
                  required
                  value={editElection.title}
                  onChange={(e) =>
                    setEditElection({ ...editElection, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter election name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editElection.start_time}
                    onChange={(e) =>
                      setEditElection({
                        ...editElection,
                        start_time: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editElection.end_time}
                    onChange={(e) =>
                      setEditElection({
                        ...editElection,
                        end_time: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* ✅ Active Checkbox */}
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={editElection.is_active}
                    onChange={(e) =>
                      setEditElection({
                        ...editElection,
                        is_active: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Active Election
                  </span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500"
                >
                  Update Election
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirm Delete"
        >
          <div className="bg-white p-6">
            <h3 className="text-lg font-medium mb-4">Delete Election</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the election "
              {selectedElection?.title}"? This action cannot be undone.
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
                Election Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {elections &&
              elections.map((election) => (
                <tr key={election.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {election.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        election.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {election.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {election.start_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {election.end_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      onClick={() => handleEdit(election)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(election)}
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
