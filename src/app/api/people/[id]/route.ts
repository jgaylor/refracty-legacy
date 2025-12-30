import { getPersonById, deletePerson, updatePerson } from '@/lib/supabase/people';
import { getUser } from '@/lib/supabase/auth';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const person = await getPersonById(id);

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json({ person });
  } catch (error) {
    console.error('Error in GET /api/people/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await updatePerson(id, {
      name: body.name,
      vibe_summary: body.vibe_summary,
    });

    if (result.success) {
      return NextResponse.json({ success: true, person: result.person });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to update person' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in PATCH /api/people/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await deletePerson(id);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to delete person' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in DELETE /api/people/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

