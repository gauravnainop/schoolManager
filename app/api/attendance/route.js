import { NextResponse } from 'next/server';
import clientPromise from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';
import { getAuth } from '@clerk/nextjs/server';
export async function POST(request) {
  try {
    const { classroomId, records } = await request.json();
    if (!classroomId || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    // Insert each attendance record with the classroomId field
    const recordsWithClassroomId = records.map(record => ({
      ...record,
      classroomId, // ensure each record includes classroomId
    }));
    const result = await db.collection('attendance').insertMany(recordsWithClassroomId);
    return NextResponse.json(
      { success: true, insertedCount: result.insertedCount },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function GET(request) {
    // Get the authenticated teacher's ID from Clerk
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      const client = await clientPromise;
      const db = client.db();
  
      // Aggregate attendance records with student and classroom details
      const records = await db.collection('attendance').aggregate([
        // Lookup student details by converting the stored studentId (a string) to ObjectId form
        {
          $lookup: {
            from: 'students',
            let: { studentIdStr: "$studentId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toString: "$_id" }, "$$studentIdStr"] }
                }
              }
            ],
            as: "studentInfo"
          }
        },
        { $unwind: "$studentInfo" },
        // Lookup classroom details by converting the stored classroomId (a string) to ObjectId form
        {
          $lookup: {
            from: 'classrooms',
            let: { classroomIdStr: "$classroomId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toString: "$_id" }, "$$classroomIdStr"] }
                }
              }
            ],
            as: "classroomInfo"
          }
        },
        { $unwind: "$classroomInfo" },
        // Filter so that only attendance records for classrooms owned by this teacher are returned
        {
          $match: {
            "classroomInfo.createdBy": userId
          }
        },
        // Project the fields you need for the front end
        {
          $project: {
            _id: 1,
            date: 1,
            present: 1,
            studentId: 1,
            studentName: "$studentInfo.name",
            rollNo: "$studentInfo.rollNo",
            classroomId: 1
          }
        },
        // Sort records by date descending (newest first)
        { $sort: { rollNo: 1 } }
      ]).toArray();
  
      return NextResponse.json({ records }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }