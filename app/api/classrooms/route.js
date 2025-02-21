import { NextResponse } from 'next/server';
import clientPromise from '@/lib/dbConnect';

import { getAuth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, createdBy } = body;

    if (!name || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields: name and createdBy are required.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(); // or client.db('your-database-name') if needed

    const newClassroom = {
      name,
      description: description || '',
      createdBy,
      createdAt: new Date(),
    };

    const result = await db.collection('classrooms').insertOne(newClassroom);
    newClassroom._id = result.insertedId;

    return NextResponse.json(
      { success: true, classroom: newClassroom },
      { status: 201 }
    );
  } catch (error) {
    console.error('Classroom creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function GET(request) {
  // Get authenticated teacher's ID from Clerk
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    // Only return classrooms created by the current teacher
    const classrooms = await db
      .collection('classrooms')
      .find({ createdBy: userId })
      .toArray();

    return NextResponse.json({ classrooms }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
