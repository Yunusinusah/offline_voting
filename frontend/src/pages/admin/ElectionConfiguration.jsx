import { useEffect, useState, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Modal } from "../../components/shared/Modal";
import api from "../../utils/api";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  Vote, 
  Calendar,
  UserPlus,
  Image,
  X,
  ArrowUpDown,
  Filter,
  Shield,
  Upload,
  AlertCircle,
  Search,
  Eye,
  EyeOff
} from "lucide-react";

// Constants for voting restrictions
const VOTING_RESTRICTIONS = [
  { value: "general", label: "All Students (General)" },
  { value: "gender", label: "Specific Gender" },
  { value: "level", label: "Specific Level" },
  { value: "department", label: "Specific Department" },
  { value: "course_level", label: "Specific Course at Level" },
  { value: "hostel", label: "Specific Hostel" }
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" }
];

export function ElectionConfiguration() {
  // State management
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState({});
  const [editingPortfolio, setEditingPortfolio] = useState(null);

  // Form states
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    file: null,
    preview: null,
    portfolioId: null,
  });

  const [portfolioForm, setPortfolioForm] = useState({
    name: "",
    number: 1,
    maxCandidates: 1,
    votingRestriction: "general",
    restrictionDetails: {},
  });

  // Custom hooks for dropzone
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    onDrop: useCallback((acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const preview = URL.createObjectURL(file);
        setCandidateForm(prev => ({ ...prev, file, preview }));
      }
    }, [])
  });

  // Memoized filtered portfolios
  const filteredPortfolios = useMemo(() => {
    if (!searchTerm) return portfolios;
    return portfolios.filter(portfolio => 
      portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.candidates.some(candidate => 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [portfolios, searchTerm]);

  // Reset form helper
  const resetPortfolioForm = useCallback(() => {
    setPortfolioForm({
      name: "",
      number: 1,
      maxCandidates: 1,
      votingRestriction: "general",
      restrictionDetails: {},
    });
    setEditingPortfolio(null);
  }, []);

  const resetCandidateForm = useCallback(() => {
    setCandidateForm({
      name: "",
      file: null,
      preview: null,
      portfolioId: null,
    });
  }, []);

  // Error handler
  const handleError = useCallback((error, message) => {
    console.error(message, error);
    setError(`${message}: ${error?.response?.data?.message || error.message}`);
    setTimeout(() => setError(null), 5000);
  }, []);

  // Load elections with error handling
  const loadElections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/elections`);
      const electionData = res.data || [];
      setElections(electionData);
      
      if (electionData.length > 0 && !selectedElectionId) {
        setSelectedElectionId(electionData[0].id);
      }
    } catch (err) {
      handleError(err, 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  }, [selectedElectionId, handleError]);

  // Fetch portfolios and candidates
  const fetchElectionData = useCallback(async () => {
    if (!selectedElectionId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch portfolios
      const pRes = await api.get(`/admin/portfolios/election/${selectedElectionId}`);
      const ports = pRes.data || [];
      
      // Fetch candidates
      let candidates = [];
      try {
        const cRes = await api.get(`/admin/candidates/election/${selectedElectionId}`);
        candidates = cRes.data || [];
      } catch (e) {
        console.warn('Could not fetch candidates:', e?.response?.status || e.message);
      }

      // Map and merge data
      const mappedPortfolios = ports.map((p) => ({
        id: p.id,
        name: p.name,
        number: p.priority !== undefined ? p.priority : (p.number || 1),
        maxCandidates: p.max_candidates || p.maxCandidates || 1,
        votingRestriction: p.voting_restriction || 'general',
        restrictionDetails: p.restriction_details || {},
        candidates: candidates
          .filter(c => c.portfolio_id === p.id)
          .map((c) => ({
            id: c.id,
            name: c.full_name,
            picture: c.profile_picture,
          })),
        election_id: p.election_id || selectedElectionId,
      }));

      setPortfolios(mappedPortfolios);
    } catch (err) {
      handleError(err, 'Failed to load election data');
    } finally {
      setLoading(false);
    }
  }, [selectedElectionId, handleError]);

  // Effects
  useEffect(() => {
    loadElections();
  }, [loadElections]);

  useEffect(() => {
    fetchElectionData();
  }, [fetchElectionData]);

  // Portfolio CRUD operations
  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    if (!selectedElectionId || !portfolioForm.name.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        name: portfolioForm.name.trim(),
        priority: Number.parseInt(portfolioForm.number) || 0,
        max_candidates: Number.parseInt(portfolioForm.maxCandidates) || 1,
        voting_restriction: portfolioForm.votingRestriction,
        restriction_details: portfolioForm.restrictionDetails,
        election_id: selectedElectionId,
      };
      
      if (editingPortfolio) {
        await api.put(`/admin/portfolios/${editingPortfolio.id}`, payload);
      } else {
        await api.post(`/admin/portfolios`, payload);
      }
      
      await fetchElectionData();
      resetPortfolioForm();
      setShowPortfolioForm(false);
    } catch (err) {
      handleError(err, `Failed to ${editingPortfolio ? 'update' : 'create'} portfolio`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPortfolio = (portfolio) => {
    setPortfolioForm({
      name: portfolio.name,
      number: portfolio.number,
      maxCandidates: portfolio.maxCandidates,
      votingRestriction: portfolio.votingRestriction,
      restrictionDetails: portfolio.restrictionDetails,
    });
    setEditingPortfolio(portfolio);
    setShowPortfolioForm(true);
  };

  const removePortfolio = async (portfolioId) => {
    if (!window.confirm('Are you sure you want to delete this portfolio? This will also remove all candidates.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.delete(`/admin/portfolios/${portfolioId}`);
      await fetchElectionData();
    } catch (err) {
      handleError(err, 'Failed to remove portfolio');
    } finally {
      setLoading(false);
    }
  };

  // Candidate CRUD operations
  const handleCandidateSubmit = async (e, portfolioId) => {
    e.preventDefault();
    if (!candidateForm.name.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const fd = new FormData();
      fd.append('portfolio_id', portfolioId);
      fd.append('full_name', candidateForm.name.trim());
      fd.append('election_id', selectedElectionId);
      if (candidateForm.file) {
        fd.append('profile_picture', candidateForm.file);
      }
      
      await api.post('/admin/candidates', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      await fetchElectionData();
      resetCandidateForm();
      setShowCandidateForm({ ...showCandidateForm, [portfolioId]: false });
    } catch (err) {
      handleError(err, 'Failed to create candidate');
    } finally {
      setLoading(false);
    }
  };

  const removeCandidate = async (portfolioId, candidateId) => {
    if (!window.confirm('Are you sure you want to remove this candidate?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.delete(`/admin/candidates/${candidateId}`);
      await fetchElectionData();
    } catch (err) {
      handleError(err, 'Failed to remove candidate');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getRestrictionDisplayText = (portfolio) => {
    const { votingRestriction, restrictionDetails } = portfolio;
    
    switch (votingRestriction) {
      case "general":
        return "All Students";
      case "gender":
        return `${restrictionDetails.gender || "Gender"} Only`;
      case "level":
        return `Level ${restrictionDetails.level || "N/A"} Only`;
      case "department":
        return `${restrictionDetails.department || "Department"} Only`;
      case "course_level":
        return `${restrictionDetails.department || "Department"} Level ${restrictionDetails.level || "N/A"}`;
      case "hostel":
        return `${restrictionDetails.hostel || "Hostel"} Only`;
      default:
        return "Unknown Restriction";
    }
  };

  const renderRestrictionForm = () => {
    const { votingRestriction } = portfolioForm;
    
    if (votingRestriction === "general") return null;

    return (
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
          <Filter size={16} />
          Restriction Details
        </h4>
        
        {votingRestriction === "gender" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
            <select
              value={portfolioForm.restrictionDetails.gender || ""}
              onChange={(e) =>
                setPortfolioForm({
                  ...portfolioForm,
                  restrictionDetails: { gender: e.target.value },
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Gender</option>
              {GENDER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {votingRestriction === "level" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
            <input
              type="text"
              placeholder="e.g., 200, 300, 400"
              value={portfolioForm.restrictionDetails.level || ""}
              onChange={(e) =>
                setPortfolioForm({
                  ...portfolioForm,
                  restrictionDetails: { level: e.target.value },
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        )}

        {votingRestriction === "department" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
            <input
              type="text"
              placeholder="e.g., Computer Science, Engineering"
              value={portfolioForm.restrictionDetails.department || ""}
              onChange={(e) =>
                setPortfolioForm({
                  ...portfolioForm,
                  restrictionDetails: { department: e.target.value },
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        )}

        {votingRestriction === "course_level" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
              <input
                type="text"
                placeholder="e.g., Computer Science"
                value={portfolioForm.restrictionDetails.department || ""}
                onChange={(e) =>
                  setPortfolioForm({
                    ...portfolioForm,
                    restrictionDetails: {
                      ...portfolioForm.restrictionDetails,
                      department: e.target.value,
                    },
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
              <input
                type="text"
                placeholder="e.g., 200, 300"
                value={portfolioForm.restrictionDetails.level || ""}
                onChange={(e) =>
                  setPortfolioForm({
                    ...portfolioForm,
                    restrictionDetails: {
                      ...portfolioForm.restrictionDetails,
                      level: e.target.value,
                    },
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
        )}

        {votingRestriction === "hostel" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Hostel</label>
            <input
              type="text"
              placeholder="e.g., Hostel A, Hostel B"
              value={portfolioForm.restrictionDetails.hostel || ""}
              onChange={(e) =>
                setPortfolioForm({
                  ...portfolioForm,
                  restrictionDetails: { hostel: e.target.value },
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Election Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">Manage portfolios and candidates for elections</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {/* Election Selector */}
          <div className="relative w-full sm:w-56">
            <select 
              value={selectedElectionId || ''} 
              onChange={(e) => setSelectedElectionId(Number(e.target.value))} 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              disabled={loading}
            >
              {elections.map((el) => (
                <option key={el.id} value={el.id}>{el.title}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Vote size={18} className="text-gray-500" />
            </div>
          </div>
          
          {/* Add Portfolio Button */}
          <button
            onClick={() => {
              resetPortfolioForm();
              setShowPortfolioForm(true);
            }}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Add Portfolio
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search Bar */}
      {portfolios.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search portfolios or candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && portfolios.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolios yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first portfolio for this election</p>
          <button
            onClick={() => {
              resetPortfolioForm();
              setShowPortfolioForm(true);
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Create Portfolio
          </button>
        </div>
      )}

      {/* Portfolio Grid */}
      {!loading && filteredPortfolios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios
            .sort((a, b) => a.number - b.number)
            .map((portfolio) => (
              <div key={portfolio.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                {/* Portfolio Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{portfolio.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                        <ArrowUpDown size={12} />
                        #{portfolio.number}
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Users size={12} />
                        Max: {portfolio.maxCandidates}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleEditPortfolio(portfolio)}
                      className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                      title="Edit portfolio"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => removePortfolio(portfolio.id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete portfolio"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Voting Restrictions */}
                <div className="mb-5 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Filter size={14} className="text-gray-600" />
                    <p className="text-sm font-medium text-gray-700">Voting Access:</p>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">
                    {getRestrictionDisplayText(portfolio)}
                  </p>
                </div>

                {/* Candidates Section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Users size={16} />
                      Candidates ({portfolio.candidates.length}/{portfolio.maxCandidates})
                    </h4>
                    <button
                      onClick={() => {
                        resetCandidateForm();
                        setShowCandidateForm({ ...showCandidateForm, [portfolio.id]: true });
                      }}
                      disabled={portfolio.candidates.length >= portfolio.maxCandidates}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UserPlus size={14} />
                      Add
                    </button>
                  </div> 

                  {portfolio.candidates.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">No candidates added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {portfolio.candidates.map((candidate) => (
                        <div key={candidate.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                          {candidate.picture ? (
                            <img
                              src={candidate.picture}
                              alt={candidate.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                              <span className="text-white font-medium text-sm">
                                {candidate.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="flex-1 text-sm font-medium text-gray-800 truncate">{candidate.name}</span>
                          <button
                            onClick={() => removeCandidate(portfolio.id, candidate.id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove candidate"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Portfolio Modal */}
      <Modal 
        isOpen={showPortfolioForm} 
        onClose={() => {
          setShowPortfolioForm(false);
          resetPortfolioForm();
        }}
        title={editingPortfolio ? "Edit Portfolio" : "Add New Portfolio"}
        size="lg"
      >
        <form onSubmit={handlePortfolioSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Portfolio Name</label>
              <input
                type="text"
                required
                value={portfolioForm.name}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Student Council President"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
              <input
                type="number"
                min="1"
                required
                value={portfolioForm.number}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, number: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum Candidates</label>
            <input
              type="number"
              min="1"
              max="10"
              required
              value={portfolioForm.maxCandidates}
              onChange={(e) => setPortfolioForm({ ...portfolioForm, maxCandidates: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Voting Restrictions</label>
            <select
              value={portfolioForm.votingRestriction}
              onChange={(e) =>
                setPortfolioForm({
                  ...portfolioForm,
                  votingRestriction: e.target.value,
                  restrictionDetails: {},
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {VOTING_RESTRICTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {renderRestrictionForm()}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (editingPortfolio ? "Updating..." : "Creating...") : (editingPortfolio ? "Update Portfolio" : "Create Portfolio")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPortfolioForm(false);
                resetPortfolioForm();
              }}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Candidate Modals */}
      {portfolios.map((portfolio) => (
        <Modal
          key={`candidate-${portfolio.id}`}
          isOpen={showCandidateForm[portfolio.id]}
          onClose={() => {
            setShowCandidateForm({ ...showCandidateForm, [portfolio.id]: false });
            resetCandidateForm();
          }}
          title={`Add Candidate to ${portfolio.name}`}
        >
          <form onSubmit={(e) => handleCandidateSubmit(e, portfolio.id)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Candidate Name</label>
              <input
                type="text"
                required
                value={candidateForm.name}
                onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter candidate name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Candidate Photo (Optional)</label>
              
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload size={24} className={`mb-2 ${isDragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-500">
                    {isDragActive ? (
                      <span className="font-semibold text-indigo-600">Drop the image here</span>
                    ) : (
                      <>
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              
              {/* Image Preview */}
              {candidateForm.preview && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={candidateForm.preview}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Image ready for upload</p>
                    <p className="text-xs text-gray-500">{candidateForm.file?.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCandidateForm({ ...candidateForm, file: null, preview: null });
                      URL.revokeObjectURL(candidateForm.preview);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <X size={14} />
                    Remove
                  </button>
                </div>
              )}

              {/* File validation errors */}
              {acceptedFiles.length === 0 && candidateForm.file && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  File validation failed. Please ensure the image is under 5MB and in a supported format.
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || !candidateForm.name.trim()}
                className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Candidate"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCandidateForm({ ...showCandidateForm, [portfolio.id]: false });
                  resetCandidateForm();
                }}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      ))}

      {/* No results for search */}
      {!loading && portfolios.length > 0 && filteredPortfolios.length === 0 && searchTerm && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 mb-4">
            No portfolios or candidates match "{searchTerm}". Try adjusting your search.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}