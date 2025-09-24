import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // There isn't a /me endpoint, so we decode token fallback
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch (err) {
      console.error('Failed to decode token', err);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="page dashboard">
      <div className="card">
        <h2>Dashboard</h2>
        {user ? (
          <div>
            <p>Welcome, <strong>{user.username}</strong>!</p>
            <p>Role: {user.role}</p>
            <button className="btn" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <p>Loading user...</p>
        )}
      </div>
    </div>
  );
}
