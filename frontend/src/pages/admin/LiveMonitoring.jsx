import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAdminSocket } from '../../hooks/useAdminSocket';
import api from "../../utils/api";
import { getElectionStatus } from '../../utils/election';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { PortfolioSummary } from "./PortfolioSummary";
import InlineLoader from '../../components/shared/InlineLoader';
import TableEmptyState from '../../components/shared/TableEmptyState';
import LoaderOverlay from "../../components/shared/LoaderOverlay";

const DEFAULT_STATS = {
  totalVoters: 0,
  votesCast: 0,
  participationRate: 0,
};

const COLORS = {
  voted: "#10B981",
  pending: "#E5E7EB",
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

// Live Monitoring Component
export function LiveMonitoring() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [portfolioResults, setPortfolioResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [votingTrend, setVotingTrend] = useState([]);
  const [electionMeta, setElectionMeta] = useState(null);

  // UI state
  const [timeRemainingMs, setTimeRemainingMs] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // kept for UI/debug only

  // refs for timers and offsets
  const tickRef = useRef(null);
  const serverClientOffsetRef = useRef(0);
  const containerRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const retryTimerRef = useRef(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const { socket, isConnected } = useAdminSocket(electionMeta?.is_active === true);

  // Derived calculations
  const calculations = useMemo(() => {
    const voted = Math.max(0, stats.votesCast || 0);
    const total = Math.max(0, stats.totalVoters || 0);
    const pending = Math.max(0, total - voted);
    const participationRate = total > 0 ? Math.round((voted / total) * 100) : 0;

    return {
      voted,
      total,
      pending,
      participationRate,
      participationData: [
        { name: "Voted", value: voted, color: COLORS.voted },
        { name: "Pending", value: pending, color: COLORS.pending }
      ]
    };
  }, [stats]);

  // Election status
  const electionStatus = useMemo(() => getElectionStatus(electionMeta), [electionMeta]);

  // Ensure cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (tickRef.current) clearInterval(tickRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const fetchMonitoring = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) setFetchError(null);
      const res = await api.get(`/admin/monitor/`);
      const data = res.data;


      if (data?.election) {
        setElectionMeta(data.election);

        // server-client offset
        if (data.election.server_time) {
          try {
            serverClientOffsetRef.current = (new Date(data.election.server_time)).getTime() - Date.now();
          } catch {
            serverClientOffsetRef.current = 0;
          }
        }
      }

      if (data?.stats) {
        setStats((prev) => ({ ...prev, ...data.stats }));
      }

      if (Array.isArray(data?.votingTrend)) {
        setVotingTrend(data.votingTrend);
      } else {
        setVotingTrend([]);
      }

      if (Array.isArray(data?.portfolios)) {
        setPortfolioResults(data.portfolios);
      } else {
        setPortfolioResults([]);
      }

      // Success: reset retry counters and mark lastUpdated
      retryCountRef.current = 0;
      setRetryCount(0);

      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch monitoring data';
      setFetchError(errorMessage);

      // Retry/backoff using ref (avoid stale closure)
      if (isRetry) {
        if (retryCountRef.current < 3) {
          retryCountRef.current += 1;
          setRetryCount(retryCountRef.current);
          const delay = Math.pow(2, retryCountRef.current) * 1000; // 1s, 2s, 4s
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          retryTimerRef.current = setTimeout(() => fetchMonitoring(true), delay);
        }
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []); 

  // Countdown / remaining time
  useEffect(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    if (!electionMeta || !electionMeta.is_active || !electionMeta.end_time) {
      setTimeRemainingMs(null);
      return;
    }

    const updateRemaining = () => {
      try {
        const clientNow = new Date();
        const serverNow = new Date(clientNow.getTime() + serverClientOffsetRef.current);
        const endTime = new Date(electionMeta.end_time);

        if (isNaN(endTime.getTime())) {
          setTimeRemainingMs(null);
          return;
        }

        const remainingMs = Math.max(0, endTime.getTime() - serverNow.getTime());
        setTimeRemainingMs(remainingMs);

        // Auto-refresh when election ends
        if (remainingMs <= 0 && electionMeta.is_active) {
          fetchMonitoring();
        }
      } catch (err) {
        console.error('Error updating countdown:', err);
        setTimeRemainingMs(null);
      }
    };

    updateRemaining();
    // update every 10 second for accurate HH:MM:SS
    tickRef.current = setInterval(updateRemaining, 10000);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [electionMeta, fetchMonitoring]);

  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (isConnected && socket) {
      let fallbackStarted = false;

      const onVote = () => fetchMonitoring();
      const onElectionStarted = () => fetchMonitoring();
      const onElectionEnded = () => fetchMonitoring();

      const onError = (error) => {
        console.error('Socket error:', error);
        if (!fallbackStarted) {
          fallbackStarted = true;
          pollIntervalRef.current = setInterval(() => fetchMonitoring(), 15000);
        }
      };

      socket.on('vote_cast', onVote);
      socket.on('election_started', onElectionStarted);
      socket.on('election_ended', onElectionEnded);
      socket.on('error', onError);
      socket.on('connect_error', onError);

      fetchMonitoring();

      return () => {
        socket.off('vote_cast', onVote);
        socket.off('election_started', onElectionStarted);
        socket.off('election_ended', onElectionEnded);
        socket.off('error', onError);
        socket.off('connect_error', onError);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    } else {
      fetchMonitoring();
      pollIntervalRef.current = setInterval(() => fetchMonitoring(), 10000);
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [isConnected, socket, fetchMonitoring]);

  // Fullscreen handler
  const handleFullscreenChange = useCallback(() => {
    const fsElement = document.fullscreenElement ||
                      document.webkitFullscreenElement ||
                      document.mozFullScreenElement ||
                      document.msFullscreenElement;
    setIsFullscreen(fsElement === containerRef.current);
  }, []);

  useEffect(() => {
    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    events.forEach(event => document.addEventListener(event, handleFullscreenChange));

    return () => {
      events.forEach(event => document.removeEventListener(event, handleFullscreenChange));
    };
  }, [handleFullscreenChange]);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;

    try {
      if (isFullscreen) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      } else {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen operation failed:', err);
    }
  }, [isFullscreen]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setFetchError(null);
    fetchMonitoring();
  }, [fetchMonitoring]);

  // Countdown style utility 
  const getCountdownStyle = useCallback((ms) => {
    if (ms == null) return 'bg-gray-100 text-gray-800';
    const minutes = Math.ceil(ms / 60000);
    if (minutes <= 10) return 'bg-red-100 text-red-800 animate-pulse';
    if (minutes <= 30) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  }, []);

  const formatRemaining = useCallback((ms) => {
    if (ms == null || ms === undefined) return '-';
    if (ms <= 0) return '00:00';

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }, []);

  if (electionMeta && !electionMeta.is_active) {
    const isEnded = electionStatus.text === 'Ended';

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 flex items-center justify-center rounded-full mb-6 ${
              isEnded ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              {isEnded ? (
                <svg className="h-10 w-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-10 w-10 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {isEnded ? 'Election Has Ended' : 'Election Not Started'}
            </h2>

            <p className="text-lg text-gray-600 mb-8 max-w-md">
              {isEnded
                ? 'The election has finished. Live monitoring is no longer available, but you can view the final results.'
                : 'Live monitoring will be available once the election starts. You can adjust the schedule if needed.'}
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-8">
              {isEnded ? (
                <Link
                  to="/admin/results"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  View Final Results
                </Link>
              ) : (
                <Link
                  to="/admin/time-adjustment"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Adjust Schedule
                </Link>
              )}

              <button
                onClick={handleRefresh}
                className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                {isLoading ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg text-left w-full max-w-md">
              <h3 className="font-semibold text-gray-900 mb-3">Election Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium">{electionMeta.title || 'Untitled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start:</span>
                  <span className="font-medium">
                    {electionMeta.start_time
                      ? new Date(electionMeta.start_time).toLocaleString()
                      : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End:</span>
                  <span className="font-medium">
                    {electionMeta.end_time
                      ? new Date(electionMeta.end_time).toLocaleString()
                      : 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-screen ${isFullscreen ? 'bg-white p-4 h-screen overflow-auto' : 'bg-gray-50 p-6'}`}
    >
      {isLoading && !electionMeta && (
        <LoaderOverlay message="Loading live monitoring data..." />
      )}

      {fetchError && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Connection Error</p>
                <p className="text-xs text-red-600">{fetchError}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="ml-3 text-red-600 hover:text-red-800"
                disabled={isLoading}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto ${isFullscreen ? 'max-w-none' : ''}`}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Election Monitoring</h1>
              <p className="text-gray-600">Real-time monitoring of election progress and results</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                title="Refresh data"
              >
                <svg className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 110 2H5v2a1 1 0 11-2 0V4zm14 0v3a1 1 0 11-2 0V5h-2a1 1 0 110-2h3a1 1 0 011 1zM4 16v-3a1 1 0 112 0v2h2a1 1 0 110 2H5a1 1 0 01-1-1zm12 0a1 1 0 00-1 1h-3a1 1 0 110-2h2v-2a1 1 0 112 0v3z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h3a1 1 0 110 2H5v2a1 1 0 11-2 0V4zm14 0v3a1 1 0 11-2 0V5h-2a1 1 0 110-2h3a1 1 0 011 1zM4 16v-3a1 1 0 112 0v2h2a1 1 0 110 2H5a1 1 0 01-1-1zm12 0a1 1 0 00-1 1h-3a1 1 0 110-2h2v-2a1 1 0 112 0v3z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    electionStatus.text === 'Active'
                      ? 'bg-green-500 animate-pulse'
                      : electionStatus.text === 'Ended'
                        ? 'bg-red-500'
                        : 'bg-yellow-400'
                  }`}></div>
                  <span className="text-lg font-semibold text-gray-900">
                    Election Status: {electionStatus.text}
                  </span>
                </div>

                {/* Connection indicator */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-sm text-gray-500">
                    {isConnected ? 'Connected' : 'Reconnecting...'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>

                {electionMeta?.is_active && timeRemainingMs != null && (
                  <div className={`px-4 py-2 rounded-lg font-medium text-sm ${getCountdownStyle(timeRemainingMs)}`}>
                    Time remaining: {formatRemaining(timeRemainingMs)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ... rest of UI unchanged (statistics cards, charts, portfolio results, footer) ... */}
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.totalVoters.toLocaleString()}</div>
                <div className="text-blue-100 text-sm font-medium">Total Voters</div>
              </div>
              <svg className="w-8 h-8 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.votesCast.toLocaleString()}</div>
                <div className="text-green-100 text-sm font-medium">Votes Cast</div>
              </div>
              <svg className="w-8 h-8 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{calculations.participationRate}%</div>
                <div className="text-purple-100 text-sm font-medium">Participation</div>
              </div>
              <svg className="w-8 h-8 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Voting Trend Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Voting Trend Over Time</h3>
              <div className="text-sm text-gray-500">
                {votingTrend.length > 0 ? `${votingTrend.length} data points` : 'No data'}
              </div>
            </div>
            <div className="h-64">
              {votingTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={votingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value.toLocaleString()} votes`, 'Total Votes']}
                      labelFormatter={(label) => `Time: ${label}`}
                      contentStyle={{
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="votes"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: COLORS.primary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-sm">No voting data available yet</p>
                    <p className="text-xs text-gray-400">Data will appear as votes are cast</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Overall Participation</h3>
              <div className="text-sm text-gray-500">
                {calculations.total > 0 ? `${calculations.voted} / ${calculations.total}` : 'No data'}
              </div>
            </div>
            <div className="h-64">
              {calculations.total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={calculations.participationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {calculations.participationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => {
                        const percent = calculations.total > 0 ? ((value / calculations.total) * 100).toFixed(1) : '0.0';
                        return [`${value.toLocaleString()} (${percent}%)`, name];
                      }}
                      contentStyle={{
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                    </svg>
                    <p className="text-sm">No participation data</p>
                    <p className="text-xs text-gray-400">Chart will appear when voters are registered</p>
                  </div>
                </div>
              )}
            </div>

            {calculations.total > 0 && (
              <div className="flex justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.voted }}></div>
                  <span className="text-sm text-gray-600">
                    Voted ({calculations.voted.toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.pending }}></div>
                  <span className="text-sm text-gray-600">
                    Pending ({calculations.pending.toLocaleString()})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Results Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Portfolio Results</h2>
            {portfolioResults.length > 0 && (
              <div className="text-sm text-gray-500">
                {portfolioResults.length} portfolio{portfolioResults.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading && portfolioResults.length === 0 ? (
              <div className="col-span-1 lg:col-span-2 xl:col-span-3">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <InlineLoader message="Loading portfolio results..." />
                </div>
              </div>
            ) : portfolioResults.length === 0 ? (
              <div className="col-span-1 lg:col-span-2 xl:col-span-3">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <TableEmptyState
                    message="No portfolio results available yet"
                    suggestion="Results will appear as votes are cast and counted"
                    icon={
                      <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                    }
                  />
                </div>
              </div>
            ) : (
              portfolioResults.map((portfolio) => (
                <div key={portfolio.id} className="transform transition-all duration-200 hover:scale-105">
                  <PortfolioSummary portfolio={portfolio} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer info in fullscreen mode */}
        {isFullscreen && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span>{isConnected ? 'Real-time connected' : 'Reconnecting...'}</span>
              </div>
              <div>Last updated: {lastUpdated.toLocaleString()}</div>
              {electionMeta && (
                <div>Election: {electionMeta.title || 'Untitled'}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
