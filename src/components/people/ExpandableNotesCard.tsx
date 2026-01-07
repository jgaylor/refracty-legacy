'use client';

import { useState, useEffect, useRef } from 'react';
import { IconButton } from '../IconButton';
import { Note } from '@/lib/supabase/people';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface ExpandableNotesCardProps {
  personId: string;
  initialNotes: Note[];
  onNotesChange?: (count: number) => void;
}

export function ExpandableNotesCard({ personId, initialNotes, onNotesChange }: ExpandableNotesCardProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const onNotesChangeRef = useRef(onNotesChange);
  
  // Keep ref in sync with prop
  useEffect(() => {
    onNotesChangeRef.current = onNotesChange;
  }, [onNotesChange]);

  // Simple sync: add new notes from initialNotes, replace when server confirms removals
  useEffect(() => {
    setNotes((prev) => {
      const currentNoteIds = new Set(prev.map(n => n.id));
      const initialNoteIds = new Set(initialNotes.map(n => n.id));
      
      const hasNewNotes = initialNotes.some(note => !currentNoteIds.has(note.id));
      const hasRemovedNotes = initialNotes.length < prev.length;
      
      // When new notes arrive from server, add them (avoid duplicates)
      if (hasNewNotes) {
        const existingIds = new Set(prev.map(n => n.id));
        const newNotes = initialNotes.filter(note => !existingIds.has(note.id));
        const updated = [...newNotes, ...prev];
        onNotesChangeRef.current?.(updated.length);
        return updated;
      }
      // When server confirms removals (fewer notes), replace state
      else if (hasRemovedNotes) {
        onNotesChangeRef.current?.(initialNotes.length);
        return initialNotes;
      }
      return prev;
    });
  }, [initialNotes]);

  // Listen for note added events to update count optimistically
  useEffect(() => {
    const handleNoteAdded = (event: CustomEvent<{ personId: string; note: Note }>) => {
      if (event.detail.personId === personId) {
        setNotes((prev) => {
          // Check if note already exists to avoid duplicates
          if (prev.some(n => n.id === event.detail.note.id)) {
            return prev;
          }
          // Add note to the beginning of the list
          const updated = [event.detail.note, ...prev];
          onNotesChangeRef.current?.(updated.length);
          return updated;
        });
      }
    };

    window.addEventListener('noteAdded', handleNoteAdded as EventListener);
    return () => {
      window.removeEventListener('noteAdded', handleNoteAdded as EventListener);
    };
  }, [personId]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${month}/${day}/${year} at ${hours}:${minutesStr} ${ampm}`;
  };

  const handleDeleteNote = async (noteId: string) => {
    setLoading(true);
    setOpenMenuId(null);
    try {
      const response = await fetch(`/api/people/${personId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Optimistically remove the note
        setNotes((prev) => {
          const updated = prev.filter((note) => note.id !== noteId);
          onNotesChangeRef.current?.(updated.length);
          return updated;
        });
        showSuccessToast('Note deleted');
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
    <div
      className="rounded-lg border"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Header */}
      <div
        className="w-full px-4 py-4 flex items-center"
        style={{ color: 'var(--text-primary)' }}
      >
        <span className="text-base font-medium flex items-center gap-2">
          Notes
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {notes.length}
          </span>
        </span>
      </div>

      {/* Notes List - Always visible */}
      <div>
        {notes.length === 0 ? (
          <div className="px-4 pb-4">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No notes yet.</p>
          </div>
        ) : (
          <>
            {notes.map((note, index) => (
                <div
                  key={note.id}
                  className={`px-4 py-4 group relative border-t`}
                  style={{
                    borderColor: 'var(--border-color)',
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
            </>
          )}
        </div>
    </div>
  );
}

