'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

const MarkAttendancePage = () => {
    const { user } = useUser();
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState('');
    const [students, setStudents] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState({});
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch classrooms for the teacher
    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const res = await fetch('/api/classrooms');
                const data = await res.json();
                if (res.ok) {
                    setClassrooms(data.classrooms);
                } else {
                    setError(data.error || 'Failed to load classrooms.');
                }
            } catch (err) {
                setError('Error fetching classrooms.');
            }
        };
        fetchClassrooms();
    }, []);

    // Fetch students for the selected classroom
    useEffect(() => {
        if (!selectedClassroom) return;
        const fetchStudents = async () => {
            try {
                const res = await fetch(`/api/classrooms/${selectedClassroom}`);
                const data = await res.json();
                if (res.ok) {
                    // Sort students by roll number
                    const sortedStudents = data.students.sort((a, b) =>
                        Number(a.rollNo) - Number(b.rollNo)
                    );

                    setStudents(sortedStudents);

                    // Initialize attendance records
                    const initialRecords = {};
                    sortedStudents.forEach((student) => {
                        initialRecords[student._id.toString()] = false;
                    });
                    setAttendanceRecords(initialRecords);
                } else {
                    setError(data.error || 'Failed to load students.');
                }
            } catch (err) {
                setError('Error fetching students.');
            }
        };
        fetchStudents();
    }, [selectedClassroom]);

    const handleCheckboxChange = (studentId) => {
        setAttendanceRecords((prev) => ({
            ...prev,
            [studentId]: !prev[studentId],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClassroom || !attendanceDate) {
            setError('Please select a classroom and a date.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            // Build an array of attendance records from our state,
            // and include the classroomId in each record
            const records = Object.entries(attendanceRecords).map(
                ([studentId, present]) => ({
                    studentId, // already a string
                    present,
                    date: attendanceDate,
                    classroomId: selectedClassroom,
                })
            );

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classroomId: selectedClassroom,
                    records,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg('Attendance recorded successfully.');
            } else {
                setError(data.error || 'Failed to record attendance.');
            }
        } catch (err) {
            setError('Error recording attendance.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-black">
            <div className="max-w-7xl mx-auto space-y-8">
                <h2 className="text-4xl font-bold text-gray-800">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Mark Attendance
                    </span>
                </h2>

                {error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white/90 p-6 rounded-xl shadow-md border border-gray-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Select Classroom
                            </label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                value={selectedClassroom}
                                onChange={(e) => setSelectedClassroom(e.target.value)}
                                required
                            >
                                <option value="">-- Select Classroom --</option>
                                {classrooms.map((classroom) => (
                                    <option key={classroom._id} value={classroom._id}>
                                        {classroom.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Select Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {students.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Student Attendance (Sorted by Roll Number)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {students.map((student) => (
                                    <div
                                        key={student._id}
                                        className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                                    >
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-blue-600 mr-4"
                                            checked={attendanceRecords[student._id.toString()] || false}
                                            onChange={() => handleCheckboxChange(student._id.toString())}
                                        />
                                        <div>
                                            <span className="block font-medium text-gray-800">
                                                Roll No: {student.rollNo}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                Name: {student.name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg shadow hover:shadow-lg transition-all"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">↻</span>
                                Submitting...
                            </span>
                        ) : (
                            'Submit Attendance'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MarkAttendancePage;