'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '../IconButton';
import { PersonWithNote } from '@/lib/supabase/people';
import { useTouchDevice } from '@/hooks/useTouchDevice';

interface PersonSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (personId: string) => void;
  people: PersonWithNote[];
  onAddPerson?: () => void;
}

export function PersonSelectionModal({
  isOpen,
  onClose,
  onSelect,
  people,
  onAddPerson,
}: PersonSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const isTouchDevice = useTouchDevice();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const listItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Lock body scroll when modal is open to prevent iOS Safari auto-scrolling
  useEffect(() => {
    if (isOpen) {
      // Store original styles
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalWidth = document.body.style.width;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      return () => {
        // Restore original styles
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = originalWidth;
      };
    }
  }, [isOpen]);

  // Trigger animation after mount for bottom sheet
  useEffect(() => {
    if (isOpen && isTouchDevice) {
      // Small delay to ensure initial render completes before animation
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, isTouchDevice]);

  // Store the element that opened the modal for focus return
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      // Auto-focus search input when modal opens (desktop only - don't on touch devices)
      if (!isTouchDevice) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    } else {
      // On touch devices, blur any active element to dismiss keyboard
      if (isTouchDevice && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      // Return focus to previous active element when modal closes (desktop only)
      if (!isTouchDevice && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
        previousActiveElementRef.current = null;
      } else {
        previousActiveElementRef.current = null;
      }
    }
  }, [isOpen, isTouchDevice]);

  // Reset search and focused index when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setFocusedIndex(-1);
      setIsSearchFocused(false);
      listItemRefs.current = [];
    }
  }, [isOpen]);

  // Track visual viewport height for iOS keyboard handling
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      // Reset viewport height when modal closes
      setViewportHeight(null);
      return;
    }

    // Calculate initial viewport height
    const updateViewportHeight = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        // Fallback for browsers without Visual Viewport API
        setViewportHeight(window.innerHeight);
      }
    };

    // Set initial height
    updateViewportHeight();

    // Listen for viewport changes (keyboard show/hide)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
      // Also listen for scroll events in case of layout shifts
      window.visualViewport.addEventListener('scroll', updateViewportHeight);
    } else {
      // Fallback: listen to window resize
      window.addEventListener('resize', updateViewportHeight);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
        window.visualViewport.removeEventListener('scroll', updateViewportHeight);
      } else {
        window.removeEventListener('resize', updateViewportHeight);
      }
    };
  }, [isOpen]);

  // Filter people based on search
  const filteredPeople = people.filter((person) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const nameMatch = person.name.toLowerCase().includes(query);
    const vibeMatch = person.vibe_summary?.toLowerCase().includes(query);
    return nameMatch || vibeMatch;
  });

  // Reset focused index when filtered results change
  useEffect(() => {
    setFocusedIndex(-1);
    listItemRefs.current = [];
  }, [filteredPeople.length, searchQuery]);

  const handleSelect = useCallback(
    (personId: string) => {
      // Blur search input on touch devices to dismiss keyboard before closing
      if (isTouchDevice && searchInputRef.current) {
        searchInputRef.current.blur();
      }
      onSelect(personId);
      onClose();
    },
    [onSelect, onClose, isTouchDevice]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev < filteredPeople.length - 1 ? prev + 1 : 0;
          listItemRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          return next;
        });
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : filteredPeople.length - 1;
          listItemRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          return next;
        });
        return;
      }

      if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filteredPeople.length) {
        e.preventDefault();
        handleSelect(filteredPeople[focusedIndex].id);
      }
    },
    [filteredPeople, focusedIndex, onClose, handleSelect]
  );

  // Handle overlay click/tap
  const handleOverlayClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      return trimmed[0].toUpperCase();
    }
    return '?';
  };

  if (!isOpen) return null;

  // Bottom sheet for touch devices, centered modal for desktop
  const isBottomSheet = isTouchDevice;

  // Full page modal for touch devices, centered modal for desktop
  const overlayClasses = isBottomSheet
    ? 'fixed inset-0 z-[60]'
    : 'fixed inset-0 z-[60] flex items-center justify-center p-4';

  // Get overlay styles
  const getOverlayStyles = () => {
    if (isBottomSheet) {
      return {
        touchAction: 'none' as const,
      };
    }
    return {};
  };

  // Full page container for touch devices
  const getContainerStyles = () => {
    if (isBottomSheet) {
      // Use dynamic viewport height when available, fallback to 100dvh
      // This ensures the modal height adjusts when iOS keyboard appears/disappears
      let height: string;
      if (viewportHeight !== null) {
        // Use tracked viewport height (updated via Visual Viewport API)
        height = `${viewportHeight}px`;
      } else if (typeof window !== 'undefined' && window.visualViewport) {
        // Fallback: use visualViewport directly during initial render
        height = `${window.visualViewport.height}px`;
      } else {
        // Final fallback: use CSS dynamic viewport unit
        height = '100dvh';
      }
      
      return {
        height,
        display: 'flex' as const,
        flexDirection: 'column' as const,
        backgroundColor: 'var(--bg-primary)',
      };
    }
    return {
      backgroundColor: 'var(--bg-primary)',
    };
  };

  const containerClasses = isBottomSheet
    ? `w-full flex flex-col transition-transform duration-300 ease-out ${
        isAnimating ? 'translate-y-0' : 'translate-y-full'
      }`
    : `w-full max-w-md rounded-lg shadow-lg flex flex-col max-h-[80dvh]`;

  const overlayStyles = {
    backgroundColor: isBottomSheet ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
    ...getOverlayStyles(),
  };

  const containerStyles = {
    backgroundColor: 'var(--bg-primary)',
    ...getContainerStyles(),
  };

  const modalContent = (
    <div
      className={overlayClasses}
      style={overlayStyles}
      onClick={handleOverlayClick}
      onTouchStart={(e) => {
        // Prevent backdrop touch from scrolling content
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div
        className={containerClasses}
        style={containerStyles}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Sticky Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0 sticky top-0"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            zIndex: 20,
          }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Choose a person
          </span>
          <IconButton onClick={onClose} size="sm" aria-label="Close person picker">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>

        {/* Sticky Search */}
        <div
          className="px-4 py-3 border-b flex-shrink-0 sticky top-[49px]"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            zIndex: 19,
          }}
        >
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--text-tertiary)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                // Ensure input is visible above keyboard
                setTimeout(() => {
                  searchInputRef.current?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                  });
                }, 100);
              }}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={handleKeyDown}
              className="input w-full pl-9 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search people"
              autoFocus={!isTouchDevice}
            />
          </div>
        </div>

        {/* Scrollable People List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {people.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                No people yet. Add someone to get started.
              </p>
              {onAddPerson && (
                <button
                  onClick={onAddPerson}
                  className="btn-primary px-4 py-2 rounded-md text-sm"
                >
                  Add Person
                </button>
              )}
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                No people found.
              </p>
            </div>
          ) : (
            <div
              role="listbox"
              aria-label="People list"
              className="py-1"
              aria-live="polite"
              aria-atomic="false"
            >
              {filteredPeople.map((person, index) => (
                <button
                  key={person.id}
                  ref={(el) => {
                    listItemRefs.current[index] = el;
                  }}
                  onClick={() => handleSelect(person.id)}
                  role="option"
                  aria-selected={focusedIndex === index}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors min-h-[44px] ${
                    focusedIndex === index ? 'bg-tertiary' : ''
                  }`}
                  style={{
                    backgroundColor:
                      focusedIndex === index ? 'var(--bg-tertiary)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isTouchDevice) {
                      setFocusedIndex(index);
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isTouchDevice && focusedIndex === index) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  onFocus={() => setFocusedIndex(index)}
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-medium"
                    aria-hidden="true"
                  >
                    {getInitials(person.name)}
                  </div>

                  {/* Name only */}
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {person.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Portal the modal to document.body to escape ViewportWrapper stacking context
  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
}
