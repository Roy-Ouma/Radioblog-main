import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPasswordComplete } from '../utils/apiCalls';
import { toast } from 'sonner';

// Lightweight password strength helpers (no external UI libs required)
function getStrengthValue(password) {
  const requirements = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^A-Za-z0-9]/];
  let score = 0;
  if (password.length >= 8) score += 1;
  requirements.forEach((re) => { if (re.test(password)) score += 1; });
  return Math.min(Math.round((score / (requirements.length + 1)) * 100), 100);
}

function Requirement({ meets, label }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {meets ? (
        <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span className={meets ? 'text-emerald-700' : 'text-red-600'}>{label}</span>
    </div>
  );
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tokenParam = params.get('token') || '';
  const idParam = params.get('id') || '';

  const [token, setToken] = useState(tokenParam);
  const [id, setId] = useState(idParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
    if (idParam) setId(idParam);
    // Remove token and id from URL so they are not stored in history
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      url.searchParams.delete('id');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    } catch (e) {
      // ignore
    }
  }, [tokenParam, idParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !id) {
      toast.error('Missing token or user id');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const resp = await resetPasswordComplete({ id, token, newPassword });
      if (resp?.message) {
        toast.success(resp.message);
        // redirect to sign-in after short delay
        setTimeout(() => navigate('/sign-in'), 900);
      } else {
        toast.error(resp?.message || 'Unable to reset password');
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12">
      <h2 className="text-2xl font-semibold mb-6">Reset password</h2>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setStrength(getStrengthValue(e.target.value)); }}
            className="w-full px-3 py-2 rounded border bg-gray-50 dark:bg-gray-900"
            placeholder="Enter new password"
          />
          <div className="mt-3 mb-2">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden" role="progressbar" aria-label="Password strength" aria-valuemin={0} aria-valuemax={100} aria-valuenow={strength}>
              <div
                className={`h-2 rounded ${strength > 80 ? 'bg-emerald-500' : strength > 50 ? 'bg-yellow-500' : 'bg-red-500'} transition-all duration-300 ease-in-out`}
                style={{ width: `${strength}%`, willChange: 'width, background-color' }}
              />
              <span className="sr-only">{strength}%</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-600 dark:text-gray-300">Strength:</div>
              <div className={`text-xs font-semibold ${strength > 80 ? 'text-emerald-600' : strength > 50 ? 'text-yellow-600' : 'text-red-600'}`}>{strength > 80 ? 'Strong' : strength > 50 ? 'Medium' : 'Weak'} • {strength}%</div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <Requirement meets={newPassword.length >= 8} label="At least 8 characters" />
              <Requirement meets={/[0-9]/.test(newPassword)} label="Includes number" />
              <Requirement meets={/[a-z]/.test(newPassword)} label="Includes lowercase" />
              <Requirement meets={/[A-Z]/.test(newPassword)} label="Includes uppercase" />
              <Requirement meets={/[^A-Za-z0-9]/.test(newPassword)} label="Includes special symbol" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 rounded border bg-gray-50 dark:bg-gray-900"
            placeholder="Repeat new password"
          />
        </div>

        <div className="flex items-center gap-3">
          <button disabled={loading} type="submit" className="px-4 py-2 bg-slate-900 text-white rounded">
            {loading ? 'Saving...' : 'Set new password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
