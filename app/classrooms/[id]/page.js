'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const ClassroomDetail = () => {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [rollNo, setRollNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [teacherClassrooms, setTeacherClassrooms] = useState([]);
  const [destinationClassroom, setDestinationClassroom] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [copyError, setCopyError] = useState('');

  // Fetch classroom details and its students
  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const res = await fetch(`/api/classrooms/${id}`);
        const data = await res.json();
        if (res.ok) {
          setClassroom(data.classroom);
          // Sort students by roll number
          const sortedStudents = (data.students || []).sort((a, b) => 
            Number(a.rollNo) - Number(b.rollNo)
          );
          setStudents(sortedStudents);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Error fetching classroom details.');
      }
    };
    fetchClassroom();
}, [id]);
  useEffect(() => {
    const fetchTeacherClassrooms = async () => {
      try {
        const res = await fetch('/api/classrooms');
        const data = await res.json();
        if (res.ok) {
          setTeacherClassrooms(data.classrooms || []);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error('Error fetching teacher classrooms.');
      }
    };
    fetchTeacherClassrooms();
  }, []);

  const handleCopyStudents = async () => {
    if (!destinationClassroom) {
      setCopyError('Please select a destination classroom.');
      return;
    }
    setCopyError('');
    setCopyMessage('');
    
    // Log the payload for debugging
    console.log('Payload:', {
      sourceClassroomId: id,
      targetClassroomId: destinationClassroom,
    });
    
    try {
      const res = await fetch('/api/students/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceClassroomId: id,
          targetClassroomId: destinationClassroom,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCopyMessage(`Successfully copied ${data.copiedCount} students. Reload The Page To See The Results`);
      } else {
        setCopyError(data.error || 'Failed to copy students.');
      }
    } catch (err) {
      setCopyError('Error copying students.');
    }
  };
  
  // Function to add a new student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classroomId: id,
          rollNo,
          name: studentName
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStudents((prev) => [...prev, data.student]);
        setRollNo('');
        setStudentName('');
      } else {
        setError(data.error || 'Failed to add student.');
      }
    } catch (err) {
      setError('Error adding student.');
    } finally {
      setLoading(false);
    }
    
  };

  // Function to delete a student with enhanced error handling
  const deleteStudent = async (studentId) => {
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE'
      });
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        // If the response is not valid JSON, log the text response to diagnose the issue.
        const text = await res.text();
        console.error('Failed to parse JSON:', text);
        throw new Error('Failed to parse JSON');
      }
      if (!res.ok) {
        setError(data.error || 'Failed to delete student.');
        return;
      }
      // Remove the deleted student from the list
      setStudents((prev) => prev.filter((student) => student._id !== studentId));
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('An error occurred while deleting the student.');
    }
  };

  if (!classroom) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="h-12 bg-gray-200 rounded-full w-1/3 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-gray-800">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {classroom.name}
            </span>
          </h2>
          <p className="text-lg text-gray-600">{classroom.description}</p>
        </div>

        {/* Add Student Form */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-2xl font-semibold mb-6 text-gray-700">Add Student</h3>
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Roll Number</label>
              <input
                type="number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Student Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">↻</span>
                    Adding...
                  </span>
                ) : 'Add Student'}
              </button>
            </div>
          </form>
        </div>

        {/* Copy Students Section */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-2xl font-semibold mb-6 text-gray-700">Copy Students</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Destination Classroom</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                value={destinationClassroom}
                onChange={(e) => setDestinationClassroom(e.target.value)}
              >
                <option value="">-- Select Classroom --</option>
                {teacherClassrooms
                  .filter((cls) => cls._id !== id)
                  .map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
              </select>
            </div>
            <button
              onClick={handleCopyStudents}
              className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
            >
              Copy Students
            </button>
            {copyMessage && <p className="p-3 bg-green-100 text-green-700 rounded-lg">{copyMessage}</p>}
            {copyError && <p className="p-3 bg-red-100 text-red-700 rounded-lg">{copyError}</p>}
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-2xl font-semibold mb-6 text-gray-700">Students</h3>
          {students.length === 0 ? (
            <p className="text-center text-gray-500 p-8">No students in this class yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600 font-medium">Roll No</th>
                    <th className="px-4 py-3 text-left text-gray-600 font-medium">Student Name</th>
                    <th className="px-4 py-3 text-left text-gray-600 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="transition-all duration-200 hover:bg-blue-50/50 group transform hover:translate-x-2">
                      <td className="px-4 py-3 text-gray-800">{student.rollNo}</td>
                      <td className="px-4 py-3 text-gray-600">{student.name}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteStudent(student._id)}
                          className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomDetail;