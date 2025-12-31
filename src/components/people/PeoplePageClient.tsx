'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PersonWithNote } from '@/lib/supabase/people';
import { PeopleList } from './PeopleList';
import { AddPersonModal } from './AddPersonModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { useMobileHeader } from '@/components/MobileHeaderProvider';

interface PeoplePageClientProps {
  initialPeople: PersonWithNote[];
}

export function PeoplePageClient({ initialPeople }: PeoplePageClientProps) {
  const router = useRouter();
  const { setConfig } = useMobileHeader();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [people, setPeople] = useState<PersonWithNote[]>(initialPeople);
  const [deleteConfirm, setDeleteConfirm] = useState<PersonWithNote | null>(null);
  const [loading, setLoading] = useState(false);

  // Configure mobile header
  useEffect(() => {
    setConfig({
      primaryAction: {
        label: 'Add Person',
        onClick: () => setIsModalOpen(true),
      },
    });

    return () => {
      setConfig(null);
    };
  }, [setConfig]);

  // Sync local state with initialPeople when it changes (e.g., after adding a person)
  useEffect(() => {
    setPeople(initialPeople);
  }, [initialPeople]);

  // Filter people based on search query (case-insensitive)
  const filteredPeople = people.filter((person) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const nameMatch = person.name.toLowerCase().includes(query);
    const vibeMatch = person.vibe_summary?.toLowerCase().includes(query);
    
    return nameMatch || vibeMatch;
  });

  const handleDeleteClick = (person: PersonWithNote) => {
    setDeleteConfirm(person);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/people/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Remove person from list
        setPeople((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
        setDeleteConfirm(null);
        showSuccessToast('Person deleted');
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete person';
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">People</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Build understanding over time through lightweight observations
        </p>

        {/* Header with Search and Add button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="search"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-4 py-2 rounded-md whitespace-nowrap"
          >
            Add Person
          </button>
        </div>

        {/* People List */}
        <PeopleList 
          people={filteredPeople} 
          onDeleteClick={handleDeleteClick}
        />
      </div>

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Person"
        message={deleteConfirm ? `Are you sure you want to delete ${deleteConfirm.name}? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}

