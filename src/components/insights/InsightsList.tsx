'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FeedItem, InsightCategory } from '@/lib/supabase/insights';
import { InsightsListSkeleton } from './InsightsListSkeleton';
import { IconButton } from '../IconButton';
import { ConfirmDialog } from '../ConfirmDialog';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface InsightsListProps {
  initialItems: FeedItem[];
  initialHasMore: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
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

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
}

export function InsightsList({ initialItems, initialHasMore }: InsightsListProps) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [moveToMenuId, setMoveToMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'note' | 'insight' } | null>(null);
  const [flipLeft, setFlipLeft] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchMoreItems = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/feed?page=${nextPage}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setItems((prev) => [...prev, ...data.items]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Error fetching feed items:', error);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchMoreItems, hasMore, loading]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
        // Don't close if clicking on menu button
        const target = event.target as HTMLElement;
        if (!target.closest('[aria-label="Item menu"]')) {
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

  // Check if submenu should flip left
  useEffect(() => {
    if (moveToMenuId && submenuRef.current) {
      const rect = submenuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const shouldFlip = rect.right > viewportWidth - 200;
      setFlipLeft(shouldFlip);
    }
  }, [moveToMenuId]);

  const handleDeleteClick = (item: FeedItem) => {
    setOpenMenuId(null);
    setDeleteConfirm({ id: item.id, type: item.type });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    const { id, type } = deleteConfirm;
    setLoading(true);
    try {
      // Find the item to get person_id
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const endpoint = type === 'note'
        ? `/api/people/${item.person.id}/notes/${id}`
        : `/api/people/${item.person.id}/insights/${id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        showSuccessToast(type === 'note' ? 'Note deleted' : 'Insight deleted');
        setDeleteConfirm(null);
        router.refresh();
      } else {
        throw new Error(result.error || `Failed to delete ${type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${deleteConfirm.type}:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to delete ${deleteConfirm.type}`;
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToInsight = async (noteId: string, category: InsightCategory) => {
    const item = items.find((i) => i.id === noteId && i.type === 'note');
    if (!item) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/people/${item.person.id}/notes/${noteId}/move-to-insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Remove note from list (it's now an insight)
        setItems((prev) => prev.filter((item) => item.id !== noteId));
        showSuccessToast('Note converted to insight');
        setMoveToMenuId(null);
        setOpenMenuId(null);
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to convert note to insight');
      }
    } catch (error) {
      console.error('Error converting note to insight:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert note to insight';
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          No items yet
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Start capturing notes and insights about people to see them here
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Single card container with all insights */}
      <div
        className="rounded-lg border"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`px-4 py-4 group relative ${index > 0 ? 'border-t' : ''}`}
            style={{
              borderColor: index > 0 ? 'var(--border-color)' : 'transparent',
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Primary: Note/Insight Content */}
                <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {item.content}
                </p>

                {/* Secondary: Metadata */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/people/${item.person.id}`}
                    className="text-xs font-medium hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {item.person.name}
                  </Link>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                  }}>
                    {item.type === 'insight' 
                      ? (CATEGORY_LABELS[item.category] || item.category)
                      : 'Note'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
              </div>

              {/* Menu Button */}
              <div className="relative flex-shrink-0 self-center">
                <IconButton
                  variant="group-hover"
                  size="sm"
                  onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                  disabled={loading}
                  isActive={openMenuId === item.id}
                  aria-label="Item menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </IconButton>

                {/* Dropdown Menu */}
                {openMenuId === item.id && (
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
                        {/* Move to... (only for notes) */}
                        {item.type === 'note' && (
                          <div className="relative">
                            <button
                              onClick={() => setMoveToMenuId(moveToMenuId === item.id ? null : item.id)}
                              disabled={loading}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-tertiary transition-colors disabled:opacity-50 flex items-center justify-between"
                              style={{
                                color: 'var(--text-primary)',
                                backgroundColor: moveToMenuId === item.id ? 'var(--bg-tertiary)' : 'transparent',
                              }}
                              onMouseEnter={(e) => {
                                if (moveToMenuId !== item.id) {
                                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (moveToMenuId !== item.id) {
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
                                  transform: moveToMenuId === item.id ? 'rotate(90deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s',
                                }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>

                            {/* Submenu for categories */}
                            {moveToMenuId === item.id && (
                              <div
                                ref={submenuRef}
                                className={`absolute ${flipLeft ? 'right-full mr-1' : 'left-full ml-1'} top-0 w-56 rounded-md shadow-lg z-[55] border`}
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
                                      onClick={() => handleMoveToInsight(item.id, category)}
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
                                      {CATEGORY_LABELS[category]}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Divider (only if Move to... is shown) */}
                        {item.type === 'note' && (
                          <div
                            className="my-1"
                            style={{ borderColor: 'var(--border-color)', borderTopWidth: '1px' }}
                          />
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteClick(item)}
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
                          Delete {item.type === 'note' ? 'note' : 'insight'}
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

      {loading && (
        <div className="mt-4">
          <InsightsListSkeleton count={3} />
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="text-center py-4 mt-4">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No more items to load
          </p>
        </div>
      )}

      <div ref={observerTarget} className="h-4" />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title={`Delete ${deleteConfirm?.type === 'note' ? 'Note' : 'Insight'}`}
        message={deleteConfirm ? `Are you sure you want to delete this ${deleteConfirm.type}? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

