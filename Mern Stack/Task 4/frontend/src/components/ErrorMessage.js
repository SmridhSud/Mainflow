import React from 'react';

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return <div role="alert" className="error-message">{message}</div>;
}
