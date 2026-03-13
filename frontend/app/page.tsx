"use client"

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-xl">Loading...</div></div>
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Welcome to Next-Gen LMS</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/courses" className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl">
          <h2 className="text-xl font-bold">Courses</h2>
          <p>Google Drive video proxy streaming</p>
        </Link>
        <Link href="/labs" className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-xl">
          <h2 className="text-xl font-bold">Virtual Labs</h2>
          <p>Monaco + Xterm + Docker containers</p>
        </Link>
        <Link href="/leaderboard" className="p-6 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-xl">
          <h2 className="text-xl font-bold">Leaderboards</h2>
          <p>Real-time Redis rankings</p>
        </Link>
      </div>

      <div className="mt-12 flex gap-4 justify-center">
        {user ? (
          <Link 
            href="/profile" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Profile ({user.phone.slice(0,12)}...)
          </Link>
        ) : (
          <>
            <Link 
              href="/sign-in" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

