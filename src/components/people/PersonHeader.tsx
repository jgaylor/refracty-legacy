'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Person } from '@/lib/supabase/people';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface PersonHeaderProps {
  person: Person;
}

export function PersonHeader({ person }: PersonHeaderProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [vibeSummary, setVibeSummary] = useState(person.vibe_summary || '');
  const [loading, setLoading] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/people/${person.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vibe_summary: vibeSummary.trim() || null,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsEditing(false);
        showSuccessToast('Summary updated');
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to update summary');
      }
    } catch (error) {
      console.error('Error updating summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update summary';
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setVibeSummary(person.vibe_summary || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xl font-medium">
          {getInitials(person.name)}
        </div>

        {/* Name and Summary */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {person.name}
          </h1>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={vibeSummary}
                onChange={(e) => setVibeSummary(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                disabled={loading}
                autoFocus
                className="input flex-1 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                style={{ color: 'var(--text-secondary)' }}
              />
            </div>
          ) : (
            <p
              className="text-base cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setIsEditing(true)}
            >
              {person.vibe_summary || 'Click to add a summary...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

