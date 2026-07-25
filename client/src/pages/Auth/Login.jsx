import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/Auth/LoginForm';
import GoogleButton from '../../components/Auth/GoogleButton';

const Login = () => {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Sign in</h1>
        </div>

        <div className="mt-8">
          <GoogleButton label="Continue with Google" />

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-paper-deep" />
            <span className="text-xs uppercase tracking-wide text-ink-muted">or</span>
            <span className="h-px flex-1 bg-paper-deep" />
          </div>

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-brand underline-offset-4 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
