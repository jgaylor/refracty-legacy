'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Logo } from './Logo';
import { useMobileHeader } from './MobileHeaderProvider';
import { useDrawer } from './DrawerContext';
import { IconButton } from './IconButton';
import type { PageAction } from './PageActions';

export function MobileHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { config } = useMobileHeader();
  const { toggle: toggleDrawer } = useDrawer();

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };

    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  // Don't render on desktop
  if (loading) {
    return null;
  }

  // Logged out state
  if (!user) {
    return (
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b pointer-events-auto"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', opacity: 0.8 }}
      >
        <nav className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Logo href="/" />
            <div className="flex items-center gap-4">
              <Link href="/login" className="link-secondary text-sm">
                Log In
              </Link>
              <Link href="/signup" className="btn-primary text-sm px-4 py-2">
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  // Logged in state
  const handleMoreActionClick = (action: PageAction) => {
    action.onClick();
    setIsMoreMenuOpen(false);
  };

  // Determine if back button should show (check if pathname has dynamic segments)
  const showBackButton = config?.showBackButton ?? (pathname.includes('/people/') && pathname !== '/people');
  const backHref = config?.backHref ?? (pathname.includes('/people/') ? '/people' : '/');

  return (
    <header
      className="md:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b pointer-events-auto"
      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', opacity: 0.8 }}
    >
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Left side: Back button (if needed) + Menu icon */}
          <div className="flex-shrink-0 flex items-center gap-1">
            {showBackButton && (
              <Link href={backHref} className="flex-shrink-0" aria-label="Back">
                <IconButton>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </IconButton>
              </Link>
            )}
            <IconButton onClick={toggleDrawer} aria-label="Menu">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </IconButton>
          </div>

          {/* Center: Page title */}
          <div className="flex-1 flex items-center justify-center min-w-0">
            {config?.pageTitle && (
              <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {config.pageTitle}
              </span>
            )}
          </div>

          {/* Right side: Primary action + More menu */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {config?.primaryAction && (
              <button
                onClick={config.primaryAction.onClick}
                className="btn-primary text-sm px-3 py-1.5 whitespace-nowrap"
              >
                {config.primaryAction.label}
              </button>
            )}
            {config?.moreActions && config.moreActions.length > 0 && (
              <div className="relative" ref={moreMenuRef}>
                <IconButton
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  isActive={isMoreMenuOpen}
                  aria-label="More actions"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                </IconButton>

                {isMoreMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 border"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <div className="py-1">
                      {config.moreActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleMoreActionClick(action)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-tertiary transition-colors"
                          style={{
                            color: action.destructive ? '#ef4444' : 'var(--text-primary)',
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

