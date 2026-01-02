import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMantineColorScheme } from '@mantine/core';
import clsx from 'clsx';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import { Toaster } from 'sonner';

const Auth = () => {
  const [active, setActive] = useState('signin');
  const { colorScheme } = useMantineColorScheme();
  const theme = colorScheme === 'dark';

  const location = useLocation();

  useEffect(() => {
    try {
      // allow linking to /auth?tab=signup or state.tab = 'signup'
      const params = new URLSearchParams(location.search || '');
      const tab = params.get('tab') || location.state?.tab;
      if (tab === 'signup') setActive('signup');
    } catch (e) {
      // ignore
    }
    // only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={clsx(
      'w-full min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-16',
      theme
        ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-black'
        : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-gray-100'
    )}>
      {/* Header */}
      <div className='mb-8 text-center'>
        <h1 className={clsx(
          'text-3xl md:text-4xl font-bold mb-2',
          theme ? 'text-white' : 'text-gray-900'
        )}>
          Admin Panel
        </h1>
        <p className={clsx(
          'text-sm md:text-base',
          theme ? 'text-gray-400' : 'text-gray-600'
        )}>
          {active === 'signin' ? 'Sign in to your admin account' : 'Create your admin account'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className='mb-6 flex gap-2 border-b border-opacity-20' style={{
        borderColor: theme ? '#374151' : '#e2e8f0'
      }}>
        <button
          onClick={() => setActive('signin')}
          className={clsx(
            'px-6 py-3 font-semibold text-sm transition-all duration-200 border-b-2',
            active === 'signin'
              ? theme
                ? 'text-blue-400 border-blue-500'
                : 'text-blue-600 border-blue-600'
              : theme
              ? 'text-gray-400 border-transparent hover:text-gray-300'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          )}
        >
          Sign In
        </button>
        <button
          onClick={() => setActive('signup')}
          className={clsx(
            'px-6 py-3 font-semibold text-sm transition-all duration-200 border-b-2',
            active === 'signup'
              ? theme
                ? 'text-blue-400 border-blue-500'
                : 'text-blue-600 border-blue-600'
              : theme
              ? 'text-gray-400 border-transparent hover:text-gray-300'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          )}
        >
          Sign Up
        </button>
      </div>

      {/* Form Container */}
      <div className='w-full max-w-4xl'>
        {active === 'signin' && (
          <LoginForm
            isSignin={true}
            setIsSignin={(updater) => {
              // allow child to pass a boolean or an updater function
              if (typeof updater === 'function') {
                const current = active === 'signin';
                const next = updater(current);
                setActive(next ? 'signin' : 'signup');
              } else {
                setActive(updater ? 'signin' : 'signup');
              }
            }}
            toggle={() => {}}
            toast={{ success: () => {}, error: () => {} }}
            setFormClose={() => {}}
          />
        )}
        
        {active === 'signup' && (
          <SignUpForm
            isSignin={false}
            setIsSignin={(updater) => {
              if (typeof updater === 'function') {
                const current = active === 'signin';
                const next = updater(current);
                setActive(next ? 'signin' : 'signup');
              } else {
                setActive(updater ? 'signin' : 'signup');
              }
            }}
            toggle={() => {}}
            toast={{ success: () => {}, error: () => {} }}
            setFormClose={() => {}}
          />
        )}
      </div>

      <Toaster richColors />
    </div>
  );
};

export default Auth;
