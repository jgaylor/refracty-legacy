'use client';

import { useState, useEffect, useRef } from 'react';
import { IconButton } from '../IconButton';
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/supabase/people';
import { InsightCategory } from '@/lib/supabase/insights';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface ExpandableNotesCardProps {
  personId: string;
  initialNotes: Note[];
  onNotesChange?: (count: number) => void;
}

const CATEGORY_LABELS: Record<InsightCategory, string> = {
  motivated_by: 'Motivated by',
  preferred_communication: 'Preferred communication',
  works_best_when: 'Works best when',
  collaboration_style: 'Collaboration style',
  feedback_approach: 'Feedback approach',
};

const ALL_CATEGORIES: InsightCategory[] = [
  'motivated_by',
  'preferred_communication',
  'works_best_when',
  'collaboration_style',
  'feedback_approach',
];

export function ExpandableNotesCard({ personId, initialNotes, onNotesChange }: ExpandableNotesCardProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [moveToMenuId, setMoveToMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Sync notes with initialNotes when it changes, but preserve optimistic updates
  useEffect(() => {
    const currentNoteIds = new Set(notes.map(n => n.id));
    const initialNoteIds = new Set(initialNotes.map(n => n.id));
    
    const hasNewNotes = initialNotes.some(note => !currentNoteIds.has(note.id));
    if (hasNewNotes && initialNotes.length >= notes.length) {
      setNotes(initialNotes);
      onNotesChange?.(initialNotes.length);
    }
  }, [initialNotes, notes, onNotesChange]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('[aria-label="Note menu"]')) {
          setOpenMenuId(null);
          setMoveToMenuId(null);
        }
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

  const handleMoveToInsight = async (noteId: string, category: InsightCategory) => {
    setLoading(true);
    setOpenMenuId(null);
    setMoveToMenuId(null);
    try {
      const response = await fetch(`/api/people/${personId}/notes/${noteId}/move-to-insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setNotes((prev) => {
          const updated = prev.filter((note) => note.id !== noteId);
          onNotesChange?.(updated.length);
          return updated;
        });
        showSuccessToast('Note moved to insight', {
          href: `/people/${personId}`,
          text: 'View person',
        });
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to move note to insight');
      }
    } catch (error) {
      console.error('Error moving note to insight:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to move note to insight';
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNoteClick = (noteId: string) => {
    setOpenMenuId(null);
    setDeleteConfirm(noteId);
  };

  const handleDeleteNote = async () => {
    if (!deleteConfirm) return;

    const noteId = deleteConfirm;
    setLoading(true);
    try {
      const response = await fetch(`/api/people/${personId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setNotes((prev) => {
          const updated = prev.filter((note) => note.id !== noteId);
          onNotesChange?.(updated.length);
          return updated;
        });
        showSuccessToast('Note deleted');
        setDeleteConfirm(null);
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
    <div
      className="rounded-lg border"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:opacity-80 transition-opacity"
        style={{ color: 'var(--text-primary)' }}
      >
        <span className="text-base font-medium flex items-center gap-2">
          Unsorted notes
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {notes.length}
          </span>
        </span>
        <svg
          className="w-5 h-5 transition-transform"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Notes List - Expandable */}
      {isExpanded && (
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
                              setMoveToMenuId(null);
                            }}
                          />
                          <div
                            className="absolute right-0 mt-1 w-56 rounded-md shadow-lg z-50 border"
                            style={{
                              backgroundColor: 'var(--bg-primary)',
                              borderColor: 'var(--border-color)',
                            }}
                          >
                            <div className="py-1">
                              {/* Move to... parent item */}
                              <div className="relative">
                                <button
                                  onClick={() => setMoveToMenuId(moveToMenuId === note.id ? null : note.id)}
                                  disabled={loading}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-50 transition-colors disabled:opacity-50 flex items-center justify-between"
                                  style={{
                                    color: 'var(--text-primary)',
                                    backgroundColor: moveToMenuId === note.id ? 'var(--bg-tertiary)' : 'transparent',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (moveToMenuId !== note.id) {
                                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (moveToMenuId !== note.id) {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                  }}
                                >
                                  <span>Move to...</span>
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{
                                      transform: moveToMenuId === note.id ? 'rotate(90deg)' : 'rotate(0deg)',
                                      transition: 'transform 0.2s',
                                    }}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>

                                {/* Submenu for categories - Inline vertical expansion */}
                                {moveToMenuId === note.id && (
                                  <div
                                    ref={submenuRef}
                                    className="w-full border-t"
                                    style={{
                                      borderColor: 'var(--border-color)',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="py-1">
                                      {ALL_CATEGORIES.map((category) => (
                                        <button
                                          key={category}
                                          onClick={() => handleMoveToInsight(note.id, category)}
                                          disabled={loading}
                                          className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-50 transition-colors disabled:opacity-50"
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
                                          {CATEGORY_LABELS[category]}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div
                                className="my-1"
                                style={{ borderColor: 'var(--border-color)', borderTopWidth: '1px' }}
                              />
                              <button
                                onClick={() => handleDeleteNoteClick(note.id)}
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
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteNote}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

