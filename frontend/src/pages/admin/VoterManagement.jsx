import { useState, useEffect } from "react";
import { Upload, Download, Edit3, Trash2, Filter, Search, UserCheck, Users } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { Modal } from "../../components/shared/Modal";
import { ConfirmDeleteModal } from "../../components/shared/ConfirmDeleteModal";
import InlineLoader from '../../components/shared/InlineLoader';
import { getElectionStatus } from '../../utils/election';

export function VoterManagement() {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  // Reset all voters
  const handleResetVoters = async () => {
    setResetLoading(true);
    try {
      const response = await api.delete("/voters/voters/reset");
      if (response.status === 200) {
        setVoters([]);
        toast.success(response.data.message || "All voters deleted");
        setResetModalOpen(false);
      } else {
        toast.error("Failed to reset voters");
      }
    } catch (error) {
      toast.error("Failed to reset voters");
      console.error(error);
    } finally {
      setResetLoading(false);
    }
  };
  const [voters, setVoters] = useState([]);
  const [election, setElection] = useState(null);

  // derive whether voter list can be modified (only when election not started or unknown)
  const electionStatusText = getElectionStatus(election).text;
  const allowVoterModifications = electionStatusText === "Not started" || electionStatusText === "Unknown";

  const fetchVoters = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/voters/voters");
      setVoters(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch voters");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  // fetch the admin's election (same pattern as other admin pages)
  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await api.get('/admin/elections/me');
        setElection(res.data);
      } catch (err) {
        console.error('Failed to fetch admin election', err);
      }
    };
    fetchElection();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState(null);

  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post("/voters/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status == 200 || response.data.success) {
          setVoters(response.data.voters || []);
          toast.success(response.data.message || "File uploaded successfully");
        } else {
          toast.error("Failed to upload file");
        }
      } catch (error) {
        toast.error(error?.response?.data?.error ||  "Error uploading file");
        console.error(error);
      } finally {
        setIsLoading(false);
        e.target.value = null;
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this voter?")) return;
    try {
      const response = await api.delete(`/voters/voters/${id}`);

      if (response.status === 200) {
        setVoters(voters.filter((v) => (v.id ?? v._id) !== id));
        toast.success(response.data.message || "Voter deleted");
      } else {
        toast.error("Failed to delete voter");
      }
    } catch (error) {
      toast.error("Failed to delete voter");
      console.error(error);
    }
  };

  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    email: "",
    level: "",
    gender: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveVoter = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingVoter) {
        const voterId = editingVoter.id ?? editingVoter._id;
        res = await api.put(`/voters/add/single/${voterId}`, formData);
      } else {
        res = await api.post("/voters/add/single", formData);
      }

      if (res.status === 200 || res.status === 201) {
        toast.success(
          res.data.message ||
            (editingVoter
              ? "Voter updated successfully"
              : "Voter created successfully")
        );
        fetchVoters();
        setFormModalOpen(false);
        setEditingVoter(null);
        setFormData({
          student_id: "",
          name: "",
          email: "",
          level: "",
          gender: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (editingVoter ? "Failed to update voter" : "Failed to create voter")
      );
      console.error(error);
    }
  };

  const handleExport = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      alert("Voter list exported successfully!");
      setIsLoading(false);
    }, 1000);
  };

  const filteredVoters = voters.filter((voter) => {
    const term = searchTerm.trim().toLowerCase();

    const matchesSearch =
      term === "" ||
      voter.student_id?.toLowerCase().includes(term) ||
      voter.name?.toLowerCase().includes(term) ||
      voter.email?.toLowerCase().includes(term) ||
      voter.level?.toString().toLowerCase().includes(term) ||
      voter.gender?.toLowerCase().includes(term);

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "voted" && (voter.has_voted === true || voter.has_voted === "true")) ||
      (filterStatus === "notVoted" && !voter.has_voted);

    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVoters = filteredVoters.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredVoters.length / itemsPerPage);

  const votedCount = voters.filter((v) => v.has_voted).length;

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Voter Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage and monitor voter participation
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Show only Add Voter when election is active or ended; show other actions only when election not started */}
          <button
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setEditingVoter(null);
              setFormData({
                student_id: "",
                name: "",
                email: "",
                level: "",
                gender: "",
              });
              setFormModalOpen(true);
            }}
          >
            Add voter
          </button>
          {/* Only show Upload/Export/Reset when election is not started OR no election loaded */}
          {allowVoterModifications && (
            <>
              <label className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-indigo-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <Upload size={16} />
                Upload Voter List
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
              <button
                onClick={handleExport}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                Export List
              </button>
              <button
                onClick={() => setResetModalOpen(true)}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
                Reset
              </button>
            </>
          )}
          {/* Confirm Delete Modal for Reset */}
          <ConfirmDeleteModal
            isOpen={resetModalOpen}
            onConfirm={handleResetVoters}
            onCancel={() => setResetModalOpen(false)}
            loading={resetLoading}
            message="Are you sure you want to delete ALL voters? This action cannot be undone."
          />
        </div>
      </div>
      
      {/* Stats Cards (only Total Voters and Votes Cast) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Voters</p>
              <p className="text-2xl font-bold text-gray-900">{voters.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Votes Cast</p>
              <p className="text-2xl font-bold text-gray-900">{votedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search voters by name, ID, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Voters</option>
              <option value="voted">Voted</option>
              <option value="notVoted">Not Voted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voters Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Student ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Level
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Gender
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Has voted
                </th>

                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center">
                    <InlineLoader message="Loading voters…" />
                  </td>
                </tr>
              ) : currentVoters.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500 font-medium">No voters found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentVoters.map((voter) => (
                  <tr
                    key={voter.id ?? voter._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {voter.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {voter.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {voter.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Level {voter.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {voter.gender}
                    </td>
                    {/* Has voted */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {voter.has_voted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        {allowVoterModifications ? (
                          <>
                            <button
                              onClick={() => {
                                setEditingVoter(voter);
                                setFormData({
                                  student_id: voter.student_id,
                                  name: voter.name,
                                  email: voter.email,
                                  level: voter.level,
                                  gender: voter.gender,
                                });
                                setFormModalOpen(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                              title="Edit voter"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(voter.id ?? voter._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                              title="Remove voter"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">Actions unavailable</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredVoters.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span>–
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredVoters.length)}
              </span>{" "}
              of <span className="font-medium">{filteredVoters.length}</span>{" "}
              voters
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
        <Modal
          isOpen={formModalOpen}
          onClose={() => {
            setFormModalOpen(false);
            setEditingVoter(null);
          }}
          title={editingVoter ? "Edit Voter" : "Add New Voter"}
        >
          <form
            id="voterForm"
            onSubmit={handleSaveVoter}
            className="space-y-4 p-3"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="student_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Student ID
                </label>
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  placeholder="Enter Student ID"
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="eg@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-700"
                >
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="" disabled>
                    --- select level ---
                  </option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="" disabled>
                  --- Select gender ---
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </form>
          <button
            onClick={() => setFormModalOpen(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400 m-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="voterForm"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
          >
            {editingVoter ? "Update" : "Create"}
          </button>
        </Modal>
      </div>

    </div>
  );
}

export default VoterManagement;
