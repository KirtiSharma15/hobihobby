import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { cn } from '@/utils/cn';
import type { RootState } from '@/store';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Logo = () => (
  <div className="flex flex-col items-center gap-3">
    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
      <span className="text-white font-bold text-2xl">H</span>
    </div>
    <span className="text-3xl font-display font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
      HobiHobby
    </span>
  </div>
);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth({ subscribe: false });
  const { isAuthenticated, isLoading, error } = useAppSelector(
    (state: RootState) => state.user
  );
  const [isSigningIn, setIsSigningIn] = useState(false);

  const authInProgress = isSigningIn || isLoading;

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-gray-100">
          <div className="p-8 sm:p-10 text-center">
            <Logo />

            <p className="mt-6 text-gray-600 text-base leading-relaxed">
              Discover hobbies you&apos;ll love. Sign in to save favorites and
              track your progress.
            </p>

            {error && (
              <p
                className="mt-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="mt-8">
              {authInProgress ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-sm font-medium text-gray-600">
                    Signing you in…
                  </p>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className={cn(
                    'w-full gap-3 bg-white hover:bg-gray-50 border-gray-200 text-gray-800',
                    'shadow-sm hover:shadow-md'
                  )}
                  onClick={handleGoogleSignIn}
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>
              )}
            </div>

            <p className="mt-8 text-sm text-gray-500">
              <Link
                to="/"
                className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                Continue without signing in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
