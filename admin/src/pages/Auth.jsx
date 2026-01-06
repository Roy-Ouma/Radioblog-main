import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import { Toaster } from 'sonner';

const Auth = () => {
  const [active, setActive] = useState('signin');
  const location = useLocation();

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || '');
      const tab = params.get('tab') || location.state?.tab;
      if (tab === 'signup') setActive('signup');
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="flex w-full min-h-screen">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden md:flex flex-col gap-y-8 w-1/3 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black items-center justify-center px-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-300 text-base">Manage your content and platform</p>
        </div>
        <div className="space-y-4 text-center max-w-sm">
          <h2 className="text-2xl font-bold text-white">
            {active === 'signin' ? 'Welcome Back' : 'Join as a Writer'}
          </h2>
          <p className="text-gray-300 text-base leading-relaxed">
            {active === 'signin'
              ? 'Sign in to access your admin dashboard and manage all your content'
              : 'Create your account to start publishing and managing content as a writer'}
          </p>
          <div className="pt-4 space-y-2 text-sm text-gray-400">
            <p>✓ Publish and manage content</p>
            <p>✓ Track analytics</p>
            <p>✓ Build your audience</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full md:w-2/3 min-h-screen bg-white dark:bg-slate-950 items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="block md:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {active === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-0 border-b-2 border-gray-200 dark:border-gray-700 mb-8">
            <button
              onClick={() => setActive('signin')}
              className={clsx(
                'flex-1 py-3 font-semibold text-sm transition-all duration-200 border-b-2 -mb-0.5',
                active === 'signin'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setActive('signup')}
              className={clsx(
                'flex-1 py-3 font-semibold text-sm transition-all duration-200 border-b-2 -mb-0.5',
                active === 'signup'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Form Container */}
          {active === 'signin' && (
            <LoginForm setIsSignin={setActive} />
          )}

          {active === 'signup' && (
            <SignUpForm setIsSignin={setActive} />
          )}
        </div>
      </div>

      <Toaster richColors />
    </div>
  );
};

export default Auth;
