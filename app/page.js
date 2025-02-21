"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Loader from '@/components/Loader';

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const [rollNo, setRollNo] = useState('');

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (rollNo.trim() !== '') {
      router.push(`/attendance?rollno=${encodeURIComponent(rollNo)}`);
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/teacher-dashboard");
    }
  }, [user, router]);

  if (user) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-black">
      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Attendance Manager
          </h1>
          <SignInButton>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow hover:shadow-md transition-all">
              Teacher Login
            </button>
          </SignInButton>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-bold text-gray-800">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Classroom Attendance Management
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline attendance tracking for educators and provide instant access to records for students.
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Teacher Card */}
          <div className="bg-white/90 p-8 rounded-xl shadow-md border border-gray-100 space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-800">For Educators</h3>
              <p className="text-gray-600">
                Create classrooms, manage student rosters, and track attendance with precision.
              </p>
            </div>
            <SignInButton>
              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow hover:shadow-md transition-all">
                Teacher Portal
              </button>
            </SignInButton>
          </div>

          {/* Student Card */}
          <div className="bg-white/90 p-8 rounded-xl shadow-md border border-gray-100 space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-800">For Students</h3>
              <p className="text-gray-600">
                Check your attendance records instantly using your roll number.
              </p>
            </div>
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <input
                type="number"
                placeholder="Enter Roll Number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow hover:shadow-md transition-all"
              >
                Check Attendance
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}