import { Plus, Shield, Search, X } from "lucide-react";

export function EmptyState({ 
  type = "portfolios", 
  onAction, 
  searchTerm, 
  onClearSearch 
}) {
  if (type === "no-results" && searchTerm) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500 mb-4">
          No portfolios or candidates match "{searchTerm}". Try adjusting your search.
        </p>
        <button
          onClick={onClearSearch}
          className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          <X size={16} />
          Clear Search
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
        <Shield className="h-8 w-8 text-indigo-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolios yet</h3>
      <p className="text-gray-500 mb-4">Get started by creating your first portfolio for this election</p>
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
      >
        <Plus size={16} />
        Create Portfolio
      </button>
    </div>
  );
}