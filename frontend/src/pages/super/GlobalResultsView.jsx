import React, { useState } from "react";

// Global Results View Component
export function GlobalResultsView() {
  const [selectedElection, setSelectedElection] = useState("all");
  const [results] = useState({
    overall: {
      totalVoters: 5000,
      votesCast: 3245,
      participationRate: 64.9
    },
    elections: [
      {
        id: 1,
        name: "Student Council 2025",
        candidates: [
          { name: "John Smith", votes: 1245, percentage: 38.4 },
          { name: "Sarah Johnson", votes: 987, percentage: 30.4 },
          { name: "Mike Brown", votes: 654, percentage: 20.1 },
          { name: "Emily Davis", votes: 359, percentage: 11.1 }
        ]
      }
    ]
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Global Results View</h2>
        <select
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="all">All Elections</option>
          <option value="1">Student Council 2025</option>
        </select>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-3xl font-bold text-indigo-600">{results.overall.totalVoters}</div>
          <div className="text-sm text-gray-600">Total Registered Voters</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-3xl font-bold text-green-600">{results.overall.votesCast}</div>
          <div className="text-sm text-gray-600">Total Votes Cast</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-3xl font-bold text-blue-600">{results.overall.participationRate}%</div>
          <div className="text-sm text-gray-600">Participation Rate</div>
        </div>
      </div>

      {/* Election Results */}
      {results.elections.map((election) => (
        <div key={election.id} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">{election.name}</h3>
          <div className="space-y-4">
            {election.candidates.map((candidate, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{candidate.name}</span>
                  <span className="text-sm text-gray-600">
                    {candidate.votes} votes ({candidate.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${candidate.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
