import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { validateEmail, validatePassword } from '../utils/validation';

export default function LoginForm({ onSubmit }) {
  const [identifier, setIdentifier] = useState(''); // email or username
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!identifier.trim()) errs.identifier = 'Email or username is required';
    else {
      // if it looks like an email, validate format
      if (identifier.includes('@') && !validateEmail(identifier)) errs.identifier = 'Email format invalid';
    }
    if (!validatePassword(password)) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await onSubmit({ identifier: identifier.trim(), password, remember });
    } catch (err) {
      // the parent will likely set global errors, but show fallback
      setErrors({ global: err?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <h2>Sign in</h2>

      <label htmlFor="identifier">Email or Username</label>
      <input
        id="identifier"
        name="identifier"
        type="text"
        value={identifier}
        onChange={e => setIdentifier(e.target.value)}
        aria-invalid={!!errors.identifier}
        aria-describedby="identifier-error"
        autoComplete="username"
      />
      {errors.identifier && <div id="identifier-error" className="field-error">{errors.identifier}</div>}

      <label htmlFor="password">Password</label>
      <div className="password-wrapper">
        <input
          id="password"
          name="password"
          type={showPass ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          aria-invalid={!!errors.password}
          aria-describedby="password-error"
          autoComplete="current-password"
        />
        <button type="button" className="toggle-pass" onClick={() => setShowPass(s => !s)} aria-label="Show or hide password">
          {showPass ? 'Hide' : 'Show'}
        </button>
      </div>
      {errors.password && <div id="password-error" className="field-error">{errors.password}</div>}

      <div className="form-row">
        <label className="remember">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
          Remember me
        </label>
        <a href="#" onClick={(e) => { e.preventDefault(); alert('Password reset not implemented in this demo.'); }}>
          Forgot?
        </a>
      </div>

      {errors.global && <ErrorMessage message={errors.global} />}

      <button type="submit" className="btn" disabled={loading}>{loading ? <LoadingSpinner /> : 'Login'}</button>
    </form>
  );
}
