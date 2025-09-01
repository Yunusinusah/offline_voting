export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
}