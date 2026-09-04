import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="mt-4 text-gray-500">Loading data...</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
