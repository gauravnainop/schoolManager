'use client';

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const AttendanceRecordsPage = () => {
    const [records, setRecords] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClassroomFilter, setSelectedClassroomFilter] = useState('all');
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterQuery, setFilterQuery] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const res = await fetch('/api/attendance');
                const data = await res.json();
                console.log('Fetched records:', data);
                if (res.ok) {
                    const sortedRecords = (data.records || []).sort(
                        (a, b) => new Date(b.date) - new Date(a.date)
                    );
                    setRecords(sortedRecords);
                } else {
                    setError(data.error || 'Failed to load attendance records.');
                }
            } catch (err) {
                console.error('Error fetching records:', err);
                setError('Error fetching attendance records.');
            }
        };
        fetchRecords();
    }, []);

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const res = await fetch('/api/classrooms');
                const data = await res.json();
                console.log('Fetched classrooms:', data);
                if (res.ok) {
                    setClassrooms(data.classrooms || []);
                } else {
                    console.error('Error fetching classrooms:', data.error);
                }
            } catch (err) {
                console.error('Error fetching classrooms:', err);
            }
        };
        fetchClassrooms();
    }, []);

    const filteredRecords = records.filter((record) => {
        const recordDate = new Date(record.date).toLocaleDateString();
        const matchesDate = filterDate
            ? recordDate === new Date(filterDate).toLocaleDateString()
            : true;
        const matchesQuery = filterQuery
            ? (record.studentName &&
                record.studentName.toLowerCase().includes(filterQuery.toLowerCase())) ||
            (record.rollNo && record.rollNo.toString().includes(filterQuery))
            : true;
        const matchesClassroom =
            selectedClassroomFilter === 'all'
                ? true
                : record.classroomId === selectedClassroomFilter;
        const matchesStatus = filterStatus
            ? (record.present ? 'Present' : 'Absent').toLowerCase() === filterStatus.toLowerCase()
            : true;

        return matchesDate && matchesQuery && matchesClassroom && matchesStatus;
    });

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Date", "Student Name", "Roll No", "Status"];
        const tableRows = [];

        filteredRecords.forEach((record) => {
            const recordData = [
                new Date(record.date).toLocaleDateString(),
                record.studentName || '-',
                record.rollNo || '-',
                record.present ? 'Present' : 'Absent',
                record.classroom || '-'
            ];
            tableRows.push(recordData);
        });

        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text("Attendance Records", 14, 15);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'striped',
            headStyles: { fillColor: [22, 160, 133] },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            margin: { top: 30 },
            styles: { fontSize: 12, cellPadding: 4 },
        });

        doc.save("attendance_records.pdf");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-black">
          <div className="max-w-7xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold text-gray-800">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Attendance Records
              </span>
            </h2>
    
            {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
    
            {/* Filters Section */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Filter by Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>
    
                {/* Search Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Search Student</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                    placeholder="Name or Roll No"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                  />
                </div>
    
                {/* Classroom Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Classroom</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                    value={selectedClassroomFilter}
                    onChange={(e) => setSelectedClassroomFilter(e.target.value)}
                  >
                    <option value="all">All Classrooms</option>
                    {classrooms.map((classroom) => (
                      <option key={classroom._id} value={classroom._id}>
                        {classroom.name}
                      </option>
                    ))}
                  </select>
                </div>
    
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
    
              <button
                onClick={exportToPDF}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Export as PDF
              </button>
            </div>
    
            {/* Records Table */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              {filteredRecords.length === 0 ? (
                <p className="text-center text-gray-500 p-8">No attendance records found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Student Name</th>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Roll No</th>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record) => (
                        <tr key={record._id} className="transition-all duration-200 hover:bg-blue-50/50 group transform hover:translate-x-2">
                          <td className="px-4 py-3 text-gray-800">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{record.studentName || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{record.rollNo || '-'}</td>
                          <td className={`px-4 py-3 font-medium ${
                            record.present ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {record.present ? 'Present' : 'Absent'}
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
    
    export default AttendanceRecordsPage;