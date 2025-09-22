'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';
import NoSSR from '@/components/NoSSR';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated, loading, login } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('Login page useEffect:', { loading, isAuthenticated, mounted });
    if (!loading && isAuthenticated && mounted) {
      console.log('Redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <NoSSR>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </NoSSR>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">PS</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Pashu Swasthya Suraksha
            </span>
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AuthForm mode="login" />
        
        {/* Debug test button */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800 mb-2">Debug: Test login with mock data</p>
          <button
            onClick={async () => {
              try {
                await login('+91-9876543210', 'password123');
                console.log('Test login completed');
              } catch (error) {
                console.error('Test login failed:', error);
              }
            }}
            className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700"
          >
            Test Login (Rajesh Kumar)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
