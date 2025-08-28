import React from 'react';
import LoginForm from '../../components/Auth/LoginForm';

const Login = () => {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <div className='bg-white p-8 rounded shadow-md w-96'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Login</h2>
        <LoginForm />
        {/* <button type="submit" className="w-full bg-black text-[#FFD700] py-2 rounded-lg font-bold hover:bg-[#F26A1B] hover:text-white transition">Login</button> */}
            <a href={`${import.meta.env.VITE_BASE_URL}/user/auth/google`} className="w-full flex items-center justify-center gap-2 mt-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-[#F26A1B] hover:text-white transition shadow">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="Google" className="h-5 w-5" loading="lazy" />
              log in with Google
            </a>
        <div className='mt-4 text-center'>
          <span className='text-sm text-gray-600'>Don't have an account? </span>
          <a href='/signup' className='text-[#B22222] font-semibold hover:underline'>Sign Up</a>
        </div>
      </div>
    </div>
  );
};0

export default Login;
