'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '../IconButton';
import { PersonWithNote } from '@/lib/supabase/people';

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

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Filter people based on search
  const filteredPeople = people.filter((person) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const nameMatch = person.name.toLowerCase().includes(query);
    const vibeMatch = person.vibe_summary?.toLowerCase().includes(query);
    return nameMatch || vibeMatch;
  });

  const handleSelect = (personId: string) => {
    onSelect(personId);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-md rounded-lg shadow-lg"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Who is this note about?
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Choose the person this insight relates to.
            </p>
          </div>
          <IconButton
            onClick={onClose}
            size="lg"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>

        {/* Search */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>

        {/* People List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {people.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                No people yet. Add someone to get started.
              </p>
              {onAddPerson && (
                <button
                  onClick={onAddPerson}
                  className="btn-primary px-4 py-2 rounded-md"
                >
                  Add Person
                </button>
              )}
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No people found.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredPeople.map((person) => (
                <button
                  key={person.id}
                  onClick={() => handleSelect(person.id)}
                  className="w-full text-left p-3 rounded-md hover:bg-opacity-50 transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                      {getInitials(person.name)}
                    </div>

                    {/* Name and Summary */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {person.name}
                      </p>
                      {person.vibe_summary && (
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {person.vibe_summary}
                        </p>
                      )}
                    </div>
                  </div>
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

