import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Mail, MessageCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { showToast } from '@/utils/toast';
import type { RootState } from '@/store';

const GoogleIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
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

const FEATURES = [
  {
    icon: Sparkles,
    tint: 'bg-terracotta/10 text-terracotta',
    title: 'AI-matched discovery',
    description: '7 questions to find hobbies made for you.',
  },
  {
    icon: Sparkles,
    tint: 'bg-olive/10 text-olive',
    title: 'A 365-day guided journey',
    description: 'Paced day by day so you actually stick with it.',
  },
  {
    icon: MessageCircle,
    tint: 'bg-amber-100 text-amber-700',
    title: 'A coach in your corner',
    description: 'Ask anything, anytime — plus classes near you.',
  },
];

const SignInCard: React.FC<{
  error: string | null;
  authInProgress: boolean;
  onGoogleSignIn: () => void;
}> = ({ error, authInProgress, onGoogleSignIn }) => {
  const [email, setEmail] = useState('');

  const handleEmailContinue = () => {
    showToast('Email sign-in is coming soon — please continue with Google for now.');
  };

  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg md:max-w-md">
      <h1 className="text-center text-2xl font-bold text-ink">Welcome</h1>
      <p className="mt-1 text-center text-sm text-taupe">
        Sign in to pick up your journey — or start a fresh one.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onGoogleSignIn}
        disabled={authInProgress}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-white py-3 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {authInProgress ? (
          <Loader2 className="h-5 w-5 animate-spin text-terracotta" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      <div className="my-4 flex items-center gap-3">
        <hr className="flex-1 border-border" />
        <span className="text-xs font-medium text-taupe">OR</span>
        <hr className="flex-1 border-border" />
      </div>

      <div className="relative">
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full rounded-2xl border border-border bg-cream py-3 pl-11 pr-4 text-sm text-ink placeholder:text-taupe focus:border-terracotta focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleEmailContinue}
        className="mt-3 w-full rounded-2xl bg-terracotta py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
      >
        Continue with email
      </button>

      <p className="mt-4 text-center text-xs text-taupe">
        By continuing you agree to our{' '}
        <span className="cursor-default underline">Terms</span> &{' '}
        <span className="cursor-default underline">Privacy Policy</span>.
      </p>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth({ subscribe: false });
  const { isAuthenticated, isLoading, error } = useAppSelector(
    (state: RootState) => state.user
  );
  const [isSigningIn, setIsSigningIn] = useState(false);

  const authInProgress = isSigningIn || isLoading;

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from =
        (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream font-jakarta md:flex">
      {/* Left panel - desktop only */}
      <div className="relative hidden shrink-0 flex-col overflow-hidden bg-gradient-to-br from-terracotta/10 via-cream to-cream px-16 py-16 md:flex md:w-[58%]">
        <span className="absolute right-[18%] top-[12%] h-3 w-3 rounded-full bg-olive" />
        <span className="absolute left-[10%] top-[22%] h-2 w-2 rounded-full bg-terracotta" />

        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta shadow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-ink">HobiHobby</span>
        </Link>

        <div className="flex flex-1 flex-col justify-center">
          <h1 className="max-w-sm text-3xl font-bold leading-tight text-ink lg:text-4xl">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-terracotta align-middle" />{' '}
            Find the hobby you&apos;ll actually love.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-taupe">
            Discover, learn and grow a hobby — with an AI coach in your pocket. Made for life in
            the UAE.
          </p>

          <div className="mt-10 flex flex-col gap-5">
            {FEATURES.map(({ icon: Icon, tint, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tint}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="text-xs text-taupe">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel / mobile full screen */}
      <div className="flex min-h-screen w-full items-center justify-center bg-cream p-4 md:min-h-0 md:w-[42%] md:px-10 md:py-0">
        <SignInCard error={error} authInProgress={authInProgress} onGoogleSignIn={handleGoogleSignIn} />
      </div>
    </div>
  );
};
