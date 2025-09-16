export function ConfirmDeleteModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  loading, 
  message = "Are you sure you want to delete this item?" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h4 className="text-lg font-bold text-gray-800 mb-2">Confirm Delete</h4>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-3 py-1.5 text-sm rounded-md ${
              loading 
                ? 'bg-red-300 text-white cursor-wait' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}