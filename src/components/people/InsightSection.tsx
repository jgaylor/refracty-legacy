'use client';

import { useState, useEffect, useRef } from 'react';
import { IconButton } from '../IconButton';
import { Insight, InsightCategory } from '@/lib/supabase/insights';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const ALL_CATEGORIES: InsightCategory[] = [
  'motivated_by',
  'preferred_communication',
  'works_best_when',
  'collaboration_style',
  'feedback_approach',
];

const CATEGORY_LABELS: Record<InsightCategory, string> = {
  motivated_by: 'Motivated by',
  preferred_communication: 'Preferred communication',
  works_best_when: 'Works best when',
  collaboration_style: 'Collaboration style',
  feedback_approach: 'Feedback approach',
};

interface InsightSectionProps {
  category: InsightCategory;
  categoryLabel: string;
  insights: Insight[];
  onAdd: (category: InsightCategory, content: string) => Promise<void>;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMoveCategory?: (id: string, newCategory: InsightCategory) => Promise<void>;
  isFirstSection?: boolean;
}

export function InsightSection({
  category,
  categoryLabel,
  insights,
  onAdd,
  onEdit,
  onDelete,
  onMoveCategory,
  isFirstSection = false,
}: InsightSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [moveToMenuId, setMoveToMenuId] = useState<string | null>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  const handleAdd = async () => {
    if (!newContent.trim()) return;

    setLoading(true);
    try {
      await onAdd(category, newContent);
      setNewContent('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding insight:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string, currentContent: string) => {
    if (editingId === id) {
      // Save edit
      if (!editingContent.trim()) return;
      setLoading(true);
      try {
        await onEdit(id, editingContent);
        setEditingId(null);
        setEditingContent('');
      } catch (error) {
        console.error('Error editing insight:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Start editing
      setEditingId(id);
      setEditingContent(currentContent);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setLoading(true);
    try {
      await onDelete(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting insight:', error);
    } finally {
      setLoading(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('[aria-label="Insight menu"]')) {
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

  const handleMoveCategory = async (insightId: string, newCategory: InsightCategory) => {
    if (!onMoveCategory) return;

    setLoading(true);
    try {
      await onMoveCategory(insightId, newCategory);
      setMoveToMenuId(null);
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error moving insight category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`px-4 py-4 group ${!isFirstSection ? 'border-t' : ''}`}
      style={{ 
        borderColor: !isFirstSection ? 'var(--border-color)' : 'transparent',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 
          className="text-xs font-medium uppercase tracking-wider" 
          style={{ 
            color: 'var(--text-secondary)',
          }}
        >
          {categoryLabel}
        </h3>
        {!isAdding && (
          <IconButton
            variant="group-hover"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={loading}
            aria-label="Add insight"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </IconButton>
        )}
      </div>

      <div className="space-y-2">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex items-start gap-2 group"
            style={{ color: 'var(--text-primary)' }}
          >
            {editingId === insight.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEdit(insight.id, editingContent);
                }}
                className="flex-1 flex gap-2"
              >
                <input
                  type="text"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                  className="input flex-1 px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !editingContent.trim()}
                  className="px-3 py-1.5 text-sm btn-primary rounded-md disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm btn-outline border rounded-md disabled:opacity-50"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span 
                  className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleEdit(insight.id, insight.content)}
                >
                  {insight.content}
                </span>
                <div className="flex gap-1 relative">
                  {/* Menu Button */}
                  {onMoveCategory && (
                    <div className="relative">
                      <IconButton
                        variant="group-hover"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === insight.id ? null : insight.id)}
                        disabled={loading}
                        isActive={openMenuId === insight.id}
                        aria-label="Insight menu"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                      </IconButton>

                      {/* Dropdown Menu */}
                      {openMenuId === insight.id && (
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
                              {/* Move to... */}
                              <div className="relative">
                                <button
                                  onClick={() => setMoveToMenuId(moveToMenuId === insight.id ? null : insight.id)}
                                  disabled={loading}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-tertiary transition-colors disabled:opacity-50 flex items-center justify-between"
                                  style={{
                                    color: 'var(--text-primary)',
                                    backgroundColor: moveToMenuId === insight.id ? 'var(--bg-tertiary)' : 'transparent',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (moveToMenuId !== insight.id) {
                                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (moveToMenuId !== insight.id) {
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
                                      transform: moveToMenuId === insight.id ? 'rotate(90deg)' : 'rotate(0deg)',
                                      transition: 'transform 0.2s',
                                    }}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>

                                {/* Submenu for categories - Inline vertical expansion */}
                                {moveToMenuId === insight.id && (
                                  <div
                                    ref={submenuRef}
                                    className="w-full border-t"
                                    style={{
                                      borderColor: 'var(--border-color)',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="py-1">
                                      {ALL_CATEGORIES.map((cat) => {
                                        // Skip current category
                                        if (cat === category) {
                                          return null;
                                        }
                                        return (
                                          <button
                                            key={cat}
                                            onClick={() => handleMoveCategory(insight.id, cat)}
                                            disabled={loading}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-tertiary transition-colors disabled:opacity-50"
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
                                            {CATEGORY_LABELS[cat]}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Divider */}
                              <div
                                className="my-1"
                                style={{ borderColor: 'var(--border-color)', borderTopWidth: '1px' }}
                              />

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleDeleteClick(insight.id);
                                }}
                                disabled={loading}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-tertiary transition-colors disabled:opacity-50"
                                style={{
                                  color: '#ef4444',
                                  backgroundColor: 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                Delete insight
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Delete Button (only if no move category handler) */}
                  {!onMoveCategory && (
                    <IconButton
                      variant="group-hover"
                      destructive
                      size="sm"
                      onClick={() => handleDeleteClick(insight.id)}
                      disabled={loading}
                      aria-label="Delete insight"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </IconButton>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {isAdding && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Add insight..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewContent('');
                }
              }}
              className="input flex-1 px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !newContent.trim()}
              className="px-3 py-1.5 text-sm btn-primary rounded-md disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewContent('');
              }}
              disabled={loading}
              className="px-3 py-1.5 text-sm btn-outline border rounded-md disabled:opacity-50"
            >
              Cancel
            </button>
          </form>
        )}

        {insights.length === 0 && !isAdding && (
          <p 
            className="text-sm italic cursor-pointer hover:opacity-80 transition-opacity" 
            style={{ color: 'var(--text-tertiary)' }}
            onClick={() => setIsAdding(true)}
          >
            No insights yet
          </p>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Insight"
        message="Are you sure you want to delete this insight? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

