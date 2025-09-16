import {
  CheckCircle,
  ChevronLeft,
  User,
  SkipForward,
  Vote,
  Shield,
  AlertTriangle,
  Send,
} from "lucide-react";

export default function ReviewSelections({
  portfolios,
  selections,
  onBack,
  onConfirm,
  isSubmitting = false,
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Review Your Selections
        </h3>
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
          <Shield className="h-4 w-4" />
          <p>Review your choices before casting your final vote</p>
        </div>
      </div>

      {/* Selections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => {
          const choice = selections[portfolio.id];
          const hasSelection = choice && choice.name !== "Skipped";

          return (
            <div
              key={portfolio.id}
              className={`flex flex-col items-center p-6 rounded-2xl shadow-sm border transition-all duration-300 ${
                hasSelection
                  ? "bg-white border-green-200 hover:shadow-lg hover:border-green-300"
                  : "bg-gray-50 border-2 border-dashed border-gray-300 hover:bg-gray-100"
              }`}
            >
              {hasSelection ? (
                <>
                  <div className="relative mb-4">
                    {choice.image ? (
                      <img
                        src={choice.image}
                        alt={choice.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                        <User className="h-10 w-10 text-indigo-600" />
                      </div>
                    )}
                    <div className="absolute -top-2 -right-2 bg-green-100 rounded-full p-1.5 shadow-sm">
                      <CheckCircle className="text-green-600 w-5 h-5" />
                    </div>
                  </div>

                  <span className="font-semibold text-gray-900 text-center text-base mb-1">
                    {choice.name}
                  </span>
                  <span className="text-sm text-gray-600 text-center">
                    {portfolio.position}
                  </span>
                  {choice.ballot_number && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-2">
                      Ballot #{choice.ballot_number}
                    </span>
                  )}

                  {choice.decision && (
                    <span
                      className={`mt-2 text-xs px-3 py-1 rounded-full font-medium ${
                        choice.decision === "YES"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {choice.decision === "YES" ? "Approved" : "Rejected"}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <SkipForward className="h-8 w-8 text-gray-400" />
                  </div>
                  <span className="font-medium text-gray-700 text-center text-sm mb-1">
                    {portfolio.position}
                  </span>
                  <span className="text-xs text-gray-500 italic">
                    No selection made
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {Object.values(selections).filter((sel) => !sel || sel.name === "Skipped")
        .length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-700">
            <span className="font-medium">Note:</span> You've skipped some
            positions. You can go back to make selections or proceed to cast
            your vote.
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Voting
        </button>

        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Casting Vote...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Confirm & Cast Vote
            </>
          )}
        </button>
      </div>

      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
          <Shield className="h-3 w-3" />
          Your vote is secure and anonymous
        </div>
      </div>
    </div>
  );
}
