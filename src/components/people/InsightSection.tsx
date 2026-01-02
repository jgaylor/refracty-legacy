'use client';

import { useState } from 'react';
import { IconButton } from '../IconButton';
import { Insight, InsightCategory } from '@/lib/supabase/insights';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface InsightSectionProps {
  category: InsightCategory;
  categoryLabel: string;
  insights: Insight[];
  onAdd: (category: InsightCategory, content: string) => Promise<void>;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function InsightSection({
  category,
  categoryLabel,
  insights,
  onAdd,
  onEdit,
  onDelete,
}: InsightSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string } | null>(null);

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

  return (
    <div 
      className="p-4 rounded-lg border mb-4"
      style={{ 
        backgroundColor: 'var(--bg-primary)', 
        borderColor: 'var(--border-color)' 
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {categoryLabel}
        </h3>
        {!isAdding && (
          <IconButton
            variant="compact"
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
                <div className="flex gap-1">
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

