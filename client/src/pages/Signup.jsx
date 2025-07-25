import React from 'react';
import SignupForm from '../components/SignupForm';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const handleSignup = () => {
    navigate('/login');
  };
  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <div className='bg-white p-8 rounded shadow-md w-96'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Sign Up</h2>
        <SignupForm onSignup={handleSignup} />
      </div>
    </div>
  );
};

export default Signup;
