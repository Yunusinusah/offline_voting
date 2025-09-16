import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import BallotCards from "../../components/voters/BallotCards";
import ReviewSelections from "../../components/voters/ReviewSelections";
import SidebarSteps from "../../components/voters/SidebarSteps";
import api, { getUploadUrl } from "../../utils/api";
import { getUser, logout } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowLeft,
  ArrowRight,
  Shield,
  Vote,
  UserCheck,
  UserX,
} from "lucide-react";

export default function VoterPage() {
  const [ballotPortfolios, setBallotPortfolios] = useState([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [reviewMode, setReviewMode] = useState(false);
  const [userVoted, setUserVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
    setIsSubmitting(true);
    // Build payload according to FINAL_API.json for /api/voting/voting/cast_vote/
    const user = getUser();
    if (!user) {
      toast.error("User not authenticated");
      setIsSubmitting(false);
      return;
    }

    const votes = Object.keys(selections).map((portfolioId) => {
      const sel = selections[portfolioId];
      // if selection indicates skipped
      if (!sel || sel?.name === "Skipped" || sel?.skip_vote) {
        return {
          voter_id: user.voter_id || user.user_id || user.id,
          portfolio: Number(portfolioId),
          candidate: null,
          skip_vote: true,
          decision: null,
        };
      }
      return {
        voter_id: user.voter_id || user.user_id || user.id,
        portfolio: Number(portfolioId),
        candidate: sel.id || sel.cand_id || sel.ballot_number || null,
        skip_vote: false,
        decision: sel.decision || null,
      };
    });

    api
      .post(`/voters/votes/`, votes)
      .then(() => {
        toast.success("✅ Your vote has been cast!");
        setReviewMode(false);
        setSelections({});
        setCurrentStep(0);
        /// logout user after voting with a delay
        setTimeout(() => {
          logout();
          navigate("/");
          window.location.reload();
        }, 1500);
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || "Failed to cast vote");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  useEffect(() => {
    // fetch portfolios for logged in voter
    const user = getUser();
    if (!user) return;
    api
      .get(`/voters/votes/`)
      .then((response) => {
        const data = response.data.mapped || [];
        const mapped = data.map((p) => ({
          id: p.id,
          position: p.name,
          candidates: (p.candidates || []).map((c) => ({
            id: c.id,
            name: c.full_name,
            image: getUploadUrl(c.profile_picture),
            ballot_number: c.ballot_num,
          })),
        }));
        setUserVoted(response.data.has_voted);
        setBallotPortfolios(mapped);
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.error || "Failed to load ballot portfolios"
        );
      })
      .finally(() => setLoadingPortfolios(false));
  }, []);

  if (loadingPortfolios) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Ballot
          </h2>
          <p className="text-gray-600">Preparing your voting portfolio...</p>
        </div>
      </div>
    );
  }

  if (!ballotPortfolios || ballotPortfolios.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200 max-w-md w-full">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Ballot Available
          </h2>
          <p className="text-gray-600 mb-6">
            There are no ballot portfolios available at this time.
          </p>
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (userVoted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-6">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200 max-w-md w-full">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Vote Already Cast
          </h2>
          <p className="text-gray-600 mb-6">
            You have already cast your vote. Thank you for participating!
          </p>
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-10 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-7 w-7 text-indigo-600 mr-2" />
          <h1 className="text-lg font-semibold text-gray-800">Voting Portal</h1>
        </div>
        <div className="text-sm text-gray-500">
          Step {currentStep + 1} of {ballotPortfolios.length}
        </div>
      </div>

      <SidebarSteps
        portfolios={ballotPortfolios}
        currentStep={currentStep}
        reviewMode={reviewMode}
        selections={selections}
        setCurrentStep={setCurrentStep}
        setReviewMode={setReviewMode}
      />

      <div className="flex-1 flex items-start justify-center p-6 pt-20 md:pt-6">
        <div className="w-full max-w-4xl space-y-6">
          {!reviewMode ? (
            <BallotCards
              portfolio={ballotPortfolios[currentStep]}
              handleSelect={handleSelect}
              handleSkip={handleSkip}
              prevStep={prevStep}
              nextStep={nextStep}
              currentStep={currentStep}
              totalSteps={ballotPortfolios.length}
              selectedCandidate={selections[ballotPortfolios[currentStep]?.id]}
            />
          ) : (
            <ReviewSelections
              portfolios={ballotPortfolios}
              selections={selections}
              onBack={() => setReviewMode(false)}
              onConfirm={handleCastVote}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}