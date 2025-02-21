// File: /app/api/students/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { classroomId, rollNo, name } = body;
    if (!classroomId || !rollNo || !name) {
      return NextResponse.json(
        { error: 'classroomId, rollNo, and name are required.' },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db();

    // Verify that the teacher is the owner of the classroom
    const classroom = await db
      .collection('classrooms')
      .findOne({ _id: new ObjectId(classroomId) });
    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }
    if (classroom.createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if a student with this roll number is already added in this classroom
    const existingStudent = await db.collection('students').findOne({
      classroomId,
      rollNo: rollNo,
    });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this roll number already exists in this classroom.' },
        { status: 400 }
      );
    }

    const newStudent = {
      classroomId, // stored as a string
      rollNo,
      name,
      createdAt: new Date(),
    };

    const result = await db.collection('students').insertOne(newStudent);
    newStudent._id = result.insertedId;
    return NextResponse.json({ success: true, student: newStudent }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
