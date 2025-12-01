import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Paper, Title, Tabs, Divider, useMantineColorScheme } from '@mantine/core';
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
    <div className={`w-full min-h-screen flex items-center justify-center ${theme ? 'bg-[#0b0b10]' : 'bg-gray-50'}`}>
      <Container size={520} className="px-4">
        <Paper radius="md" p="xl" withBorder>
          <Title order={2} align="center" mb="sm">
            Welcome back
          </Title>

          <Tabs value={active} onTabChange={setActive} variant="pills">
            <Tabs.List>
              <Tabs.Tab value="signin">Sign In</Tabs.Tab>
              <Tabs.Tab value="signup">Sign Up</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="signin" pt="sm">
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
            </Tabs.Panel>

            <Tabs.Panel value="signup" pt="sm">
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
            </Tabs.Panel>
          </Tabs>

          <Divider my="sm" />
          <Toaster richColors />
        </Paper>
      </Container>
    </div>
  );
};

export default Auth;
