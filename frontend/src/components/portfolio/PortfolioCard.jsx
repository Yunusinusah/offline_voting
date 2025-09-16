import {
  Trash2,
  Edit,
  Users,
  UserPlus,
  ArrowUpDown,
  Filter,
} from "lucide-react";
const UPLOAD_URL = import.meta.env.VITE_API_UPLOAD_URL;
export function PortfolioCard({
  portfolio,
  onEdit,
  onDelete,
  onAddCandidate,
  onRemoveCandidate,
  getRestrictionDisplayText,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      {/* Portfolio Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {portfolio.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <ArrowUpDown size={12} />#{portfolio.priority}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => onEdit(portfolio)}
            className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            title="Edit portfolio"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(portfolio.id)}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete portfolio"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Voting Restrictions */}
      <div className="mb-5 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <Filter size={14} className="text-gray-600" />
          <p className="text-sm font-medium text-gray-700">Voting Access:</p>
        </div>
        <p className="text-sm text-gray-600 pl-6">
          {getRestrictionDisplayText(portfolio)}
        </p>
      </div>

      {/* Candidates Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Users size={16} />
            Candidate{portfolio.candidates?.length > 1 && "s"} (
            {portfolio.candidates.length})
          </h4>
          <button
            onClick={() => onAddCandidate(portfolio.id)}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={14} />
            Add
          </button>
        </div>

        {portfolio.candidates.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">No candidates added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {portfolio.candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                {candidate.profile_picture ? (
                  <img
                    src={`${UPLOAD_URL}${candidate.profile_picture}`}
                    alt={candidate.full_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="text-white font-medium text-sm">
                      {candidate.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                  {candidate.full_name}
                  {candidate.ballot_num  ? (
                    <span className="text-xs text-gray-500 ml-2">#{candidate.ballot_num}</span>
                  ) : null}
                </span>
                <button
                  onClick={() => onRemoveCandidate(portfolio.id, candidate.id)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove candidate"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
