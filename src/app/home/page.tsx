import { getAllNotesAndInsights } from '@/lib/supabase/insights';
import { InsightsList } from '@/components/insights/InsightsList';
import { HomePageSkeleton } from '@/components/insights/HomePageSkeleton';
import { getUser } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function HomePageContent() {
  const { items, hasMore } = await getAllNotesAndInsights(20, 0);
  
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Home</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        All your notes in one place
      </p>
      <InsightsList initialItems={items} initialHasMore={hasMore} />
    </>
  );
}

export default async function HomePage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<HomePageSkeleton />}>
          <HomePageContent />
        </Suspense>
      </div>
    </div>
  );
}

