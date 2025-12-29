'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface ProfileContentProps {
  user: User;
}

export function ProfileContent({ user }: ProfileContentProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-sm font-medium text-neutral-500 mb-1">Email</h2>
        <p className="text-lg text-neutral-900">{user.email}</p>
      </div>

      <div>
        <h2 className="text-sm font-medium text-neutral-500 mb-1">User ID</h2>
        <p className="text-sm text-neutral-600 font-mono">{user.id}</p>
      </div>

      {user.user_metadata?.full_name && (
        <div>
          <h2 className="text-sm font-medium text-neutral-500 mb-1">Name</h2>
          <p className="text-lg text-neutral-900">{user.user_metadata.full_name}</p>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-neutral-500 mb-1">Account Created</h2>
        <p className="text-sm text-neutral-600">
          {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="pt-4 border-t border-neutral-200">
        <button onClick={handleLogout} className="btn-danger">
          Logout
        </button>
      </div>
    </div>
  );
}

