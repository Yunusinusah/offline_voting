import { ImageUpload } from "../shared/ImageUpload";

export function CandidateAddForm({ 
  candidateForm, 
  setCandidateForm, 
  onSubmit, 
  onCancel, 
  loading,
  portfolioName
}) {
  const handleImageSelect = (file, preview) => {
    setCandidateForm(prev => ({ ...prev, file, preview }));
  };

  const handleImageRemove = () => {
    setCandidateForm(prev => ({ ...prev, file: null, preview: null }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {portfolioName ? (
        <p className="text-sm text-gray-500">Adding candidate to <strong>{portfolioName}</strong></p>
      ) : null}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Candidate Name</label>
        <input
          type="text"
          required
          value={candidateForm.name}
          onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter candidate name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ballot Number (Optional)</label>
        <input
          type="number"
          min={1}
          value={candidateForm.ballotNumber ?? ""}
          onChange={(e) => setCandidateForm({ ...candidateForm, ballotNumber: e.target.value ? Number(e.target.value) : null })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter ballot position (e.g. 1, 2, 3)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Candidate Photo (Optional)</label>
        <ImageUpload
          onFileSelect={handleImageSelect}
          currentFile={candidateForm.file}
          preview={candidateForm.preview}
          onRemove={handleImageRemove}
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading || !candidateForm.name.trim()}
          className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add Candidate"}
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