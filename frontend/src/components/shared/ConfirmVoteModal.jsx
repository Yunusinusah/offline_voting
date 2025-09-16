// components/ConfirmModal.jsx
import { X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  icon,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "from-green-600 to-emerald-600",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            {icon}
            {title}
          </h4>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-600 text-sm mb-6 text-center">{message}</p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r ${confirmColor} rounded-xl hover:brightness-110 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
