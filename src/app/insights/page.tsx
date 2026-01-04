import { getAllNotesAndInsights } from '@/lib/supabase/insights';
import { InsightsList } from '@/components/insights/InsightsList';
import { getUser } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';

export default async function InsightsPage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  
  const { items, hasMore } = await getAllNotesAndInsights(20, 0);

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Home</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          All your notes and observations in one place
        </p>
        <InsightsList initialItems={items} initialHasMore={hasMore} />
      </div>
    </div>
  );
}

