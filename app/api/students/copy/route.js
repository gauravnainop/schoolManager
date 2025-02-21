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
    // Read the request body only once and store it in a variable
    const payload = await request.json();
    const { sourceClassroomId, targetClassroomId } = payload;
    if (!sourceClassroomId || !targetClassroomId) {
      return NextResponse.json(
        { error: 'Both source and target classroom IDs are required.' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();

    // Verify teacher owns both the source and target classrooms
    const sourceClassroom = await db.collection('classrooms').findOne({ _id: new ObjectId(sourceClassroomId) });
    const targetClassroom = await db.collection('classrooms').findOne({ _id: new ObjectId(targetClassroomId) });
    
    if (!sourceClassroom || !targetClassroom) {
      return NextResponse.json({ error: 'One or both classrooms not found.' }, { status: 404 });
    }
    
    if (sourceClassroom.createdBy !== userId || targetClassroom.createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own one or both classrooms.' }, { status: 403 });
    }
    
    // Fetch all students from the source classroom
    const sourceStudents = await db.collection('students').find({ classroomId: targetClassroomId }).toArray();
    console.log(sourceStudents);
    
    if (!sourceStudents.length) {
      return NextResponse.json({ error: 'No students found in the source classroom.' }, { status: 400 });
    }
    
    let copiedCount = 0;
    for (const student of sourceStudents) {
      // Check if a student with the same rollNo already exists in the target classroom
      const exists = await db.collection('students').findOne({ classroomId: sourceClassroomId, rollNo: student.rollNo });
      if (!exists) {
        const newStudent = {
          rollNo: student.rollNo,
          name: student.name,
          classroomId: sourceClassroomId,
          createdAt: new Date()
        };
        await db.collection('students').insertOne(newStudent);
        copiedCount++;
      }
    }
    
    return NextResponse.json({ success: true, copiedCount }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
