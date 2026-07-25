import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import axios from '../../config/axios';

const LoginForm = ({ onLogin }) => {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('/user/auth/login', { email, password });
      // ✅ Pass only user data, no token needed for session-based auth
      authLogin(res.data.user);
      if (onLogin) onLogin();
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || 'Invalid email or password';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-soft" htmlFor="email">Email</label>
        <input
          className="w-full rounded-lg border border-paper-deep bg-paper p-2.5 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          type="email"
          id="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-soft" htmlFor="password">Password</label>
        <input
          className="w-full rounded-lg border border-paper-deep bg-paper p-2.5 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          type="password"
          id="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button
        className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:opacity-90 disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
};

export default LoginForm;
