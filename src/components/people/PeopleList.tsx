'use client';

import Link from 'next/link';
import { PersonWithNote } from '@/lib/supabase/people';

interface PeopleListProps {
  people: PersonWithNote[];
  onPersonClick?: (person: PersonWithNote) => void;
  onDeleteClick?: (person: PersonWithNote) => void;
}

export function PeopleList({ people, onPersonClick, onDeleteClick }: PeopleListProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (people.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">No people yet. Add someone to get started.</p>
      </div>
    );
  }

  return (
    <div>
      {people.map((person) => {
        const content = (
          <div 
            className="p-4 rounded-lg border cursor-pointer transition-colors hover:bg-opacity-95 group relative"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                {getInitials(person.name)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                  {person.name}
                </h3>
                {person.vibe_summary && (
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {person.vibe_summary}
                  </p>
                )}
              </div>

              {/* Delete Button */}
              {onDeleteClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDeleteClick(person);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-red-600 p-1 flex-shrink-0 self-center"
                  aria-label="Delete person"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );

        if (onPersonClick) {
          return (
            <div key={person.id} className="mb-4 last:mb-0" onClick={() => onPersonClick(person)}>
              {content}
            </div>
          );
        }

        return (
          <Link key={person.id} href={`/people/${person.id}`} className="block mb-4 last:mb-0">
            {content}
          </Link>
        );
      })}
    </div>
  );
}

