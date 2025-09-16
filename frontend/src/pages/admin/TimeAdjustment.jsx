import { useEffect, useState, useCallback, useMemo } from "react";
import { useAdminSocket } from '../../hooks/useAdminSocket';
import api from "../../utils/api";
import { formatDateTime, toInputDateTime, parseDateTime } from "../../utils/datetime";
import StatusBadge from '../../components/shared/StatusBadge';
import { canAdjustElection } from '../../utils/election';
import { toast } from "react-toastify";
import InlineLoader from '../../components/shared/InlineLoader';

export function TimeAdjustment() {
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newEndTime, setNewEndTime] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [remainingMs, setRemainingMs] = useState(null);

  const calculations = useMemo(() => {
    if (!election) return { canAdjust: false, minutesRemaining: null, endTime: null, serverNow: new Date() };
    
    const serverNow = parseDateTime(election.server_time) || new Date();
    const endTime = parseDateTime(election.end_time);
    const minutesRemaining = endTime ? Math.floor((endTime.getTime() - serverNow.getTime()) / 60000) : null;
    const canAdjust = canAdjustElection(election, 30);
    
    return { canAdjust, minutesRemaining, endTime, serverNow };
  }, [election]);

  const { socket, isConnected } = useAdminSocket(true);

  useEffect(() => {
    if (calculations.endTime && calculations.serverNow) {
      const remaining = Math.max(0, calculations.endTime.getTime() - calculations.serverNow.getTime());
      setRemainingMs(remaining);
    }
  }, [calculations.endTime, calculations.serverNow]);

  const fetchElection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/elections/me");
      setElection(res.data);
      
      if (res.data?.end_time) {
        setNewEndTime(toInputDateTime(res.data.end_time));
      }
    } catch {
      setError("Failed to load election data. Please try again.");
      toast.error("Failed to load election data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchElection();
  }, [fetchElection]);

  useEffect(() => {
    if (!isConnected || !socket || !election?.id) return;

    const onTick = (payload) => {
      if (!payload || payload.electionId !== election.id) return;
      setRemainingMs(payload.remainingMs);
    };

    const onStart = (payload) => {
      if (payload?.electionId === election.id) {
        setElection(prev => prev ? { ...prev, is_active: true } : null);
      }
    };

    const onEnd = (payload) => {
      if (payload?.electionId === election.id) {
        setElection(prev => prev ? { ...prev, is_active: false } : null);
        setRemainingMs(0);
      }
    };

    socket.on('election_tick', onTick);
    socket.on('election_started', onStart);
    socket.on('election_ended', onEnd);

    return () => {
      socket.off('election_tick', onTick);
      socket.off('election_started', onStart);
      socket.off('election_ended', onEnd);
    };
  }, [isConnected, socket, election?.id]);

  const formatRemainingTime = useCallback(() => {
    if (remainingMs === null || remainingMs === undefined) return '-';
    if (remainingMs <= 0) return 'Ended';
    
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  }, [remainingMs]);

  const applyQuickAdjust = useCallback((minutes) => {
    if (!election?.end_time) return;
    
    const currentEndTime = parseDateTime(election.end_time);
    if (!currentEndTime) return;
    
    const adjustedTime = new Date(currentEndTime.getTime() + (minutes * 60000));
    setNewEndTime(toInputDateTime(adjustedTime.toISOString()));
  }, [election?.end_time]);

  const validateNewEndTime = useCallback(() => {
    if (!newEndTime) return "Please select an end time";
    
    const parsed = parseDateTime(newEndTime);
    if (!parsed || isNaN(parsed.getTime())) {
      return "Please enter a valid date and time";
    }

    if (election?.start_time) {
      const startTime = parseDateTime(election.start_time);
      if (startTime && parsed.getTime() <= startTime.getTime()) {
        return "End time must be after the election start time";
      }
    }

    const now = new Date();
    if (parsed.getTime() < now.getTime() - (5 * 60000)) { // Allow 5 minutes buffer for clock differences
      return "End time cannot be more than 5 minutes in the past";
    }

    return null;
  }, [newEndTime, election?.start_time]);

  const openModal = useCallback(() => {
    const validationError = validateNewEndTime();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setShowModal(true);
  }, [validateNewEndTime]);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const confirmUpdate = useCallback(async () => {
    if (!election) return;
    
    const validationError = validateNewEndTime();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const parsed = parseDateTime(newEndTime);
    
    setUpdating(true);
    try {
      const payload = { end_time: parsed.toISOString() };
      const res = await api.put(`/admin/elections/end_time`, payload);
      
      setElection(res.data);
      setNewEndTime(toInputDateTime(res.data.end_time));
      closeModal();
      
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 8000);
      
      toast.success("Election end time updated successfully!");
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Unknown error occurred";
      toast.error(`Failed to update election: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  }, [election, newEndTime, validateNewEndTime, closeModal]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <InlineLoader message="Loading election data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Election</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchElection}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Election Time Adjustment</h2>
        <button
          onClick={fetchElection}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Refresh
        </button>
      </div>

      {showWarning && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Current Election Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <p className="text-gray-900 font-medium">{election?.title || "Untitled Election"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <p className="text-gray-900">{formatDateTime(election?.start_time) || "Not set"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current End Time</label>
                <p className="text-gray-900">{formatDateTime(election?.end_time) || "Not set"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex items-center gap-2">
                  <StatusBadge election={election} />
                  {election?.is_active && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      Live
                    </span>
                  )}
                </div>
              </div>

              {election?.is_active && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Remaining</label>
                  <div className="text-2xl font-bold text-gray-900 font-mono">
                    {formatRemainingTime()}
                  </div>
                  {remainingMs !== null && remainingMs > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.max(0, Math.min(100, (remainingMs / (4 * 60 * 60 * 1000)) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Adjust End Time
            </h3>
            
            {calculations.canAdjust ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                    min={toInputDateTime(new Date().toISOString())}
                  />
                  {validateNewEndTime() && (
                    <p className="mt-1 text-sm text-red-600">{validateNewEndTime()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Adjustments
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: '+15m', value: 15, color: 'bg-green-100 hover:bg-green-200 text-green-800' },
                      { label: '+30m', value: 30, color: 'bg-green-100 hover:bg-green-200 text-green-800' },
                      { label: '+1h', value: 60, color: 'bg-blue-100 hover:bg-blue-200 text-blue-800' },
                      { label: '-15m', value: -15, color: 'bg-red-100 hover:bg-red-200 text-red-800' }
                    ].map((btn) => (
                      <button
                        key={btn.value}
                        onClick={() => applyQuickAdjust(btn.value)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${btn.color}`}
                        disabled={!election?.end_time}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <button
                    onClick={openModal}
                    disabled={!election || updating || !!validateNewEndTime()}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Preview Changes
                  </button>
                  <button
                    onClick={confirmUpdate}
                    disabled={updating || !!validateNewEndTime()}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Time Adjustment Unavailable</h4>
                    <p className="text-sm text-gray-600">
                      {!election ? (
                        "No election data available."
                      ) : !election.is_active ? (
                        "Time adjustments are only available while the election is active."
                      ) : (
                        <>
                          Time adjustments are only allowed when 30 minutes or less remain. 
                          <br />
                          <span className="font-medium">
                            Current time remaining: {calculations.minutesRemaining !== null ? 
                              `${calculations.minutesRemaining} minute(s)` : 
                              "calculating..."}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Confirm Time Adjustment</h4>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Current end time:</p>
                  <p className="font-medium text-gray-900">{formatDateTime(election?.end_time)}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm text-indigo-600">New end time:</p>
                  <p className="font-medium text-indigo-900">{formatDateTime(newEndTime)}</p>
                </div>
              </div>

            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdate}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Applying...' : 'Apply Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}