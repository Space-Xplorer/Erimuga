import React, { useState } from 'react';

const SignupForm = ({ onSignup }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, usertype: 'user' })
      });
      const data = await res.json();
      
      if (!res.ok) {
        // This will catch and display the "Email already registered" message
        throw new Error(data.message || 'Signup failed');
      }
      
      if (data._id) {
        if (onSignup) onSignup();
      }
    } catch (err) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <a href={`${import.meta.env.VITE_BASE_URL}/user/auth/google`} className="w-full flex items-center justify-center gap-2 mt-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-[#F26A1B] hover:text-white transition shadow">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="Google" className="h-5 w-5" loading="lazy" />
        Sign up with Google
      </a>
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-2' htmlFor='name'>Name</label>
        <input className='border border-gray-300 p-2 w-full rounded' type='text' id='name' required value={name} onChange={e => setName(e.target.value)} />
      </div>
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
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignupForm;
