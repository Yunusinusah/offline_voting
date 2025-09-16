import { AlertCircle, X } from "lucide-react";

export function ErrorAlert({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600"
      >
        <X size={16} />
      </button>
    </div>
  );
}