'use client';

interface PersonDetailsCardProps {
  personId: string;
  notesCount: number;
}

export function PersonDetailsCard({ personId, notesCount }: PersonDetailsCardProps) {
  return (
    <div
      className="rounded-lg border"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Summary Section */}
      <div>
        <div
          className="w-full px-4 py-4 flex items-center"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="text-base font-medium flex items-center gap-2">
            Summary
          </span>
        </div>
        <div className="px-4 pb-4">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Nothing here yet
          </p>
        </div>
      </div>

      {/* My current read Section */}
      <div 
        className="border-t"
        style={{ 
          borderColor: 'var(--border-color)',
        }}
      >
        <div
          className="w-full px-4 py-4 flex items-center"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="text-base font-medium flex items-center gap-2">
            My current read
          </span>
        </div>
        <div className="px-4 pb-4">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {notesCount > 0 
              ? 'Based on your notes so far, nothing clear has emerged yet.'
              : 'Nothing here yet'}
          </p>
        </div>
      </div>

      {/* What I'm noticing Section */}
      <div 
        className="border-t"
        style={{ 
          borderColor: 'var(--border-color)',
        }}
      >
        <div
          className="w-full px-4 py-4 flex items-center"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="text-base font-medium flex items-center gap-2">
            What I'm noticing
          </span>
        </div>
        <div className="px-4 pb-4">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {notesCount >= 3
              ? 'Some early patterns may be forming.'
              : notesCount > 0
              ? 'No strong patterns yet. This updates as you add more notes.'
              : 'Nothing here yet'}
          </p>
        </div>
      </div>
    </div>
  );
}

