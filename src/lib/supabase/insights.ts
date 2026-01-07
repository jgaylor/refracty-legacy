import { createClient } from './server';
import { getUser } from './auth';

export type InsightCategory =
  | 'motivated_by'
  | 'preferred_communication'
  | 'works_best_when'
  | 'collaboration_style'
  | 'feedback_approach';

export interface Insight {
  id: string;
  person_id: string;
  user_id: string;
  category: InsightCategory;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInsightInput {
  person_id: string;
  category: InsightCategory;
  content: string;
}

export interface UpdateInsightInput {
  content?: string;
  category?: InsightCategory;
}

export interface InsightWithPerson extends Insight {
  person: {
    id: string;
    name: string;
  };
}

/**
 * Get all insights for the current user with pagination
 */
export async function getAllInsights(
  limit: number = 20,
  offset: number = 0
): Promise<{ insights: InsightWithPerson[]; hasMore: boolean }> {
  const user = await getUser();
  if (!user) {
    return { insights: [], hasMore: false };
  }

  const supabase = await createClient();
  
  // Fetch insights with person data, ordered by most recent first
  const { data, error } = await supabase
    .from('insights')
    .select(`
      *,
      people (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching insights:', error);
    return { insights: [], hasMore: false };
  }

  // Check if there are more insights
  const { count } = await supabase
    .from('insights')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const totalCount = count || 0;
  const hasMore = offset + limit < totalCount;

  // Transform the data to match InsightWithPerson interface
  const insights: InsightWithPerson[] = (data || []).map((item: any) => {
    const personData = Array.isArray(item.people) ? item.people[0] : item.people;
    return {
      ...item,
      person: personData 
        ? { id: personData.id, name: personData.name }
        : { id: item.person_id, name: 'Unknown' },
    };
  });

  return { insights, hasMore };
}

export interface NoteWithPerson {
  id: string;
  person_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  person: {
    id: string;
    name: string;
  };
}

export type FeedItem = 
  | ({ type: 'insight' } & InsightWithPerson)
  | ({ type: 'note' } & NoteWithPerson);

/**
 * Get all notes for the current user with pagination, sorted by most recent first
 */
export async function getAllNotesAndInsights(
  limit: number = 20,
  offset: number = 0
): Promise<{ items: FeedItem[]; hasMore: boolean }> {
  const user = await getUser();
  if (!user) {
    return { items: [], hasMore: false };
  }

  const supabase = await createClient();
  
  // Fetch notes with person data
  const { data: notesData, error: notesError } = await supabase
    .from('notes')
    .select(`
      *,
      people (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (notesError) {
    console.error('Error fetching feed items:', notesError);
    return { items: [], hasMore: false };
  }

  // Check if there are more notes
  const { count } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const totalCount = count || 0;
  const hasMore = offset + limit < totalCount;

  // Transform notes
  const notes: FeedItem[] = (notesData || []).map((item: any) => {
    const personData = Array.isArray(item.people) ? item.people[0] : item.people;
    return {
      type: 'note' as const,
      ...item,
      person: personData 
        ? { id: personData.id, name: personData.name }
        : { id: item.person_id, name: 'Unknown' },
    };
  });

  return { items: notes, hasMore };
}

/**
 * Get all insights for a specific person
 */
export async function getInsightsByPerson(personId: string): Promise<Insight[]> {
  const user = await getUser();
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('person_id', personId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching insights:', error);
    return [];
  }

  return data || [];
}

/**
 * Get insights for a specific category
 */
export async function getInsightsByCategory(
  personId: string,
  category: InsightCategory
): Promise<Insight[]> {
  const user = await getUser();
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('person_id', personId)
    .eq('user_id', user.id)
    .eq('category', category)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching insights by category:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new insight
 */
export async function createInsight(
  input: CreateInsightInput
): Promise<{ success: boolean; insight?: Insight; error?: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  if (!input.content || input.content.trim().length === 0) {
    return { success: false, error: 'Content is required' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('insights')
    .insert({
      person_id: input.person_id,
      user_id: user.id,
      category: input.category,
      content: input.content.trim(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating insight:', error);
    return { success: false, error: error.message };
  }

  return { success: true, insight: data };
}

/**
 * Update an existing insight
 */
export async function updateInsight(
  id: string,
  input: UpdateInsightInput
): Promise<{ success: boolean; insight?: Insight; error?: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  // At least one field must be provided
  if (!input.content && !input.category) {
    return { success: false, error: 'Either content or category must be provided' };
  }

  // Content validation (only if provided)
  if (input.content !== undefined && (!input.content || input.content.trim().length === 0)) {
    return { success: false, error: 'Content cannot be empty' };
  }

  const supabase = await createClient();
  const updateData: { content?: string; category?: InsightCategory; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };

  if (input.content !== undefined) {
    updateData.content = input.content.trim();
  }

  if (input.category !== undefined) {
    updateData.category = input.category;
  }

  const { data, error } = await supabase
    .from('insights')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating insight:', error);
    return { success: false, error: error.message };
  }

  return { success: true, insight: data };
}

/**
 * Delete an insight
 */
export async function deleteInsight(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('insights')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting insight:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

