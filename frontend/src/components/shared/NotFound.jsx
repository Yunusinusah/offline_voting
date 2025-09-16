import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">404 — Page not found</h1>
        <p className="text-gray-600 mb-6">We couldn't find the page you're looking for. It may have been moved or deleted.</p>
        <div className="flex justify-center gap-3">
          <Link to="/" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
