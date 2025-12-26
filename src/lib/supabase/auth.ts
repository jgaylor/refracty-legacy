import { createClient } from "./server";
import type { User } from "@supabase/supabase-js";

/**
 * Get the current authenticated user from the server
 * @returns The user object if authenticated, null otherwise
 */
export async function getUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current session from the server
 * @returns The session object if authenticated, null otherwise
 */
export async function getSession() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Require authentication - throws an error if user is not authenticated
 * @returns The authenticated user
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

