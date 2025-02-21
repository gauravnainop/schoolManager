'use client';
import React from 'react';
import { useUser, SignOutButton, SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Loader from '@/components/Loader';

const TeacherDashboard = () => {
  const { user } = useUser();

  if (!user) {
    return <Loader/>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-black">
      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton appearance={{ variables: { colorPrimary: '#4f46e5' }}} />
            </SignedIn>
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Attendance Manager
              </h1>
            </Link>
          </div>
          <SignOutButton>
            <button className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow hover:shadow-md transition-all">
              Logout
            </button>
          </SignOutButton>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <h2 className="text-4xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome, {user.username}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Create Classroom', link: '/create-classroom', description: 'Create a new classroom' },
            { title: 'Mark Attendance', link: '/mark-attendance', description: 'Take attendance for classroom sessions' },
            { title: 'View Attendence Records', link: '/attendance-records', description: 'Check student attendance records' },
            { title: 'Your Classes', link: '/classrooms', description: 'Manage all your classrooms' }
          ].map(({ title, link, description }, index) => (
            <div
              key={index}
              className="bg-white/90 p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
              <p className="text-gray-600 mb-6">{description}</p>
              <Link href={link}>
                <button className="w-full px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow hover:shadow-md transition-all">
                  {title}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;