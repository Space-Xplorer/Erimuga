import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

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
      const res = await fetch('http://localhost:5000/user/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        // Use the AuthContext login function
        authLogin(data.user, data.token);
        if (onLogin) onLogin();
        // Navigate to the previous page or home
        navigate(from, { replace: true });
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-2' htmlFor='email'>Email</label>
        <input className='border border-gray-300 p-2 w-full rounded' type='email' id='email' required value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className='mb-6'>
        <label className='block text-sm font-medium mb-2' htmlFor='password'>Password</label>
        <input className='border border-gray-300 p-2 w-full rounded' type='password' id='password' required value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {error && <div className='text-red-600 mb-2 text-sm'>{error}</div>}
      <button className='bg-[#B22222] text-white font-semibold py-2 rounded w-full hover:bg-red-600 transition-colors duration-200' type='submit' disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
