import { 
  CheckCircle, 
  SkipForward,
  ClipboardCheck,
  ChevronRight
} from "lucide-react";

export default function SidebarSteps({
  portfolios,
  currentStep,
  reviewMode,
  selections,
}) {
  const lastPortfolio = portfolios[portfolios.length - 1];
  const lastStepCompleted = !!selections[lastPortfolio.id];

  return (
    // Use sticky positioning so the sidebar stays visible while remaining in the document flow
    // `top-24` provides an offset (6rem) from the top; adjust if you have a fixed header.
    // `max-h-[calc(100vh-6rem)]` and `overflow-auto` ensure the sidebar scrolls internally
    // instead of overlapping the main content when it's taller than the viewport.
    <div className="w-72 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 sticky top-24 self-start max-h-[calc(100vh-6rem)] overflow-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5 text-blue-600" />
        Ballot Steps
      </h2>
      
      <ul className="space-y-3">
        {portfolios.map((portfolio, index) => {
          const choice = selections[portfolio.id];
          const isCurrent = currentStep === index && !reviewMode;
          const isCompleted = choice && choice.name !== "Skipped";
          const isSkipped = choice && choice.name === "Skipped";

          return (
            <li
              key={portfolio.id}
              className={`p-4 rounded-xl transition-all duration-200 ${
                isCurrent
                  ? "bg-blue-50 border-l-4 border-blue-500 shadow-sm"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCurrent 
                      ? "bg-blue-100 text-blue-700" 
                      : isCompleted
                      ? "bg-green-100 text-green-600"
                      : isSkipped
                      ? "bg-gray-200 text-gray-600"
                      : "bg-white text-gray-400 border border-gray-300"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : isSkipped ? (
                      <SkipForward className="h-4 w-4" />
                    ) : (
                      <span className="font-semibold text-sm">{index + 1}</span>
                    )}
                  </div>
                  
                  <span className={`text-sm font-medium ${
                    isCurrent 
                      ? "text-blue-800" 
                      : isCompleted
                      ? "text-green-700"
                      : isSkipped
                      ? "text-gray-600"
                      : "text-gray-700"
                  }`}>
                    {portfolio.position}
                  </span>
                </div>
                
                {isCurrent && (
                  <ChevronRight className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              
              {isCompleted && choice.ballot_number && (
                <div className="ml-11 mt-2">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Ballot #{choice.ballot_number}
                  </span>
                </div>
              )}
            </li>
          );
        })}

        {/* Review Step */}
        <li
          className={`p-4 rounded-xl transition-all duration-200 ${
            reviewMode
              ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-sm"
              : !lastStepCompleted
              ? "bg-gray-100 text-gray-400"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              reviewMode
                ? "bg-blue-100 text-blue-700" 
                : lastStepCompleted
                ? "bg-indigo-100 text-indigo-600"
                : "bg-gray-200 text-gray-400"
            }`}>
              {reviewMode ? (
                <ClipboardCheck className="h-5 w-5" />
              ) : (
                <span className="font-semibold text-sm">{portfolios.length + 1}</span>
              )}
            </div>
            
            <span className={`text-sm font-medium ${
              reviewMode
                ? "text-blue-800" 
                : lastStepCompleted
                ? "text-indigo-700"
                : "text-gray-400"
            }`}>
              Review & Confirm
            </span>
          </div>
          
          {reviewMode && (
            <div className="ml-11 mt-2">
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Finalizing your ballot
              </span>
            </div>
          )}
        </li>
      </ul>
      
      {/* Progress Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
          <span>Voted</span>
          <span>
            {Object.values(selections).filter(sel => sel && sel.name !== "Skipped").length} of {portfolios.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500" 
            style={{ 
              width: `${(Object.values(selections).filter(sel => sel && sel.name !== "Skipped").length / portfolios.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}