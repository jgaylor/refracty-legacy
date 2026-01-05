'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface NameSettingsProps {
  user: User;
}

export function NameSettings({ user }: NameSettingsProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (fullName.trim() === (user.user_metadata?.full_name || '')) {
      // No changes, don't save
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim() || null,
        },
      });

      if (updateError) {
        throw updateError;
      }

      // Refresh to update the user data in the sidebar
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save name');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="fullName" className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={saving}
          placeholder="Enter your full name"
          className="input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
        {saving && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Saving...
          </p>
        )}
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}
    </div>
  );
}

