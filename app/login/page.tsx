'use client';

import { useEffect, useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border p-8 shadow-xl
                      bg-white dark:bg-slate-900
                      border-slate-200 dark:border-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Welcome to Marshal Store
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in to continue
          </p>
        </div>

        {/* Google Sign-In button — always asks which account */}
        <button
          onClick={() =>
            signIn('google', {
              callbackUrl,
              prompt: 'select_account', // 👈 Forces Google to ask which account
            })
          }
          className="flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 font-semibold transition
                     border-slate-200 bg-white text-slate-700 hover:bg-slate-50
                     dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2 14-5.4l-6.4-5.4C29.5 34.7 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.4 5.4C41 35.6 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        {error && (
          <p className="text-center text-sm text-rose-500">{error}</p>
        )}

        <p className="text-center text-xs text-slate-500">
          By continuing, you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" />}>
      <LoginContent />
    </Suspense>
  );
}