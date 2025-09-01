import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import BallotCards from "../../components/voters/BallotCards";
import ReviewSelections from "../../components/voters/ReviewSelections";
import SidebarSteps from "../../components/voters/SidebarSteps";
import api from "../../utils/api";
import * as auth from "../../utils/auth";

export default function VoterPage() {
  const [ballotPortfolios, setBallotPortfolios] = useState([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [reviewMode, setReviewMode] = useState(false);

  const handleSelect = (portfolio, candidate) => {
    setSelections({
      ...selections,
      [portfolio.id]: candidate,
    });
    nextStep();
  };

  const handleSkip = (portfolio) => {
    setSelections({
      ...selections,
      [portfolio.id]: { name: "Skipped" },
    });
    nextStep();
  };

  const nextStep = () => {
    if (currentStep < ballotPortfolios.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setReviewMode(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCastVote = () => {
    // Build payload according to FINAL_API.json for /api/voting/voting/cast_vote/
    const user = auth.getUser();
    if (!user) {
      toast.error("User not authenticated");
      return;
    }
    const votes = Object.keys(selections).map((portfolioId) => {
      const sel = selections[portfolioId];
      if (!sel || sel?.name === "Skipped" || sel?.skip_vote) {
        return {
          portfolio_id: Number(portfolioId),
          candidate_id: null,
          skip_vote: true,
        };
      }

      return {
        portfolio_id: Number(portfolioId),
        candidate_id: sel.id || sel.candidate_id || null,
        skip_vote: false,
      };
    });

    // Determine electionId from user or first portfolio
    const electionId = user?.election_id || user?.electionId || (ballotPortfolios[0] && ballotPortfolios[0].election_id) || null;
    if (!electionId) {
      toast.error('Election not determined. Cannot cast vote.');
      return;
    }

    api.post(`/votes`, { electionId, votes })
      .then(() => {
        toast.success("\u2705 Your vote has been cast!");
        setReviewMode(false);
        setSelections({});
        setCurrentStep(0);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.error || "Failed to cast vote");
      });
  };

  useEffect(() => {
    // fetch portfolios for logged in voter
    const user = auth.getUser();
    if (!user) return;
    // Determine election id from logged in user if available
    const electionId = user?.election_id || user?.electionId || null;

    async function fetchForElection(eid) {
      try {
        // Try admin portfolios endpoint first (ordering by priority)
        const portRes = await api.get(`/admin/portfolios/election/${eid}`);
        const ports = portRes.data || [];

        // for each portfolio fetch candidates by election and group by portfolio
        // backend offers candidates list by election (admin route) so attempt that
 ection_id: p.election_id || eid,
          candidates: (candidates.filter(c => c.portfolio_id === p.id) || []).map((c) => ({
            id: c.id,
            name: c.full_name || c.name,
            image: c.profile_picture || null,
            ballot_number: c.ballot_num || c.ballot_number || null,
            portfolio_id: c.portfolio_id,
          })),
        }));

        setBallotPortfolios(mapped);
        return true;
      } catch (err) {
        // If admin endpoint returned 401/403 (no access) try a fallback approach
        console.warn('admin portfolio fetch failed', err?.response?.status || err.message);
        return false;
      }
    }

    async function tryFetch() {
      setLoadingPortfolios(true);
      // If we have an electionId try fetching
      if (electionId) {
        const ok = await fetchForElection(electionId);
        if (!ok) {
          // no admin access: attempt to use results endpoint to reconstruct candidate list (public)
          try {
            const res = await api.get(`/results/election/${electionId}`);
            const data = res.data || {};
            // results.results contains candidates list
            const results = data.results || [];
            // group candidates by portfolio_id if available; otherwise make a single portfolio
            const byPortfolio = {};
            results.forEach((c) => {
              const pid = c.portfolio_id || '1';
              if (!byPortfolio[pid]) byPortfolio[pid] = [];
              byPortfolio[pid].push({ id: c.id, name: c.full_name, image: c.profile_picture, votes: c.votes, percentage: c.percentage });
            });

            const mapped = Object.keys(byPortfolio).map((pid, idx) => ({ id: Number(pid) || idx + 1, position: `Position ${pid}`, candidates: byPortfolio[pid], election_id: electionId }));
            setBallotPortfolios(mapped);
          } catch (err) {
            console.error(err);
            toast.error('Failed to load ballot portfolios. Please contact administrator.');
          }
        }
      } else {
        // no electionId — inform user
        toast.error('No election associated with this voter account.');
      }
      setLoadingPortfolios(false);
    }

    tryFetch();
  }, []);


  if (loadingPortfolios) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">Loading ballot portfolios...</div>
      </div>
    );
  }

  if (!ballotPortfolios || ballotPortfolios.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">No ballot portfolios available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <SidebarSteps
        portfolios={ballotPortfolios}
        currentStep={currentStep}
        reviewMode={reviewMode}
        selections={selections}
        setCurrentStep={setCurrentStep}
        setReviewMode={setReviewMode}
      />

      <div className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-4xl space-y-6">
          {!reviewMode ? (
            <BallotCards
              portfolio={ballotPortfolios[currentStep]}
              handleSelect={handleSelect}
              handleSkip={handleSkip}
              prevStep={prevStep}
              currentStep={currentStep}
              totalSteps={ballotPortfolios.length}
              selectedCandidate={selections[ballotPortfolios[currentStep].id]}
            />
          ) : (
            <ReviewSelections
              portfolios={ballotPortfolios}
              selections={selections}
              onBack={() => setReviewMode(false)}
              onConfirm={handleCastVote}
            />
          )}
        </div>
      </div>
    </div>
  );
}
