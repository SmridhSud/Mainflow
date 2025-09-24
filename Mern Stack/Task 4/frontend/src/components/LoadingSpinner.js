import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="spinner" role="status" aria-live="polite" aria-label="Loading">
      <div className="lds-dual-ring"></div>
    </div>
  );
}
