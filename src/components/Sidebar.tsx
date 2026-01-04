'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { SidebarSkeleton } from './skeletons/SidebarSkeleton';

// Icon components defined outside the main component
const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Helper function to get user initials
const getUserInitials = (user: User): string => {
  // Try to get initials from user_metadata.full_name first
  if (user.user_metadata?.full_name) {
    const parts = user.user_metadata.full_name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.user_metadata.full_name.substring(0, 2).toUpperCase();
  }
  
  // Fall back to email
  if (user.email) {
    const emailParts = user.email.split('@')[0];
    if (emailParts.length >= 2) {
      return emailParts.substring(0, 2).toUpperCase();
    }
    return emailParts[0].toUpperCase();
  }
  
  return 'U';
};

interface SidebarProps {
  initialUser?: User | null;
}

export function Sidebar({ initialUser = null }: SidebarProps = {}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // If we have an initial user, we can skip the initial check
    if (initialUser) {
      setLoading(false);
    } else {
      // Get initial session
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
        setLoading(false);
      });
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Logout handler
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Show skeleton while loading
  if (loading) {
    return <SidebarSkeleton />;
  }

  // Don't render if not logged in
  if (!user) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header with branding and user menu */}
      <div className="flex items-center justify-between py-8 px-4">
        <Link href="/people" className="flex items-center gap-3 px-3 hover:opacity-80 transition-opacity">
          {/* Avatar placeholder with "R" - aligned with menu icons */}
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-medium text-sm">R</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Refracty</span>
        </Link>
        
        {/* User avatar dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
            aria-label="User menu"
          >
            <span className="text-xs font-medium">{getUserInitials(user)}</span>
          </button>

          {isUserMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="py-1">
                {/* Settings */}
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-tertiary transition-colors"
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
                  <SettingsIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Settings</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-tertiary transition-colors"
                  style={{
                    color: '#ef4444',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Home */}
        <Link
          href="/insights"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive('/insights')
              ? 'bg-primary text-white'
              : 'sidebar-link'
          }`}
        >
          <HomeIcon className="w-5 h-5 flex-shrink-0" />
          <span>Home</span>
        </Link>

        {/* People */}
        <Link
          href="/people"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive('/people')
              ? 'bg-primary text-white'
              : 'sidebar-link'
          }`}
        >
          <UsersIcon className="w-5 h-5 flex-shrink-0" />
          <span>People</span>
        </Link>
      </nav>
    </div>
  );

  return (
    <aside className="hidden md:block flex-shrink-0 h-full w-56 sidebar-bg border-r">
      {sidebarContent}
    </aside>
  );
}

// Export the content separately for use in drawer
export function SidebarContent({ initialUser = null }: SidebarProps = {}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    if (initialUser) {
      setLoading(false);
    } else {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
        setLoading(false);
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Logout handler
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return <SidebarSkeleton />;
  }

  if (!user) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="h-full flex flex-col">
      {/* Header with branding and user menu */}
      <div className="flex items-center justify-between py-8 px-4">
        <Link href="/people" className="flex items-center gap-3 px-3 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-medium text-sm">R</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Refracty</span>
        </Link>
        
        {/* User avatar dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
            aria-label="User menu"
          >
            <span className="text-xs font-medium">{getUserInitials(user)}</span>
          </button>

          {isUserMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="py-1">
                {/* Settings */}
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-tertiary transition-colors"
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
                  <SettingsIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Settings</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-tertiary transition-colors"
                  style={{
                    color: '#ef4444',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Home */}
        <Link
          href="/insights"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive('/insights')
              ? 'bg-primary text-white'
              : 'sidebar-link'
          }`}
        >
          <HomeIcon className="w-5 h-5 flex-shrink-0" />
          <span>Home</span>
        </Link>

        {/* People */}
        <Link
          href="/people"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive('/people')
              ? 'bg-primary text-white'
              : 'sidebar-link'
          }`}
        >
          <UsersIcon className="w-5 h-5 flex-shrink-0" />
          <span>People</span>
        </Link>
      </nav>
    </div>
  );
}

