'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

interface OAuthButtonProps {
  provider: 'google' | 'github';
  children: React.ReactNode;
}

export function OAuthButton({ provider, children }: OAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleOAuth = async () => {
    setLoading(true);
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleOAuth}
      disabled={loading}
      className="btn-outline w-full flex items-center justify-center gap-2"
    >
      {loading ? (
        <span>Loading...</span>
      ) : (
        children
      )}
    </button>
  );
}

