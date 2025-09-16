import { useState } from "react";
import {
  CheckCircle,
  ChevronLeft,
  User,
  SkipForward,
  AlertCircle,
  X,
  Vote,
  Info,
  Shield,
} from "lucide-react";
import ConfirmModal from "../shared/ConfirmVoteModal";

export default function BallotCards({
  portfolio,
  handleSelect,
  handleSkip,
  prevStep,
  currentStep,
  nextStep,
  totalSteps,
  selectedCandidate,
}) {
  const [confirmCandidate, setConfirmCandidate] = useState(null);
  const [showConfirmSkip, setShowConfirmSkip] = useState(false);

  const isUnopposed = portfolio.candidates.length === 1;
  const candidate = isUnopposed ? portfolio.candidates[0] : null;

  const confirmVote = (candidate) => {
    setConfirmCandidate(candidate);
  };

  const handleConfirm = () => {
    if (confirmCandidate) {
      handleSelect(portfolio, confirmCandidate);
      setConfirmCandidate(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          <span className="text-xl font-medium text-gray-700">
            {portfolio.position}
          </span>
        </div>
        <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
          Step <span className="text-indigo-600 mx-1">{currentStep + 1}</span>{" "}
          of <span className="text-gray-700 ml-1">{totalSteps}</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
          <Info className="h-4 w-4" />
          <p>
            {isUnopposed
              ? `${candidate.name} is running unopposed`
              : `Select your preferred candidate`}
          </p>
        </div>
      </div>

      <div className="flex-1">
        {isUnopposed ? (
          <div className="flex justify-center">
            <div
              className={`relative flex flex-col items-center p-8 rounded-2xl shadow-sm border transition-all duration-300 w-full max-w-md ${
                selectedCandidate?.name === candidate.name
                  ? "border-green-500 ring-4 ring-green-400/20 bg-green-50"
                  : "border-gray-200 bg-white hover:shadow-lg hover:border-gray-300"
              }`}
            >
              <div className="relative mb-6">
                {candidate.image ? (
                  <img
                    src={candidate.image}
                    alt={candidate.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-xl">
                    <User className="h-12 w-12 text-indigo-600" />
                  </div>
                )}
                <div className="absolute -top-2 -right-2 bg-blue-100 rounded-full p-2 shadow-sm">
                  <span className="text-sm font-bold text-blue-700 px-2">
                    #{candidate.ballot_number || "1"}
                  </span>
                </div>
              </div>

              <span className="font-semibold text-gray-900 text-center mb-6 text-lg">
                {candidate.name}
              </span>

              <div className="flex space-x-4 w-full max-w-xs">
                <button
                  onClick={() =>
                    handleSelect(portfolio, { ...candidate, decision: "YES" })
                  }
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl text-base font-medium transition-all duration-200 shadow-sm ${
                    selectedCandidate?.decision === "YES"
                      ? "bg-green-700 text-white shadow-inner"
                      : "bg-green-600 text-white hover:bg-green-700 hover:shadow-md"
                  }`}
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    handleSelect(portfolio, { ...candidate, decision: "NO" })
                  }
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl text-base font-medium transition-all duration-200 shadow-sm ${
                    selectedCandidate?.decision === "NO"
                      ? "bg-red-700 text-white shadow-inner"
                      : "bg-red-600 text-white hover:bg-red-700 hover:shadow-md"
                  }`}
                >
                  Reject
                </button>
              </div>

              {selectedCandidate?.name === candidate.name && (
                <div className="absolute top-4 right-4 bg-green-100 rounded-full p-2 shadow-sm">
                  <CheckCircle className="text-green-600 w-6 h-6" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.candidates.map((candidate, index) => {
              const isSelected =
                selectedCandidate?.name === candidate.name &&
                !selectedCandidate?.decision;

              return (
                <div
                  key={candidate.name + index}
                  className={`relative flex flex-col items-center p-6 rounded-2xl shadow-sm border transition-all duration-300 ${
                    isSelected
                      ? "border-green-500 ring-4 ring-green-400/20 bg-green-50 transform scale-105"
                      : "border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 hover:transform hover:scale-105"
                  }`}
                >
                  <div className="relative mb-4">
                    {candidate.image ? (
                      <img
                        src={candidate.image}
                        alt={candidate.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                        <User className="h-10 w-10 text-indigo-600" />
                      </div>
                    )}
                    <div className="absolute -top-2 -right-2 bg-blue-100 rounded-full p-1.5 shadow-sm">
                      <span className="text-xs font-bold text-blue-700 px-2">
                        #{candidate.ballot_number || index + 1}
                      </span>
                    </div>
                  </div>

                  <span className="font-semibold text-gray-900 text-center mb-4 text-base leading-tight">
                    {candidate.name}
                  </span>

                  <button
                    onClick={() => confirmVote(candidate)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Vote className="h-4 w-4" />
                    Select Candidate
                  </button>

                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-green-100 rounded-full p-1.5 shadow-sm">
                      <CheckCircle className="text-green-600 w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            currentStep === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <button
          onClick={() => {
            if (currentStep < totalSteps - 1) {
              // call a parent "nextStep" function
              // (should be passed as a prop just like prevStep)
              nextStep();
            }
          }}
          disabled={currentStep === totalSteps - 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            currentStep === totalSteps - 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
          }`}
        >
          Next
        </button>

        <button
          onClick={() => setShowConfirmSkip(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:text-gray-800 hover:bg-gray-200 transition-all duration-200 hover:shadow-sm"
        >
          Skip Position
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      {/*confirm vote modal */}
      <ConfirmModal
        isOpen={!!confirmCandidate}
        title="Confirm Your Vote"
        icon={<AlertCircle className="h-6 w-6 text-blue-500" />}
        message={`You are about to vote for ${confirmCandidate?.name} as ${portfolio.position}. This action cannot be undone.`}
        confirmText="Confirm Vote"
        confirmColor="from-green-600 to-emerald-600"
        onCancel={() => setConfirmCandidate(null)}
        onConfirm={handleConfirm}
      />

      {/*Confirm Skip Vote modal */}
      <ConfirmModal
        isOpen={!!showConfirmSkip}
        title="Confirm Skip Position"
        icon={<AlertCircle className="h-6 w-6 text-blue-500" />}
        message={`Are you sure you want to skip voting for ${portfolio.position}? You can choose to vote later before final submission.`}
        confirmText="Yes, Skip"
        confirmColor="from-red-600 to-red-700"
        onCancel={() => setShowConfirmSkip(false)}
        onConfirm={() => {
          handleSkip(portfolio);
          setShowConfirmSkip(false);
        }}
      />
    </div>
  );
}