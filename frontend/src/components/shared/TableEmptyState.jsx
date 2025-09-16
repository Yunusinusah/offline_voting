import React from 'react';
import { Users } from 'lucide-react';

export function TableEmptyState({ message = 'No records found', suggestion, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="flex items-center justify-center mb-3">
        {icon || <Users className="h-12 w-12 text-gray-400" />}
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
      {suggestion && <p className="text-gray-400 text-sm mt-1">{suggestion}</p>}
    </div>
  );
}

export default TableEmptyState;
