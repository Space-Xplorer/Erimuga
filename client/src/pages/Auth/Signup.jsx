import React from 'react';
import SignupForm from '../../components/Auth/SignupForm';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const handleSignup = () => {
    navigate('/login');
  };
  return (
    <div className='min-h-screen flex flex-col items-center justify-center px-4'>
      <div className='bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-sm'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Sign Up</h2>
        <SignupForm onSignup={handleSignup} />
      </div>
    </div>
  );
};

export default Signup;
