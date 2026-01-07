'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Person, Note } from '@/lib/supabase/people';
import { PersonHeader } from './PersonHeader';
import { PersonDetailsCard } from './PersonDetailsCard';
import { ExpandableNotesCard } from './ExpandableNotesCard';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { useMobileHeader } from '@/components/MobileHeaderProvider';

interface PersonDetailClientProps {
  person: Person;
  initialNotes: Note[];
}

export function PersonDetailClient({
  person,
  initialNotes,
}: PersonDetailClientProps) {
  const router = useRouter();
  const { setConfig } = useMobileHeader();
  const [notesCount, setNotesCount] = useState(initialNotes.length);

  // Sync notesCount when initialNotes changes (e.g., after page refresh)
  useEffect(() => {
    setNotesCount(initialNotes.length);
  }, [initialNotes.length]);

  const handleDelete = useCallback(async () => {
    try {
      const response = await fetch(`/api/people/${person.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccessToast('Person deleted');
        router.push('/home');
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete person';
      showErrorToast(errorMessage);
    }
  }, [person.id, router]);

  // Configure mobile header
  useEffect(() => {
    setConfig({
      pageTitle: person.name,
      moreActions: [
        {
          label: 'Delete person',
          onClick: handleDelete,
          destructive: true,
        },
      ],
    });

    return () => {
      setConfig(null);
    };
  }, [person.name, setConfig, handleDelete]);

  return (
    <div className="space-y-6">
      <PersonHeader person={person} onDelete={handleDelete} />

      {/* Person Details Card */}
      <PersonDetailsCard personId={person.id} notesCount={notesCount} />

      {/* Notes Card */}
      <ExpandableNotesCard
        personId={person.id}
        initialNotes={initialNotes}
        onNotesChange={setNotesCount}
      />
    </div>
  );
}

