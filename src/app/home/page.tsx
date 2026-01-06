import { getAllNotesAndInsights } from '@/lib/supabase/insights';
import { InsightsList } from '@/components/insights/InsightsList';
import { InsightsListSkeleton } from '@/components/insights/InsightsListSkeleton';
import { getUser } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function InsightsListContent() {
  const { items, hasMore } = await getAllNotesAndInsights(20, 0);
  return <InsightsList initialItems={items} initialHasMore={hasMore} />;
}

export default async function HomePage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Home</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          All your notes and observations in one place
        </p>
        <Suspense fallback={<InsightsListSkeleton count={5} />}>
          <InsightsListContent />
        </Suspense>
      </div>
    </div>
  );
}

