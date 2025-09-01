export default function ReviewSelections({
  portfolios,
  selections,
  onBack,
  onConfirm,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-center">Review Your Selections</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {portfolios.map((portfolio) => {
          const choice = selections[portfolio.id];

          return choice && choice.name !== "Skipped" ? (
            <div
              key={portfolio.id}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow border"
            >
              <img
                src={choice.image}
                alt={choice.name}
                className="w-20 h-20 rounded-full object-cover border border-gray-200 shadow-sm mb-2"
              />
              <span className="font-medium text-base text-gray-800">
                {choice.name}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {portfolio.position}
              </span>
            </div>
          ) : (
            <div
              key={portfolio.id}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-gray-500"
            >
              <span className="font-medium text-sm">{portfolio.position}</span>
              <span className="italic text-xs mt-1">Skipped</span>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={onBack}
          className="bg-gray-200 px-3 py-1.5 text-sm rounded-md hover:bg-gray-300"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="bg-green-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-green-700"
        >
          Confirm & Cast Vote
        </button>
      </div>
    </div>
  );
}
