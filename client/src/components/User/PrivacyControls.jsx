import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../config/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../Auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Download, Trash2 } from 'lucide-react';

/**
 * DPDP data-rights controls: download my data (access) and delete my account
 * (erasure). Deletion is behind a typed/password confirmation because it is
 * irreversible.
 */
const PrivacyControls = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Google accounts have no usable password, so they confirm by typing DELETE
  // instead of re-entering one. The flag comes from /me and /login.
  const isGoogle = Boolean(user?.isGoogle);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await axios.get('/user/auth/export-data', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'erimuga-my-data.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Your data has been downloaded');
    } catch {
      toast.error('Could not export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete('/user/auth/account', {
        data: isGoogle ? { confirmText } : { password, confirmText },
      });
      toast.success('Your account has been deleted');
      // Session is already destroyed server-side; clear client auth and leave.
      try { await logout(); } catch { /* already signed out */ }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not delete your account');
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = isGoogle ? confirmText === 'DELETE' : password.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-2 text-gray-800">
        <ShieldCheck className="w-5 h-5 text-brand" /> Privacy &amp; Your Data
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Under India's Digital Personal Data Protection Act, you can download a copy of your data
        or delete your account at any time. See our{' '}
        <Link to="/privacy" className="text-brand underline underline-offset-2">Privacy Policy</Link>.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Preparing…' : 'Download my data'}
        </button>

        {!showDelete && (
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete my account
          </button>
        )}
      </div>

      {showDelete && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-semibold text-red-700">Delete your account</h3>
          <p className="mt-1 text-sm text-red-700/90">
            This permanently removes your profile, saved addresses and cart, and signs you out. Past
            orders are kept without your personal details, as tax law requires. This cannot be undone.
          </p>

          <div className="mt-4 space-y-3">
            {!isGoogle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm your password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full max-w-sm rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-brand focus:border-brand"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="font-mono font-semibold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full max-w-sm rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting || !canDelete || confirmText !== 'DELETE'}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Permanently delete'}
            </button>
            <button
              onClick={() => { setShowDelete(false); setPassword(''); setConfirmText(''); }}
              className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyControls;
