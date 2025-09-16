export function PortfolioSummary({ portfolio }) {
  const total = Number(portfolio?.totalVotes || 0);
  const candidates = Array.isArray(portfolio?.candidates) ? portfolio.candidates : [];

  return (
    <div key={portfolio?.id} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-1">{portfolio?.name || 'Portfolio'}</h3>
      {portfolio?.decisionTarget && (
        <div className="text-sm text-gray-500 mb-2">Decision for: <span className="font-medium text-gray-700">{portfolio.decisionTarget.name}</span></div>
      )}
      <p className="text-sm text-gray-600 mb-4">Total Votes: {total.toLocaleString()}</p>

      <div className="space-y-3">
        {candidates.length === 0 && <div className="text-sm text-gray-500">No candidates to display.</div>}
        {candidates.map((candidate, index) => {
          const votes = Number(candidate.votes || 0);
          const pct = candidate.percentage != null ? Number(candidate.percentage) : (total > 0 ? Number(((votes / total) * 100).toFixed(1)) : 0);
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">{candidate.name}</span>
                <span className="text-sm text-gray-600">{votes.toLocaleString()} ({pct}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${candidate.name === 'YES' ? 'bg-green-600' : candidate.name === 'NO' ? 'bg-red-500' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
