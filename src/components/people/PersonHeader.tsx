'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Person } from '@/lib/supabase/people';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { IconButton } from '../IconButton';
import { ConfirmDialog } from '../ConfirmDialog';

interface PersonHeaderProps {
  person: Person;
  onDelete?: () => void;
}

export function PersonHeader({ person, onDelete }: PersonHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      return trimmed[0].toUpperCase();
    }
    return '?';
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {person.name}
              </h1>
              {/* Menu Button - Desktop only */}
              {onDelete && (
                <div className="relative flex-shrink-0 hidden md:block" ref={menuRef}>
                  <IconButton
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    isActive={isMenuOpen}
                    aria-label="Person menu"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                      />
                    </svg>
                  </IconButton>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-45"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <div
                        className="absolute right-0 mt-1 w-48 rounded-md shadow-lg z-50 border"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-color)',
                        }}
                      >
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              setShowDeleteConfirm(true);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-tertiary transition-colors"
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
                            Delete person
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xl font-medium">
            {getInitials(person.name)}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Person"
        message={`Are you sure you want to delete ${person.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete?.();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

