'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/supabase/people';
import { InsightCategory } from '@/lib/supabase/insights';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface NotesTabProps {
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

export function NotesTab({ personId, initialNotes, onNotesChange }: NotesTabProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [moveToMenuId, setMoveToMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
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

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/people/${personId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNoteContent }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const updated = [result.note, ...notes];
        setNotes(updated);
        onNotesChange?.(updated.length);
        setNewNoteContent('');
        showSuccessToast('Note added');
      } else {
        throw new Error(result.error || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setLoading(false);
    }
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
        // Remove note from list
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
        // Remove note from list
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
    <div>
      {/* Add Note Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddNote();
        }}
        className="mb-6 flex gap-3"
      >
        <textarea
          placeholder="Add a quick note..."
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddNote();
            }
          }}
          rows={3}
          disabled={loading}
          className="input flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
        <button
          type="submit"
          disabled={loading || !newNoteContent.trim()}
          className="btn-primary px-4 py-2 rounded-md h-fit disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">No notes yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div 
              key={note.id} 
              className="p-4 rounded-lg border relative group"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="mb-2" style={{ color: 'var(--text-primary)' }}>
                    {note.content}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDate(note.created_at)}
                  </p>
                </div>
                
                {/* Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                    disabled={loading}
                    className="text-neutral-500 hover:text-neutral-700 p-1 disabled:opacity-50"
                    aria-label="Note menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === note.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => {
                          setOpenMenuId(null);
                          setMoveToMenuId(null);
                        }}
                      />
                      <div
                        className="absolute right-0 mt-1 w-56 rounded-md shadow-lg z-20 border"
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

                            {/* Submenu for categories */}
                            {moveToMenuId === note.id && (
                              <div
                                className="absolute left-full top-0 ml-1 w-56 rounded-md shadow-lg z-30 border"
                                style={{
                                  backgroundColor: 'var(--bg-primary)',
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
