'use client';

import { useState, useEffect } from 'react';
import { Person, Note } from '@/lib/supabase/people';
import { Insight } from '@/lib/supabase/insights';
import { PersonHeader } from './PersonHeader';
import { InsightsTab } from './InsightsTab';
import { NotesTab } from './NotesTab';

interface PersonDetailClientProps {
  person: Person;
  initialInsights: Insight[];
  initialNotes: Note[];
}

export function PersonDetailClient({
  person,
  initialInsights,
  initialNotes,
}: PersonDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'notes'>('insights');
  const [notesCount, setNotesCount] = useState(initialNotes.length);

  // Sync notesCount with initialNotes when it changes (e.g., after router.refresh from InsightCapture)
  useEffect(() => {
    setNotesCount(initialNotes.length);
  }, [initialNotes.length]);

  return (
    <div>
      <PersonHeader person={person} />

      {/* Tabs */}
      <div className="border-b mb-6" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('insights')}
            className="pb-3 px-1 font-medium text-sm transition-colors border-b-2"
            style={{
              borderColor: activeTab === 'insights' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'insights' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'insights') {
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'insights') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className="pb-3 px-1 font-medium text-sm transition-colors border-b-2"
            style={{
              borderColor: activeTab === 'notes' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'notes' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'notes') {
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'notes') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            My Notes ({notesCount})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'insights' && (
        <InsightsTab personId={person.id} initialInsights={initialInsights} />
      )}
      {activeTab === 'notes' && (
        <NotesTab
          personId={person.id}
          initialNotes={initialNotes}
          onNotesChange={setNotesCount}
        />
      )}
    </div>
  );
}

