import { Filter } from "lucide-react";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export function PortfolioForm({
  portfolioForm,
  setPortfolioForm,
  votingRestrictions,
  onSubmit,
  onCancel,
  loading,
  isEditing,
}) {
  // Helper function to get available options for a restriction type
  const getRestrictionOptions = (restrictionType) => {
    if (restrictionType === "gender") {
      return GENDER_OPTIONS;
    }

    if (restrictionType === "level") {
      const levels = [100, 200, 300, 400, 500, 600];
      return levels.map((l) => ({ value: String(l), label: String(l) }));
    }

    return [];
  };

  const renderRestrictionForm = () => {
    const { votingRestriction } = portfolioForm;

    if (votingRestriction === "general") return null;

    return (
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
          <Filter size={16} />
          Restriction Details
        </h4>

        {votingRestriction === "gender" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Gender
            </label>
            <select
              value={portfolioForm.restrictionDetails.gender || ""}
              onChange={(e) =>
                setPortfolioForm({
                  ...portfolioForm,
                  restrictionDetails: { gender: e.target.value },
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Gender</option>
              {getRestrictionOptions("gender").map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {votingRestriction === "level" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Level
            </label>
            <select
              value={portfolioForm.restrictionDetails.level || ""}
              onChange={(e) =>
                setPortfolioForm({
                  ...portfolioForm,
                  restrictionDetails: { level: e.target.value },
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Level</option>
              {getRestrictionOptions("level").map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Portfolio Name
          </label>
          <input
            type="text"
            required
            value={portfolioForm.name}
            onChange={(e) =>
              setPortfolioForm({ ...portfolioForm, name: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Student Council President"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Display Order
          </label>
          <input
            type="number"
            min="1"
            required
            value={portfolioForm.number}
            onChange={(e) =>
              setPortfolioForm({ ...portfolioForm, number: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Voting Restrictions
        </label>
        <select
          value={portfolioForm.votingRestriction}
          onChange={(e) =>
            setPortfolioForm({
              ...portfolioForm,
              votingRestriction: e.target.value,
              restrictionDetails: {},
            })
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {votingRestrictions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {renderRestrictionForm()}

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Update Portfolio"
            : "Create Portfolio"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
