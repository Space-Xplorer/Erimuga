import React, { useState } from 'react';
import axios from '../../config/axios';

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
      const res = await axios.post('/user/auth/register', { name, email, password, userType: 'user' });

      if (res.data.success) {
        console.log('✅ Registration successful:', res.data.user);
        if (onSignup) onSignup(res.data.user);
      }
    } catch (err) {
      console.error('❌ Signup error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = 'w-full rounded-lg border border-paper-deep bg-paper p-2.5 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-soft" htmlFor="name">Name</label>
        <input className={field} type="text" id="name" required value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-soft" htmlFor="email">Email</label>
        <input className={field} type="email" id="email" required value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-soft" htmlFor="password">Password</label>
        <input className={field} type="password" id="password" required value={password} onChange={e => setPassword(e.target.value)} />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <button
        className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:opacity-90 disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
};

export default SignupForm;
