export default function SidebarSteps({
  portfolios,
  currentStep,
  reviewMode,
  selections,
  setCurrentStep,
  setReviewMode,
}) {
  const lastPortfolio = portfolios[portfolios.length - 1];
  const lastStepCompleted = !!selections[lastPortfolio.id];

  return (
    <div className="w-64 bg-white shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Ballot Steps</h2>
      <ul className="space-y-2">
        {portfolios.map((portfolio, index) => {
          const choice = selections[portfolio.id];

          return (
            <li
              key={portfolio.id}
              className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                currentStep === index && !reviewMode
                  ? "bg-blue-100 font-semibold border-l-4 border-blue-500"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                setReviewMode(false);
                setCurrentStep(index);
              }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 font-bold">{index + 1}.</span>
                <span>{portfolio.position}</span>
              </div>

              {choice ? (
                choice.name === "Skipped" ? (
                  <span className="text-sm text-gray-500 font-semibold">⏭</span>
                ) : (
                  <span className="text-sm text-green-600 font-bold">✔</span>
                )
              ) : null}
            </li>
          );
        })}

        <li
          className={`p-3 rounded-lg flex justify-between items-center ${
            !lastStepCompleted
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "cursor-pointer hover:bg-gray-100"
          } ${
            reviewMode && lastStepCompleted
              ? "bg-blue-100 font-semibold border-l-4 border-blue-500"
              : ""
          }`}
          onClick={() => {
            if (lastStepCompleted) {
              setReviewMode(true);
            }
          }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 font-bold">
              {portfolios.length + 1}.
            </span>
            <span>Review & Confirm</span>
          </div>
          {reviewMode && lastStepCompleted && (
            <span className="text-sm text-blue-600 font-bold">🔍</span>
          )}
        </li>
      </ul>
    </div>
  );
}
