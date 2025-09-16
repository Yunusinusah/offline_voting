import { Plus } from "lucide-react";

export function PageHeader({ 
  election, 
  onAddPortfolio, 
  loading 
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Election Configuration</h2>
        <p className="text-sm text-gray-600 mt-1">Manage portfolios and candidates for election</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700">
            <div className="text-xs text-gray-500">Election</div>
            <div className="font-medium text-gray-900">{election?.title || 'No election found'}</div>
          </div>
        </div>
        
        <button
          onClick={onAddPortfolio}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Add Portfolio
        </button>
      </div>
    </div>
  );
}