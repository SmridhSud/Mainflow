import React from 'react';

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto max-w-md" role="alert">
    <p className="font-medium">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label="Retry the request"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorMessage;