"use client";
import { useEffect, useState } from "react";
import api from "../../utils/api";

// Results and Printing Component
export function ResultsAndPrinting() {
  const [selectedElection, setSelectedElection] = useState(null);
  const [elections, setElections] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadElections() {
      try {
        const res = await api.get('/admin/elections');
        setElections(res.data || []);
        if ((res.data || []).length > 0) setSelectedElection(res.data[0].id);
      } catch (err) {
        console.error('Failed to load elections', err);
      }
    }
    loadElections();
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    setLoading(true);
    async function loadResults() {
      try {
        const res = await api.get(`/results/election/${selectedElection}`);
        setResults(res.data || null);
      } catch (err) {
        console.error('Failed to load results', err);
        setResults(null);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [selectedElection]);

  const printResults = () => window.print();

  const printAllResults = async () => {
    // Fetch results for all elections and open a print window
    try {
      const all = [];
      for (const el of elections) {
        try {
          const res = await api.get(`/results/election/${el.id}`);
          all.push({ election: el, results: res.data });
        } catch (e) {
          console.warn('Failed to load results for', el.id, e?.message || e);
        }
      }
      const printWindow = window.open('', '_blank');
      const allResultsHTML = `
        <html>
          <head>
            <title>Complete Election Results</title>
            <style>body { font-family: Arial, sans-serif; margin: 20px; } .election { margin-bottom: 40px; page-break-inside: avoid; } .candidate { margin: 10px 0; padding: 10px; border: 1px solid #ddd; } .stats { display: flex; gap: 20px; margin: 20px 0; } .stat { text-align: center; padding: 10px; background: #f5f5f5; } @media print { .election { page-break-after: always; } }</style>
          </head>
          <body>
            <h1>Complete Election Results - ${new Date().toLocaleDateString()}</h1>
            ${all.map((entry) => {
              const r = entry.results || {};
              const rows = (r.results || []).map((c) => `<div class="candidate"><strong>${c.full_name}</strong>: ${c.votes} votes (${c.percentage}%)</div>`).join('');
              return `<div class="election"><h2>${entry.election.title || entry.election.name}</h2><div class="stats"><div class="stat"><strong>${r.total_votes || 0}</strong><br/>Total Valid Votes</div><div class="stat"><strong>${r.skipped_votes || 0}</strong><br/>Skipped Votes</div></div>${rows}</div>`;
            }).join('')}
          </body>
        </html>
      `;
      printWindow.document.write(allResultsHTML);
      printWindow.document.close();
      printWindow.print();
    } catch (err) {
      console.error('Failed to print all results', err);
    }
  };

  const exportResults = (format) => {
    alert(`Exporting results as ${format.toUpperCase()}...`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Results & Printing</h2>
        <div className="flex space-x-3">
          <button
            onClick={printResults}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-500"
          >
            Print Current
          </button>
          <button
            onClick={printAllResults}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-500"
          >
            Print All Results
          </button>
          <select
            onChange={(e) => exportResults(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Export As...</option>
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-sm font-medium text-gray-700">Select Election:</label>
          <select
            value={selectedElection || ''}
            onChange={(e) => setSelectedElection(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            {elections.map((el) => (
              <option key={el.id} value={el.id}>{el.title || el.name}</option>
            ))}
          </select>
        </div>

        {!results && !loading && <div className="text-center text-gray-600">No results available for the selected election.</div>}
        {results && (
          <div className="print:break-inside-avoid">
            <h3 className="text-xl font-semibold mb-4 text-center">{results.electionId ? `Election ${results.electionId} - Official Results` : 'Official Results'}</h3>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-900">{results.total_votes || 0}</div>
                <div className="text-sm text-gray-600">Total Valid Votes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-900">{results.skipped_votes || 0}</div>
                <div className="text-sm text-gray-600">Skipped Votes</div>
              </div>
            </div>

            <div className="space-y-4">
              {(results.results || []).map((candidate, index) => (
                <div key={candidate.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{candidate.full_name}</span>
                    <span className="text-sm text-gray-600">
                      {candidate.votes} votes ({candidate.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full"
                      style={{ width: `${Number(candidate.percentage) || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> These are preliminary results. Final results will be certified after all votes
                are verified.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Result Certificates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400">
            <div className="text-gray-400 mb-2">📄</div>
            <div className="text-sm text-gray-600">Generate Winner Certificate</div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400">
            <div className="text-gray-400 mb-2">📊</div>
            <div className="text-sm text-gray-600">Full Results Report</div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400">
            <div className="text-gray-400 mb-2">📋</div>
            <div className="text-sm text-gray-600">Audit Trail Report</div>
          </button>
        </div>
      </div>
    </div>
  );
}
