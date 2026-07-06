/**
 * Layout Component - Artisan Theme
 *
 * Global app shell: top navbar (all screen sizes) + bottom tab bar
 * (mobile only, hidden md and above), per the locked design system.
 */

import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sparkles, Compass, MessageCircle, Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { FeedbackModal } from './FeedbackModal';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_LINKS: { path: string; label: string; end?: boolean }[] = [
  { path: '/explore', label: 'Explore', end: true },
  { path: '/quiz', label: 'Discover' },
  { path: '/coach', label: 'Coach' },
];

const BOTTOM_NAV_ITEMS: {
  path: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}[] = [
  { path: '/explore', label: 'Explore', icon: <Compass className="h-5 w-5" />, end: true },
  { path: '/quiz', label: 'Discover', icon: <Sparkles className="h-5 w-5" /> },
  { path: '/', label: 'My Hobbies', icon: <Heart className="h-5 w-5" />, end: true },
  { path: '/coach', label: 'Coach', icon: <MessageCircle className="h-5 w-5" /> },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm transition-colors duration-200',
    isActive ? 'font-semibold text-terracotta' : 'font-medium text-taupe hover:text-ink'
  );

const bottomNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex flex-col items-center gap-1 px-3 py-1.5 text-[11px] font-medium transition-colors',
    isActive ? 'text-terracotta' : 'text-taupe'
  );

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const profile = useAppSelector((state) => state.user.profile);

  return (
    <div className="min-h-screen bg-cream font-jakarta">
      {/* Navbar - all screen sizes */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/explore" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-terracotta" aria-hidden />
            <span className="text-lg font-bold text-ink">HobiHobby</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.path} to={link.path} end={link.end} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {isAuthenticated && profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.displayName || 'Your profile'}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <Link
              to="/login"
              className="rounded-2xl bg-terracotta px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">{children}</main>

      {/* Bottom nav - mobile only */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 py-2">
          {BOTTOM_NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end} className={bottomNavLinkClass}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Feedback Button - Phase 1 Validation (nudged above the mobile bottom nav) */}
      <FeedbackModal className="bottom-24 md:bottom-6" />
    </div>
  );
};
