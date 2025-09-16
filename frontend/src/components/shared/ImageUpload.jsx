import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";

export function ImageUpload({ 
  onFileSelect, 
  currentFile = null, 
  preview = null, 
  onRemove,
  className = "",
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
  },
  placeholder = "Click to upload or drag and drop",
  description = "PNG, JPG, GIF up to 5MB"
}) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept,
    maxSize,
    multiple: false,
    onDrop: useCallback((acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const preview = URL.createObjectURL(file);
        onFileSelect?.(file, preview);
      }
    }, [onFileSelect])
  });

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    onRemove?.();
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload size={24} className={`mb-2 ${isDragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-500">
            {isDragActive ? (
              <span className="font-semibold text-indigo-600">Drop the image here</span>
            ) : (
              <>
                <span className="font-semibold">{placeholder}</span>
              </>
            )}
          </p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
      
      {preview && (
        <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <img
            src={preview}
            alt="Preview"
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Image ready for upload</p>
            <p className="text-xs text-gray-500">{currentFile?.name}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            <X size={14} />
            Remove
          </button>
        </div>
      )}

      {/* File validation errors */}
      {acceptedFiles.length === 0 && currentFile && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          File validation failed. Please ensure the image is under {Math.round(maxSize / (1024 * 1024))}MB and in a supported format.
        </div>
      )}
    </div>
  );
}