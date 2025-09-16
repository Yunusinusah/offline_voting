import { useState, useEffect } from "react";
import { Modal } from "../../components/shared/Modal";
import { Edit, Trash2, Plus } from "lucide-react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { fetchElections } from "../../utils/utils";
import { formatDateTime, toInputDateTime } from "../../utils/datetime";
import StatusBadge from '../../components/shared/StatusBadge';
import InlineLoader from '../../components/shared/InlineLoader';
import TableEmptyState from '../../components/shared/TableEmptyState';
// election status helper used where needed via StatusBadge

// Election Management Component
export function ElectionManagement() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);

  const [newElection, setNewElection] = useState({
    title: "",
    start_time: "",
    end_time: "",
    is_active: false,
    max_votes_per_voter: 1,
  });

  const [editElection, setEditElection] = useState({
    title: "",
    start_time: "",
    end_time: "",
    is_active: false,

    max_votes_per_voter: 1,
  });

  useEffect(() => {
    const loadElections = async () => {
      try {
        setLoading(true);
        const allElections = await fetchElections();
        setElections(allElections);
      } finally {
        setLoading(false);
      }
    };
    loadElections();
  }, []);


  const handleEdit = (election) => {
    setSelectedElection(election);
    setEditElection({
      title: election.title,
      // convert DB datetime to input-friendly format
      start_time: toInputDateTime(election.start_time),
      end_time: toInputDateTime(election.end_time),
      is_active: election.is_active,
      max_votes_per_voter: election.max_votes_per_voter,
    });
    setShowEditForm(true);
  };

  const handleDelete = (election) => {
    setSelectedElection(election);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await api.delete(
        `/admin/elections/${selectedElection.id}/`
      );
      if (response.status === 200 || response.status === 204) {
        toast.success("Election deleted successfully");
        setElections((prev) =>
          prev.filter((el) => el.id !== selectedElection.id)
        );
        setShowDeleteConfirm(false);
        setSelectedElection(null);
      }
    } catch {
      toast.error("Error deleting election");
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/admin/elections/`, newElection);
      if (response.status === 201 || response.status === 200) {
        toast.success("Election created successfully");
        setElections((prev) => [...prev, response.data]); // ✅ add new election instantly
        setNewElection({
          title: "",
          start_time: "",
          end_time: "",
          is_active: false,
          max_votes_per_voter: 1,
        });
        setShowCreateForm(false);
      }
    } catch(error) {
      toast.error(error.response.data.error || "Error creating election");
    }
  };

  const handleUpdateElection = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(
        `/admin/elections/${selectedElection.id}/`,
        editElection
      );
      if (response.status === 200) {
        toast.success("Election updated successfully");
        setElections((prev) =>
          prev.map((el) => (el.id === selectedElection.id ? response.data : el))
        );
        setEditElection({
          title: "",
          start_time: "",
          end_time: "",
          is_active: false,
          max_votes_per_voter: 1,
        });
        setShowEditForm(false);
        setSelectedElection(null);
      }
    } catch (error) {
      toast.error(error.response.data.error || "E rror updating election");
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
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Create New Election</span>
        </button>
      </div>

      {/* Create Election Modal */}
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

      {/* Edit Election Modal */}
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

      {/* Elections Table */}
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
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <InlineLoader message="Loading elections…" />
                </td>
              </tr>
            ) : elections.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <TableEmptyState message="No elections found" suggestion="Create an election to get started" />
                </td>
              </tr>
            ) : null}
            {elections.map((election) => (
                <tr key={election.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {election.title}
                  </td>
                  {(() => {
                    return (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge election={election} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(election.start_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(election.end_time)}
                        </td>
                      </>
                    );
                  })()}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button
                        className={`p-1 hover:bg-indigo-50 rounded transition-colors ${
                          election.is_active
                            ? "opacity-50 cursor-not-allowed text-gray-400"
                            : "text-indigo-600 hover:text-indigo-900"
                        }`}
                        onClick={() =>
                          !election.is_active && handleEdit(election)
                        }
                        disabled={election.is_active}
                        title={
                          election.is_active
                            ? "Cannot edit active election"
                            : "Edit Election"
                        }
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className={`p-1 hover:bg-red-50 rounded transition-colors ${
                          election.is_active
                            ? "opacity-50 cursor-not-allowed text-gray-400"
                            : "text-red-600 hover:text-red-900"
                        }`}
                        onClick={() =>
                          !election.is_active && handleDelete(election)
                        }
                        disabled={election.is_active}
                        title={
                          election.is_active
                            ? "Cannot delete active election"
                            : "Delete Election"
                        }
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