import type { Database } from "@supabase/supabase-js";

// Re-export common Supabase types
export type { User, Session } from "@supabase/supabase-js";

// If you have generated database types, export them here:
// export type { Database } from "./database.types";

// For now, using a generic Database type
// You can replace this with your generated types later
export type { Database };

