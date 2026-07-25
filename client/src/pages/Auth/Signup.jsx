import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignupForm from '../../components/Auth/SignupForm';
import GoogleButton from '../../components/Auth/GoogleButton';

// Editorial image beside the form. Uses one of the brand's handloom shots.
const SIDE_IMAGE = encodeURI('/Home Page/Screenshot_2026-07-15-10-55-57-55.jpg');

const Signup = () => {
  const navigate = useNavigate();
  const handleSignup = () => navigate('/login');

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-paper">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Image side — hidden on small screens where it would only push the form down */}
        <div className="relative hidden lg:block">
          <img src={SIDE_IMAGE} alt="Handwoven Eri silk" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-black/10" />
          <div className="absolute bottom-10 left-10 right-10 text-paper">
            <p className="eyebrow text-paper/70">Erimuga</p>
            <p className="mt-3 font-display text-3xl leading-tight">
              Woven by hand, in Assam — join us and wear the loom.
            </p>
          </div>
        </div>

        {/* Form side */}
        <div className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-sm">
            <div className="text-center lg:text-left">
              <p className="eyebrow">Create your account</p>
              <h1 className="mt-2 font-display text-4xl text-ink">Sign up</h1>
            </div>

            <div className="mt-8">
              <GoogleButton label="Sign up with Google" />

              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-paper-deep" />
                <span className="text-xs uppercase tracking-wide text-ink-muted">or</span>
                <span className="h-px flex-1 bg-paper-deep" />
              </div>

              <SignupForm onSignup={handleSignup} />
            </div>

            <p className="mt-6 text-center text-sm text-ink-soft lg:text-left">
              Already have an account?{' '}
              <Link to="/login" className="text-brand underline-offset-4 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
