import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
const UPLOAD_URL = import.meta.env.VITE_API_UPLOAD_URL;

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex items-start gap-4">
      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
      </div>
    </div>
  );
}

function Progress({ percent }) {
  const pct = Number(percent) || 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-indigo-500 to-green-400 transition-all duration-300" 
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} 
      />
    </div>
  );
}

function CandidateAvatar({ name, profile_picture }) {
  const initials = name?.split(' ').map(n => n[0]).join('') || '?';
  
  if (profile_picture) {
    return (
      <img 
        src={`${UPLOAD_URL}${profile_picture}`} 
        alt={name} 
        className="w-full h-full object-cover" 
      />
    );
  }
  
  return (
    <span className="text-sm font-semibold text-gray-700">
      {initials}
    </span>
  );
}

function PortfolioCard({ portfolio }) {
  const candidates = portfolio.candidates || [];
  const sortedCandidates = [...candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const maxVotes = sortedCandidates.length > 0 ? (sortedCandidates[0].votes || 0) : 0;
  const winnersCount = sortedCandidates.filter(c => (c.votes || 0) === maxVotes && maxVotes > 0).length;

  return (
    <div className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-lg font-medium text-gray-800">{portfolio.name}</div>
          {portfolio.decisionTarget && (
            <div className="text-sm text-gray-500">
              Decision for: <span className="font-medium text-gray-700">{portfolio.decisionTarget.name}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {(portfolio.totalVotes || 0).toLocaleString()} votes
        </div>
      </div>
      
      <div className="space-y-3">
        {sortedCandidates.length === 0 && (
          <div className="text-sm text-gray-500 py-4 text-center">
            No candidates for this portfolio.
          </div>
        )}
        
        {sortedCandidates.map((candidate, idx) => {
          const votes = candidate.votes || 0;
          const percentage = candidate.percentage || 0;
          const isWinner = votes === maxVotes && maxVotes > 0;
          
          return (
            <div 
              key={candidate.id || idx} 
              className={`p-3 rounded-lg flex items-center gap-3 transition-all ${
                isWinner 
                  ? 'bg-green-50 border-2 border-green-200 shadow-sm' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white overflow-hidden flex items-center justify-center border-2 border-gray-200">
                <CandidateAvatar 
                  name={candidate.name} 
                  profile_picture={candidate.profile_picture} 
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {candidate.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isWinner ? (winnersCount > 1 ? 'Winner (tie)' : 'Winner') : 'Candidate'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {votes.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <Progress percent={percentage} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ShowResults({ params }) {
  const electionId = params?.id || null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/admin/results/`);
        const responseData = response.data || {};
        console.log('API Response:', responseData);
        setData(responseData);
      } catch (err) {
        const errorMessage = err?.response?.data?.error || err.message || 'Failed to fetch results';
        setError(errorMessage);
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg bg-white p-8 shadow-sm text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <div className="text-gray-600">Loading results...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg bg-red-50 border border-red-200 p-6">
            <div className="text-red-700 font-medium">Error Loading Results</div>
            <div className="text-red-600 mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const {
    election = {},
    stats = {},
    portfolios = [],
    total_votes = 0,
    skipped_votes = 0,
    votingTrend = []
  } = data || {};

  const handlePrint = () => window.print();
  // const handleExport = () => alert('Export functionality to be implemented');

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <nav className="text-sm text-gray-500 mb-2" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li><a href="/admin" className="hover:text-indigo-600 hover:underline">Admin</a></li>
                <li className="text-gray-300">/</li>
                <li className="font-medium text-gray-700">Results</li>
              </ol>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Election Results</h1>
            <p className="text-gray-600">
              {election.title && (
                <>
                  <span className="font-medium">{election.title}</span>
                  {' • '}
                </>
              )}
              Official results summary and breakdowns
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint} 
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-7a2 2 0 00-2-2H9a2 2 0 00-2 2v7a2 2 0 002 2z" />
              </svg>
              Print
            </button>
            {/* <button 
              onClick={handleExport}
              className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Export
            </button> */}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                title="Total Valid Votes" 
                value={total_votes.toLocaleString()} 
                subtitle="Counted votes" 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                } 
              />
              <StatCard 
                title="Skipped Votes" 
                value={skipped_votes.toLocaleString()} 
                subtitle="Invalid/blank ballots" 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                } 
              />
              <StatCard 
                title="Participation Rate" 
                value={stats.participationRate ? `${stats.participationRate}%` : 'N/A'} 
                subtitle="Voter turnout" 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                } 
              />
            </div>

            {/* Portfolio Results */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Portfolio Results</h2>
              
              {portfolios.length === 0 ? (
                <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                  <div className="text-gray-500">No portfolio results available.</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolios.map((portfolio) => (
                    <PortfolioCard key={portfolio.id} portfolio={portfolio} />
                  ))}
                </div>
              )}
            </div>

            {/* Voting Trend Chart */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Voting Trend</h3>
              {votingTrend.length > 0 ? (
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={votingTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} votes`, 'Votes']}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{ 
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="votes" 
                        stroke="#4f46e5" 
                        strokeWidth={3}
                        dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No voting trend data available
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Election Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Election Summary</h3>
              <div className="space-y-3">
                {election.title && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Election:</span>
                    <span className="text-sm font-medium text-gray-900 text-right">{election.title}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Registered:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.totalVoters?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Votes Cast:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.votesCast?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Participation:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.participationRate ? `${stats.participationRate}%` : 'N/A'}
                  </span>
                </div>
                {election.is_active !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      election.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {election.is_active ? 'Active' : 'Completed'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Portfolio Breakdown */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Breakdown</h3>
              <div className="space-y-4">
                {portfolios.length === 0 ? (
                  <div className="text-sm text-gray-500">No portfolio data available.</div>
                ) : (
                  portfolios.map((portfolio) => {
                    const percentage = total_votes > 0 ? (portfolio.totalVotes / total_votes * 100) : 0;
                    
                    return (
                      <div key={portfolio.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {portfolio.name}
                          </div>
                          <div className="text-xs text-gray-500 ml-2">
                            {(portfolio.totalVotes || 0).toLocaleString()} votes
                          </div>
                        </div>
                        <Progress percent={percentage} />
                        <div className="text-xs text-gray-500">
                          {percentage.toFixed(1)}% of total votes
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}