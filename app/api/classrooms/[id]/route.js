// File: /app/api/classrooms/[id]/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request, { params }) {
  const { id } = params;
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const classroom = await db
      .collection('classrooms')
      .findOne({ _id: new ObjectId(id) });

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }
    // Only allow the teacher who created the classroom to access it
    if (classroom.createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Retrieve the students for this classroom
    const students = await db
      .collection('students')
      .find({ classroomId: id })
      .toArray();

    return NextResponse.json({ classroom, students }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE(request, { params }) {
  const { id } = params;
  const { userId } = getAuth(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const client = await clientPromise;
    const db = client.db();

    // Find the classroom by ID
    const classroom = await db.collection('classrooms').findOne({ _id: new ObjectId(id) });
    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }
    
    // Ensure that the authenticated teacher is the owner of the classroom
    if (classroom.createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this classroom.' }, { status: 403 });
    }
    
    // Delete the classroom
    const result = await db.collection('classrooms').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete classroom' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Classroom deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}