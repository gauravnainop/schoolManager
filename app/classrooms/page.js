'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Loader from '@/components/Loader';

const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [error, setError] = useState('');
  const { user } = useUser();

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

  const handleDelete = async (classroomId) => {
    const confirmed = confirm(
      'Are you sure you want to delete this classroom? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/classrooms/${classroomId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        // Remove the deleted classroom from state
        setClassrooms((prev) => prev.filter((cls) => cls._id !== classroomId));
      } else {
        alert(data.error || 'Failed to delete classroom.');
      }
    } catch (err) {
      alert('Error deleting classroom.');
    }
  };

  if (!user) {
    return <Loader />;
  }
  if (!classrooms) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        <h2 className="text-4xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Classrooms
          </span>
        </h2>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {classrooms.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
            <p className="text-gray-600">
              No classrooms found. Create your first classroom.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <div
                key={classroom._id}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition relative"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {classroom.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {classroom.description}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Created by: {user.username}
                </p>
                <div className="flex justify-between">
                  <Link
                    href={`/classrooms/${classroom._id}`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                  >
                    Manage Students
                  </Link>
                  <button
                    onClick={() => handleDelete(classroom._id)}
                    className="inline-block px-4 py-2 bg-red-600 text-white text-center rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomsPage;
