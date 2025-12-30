import { createClient } from './server';
import { getUser } from './auth';

export interface Person {
  id: string;
  user_id: string;
  name: string;
  vibe_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  person_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PersonWithNote extends Person {
  first_note?: Note | null;
}

export interface CreatePersonInput {
  name: string;
  vibe_summary?: string | null;
  first_note?: string | null;
}

/**
 * Get all people for the current user
 */
export async function getPeople(): Promise<PersonWithNote[]> {
  const user = await getUser();
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  
  // Fetch people for the current user
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (peopleError) {
    console.error('Error fetching people:', peopleError);
    return [];
  }

  if (!people || people.length === 0) {
    return [];
  }

  // Fetch the first note for each person
  const personIds = people.map(p => p.id);
  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .in('person_id', personIds)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (notesError) {
    console.error('Error fetching notes:', notesError);
    // Return people without notes if notes fetch fails
    return people.map(p => ({ ...p, first_note: null }));
  }

  // Group notes by person_id and get the first one
  const notesByPersonId = new Map<string, Note>();
  notes?.forEach(note => {
    if (!notesByPersonId.has(note.person_id)) {
      notesByPersonId.set(note.person_id, note);
    }
  });

  // Combine people with their first note
  return people.map(person => ({
    ...person,
    first_note: notesByPersonId.get(person.id) || null,
  }));
}

/**
 * Get a single person by ID
 */
export async function getPersonById(id: string): Promise<Person | null> {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching person:', error);
    return null;
  }

  return data;
}

/**
 * Get all notes for a specific person
 */
export async function getNotesByPerson(personId: string): Promise<Note[]> {
  const user = await getUser();
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('person_id', personId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }

  return data || [];
}

/**
 * Update a person
 */
export async function updatePerson(
  id: string,
  updates: { name?: string; vibe_summary?: string | null }
): Promise<{ success: boolean; person?: Person; error?: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const supabase = await createClient();
  
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };
  
  if (updates.name !== undefined) {
    updateData.name = updates.name.trim();
  }
  
  if (updates.vibe_summary !== undefined) {
    updateData.vibe_summary = updates.vibe_summary?.trim() || null;
  }

  const { data, error } = await supabase
    .from('people')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating person:', error);
    return { success: false, error: error.message };
  }

  return { success: true, person: data };
}

/**
 * Create a new person and optionally a first note
 */
export async function createPerson(
  input: CreatePersonInput
): Promise<{ success: boolean; person?: Person; error?: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  if (!input.name || input.name.trim().length === 0) {
    return { success: false, error: 'Name is required' };
  }

  const supabase = await createClient();

  // Create the person
  const { data: person, error: personError } = await supabase
    .from('people')
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      vibe_summary: input.vibe_summary?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (personError) {
    console.error('Error creating person:', personError);
    return { success: false, error: personError.message };
  }

  // Create the first note if provided
  if (input.first_note && input.first_note.trim().length > 0) {
    const { error: noteError } = await supabase
      .from('notes')
      .insert({
        person_id: person.id,
        user_id: user.id,
        content: input.first_note.trim(),
        updated_at: new Date().toISOString(),
      });

    if (noteError) {
      console.error('Error creating note:', noteError);
      // Person was created but note failed - still return success with person
      return { success: true, person, error: 'Person created but note failed to save' };
    }
  }

  return { success: true, person };
}

/**
 * Delete a person
 */
export async function deletePerson(
  personId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const supabase = await createClient();
  
  // Verify person belongs to user before deleting
  const { data: person, error: verifyError } = await supabase
    .from('people')
    .select('id')
    .eq('id', personId)
    .eq('user_id', user.id)
    .single();

  if (verifyError || !person) {
    return { success: false, error: 'Person not found' };
  }

  // Delete the person (cascade will handle related notes/insights)
  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', personId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting person:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Create a sample person with 3 sample insights for new users
 */
export async function createSamplePerson(): Promise<{ success: boolean; person?: Person; error?: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const supabase = await createClient();

  // Check if sample person already exists
  const { data: existingSample, error: existingError } = await supabase
    .from('people')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', 'Alex (Sample)')
    .maybeSingle();

  if (existingSample) {
    // Sample person already exists, return success
    return { success: true, person: existingSample as Person };
  }
  
  // If error occurred and it's not "no rows found", return error
  if (existingError && existingError.code !== 'PGRST116') {
    console.error('Error checking for existing sample person:', existingError);
    return { success: false, error: existingError.message };
  }

  // Create the sample person
  const { data: person, error: personError } = await supabase
    .from('people')
    .insert({
      user_id: user.id,
      name: 'Alex (Sample)',
      vibe_summary: 'Example person to show how insights work',
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (personError) {
    console.error('Error creating sample person:', personError);
    return { success: false, error: personError.message };
  }

  // Create 3 sample insights
  const sampleInsights = [
    {
      category: 'motivated_by' as const,
      content: 'Likes to see progress and impact of their work',
    },
    {
      category: 'preferred_communication' as const,
      content: 'Prefers async updates via Slack, but appreciates quick syncs for blockers',
    },
    {
      category: 'works_best_when' as const,
      content: 'Has clear context and can focus without interruptions',
    },
  ];

  for (const insight of sampleInsights) {
    const { error: insightError } = await supabase
      .from('insights')
      .insert({
        person_id: person.id,
        user_id: user.id,
        category: insight.category,
        content: insight.content,
        updated_at: new Date().toISOString(),
      });

    if (insightError) {
      console.error('Error creating sample insight:', insightError);
      // Continue creating other insights even if one fails
    }
  }

  return { success: true, person };
}

