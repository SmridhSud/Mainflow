import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import api from '../utils/api';
import ErrorMessage from '../components/ErrorMessage';

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const handleSubmit = async ({ identifier, password, remember }) => {
    setServerError(null);
    try {
      const payload = { identifier, password }; // server validation determines if identifier is email/username
      const res = await api.post('/auth/login', payload);
      const { token } = res.data;
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
      }
      // save token in localStorage anyway for requests (api reads localStorage)
      localStorage.setItem('token', token);

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || err?.response?.data?.errors || err.message;
      setServerError(typeof message === 'string' ? message : JSON.stringify(message));
      // throw error so LoginForm can stop loading
      throw new Error(message);
    }
  };

  return (
    <div className="page login-page">
      <div className="card">
        {serverError && <ErrorMessage message={serverError} />}
        <LoginForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
