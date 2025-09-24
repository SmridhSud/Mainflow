import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8" role="status" aria-label="Loading movies">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" aria-hidden="true"></div>
    <span className="ml-2 text-gray-600 sr-only">Loading...</span>
  </div>
);

export default LoadingSpinner;