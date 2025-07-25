import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const Login = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/');
  };
  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <div className='bg-white p-8 rounded shadow-md w-96'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Login</h2>
        <LoginForm onLogin={handleLogin} />
        <div className='mt-4 text-center'>
          <span className='text-sm text-gray-600'>Don't have an account? </span>
          <a href='/signup' className='text-[#B22222] font-semibold hover:underline'>Sign Up</a>
        </div>
      </div>
    </div>
  );
};0

export default Login;
