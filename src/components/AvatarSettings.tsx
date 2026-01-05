'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface AvatarSettingsProps {
  user: User;
}

// Helper function to get user initials (same as in Sidebar)
const getUserInitials = (user: User): string => {
  if (user.user_metadata?.full_name) {
    const trimmed = user.user_metadata.full_name.trim();
    if (trimmed.length > 0) {
      return trimmed[0].toUpperCase();
    }
  }
  
  if (user.email) {
    const emailParts = user.email.split('@')[0];
    if (emailParts.length > 0) {
      return emailParts[0].toUpperCase();
    }
  }
  
  return 'U';
};

export function AvatarSettings({ user }: AvatarSettingsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarUrl = user.user_metadata?.avatar_url;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Get file extension
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if it exists
      if (avatarUrl) {
        try {
          const oldFileName = avatarUrl.split('/').slice(-2).join('/'); // Get user_id/filename from URL
          await supabase.storage.from('avatars').remove([oldFileName]);
        } catch (err) {
          // Ignore errors when deleting old avatar
          console.warn('Error deleting old avatar:', err);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user metadata with avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        },
      });

      if (updateError) {
        throw updateError;
      }

      // Refresh to update the user data
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!avatarUrl) return;

    setDeleting(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Extract filename from URL (format: user_id/avatar.ext)
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // Get last two parts (user_id/filename)

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([fileName]);

      if (deleteError) {
        throw deleteError;
      }

      // Clear avatar URL from user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: null,
        },
      });

      if (updateError) {
        throw updateError;
      }

      // Refresh to update the user data
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete avatar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>
          Avatar
        </label>
        
        <div className="flex items-center gap-4">
          {/* Current Avatar Display */}
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                {getUserInitials(user)}
              </div>
            )}
          </div>

          {/* Upload/Delete Controls */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              disabled={uploading || deleting}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="inline-block px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap border"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                if (!uploading && !deleting) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!uploading && !deleting) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Avatar'}
            </label>

            {avatarUrl && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={uploading || deleting}
                className="btn-icon"
                aria-label={deleting ? 'Deleting...' : 'Delete Avatar'}
              >
                {deleting ? (
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>...</span>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {(uploading || deleting) && (
          <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
            {uploading ? 'Uploading...' : 'Deleting...'}
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

