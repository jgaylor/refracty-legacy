'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FeedItem } from '@/lib/supabase/insights';
import { ConfirmDialog } from '../ConfirmDialog';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { NoteItem } from '../people/NoteItem';
import { SkeletonText } from '../skeletons/SkeletonComponents';

interface InsightsListProps {
  initialItems: FeedItem[];
  initialHasMore: boolean;
}

// formatRelativeTime is now in NoteItem component
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

// Component to render relative time client-side only (prevents hydration mismatch)
function RelativeTime({ dateString }: { dateString: string }) {
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    // Only calculate on client after hydration
    // Using setTimeout to defer state update slightly and avoid hydration mismatch
    const updateTime = () => {
      setRelativeTime(formatRelativeTime(dateString));
    };
    
    // Defer initial update to next tick to ensure hydration is complete
    const timeoutId = setTimeout(updateTime, 0);
    
    // Update every minute for recent items to keep "just now" / "X minutes ago" accurate
    const interval = setInterval(updateTime, 60000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [dateString]);

  return <>{relativeTime || '...'}</>;
}

export function InsightsList({ initialItems, initialHasMore }: InsightsListProps) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
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
      const target = event.target as HTMLElement;
      if (!target.closest('[aria-label="Item menu"]') && !target.closest('[data-menu-dropdown]')) {
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

  const handleDeleteClick = (noteId: string) => {
    setDeleteConfirm(noteId);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    const noteId = deleteConfirm;
    setLoading(true);
    try {
      // Find the item to get person_id
      const item = items.find((i) => i.id === noteId);
      if (!item || item.type !== 'note') return;

      const response = await fetch(`/api/people/${item.person.id}/notes/${noteId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setItems((prev) => prev.filter((item) => item.id !== noteId));
        showSuccessToast('Note deleted');
        setDeleteConfirm(null);
        setOpenMenuId(null);
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

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          No items yet
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Start capturing notes about people to see them here
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
        {items.map((item, index) => {
          // Only render notes using NoteItem component
          if (item.type === 'note') {
            return (
              <NoteItem
                key={item.id}
                note={item}
                showPersonName={true}
                personName={item.person.name}
                personId={item.person.id}
                onDelete={handleDeleteClick}
                isDeleting={loading}
                borderTop={index > 0}
              />
            );
          }
          
          // For insights, keep the existing rendering (for now)
          return (
            <div
              key={item.id}
              className={`px-4 py-4 group relative ${index > 0 ? 'border-t' : ''}`}
              style={{
                borderColor: index > 0 ? 'var(--border-color)' : 'transparent',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Primary: Insight Content */}
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
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <RelativeTime dateString={item.created_at} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Skeleton loaders integrated into the same card */}
        {loading && Array.from({ length: 3 }).map((_, skeletonIndex) => {
          const hasItemsBefore = items.length > 0;
          const hasSkeletonsBefore = skeletonIndex > 0;
          const needsBorderTop = hasItemsBefore || hasSkeletonsBefore;
          
          return (
            <div
              key={`skeleton-${skeletonIndex}`}
              className={`px-4 py-4 ${needsBorderTop ? 'border-t' : ''}`}
              style={{
                borderColor: needsBorderTop ? 'var(--border-color)' : 'transparent',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Primary: Note Content */}
                  <div className="mb-1">
                    <SkeletonText width="100%" height="0.875rem" className="mb-1" />
                    {skeletonIndex % 2 === 0 && (
                      <SkeletonText width="75%" height="0.875rem" />
                    )}
                  </div>

                  {/* Secondary: Metadata */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Person name */}
                    <SkeletonText width="100px" height="0.75rem" />
                    {/* Timestamp */}
                    <SkeletonText width="80px" height="0.75rem" />
                  </div>
                </div>

                {/* Menu button skeleton */}
                <div className="relative flex-shrink-0 self-center">
                  <SkeletonText width="1.25rem" height="1.25rem" className="rounded" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteConfirm(null);
          setOpenMenuId(null);
        }}
      />
    </div>
  );
}

