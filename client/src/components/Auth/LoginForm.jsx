import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

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
      const result = await authLogin({ email, password });
      
      if (result.success) {
        toast.success('Login successful!');
        if (onLogin) onLogin();
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-2' htmlFor='email'>Email</label>
        <input 
          className='border border-gray-300 p-2 w-full rounded' 
          type='email' 
          id='email' 
          required 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
      </div>
      <div className='mb-6'>
        <label className='block text-sm font-medium mb-2' htmlFor='password'>Password</label>
        <input 
          className='border border-gray-300 p-2 w-full rounded' 
          type='password' 
          id='password' 
          required 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
      </div>
      {error && <div className='text-red-600 mb-2 text-sm'>{error}</div>}
      <button 
        className='bg-[#B22222] text-white font-semibold py-2 rounded w-full hover:bg-red-600 transition-colors duration-200' 
        type='submit' 
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
