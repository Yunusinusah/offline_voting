"use client";
import { useState } from "react";
import { PortfolioSummary } from "../../components/admin/PortfolioSummary";


// Live Monitoring Component
export function LiveMonitoring() {
  const [stats] = useState({
    totalVoters: 1500,
    votesCast: 1245,
    participationRate: 83,
    activeStations: 8,
    issuesReported: 3,
  });

  const [portfolioResults] = useState([
    {
      id: 1,
      name: "Student Council President",
      candidates: [
        { name: "John Smith", votes: 654, percentage: 52.5 },
        { name: "Sarah Johnson", votes: 591, percentage: 47.5 },
      ],
      totalVotes: 1245,
    },
    {
      id: 2,
      name: "Vice President",
      candidates: [
        { name: "Mike Davis", votes: 423, percentage: 34.0 },
        { name: "Lisa Brown", votes: 512, percentage: 41.1 },
        { name: "Tom Wilson", votes: 310, percentage: 24.9 },
      ],
      totalVotes: 1245,
    },
    {
      id: 3,
      name: "Class Representative",
      candidates: [
        { name: "Anna Lee", votes: 234, percentage: 18.8 },
        { name: "David Kim", votes: 345, percentage: 27.7 },
        { name: "Emma White", votes: 456, percentage: 36.6 },
        { name: "James Green", votes: 210, percentage: 16.9 },
      ],
      totalVotes: 1245,
    },
    {
      id: 4,
      name: "Treasurer",
      candidates: [
        { name: "Olivia Martinez", votes: 678, percentage: 54.5 },
        { name: "Ethan Garcia", votes: 567, percentage: 45.5 },
      ],
      totalVotes: 1245,
    },
    {
      id: 5,
      name: "Secretary",
      candidates: [
        { name: "Sophia Rodriguez", votes: 512, percentage: 41.1 },
        { name: "Liam Hernandez", votes: 733, percentage: 58.9 },
      ],
      totalVotes: 1245,
    },
     {
      id: 5,
      name: "Secretary",
      candidates: [
        { name: "Sophia Rodriguez", votes: 512, percentage: 41.1 },
        { name: "Liam Hernandez", votes: 733, percentage: 58.9 },
      ],
      totalVotes: 1245,
    },
    
  ]);

  // const [liveResults] = useState([
  //   { time: "14:30", votes: 1245 },
  //   { time: "14:00", votes: 1100 },
  //   { time: "13:30", votes: 950 },
  //   { time: "13:00", votes: 800 },
  //   { time: "12:30", votes: 650 },
  // ]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Monitoring Dashboard</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalVoters}</div>
          <div className="text-sm text-blue-800">Total Voters</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-green-600">{stats.votesCast}</div>
          <div className="text-sm text-green-800">Votes Cast</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.participationRate}%</div>
          <div className="text-sm text-purple-800">Participation</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.activeStations}</div>
          <div className="text-sm text-orange-800">Active Stations</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-red-600">{stats.issuesReported}</div>
          <div className="text-sm text-red-800">Issues</div>
        </div>
      </div>

        {/* Live Results Graph */}
        {/* Voting Progress Chart */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Voting Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div className="bg-green-600 h-4 rounded-full" style={{ width: `${stats.participationRate}%` }}></div>
          </div>
          <p className="text-sm text-gray-600">{stats.participationRate}% complete</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Live Results Trend</h3>
          <div className="flex items-end h-32 space-x-2">
            {liveResults.map((result, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="bg-indigo-600 w-full rounded-t"
                  style={{ height: `${(result.votes / stats.totalVoters) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-600 mt-1">{result.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {portfolioResults.map((portfolio) => (
          <PortfolioSummary key={portfolio.id} portfolio={portfolio} />
        ))}
      </div>

      {/* Recent Activity */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-sm text-green-800">Polling Station A: 25 new votes</span>
            <span className="text-xs text-gray-500 ml-auto">2 minutes ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-blue-800">Polling Station C: System restart completed</span>
            <span className="text-xs text-gray-500 ml-auto">5 minutes ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded">
            <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
            <span className="text-sm text-yellow-800">Polling Station B: Low paper alert</span>
            <span className="text-xs text-gray-500 ml-auto">8 minutes ago</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}


