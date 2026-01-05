'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { AppearanceSettings } from './AppearanceSettings';
import { NameSettings } from './NameSettings';
import { AvatarSettings } from './AvatarSettings';
import type { AppearancePreference } from '@/lib/supabase/profile';

interface ProfileContentProps {
  user: User;
  appearance?: AppearancePreference;
}

export function ProfileContent({ user, appearance }: ProfileContentProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div 
        className="rounded-lg border"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Profile</h2>
        </div>
        
        <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <AvatarSettings user={user} />
        </div>

        <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <NameSettings user={user} />
        </div>

        <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</h3>
            <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{user.email}</p>
          </div>
        </div>

        <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>User ID</h3>
            <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{user.id}</p>
          </div>
        </div>

        <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Account Created</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div 
        className="rounded-lg border"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Preferences</h2>
        </div>
        
        <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <AppearanceSettings initialAppearance={appearance} />
        </div>
      </div>

      {/* Logout */}
      <div 
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
        }}
      >
        <button onClick={handleLogout} className="btn-danger">
          Logout
        </button>
      </div>
    </div>
  );
}

