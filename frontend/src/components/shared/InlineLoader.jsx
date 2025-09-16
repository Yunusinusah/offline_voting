import React from 'react';
import { RefreshCw } from 'lucide-react';

export function InlineLoader({ message = 'Loading…' }) {
  return (
    <div className="w-full py-8 flex items-center justify-center">
      <div className="flex items-center space-x-3 text-gray-700">
        <RefreshCw className="animate-spin h-5 w-5 text-indigo-600" />
        <span>{message}</span>
      </div>
    </div>
  );
}

export default InlineLoader;
