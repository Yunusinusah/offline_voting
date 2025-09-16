import { parseDateTime } from './datetime';

export function getElectionStatus(election) {
  if (!election) return { text: 'Unknown', className: 'bg-gray-100 text-gray-800' };
  const serverNow = parseDateTime(election.server_time) || new Date();
  const endTime = parseDateTime(election.end_time);

  if (election.is_active) return { text: 'Active', className: 'bg-green-100 text-green-800' };
  if (endTime && endTime.getTime() <= serverNow.getTime()) return { text: 'Ended', className: 'bg-red-100 text-red-800' };
  return { text: 'Not started', className: 'bg-gray-100 text-gray-800' };
}

export function canAdjustElection(election, thresholdMinutes = 30) {
  if (!election) return false;
  if (!election.is_active) return false;
  const serverNow = parseDateTime(election.server_time) || new Date();
  const endTime = parseDateTime(election.end_time);
  if (!endTime) return false;
  const minutesRemaining = Math.floor((endTime.getTime() - serverNow.getTime()) / 60000);
  return minutesRemaining >= 0 && minutesRemaining <= thresholdMinutes;
}
