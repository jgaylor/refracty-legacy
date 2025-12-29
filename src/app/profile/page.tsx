import { getUser } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import { ProfileContent } from '@/components/ProfileContent';

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        <ProfileContent user={user} />
      </div>
    </div>
  );
}

