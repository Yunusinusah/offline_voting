import React, { useState } from "react";

// System Settings Component
export function SystemSettings() {
  const [settings, setSettings] = useState({
    systemName: "University Voting System",
    maxVotesPerStudent: 1,
    resultsVisibility: "after_election",
    notificationEmails: true,
    maintenanceMode: false
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">System Name</label>
            <input
              type="text"
              value={settings.systemName}
              onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Votes Per Student</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.maxVotesPerStudent}
              onChange={(e) => setSettings({ ...settings, maxVotesPerStudent: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Results Visibility</label>
            <select
              value={settings.resultsVisibility}
              onChange={(e) => setSettings({ ...settings, resultsVisibility: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="during_election">During Election (Live)</option>
              <option value="after_election">After Election Ends</option>
              <option value="manual">Manual Release</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notificationEmails"
              checked={settings.notificationEmails}
              onChange={(e) => setSettings({ ...settings, notificationEmails: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
            <label htmlFor="notificationEmails" className="ml-2 block text-sm text-gray-900">
              Send Notification Emails
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
            <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
              Maintenance Mode
            </label>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-500"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
