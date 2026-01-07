'use client';

import { useState, useEffect } from 'react';
import { IconButton } from '../IconButton';
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/supabase/people';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface NotesTabProps {
  personId: string;
  initialNotes: Note[];
  onNotesChange?: (count: number) => void;
}

export function NotesTab({ personId, initialNotes, onNotesChange }: NotesTabProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const router = useRouter();

  // Sync notes with initialNotes when it changes, but preserve optimistic updates
  useEffect(() => {
    // Only sync if initialNotes has significantly more items (likely a server refresh)
    // This prevents overwriting optimistic updates but allows syncing after navigation
    const currentNoteIds = new Set(notes.map(n => n.id));
    const initialNoteIds = new Set(initialNotes.map(n => n.id));
    
    // If initialNotes has notes that aren't in current state, sync
    const hasNewNotes = initialNotes.some(note => !currentNoteIds.has(note.id));
    if (hasNewNotes && initialNotes.length >= notes.length) {
      setNotes(initialNotes);
      onNotesChange?.(initialNotes.length);
    }
  }, [initialNotes, notes, onNotesChange]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${month}/${day}/${year} at ${hours}:${minutesStr} ${ampm}`;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[aria-label="Note menu"]') && !target.closest('[data-menu-dropdown]')) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const handleDeleteNote = async (noteId: string) => {
    setLoading(true);
    setOpenMenuId(null);
    try {
      const response = await fetch(`/api/people/${personId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Remove note from list
        setNotes((prev) => {
          const updated = prev.filter((note) => note.id !== noteId);
          onNotesChange?.(updated.length);
          return updated;
        });
        showSuccessToast('Note deleted');
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">No notes yet.</p>
        </div>
      ) : (
        <div
          className="rounded-lg border"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
          }}
        >
          {notes.map((note, index) => (
            <div
              key={note.id}
              className={`px-4 py-4 group relative ${index > 0 ? 'border-t' : ''}`}
              style={{
                borderColor: index > 0 ? 'var(--border-color)' : 'transparent',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Primary: Note Content */}
                  <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {note.content}
                  </p>

                  {/* Secondary: Metadata */}
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDate(note.created_at)}
                  </p>
                </div>

                {/* Menu Button */}
                <div className="relative flex-shrink-0 self-center">
                  <IconButton
                    variant="group-hover"
                    size="sm"
                    onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                    disabled={loading}
                    isActive={openMenuId === note.id}
                    aria-label="Note menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  </IconButton>

                  {/* Dropdown Menu */}
                  {openMenuId === note.id && (
                    <>
                      <div
                        className="fixed inset-0 z-45"
                        onClick={() => {
                          setOpenMenuId(null);
                        }}
                      />
                      <div
                        data-menu-dropdown
                        className="absolute right-0 mt-1 w-56 rounded-md shadow-lg z-50 border"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-color)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={loading}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-50 transition-colors disabled:opacity-50 text-red-600"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            Delete note
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
