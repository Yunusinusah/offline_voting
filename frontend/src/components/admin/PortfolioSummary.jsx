"use client";
// portfolio summary
export function PortfolioSummary({ portfolio }) {
  return (
    <div key={portfolio.id} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{portfolio.name}</h3>
      <p className="text-sm text-gray-600 mb-4">Total Votes: {portfolio.totalVotes}</p>

      <div className="space-y-3">
        {portfolio.candidates.map((candidate, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">{candidate.name}</span>
              <span className="text-sm text-gray-600">
                {candidate.votes} ({candidate.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${candidate.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
