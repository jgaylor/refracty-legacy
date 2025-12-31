'use client';

import { useState } from 'react';
import { CreatePersonInput } from '@/lib/supabase/people';
import { useRouter } from 'next/navigation';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { IconButton } from '../IconButton';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonAdded?: (personId: string) => void;
}

export function AddPersonModal({ isOpen, onClose, onPersonAdded }: AddPersonModalProps) {
  const [name, setName] = useState('');
  const [vibeSummary, setVibeSummary] = useState('');
  const [firstNote, setFirstNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input: CreatePersonInput = {
      name,
      vibe_summary: vibeSummary.trim() || null,
      first_note: firstNote.trim() || null,
    };

    const response = await fetch('/api/people', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      const personId = result.person?.id;
      
      // Reset form
      setName('');
      setVibeSummary('');
      setFirstNote('');
      onClose();
      
      // Call onPersonAdded callback if provided
      if (personId && onPersonAdded) {
        onPersonAdded(personId);
      } else {
        // Show success toast with link to person page (only if not using callback)
        if (personId) {
          showSuccessToast('Person added', {
            href: `/people/${personId}`,
            text: 'View person',
          });
        } else {
          showSuccessToast('Person added');
        }
        router.refresh();
      }
    } else {
      const errorMessage = result.error || 'Failed to create person';
      setError(errorMessage);
      showErrorToast(errorMessage);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setVibeSummary('');
      setFirstNote('');
      setError(null);
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Add New Person
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Add someone to start capturing insights about how they work best.
            </p>
          </div>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            size="lg"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="label block text-sm font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter their name"
              disabled={loading}
              className="input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Vibe Summary */}
          <div>
            <label htmlFor="vibe-summary" className="label block text-sm font-medium mb-2">
              Vibe Summary <span className="text-neutral-400 text-xs">(Optional)</span>
            </label>
            <input
              id="vibe-summary"
              type="text"
              value={vibeSummary}
              onChange={(e) => setVibeSummary(e.target.value)}
              placeholder="e.g. Thinks best out loud, quick responder"
              disabled={loading}
              className="input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* First Note */}
          <div>
            <label htmlFor="first-note" className="label block text-sm font-medium mb-2">
              First Note <span className="text-neutral-400 text-xs">(Optional)</span>
            </label>
            <textarea
              id="first-note"
              value={firstNote}
              onChange={(e) => setFirstNote(e.target.value)}
              placeholder="Any initial observation..."
              rows={4}
              disabled={loading}
              className="input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>

          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn-outline px-4 py-2 border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

