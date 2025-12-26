import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("greetings")
    .select("message")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const message = error ? "Error loading greeting" : data?.message ?? "No greeting found";

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">{message}</h1>
    </main>
  );
}