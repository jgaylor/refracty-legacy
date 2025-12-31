'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  // Don't render header when logged in (sidebar is main navigation)
  if (loading) {
    return null;
  }

  if (user) {
    return null;
  }

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', opacity: 0.8 }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Refracty
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="link-secondary">
              Log In
            </Link>
            <Link href="/signup" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

