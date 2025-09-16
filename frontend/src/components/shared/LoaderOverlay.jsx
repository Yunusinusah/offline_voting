import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export function LoaderOverlay({ message = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
        <LoadingSpinner size="md" />
        <div className="text-gray-700">{message}</div>
      </div>
    </div>
  );
}

export default LoaderOverlay;
