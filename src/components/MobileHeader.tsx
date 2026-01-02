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
  const [isBreadcrumbDropdownOpen, setIsBreadcrumbDropdownOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const breadcrumbDropdownRef = useRef<HTMLDivElement>(null);
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
        style={{ backgroundColor: 'var(--bg-primary-transparent)', borderColor: 'var(--border-color)' }}
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
      style={{ backgroundColor: 'var(--bg-primary-transparent)', borderColor: 'var(--border-color)' }}
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

          {/* Page title - left aligned with breadcrumb dropdown */}
          <div className="flex-1 flex items-center justify-start min-w-0">
            {config?.pageTitle && (
              <div className="relative" ref={breadcrumbDropdownRef}>
                {config.breadcrumbs && config.breadcrumbs.length > 1 ? (
                  <>
                    <button
                      onClick={() => setIsBreadcrumbDropdownOpen(!isBreadcrumbDropdownOpen)}
                      className="flex items-center gap-2 min-w-0 group"
                    >
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {config.pageTitle}
                      </span>
                      <svg
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${isBreadcrumbDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isBreadcrumbDropdownOpen && (
                      <div
                        className="absolute top-full left-0 mt-2 w-64 rounded-md shadow-lg z-50 border"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-color)',
                        }}
                      >
                        {/* Title */}
                        <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                            Breadcrumb
                          </span>
                        </div>
                        {/* Breadcrumb items */}
                        <div className="py-1">
                          {config.breadcrumbs.map((item, index) => {
                            const isLast = index === config.breadcrumbs!.length - 1;
                            return (
                              <div key={index}>
                                {item.href && !isLast ? (
                                  <Link
                                    href={item.href}
                                    onClick={() => setIsBreadcrumbDropdownOpen(false)}
                                    className="flex items-center px-4 py-2 text-sm hover:bg-tertiary transition-colors"
                                    style={{
                                      color: 'var(--text-primary)',
                                      backgroundColor: 'transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <span>{item.label}</span>
                                  </Link>
                                ) : (
                                  <div
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                                    style={{
                                      color: 'var(--text-primary)',
                                      backgroundColor: 'var(--bg-tertiary)',
                                    }}
                                  >
                                    <svg
                                      className="w-4 h-4 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      style={{ color: 'var(--text-tertiary)' }}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4V5.4C4 8.76031 4 10.4405 4.65396 11.7239C5.2292 12.8529 6.14708 13.7708 7.27606 14.346C8.55953 15 10.2397 15 13.6 15H20M20 15L15 10M20 15L15 20" />
                                    </svg>
                                    <span className="flex-1">{item.label}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {config.pageTitle}
                  </span>
                )}
              </div>
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

