"use client";
import { useState } from "react";

// Time Adjustment Component
export function TimeAdjustment() {
  const [currentTime, setCurrentTime] = useState("2024-03-15T14:30");
  const [newEndTime, setNewEndTime] = useState("2024-03-15T16:00");
  const [showWarning, setShowWarning] = useState(false);

  const adjustTime = () => {
    if (window.confirm("Are you sure you want to adjust the election end time?")) {
      setCurrentTime(newEndTime);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
      alert("Election end time updated successfully!");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Election Time Adjustment</h2>

      {showWarning && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>⚠️ Election time has been adjusted. Voters and polling agents have been notified.</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Election Schedule</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <p className="mt-1 text-gray-900">2024-03-15 08:00 AM</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current End Time</label>
                <p className="mt-1 text-gray-900">{new Date(currentTime).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1 text-green-600">Active</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Adjust End Time</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New End Time</label>
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">30 Minutes Warning</h4>
                <p className="text-sm text-blue-700">
                  The system will automatically notify all voters and polling agents 30 minutes before the new end time.
                </p>
              </div>
              <button
                onClick={adjustTime}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500"
              >
                Update Election Time
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Time Adjustment History</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-gray-600">2024-03-15 10:00 AM</span>
            <span className="text-sm text-gray-600">End time extended by 2 hours</span>
            <span className="text-sm text-gray-600">Admin: John Doe</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-gray-600">2024-03-15 09:30 AM</span>
            <span className="text-sm text-gray-600">End time set initially</span>
            <span className="text-sm text-gray-600">System</span>
          </div>
        </div>
      </div>
    </div>
  );
}
