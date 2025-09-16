import React from 'react';
import { parseDateTime } from '../../utils/datetime';

export default function StatusBadge({ election }) {
  if (!election) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>;

  const serverNow = parseDateTime(election.server_time) || new Date();
  const endTime = parseDateTime(election.end_time);

  if (election.is_active) {
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
  }

  if (endTime && endTime.getTime() <= serverNow.getTime()) {
    return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Ended</span>;
  }

  return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Not started</span>;
}
