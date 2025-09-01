import { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function BallotCards({
  portfolio,
  handleSelect,
  handleSkip,
  prevStep,
  currentStep,
  totalSteps,
  selectedCandidate,
}) {
  const [confirmCandidate, setConfirmCandidate] = useState(null);

  const isUnopposed = portfolio.candidates.length === 1;
  const candidate = isUnopposed ? portfolio.candidates[0] : null;

  const confirmVote = (candidate) => {
    setConfirmCandidate(candidate);
  };

  const handleConfirm = () => {
    if (confirmCandidate) {
      handleSelect(portfolio, confirmCandidate);
      setConfirmCandidate(null); // close modal
    }
  };

  return (
    <div className="p-4">
      {/* Position Title */}
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-gray-800">
          {portfolio.position}
        </h3>
        <p className="text-gray-600 mt-1 text-sm">
          {isUnopposed
            ? `${candidate.name} is unopposed. Do you approve?`
            : "Select your preferred candidate"}
        </p>
      </div>

      <div className="flex-1 mt-3">
        {isUnopposed ? (
          <div
            className={`relative flex flex-col items-center p-4 rounded-lg shadow border transition ${
              selectedCandidate?.name === candidate.name
                ? "border-green-500 ring-2 ring-green-400 bg-green-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <img
              src={candidate.image}
              alt={candidate.name}
              className="w-20 h-20 rounded-full object-cover border border-gray-200 shadow-sm mb-2"
            />
            <span className="font-medium text-base text-gray-800">
              {candidate.name}
            </span>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() =>
                  handleSelect(portfolio, { ...candidate, decision: "YES" })
                }
                className={`px-3 py-1 text-sm rounded-md transition ${
                  selectedCandidate?.decision === "YES"
                    ? "bg-green-700 text-white"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                YES
              </button>
              <button
                onClick={() =>
                  handleSelect(portfolio, { ...candidate, decision: "NO" })
                }
                className={`px-3 py-1 text-sm rounded-md transition ${
                  selectedCandidate?.decision === "NO"
                    ? "bg-red-700 text-white"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                NO
              </button>
            </div>

            {selectedCandidate?.name === candidate.name && (
              <CheckCircle className="absolute top-2 right-2 text-green-500 w-5 h-5" />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {portfolio.candidates.map((candidate, index) => {
              const isSelected =
                selectedCandidate?.name === candidate.name &&
                !selectedCandidate?.decision;

              return (
                <div
                  key={candidate.name + index}
                  className={`relative flex flex-col items-center p-4 rounded-lg shadow border transition ${
                    isSelected
                      ? "border-green-500 ring-2 ring-green-400 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <img
                    src={candidate.image}
                    alt={candidate.name}
                    className="w-20 h-20 rounded-full object-cover border border-gray-200 shadow-sm mb-2"
                  />
                  <span className="font-medium text-base text-gray-800">
                    {candidate.name}
                  </span>

                  <button
                    onClick={() => confirmVote(candidate)}
                    className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Vote
                  </button>

                  <div className="absolute inset-0 flex items-start justify-start p-2 pointer-events-none">
                    <span className="text-sm font-bold bg-blue-100 rounded-full py-0.5 px-2 text-blue-600 select-none">
                      {candidate.ballot_number ?? index + 1}
                    </span>
                  </div>

                  {isSelected && (
                    <CheckCircle className="absolute top-2 right-2 text-green-500 w-5 h-5" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-3">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex items-center px-4 py-1.5 rounded-md text-sm transition-colors ${
            currentStep === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ← Previous
        </button>

        <button
          onClick={() => handleSkip(portfolio)}
          className="flex items-center px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Skip →
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center items-center pt-2">
        <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Step <span className="text-blue-600">{currentStep + 1}</span> of{" "}
          <span className="text-gray-700">{totalSteps}</span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmCandidate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h4 className="text-lg font-bold text-gray-800 mb-2">
              Confirm Vote
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to vote for{" "}
              <span className="font-semibold text-gray-900">
                {confirmCandidate.name}
              </span>{" "}
              as {portfolio.position}?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmCandidate(null)}
                className="px-3 py-1.5 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
