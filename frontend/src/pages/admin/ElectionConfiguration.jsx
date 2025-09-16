import { toast } from "react-toastify";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Modal } from "../../components/shared/Modal";
import { PageHeader } from "../../components/shared/PageHeader";
import { ErrorAlert } from "../../components/shared/ErrorAlert";
import LoaderOverlay from '../../components/shared/LoaderOverlay';
import { EmptyState } from "../../components/shared/EmptyState";
import { SearchBar } from "../../components/shared/SearchBar";
import { PortfolioCard } from "../../components/portfolio/PortfolioCard";
import { PortfolioForm } from "../../components/portfolio/PortfolioForm";
import { CandidateAddForm } from "../../components/candidate/CandidateAddForm";
import { ConfirmDeleteModal } from "../../components/shared/ConfirmDeleteModal";

import api from "../../utils/api";
import { getElectionStatus } from '../../utils/election';

const DEFAULT_VOTING_RESTRICTIONS = [
  { value: "general", label: "All Students (General)" },
  { value: "gender", label: "Gender" },
  { value: "level", label: "Level" },
];

export function ElectionConfiguration() {
  // Refs for cleanup
  const errorTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  // State management
  const [election, setElection] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState({});
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Form states
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    file: null,
    preview: null,
    portfolioId: null,
    ballotNumber: null,
  });

  const [portfolioForm, setPortfolioForm] = useState({
    name: "",
    number: 1,
    votingRestriction: "general",
    restrictionDetails: {},
  });

  // Constants
  const votingRestrictions = DEFAULT_VOTING_RESTRICTIONS;

  // Cleanup function
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Memoized filtered portfolios
  const filteredPortfolios = useMemo(() => {
    if (!searchTerm.trim()) return portfolios;
    const searchLower = searchTerm.toLowerCase().trim();
    return portfolios.filter(
      (portfolio) =>
        portfolio.name.toLowerCase().includes(searchLower) ||
        (portfolio.candidates || []).some((candidate) =>
          candidate.name.toLowerCase().includes(searchLower)
        )
    );
  }, [portfolios, searchTerm]);

  // Convert backend restriction_type/restriction_details to frontend votingRestriction + details
  const mapBackendRestrictionToFrontend = useCallback(
    (restrictionType, details = {}) => {
      if (
        !restrictionType ||
        restrictionType === "general" ||
        restrictionType === "NONE"
      ) {
        return { votingRestriction: "general", restrictionDetails: {} };
      }

      if (restrictionType === "GENDER_MALE_ONLY") {
        return {
          votingRestriction: "gender",
          restrictionDetails: { gender: "male" },
        };
      }

      if (restrictionType === "GENDER_FEMALE_ONLY") {
        return {
          votingRestriction: "gender",
          restrictionDetails: { gender: "female" },
        };
      }

      if (restrictionType.startsWith("LEVEL_")) {
        const parts = restrictionType.split("_");
        const idx = Number(parts[1]) || 0;
        const levelVal = idx > 0 ? String(idx * 100) : details?.level || "";
        return {
          votingRestriction: "level",
          restrictionDetails: { level: String(levelVal) },
        };
      }

      // Fallback to details-based mapping
      if (details && typeof details === "object") {
        if (details.gender) {
          return {
            votingRestriction: "gender",
            restrictionDetails: { gender: String(details.gender) },
          };
        }
        if (details.level) {
          return {
            votingRestriction: "level",
            restrictionDetails: { level: String(details.level) },
          };
        }
      }

      return { votingRestriction: "general", restrictionDetails: {} };
    },
    []
  );

  // Compute backend restriction_type enum from frontend form values
  const computeRestrictionTypeFromForm = useCallback(
    (votingRestriction, restrictionDetails = {}) => {
      if (votingRestriction === "general") return "NONE";
      
      if (votingRestriction === "gender") {
        const gender = (restrictionDetails?.gender || "").toLowerCase();
        return gender === "male" ? "GENDER_MALE_ONLY" : "GENDER_FEMALE_ONLY";
      }
      
      if (votingRestriction === "level") {
        const lvl = String(restrictionDetails?.level || "").replace(/[^0-9]/g, "");
        const n = Number(lvl);
        if (!n || n <= 0) return "NONE";
        const idx = Math.round(n / 100);
        if (idx >= 1 && idx <= 6) return `LEVEL_${idx}`;
        return "NONE";
      }
      
      return "NONE";
    },
    []
  );

  // Reset form helpers
  const resetPortfolioForm = useCallback(() => {
    setPortfolioForm({
      name: "",
      number: 1,
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
      ballotNumber: null,
    });
  }, []);

  // Error handler with cleanup
  const handleError = useCallback((error, message) => {
    const errorMessage = `${message}: ${error?.response?.data?.message || error.message}`;
    
    if (mountedRef.current) {
      setError(errorMessage);
      
      // Clear existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      
      // Set new timeout
      errorTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setError(null);
        }
      }, 5000);
    }
  }, []);

  // Combined load function to prevent double loading
  const loadElectionAndPortfolios = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load election first
      const electionRes = await api.get(`/admin/elections/me`);
      const electionData = electionRes.data;
      
      if (!mountedRef.current) return;

      if (!electionData) {
        setElection(null);
        setPortfolios([]);
        return;
      }

      const normalizedElection = !electionData.id && electionData._id
        ? { ...electionData, id: electionData._id }
        : electionData;
      
      setElection(normalizedElection);

      // Load portfolios if election exists
      if (normalizedElection?.id) {
        const portfoliosRes = await api.get(`/admin/portfolios`);
        
        if (!mountedRef.current) return;
        
        const portfoliosData = portfoliosRes.data || [];
        const mappedPortfolios = portfoliosData.map((portfolio) => {
          const mappedRestriction = mapBackendRestrictionToFrontend(
            portfolio.restriction_type || portfolio.voting_restriction,
            portfolio.restriction_details
          );
          
          return {
            ...portfolio,
            votingRestriction: mappedRestriction.votingRestriction,
            restrictionDetails: mappedRestriction.restrictionDetails || {},
            candidates: portfolio.candidates || [],
          };
        });
        
        setPortfolios(mappedPortfolios);
      } else {
        setPortfolios([]);
      }
    } catch (err) {
      if (mountedRef.current) {
        handleError(err, "Failed to load election data");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  }, [handleError, mapBackendRestrictionToFrontend]);

  // Refresh portfolios only (after CRUD operations)
  const refreshPortfolios = useCallback(async () => {
    if (!election?.id || !mountedRef.current) return;

    try {
      setError(null);
      
      const portfoliosRes = await api.get(`/admin/portfolios`);
      
      if (!mountedRef.current) return;
      
      const portfoliosData = portfoliosRes.data || [];
      const mappedPortfolios = portfoliosData.map((portfolio) => {
        const mappedRestriction = mapBackendRestrictionToFrontend(
          portfolio.restriction_type || portfolio.voting_restriction,
          portfolio.restriction_details
        );
        
        return {
          ...portfolio,
          votingRestriction: mappedRestriction.votingRestriction,
          restrictionDetails: mappedRestriction.restrictionDetails || {},
          candidates: portfolio.candidates || [],
        };
      });
      
      setPortfolios(mappedPortfolios);
    } catch (err) {
      if (mountedRef.current) {
        handleError(err, "Failed to refresh portfolios");
      }
    }
  }, [election?.id, handleError, mapBackendRestrictionToFrontend]);

  // Initial load effect
  useEffect(() => {
    loadElectionAndPortfolios();
  }, [loadElectionAndPortfolios]);

  // Portfolio CRUD operations
  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    
    if (!election?.id || !portfolioForm.name.trim() || !mountedRef.current) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: portfolioForm.name.trim(),
        priority: Number.parseInt(portfolioForm.number) || 0,
        restriction_type: computeRestrictionTypeFromForm(
          portfolioForm.votingRestriction,
          portfolioForm.restrictionDetails
        ),
        restriction_details: portfolioForm.restrictionDetails || {},
        election_id: election.id,
      };

      if (editingPortfolio) {
        await api.put(`/admin/portfolios/${editingPortfolio.id}`, payload);
      } else {
        await api.post(`/admin/portfolios`, payload);
      }
      
      if (!mountedRef.current) return;
      
      toast.success(
        `Portfolio ${editingPortfolio ? "updated" : "created"} successfully`
      );
      
      await refreshPortfolios();
      resetPortfolioForm();
      setShowPortfolioForm(false);
    } catch (err) {
      if (mountedRef.current) {
        handleError(
          err,
          `Failed to ${editingPortfolio ? "update" : "create"} portfolio`
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleEditPortfolio = useCallback((portfolio) => {
    setPortfolioForm({
      name: portfolio.name || "",
      number: portfolio.number || portfolio.priority || 1,
      votingRestriction: portfolio.votingRestriction || "general",
      restrictionDetails: portfolio.restrictionDetails || {},
    });
    setEditingPortfolio(portfolio);
    setShowPortfolioForm(true);
  }, []);

  const removePortfolio = useCallback((portfolioId) => {
    setConfirmDelete({
      type: "portfolio",
      id: portfolioId,
      message:
        "Are you sure you want to delete this portfolio? This will also remove all candidates.",
    });
  }, []);

  // Candidate CRUD operations
  const handleCandidateSubmit = async (e, portfolioId) => {
    e.preventDefault();
    
    if (!candidateForm.name.trim() || !mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("portfolio_id", portfolioId);
      formData.append("full_name", candidateForm.name.trim());
      formData.append("election_id", election.id);
      
      if (candidateForm.ballotNumber) {
        formData.append("ballot_num", candidateForm.ballotNumber);
      }
      
      if (candidateForm.file) {
        formData.append("profile_picture", candidateForm.file);
      }

      await api.post("/admin/candidates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!mountedRef.current) return;
      
      toast.success("Candidate added successfully");
      await refreshPortfolios();
      resetCandidateForm();
      setShowCandidateForm(prev => ({ ...prev, [portfolioId]: false }));
    } catch (err) {
      if (mountedRef.current) {
        handleError(err, "Failed to create candidate");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const removeCandidate = useCallback((portfolioId, candidateId) => {
    setConfirmDelete({
      type: "candidate",
      id: candidateId,
      portfolioId,
      message: "Are you sure you want to remove this candidate?",
    });
  }, []);

  // Handle confirm delete action from modal
  const handleConfirmDelete = async () => {
    if (!confirmDelete || !mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      if (confirmDelete.type === "portfolio") {
        await api.delete(`/admin/portfolios/${confirmDelete.id}`);
      } else if (confirmDelete.type === "candidate") {
        await api.delete(`/admin/candidates/${confirmDelete.id}`);
      }
      
      if (!mountedRef.current) return;
      
      toast.success(`${confirmDelete.type} removed successfully`);
      await refreshPortfolios();
      setConfirmDelete(null);
    } catch (err) {
      if (mountedRef.current) {
        handleError(err, `Failed to delete ${confirmDelete.type}`);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Helper functions for portfolio card
  const getRestrictionDisplayText = useCallback((portfolio) => {
    const { votingRestriction, restrictionDetails = {} } = portfolio;

    switch (votingRestriction) {
      case "general":
        return "All Students";
      case "gender": {
        const gender = restrictionDetails.gender || "Gender";
        return `${gender.charAt(0).toUpperCase() + gender.slice(1)} Only`;
      }
      case "level":
        return `Level ${restrictionDetails.level || "N/A"} Only`;
      default:
        return "Unknown Restriction";
    }
  }, []);

  // Event handlers
  const handleAddPortfolio = useCallback(() => {
    resetPortfolioForm();
    setShowPortfolioForm(true);
  }, [resetPortfolioForm]);

  const handleAddCandidate = useCallback((portfolioId) => {
    resetCandidateForm();
    setShowCandidateForm(prev => ({ ...prev, [portfolioId]: true }));
  }, [resetCandidateForm]);

  const handlePortfolioFormCancel = useCallback(() => {
    setShowPortfolioForm(false);
    resetPortfolioForm();
  }, [resetPortfolioForm]);

  const handleCandidateFormCancel = useCallback((portfolioId) => {
    setShowCandidateForm(prev => ({ ...prev, [portfolioId]: false }));
    resetCandidateForm();
  }, [resetCandidateForm]);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleErrorDismiss = useCallback(() => {
    setError(null);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Sorted portfolios for rendering
  const sortedFilteredPortfolios = useMemo(() => {
    return [...filteredPortfolios].sort((a, b) => {
      const aNum = a.number || a.priority || 0;
      const bNum = b.number || b.priority || 0;
      return aNum - bNum;
    });
  }, [filteredPortfolios]);

  const electionStatus = getElectionStatus(election);

  if (election && (election.is_active || electionStatus.text === 'Ended')) {
    const isActive = Boolean(election.is_active);
    return (
        <div className="max-w-3xl w-full mx-auto bg-white p-8 rounded shadow text-center">
          <div className="flex flex-col items-center">
            <div className={`w-24 h-24 flex items-center justify-center rounded-full mb-4 ${isActive ? 'bg-green-50' : 'bg-red-50'}`}>
              {isActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.681-1.36 3.446 0l3.58 6.36c.75 1.333-.213 2.99-1.723 2.99H6.4c-1.51 0-2.473-1.657-1.723-2.99l3.58-6.36zM11 13a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <h2 className="text-2xl font-semibold text-gray-900">{isActive ? 'Election in progress' : 'Election has ended'}</h2>
            <p className="mt-3 text-gray-600 max-w-xl">{isActive ? 'Live configuration is disabled while the election is running. Use the monitoring dashboard to watch progress in real-time.' : 'Configuration is disabled after the election has ended. You can view official results for this election.'}</p>

            <div className="mt-6 flex items-center gap-3">
              {isActive ? (
                <Link to="/admin/live-monitoring" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500">Monitor</Link>
              ) : (
                <Link to="/admin/results" className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500">View Results</Link>
              )}

            </div>

            <div className="mt-6 text-sm text-gray-500">
              <div>Election: <strong>{election.title || '-'}</strong></div>
              <div>Start: {election.start_time ? new Date(election.start_time).toLocaleString() : '-'}</div>
              <div>End: {election.end_time ? new Date(election.end_time).toLocaleString() : '-'}</div>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        election={election}
        onAddPortfolio={handleAddPortfolio}
        loading={loading}
      />

      <ErrorAlert error={error} onDismiss={handleErrorDismiss} />

      {portfolios.length > 0 && (
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholder="Search portfolios or candidates..."
        />
      )}

      {loading && <LoaderOverlay message="Loading election configuration…" />}

      {!loading && !initialLoad && portfolios.length === 0 && (
        <EmptyState type="portfolios" onAction={handleAddPortfolio} />
      )}

      {!loading && sortedFilteredPortfolios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedFilteredPortfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onEdit={handleEditPortfolio}
              onDelete={removePortfolio}
              onAddCandidate={handleAddCandidate}
              onRemoveCandidate={removeCandidate}
              getRestrictionDisplayText={getRestrictionDisplayText}
            />
          ))}
        </div>
      )}

      {!loading &&
        portfolios.length > 0 &&
        filteredPortfolios.length === 0 &&
        searchTerm.trim() && (
          <EmptyState
            type="no-results"
            searchTerm={searchTerm}
            onClearSearch={handleClearSearch}
          />
        )}

      {/* Portfolio Modal */}
      <Modal
        isOpen={showPortfolioForm}
        onClose={handlePortfolioFormCancel}
        title={editingPortfolio ? "Edit Portfolio" : "Add New Portfolio"}
        size="lg"
      >
        <PortfolioForm
          portfolioForm={portfolioForm}
          setPortfolioForm={setPortfolioForm}
          votingRestrictions={votingRestrictions}
          onSubmit={handlePortfolioSubmit}
          onCancel={handlePortfolioFormCancel}
          loading={loading}
          isEditing={!!editingPortfolio}
        />
      </Modal>

      {/* Candidate Modals */}
      {portfolios.map((portfolio) => (
        <Modal
          key={`candidate-${portfolio.id}`}
          isOpen={!!showCandidateForm[portfolio.id]}
          onClose={() => handleCandidateFormCancel(portfolio.id)}
          title={`Add Candidate to ${portfolio.name}`}
        >
          <CandidateAddForm
            candidateForm={candidateForm}
            setCandidateForm={setCandidateForm}
            onSubmit={(e) => handleCandidateSubmit(e, portfolio.id)}
            onCancel={() => handleCandidateFormCancel(portfolio.id)}
            loading={loading}
            portfolioName={portfolio.name}
          />
        </Modal>
      ))}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!confirmDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={loading}
        message={confirmDelete?.message}
      />
    </div>
  );
}