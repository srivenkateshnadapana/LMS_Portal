"use client"

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function CoursesPage() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h1 className="text-3xl font-bold mb-4">Courses</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">Please sign in to access courses.</p>
        <Link href="/sign-in" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Courses</h1>
      <p>Your enrolled courses will appear here. (Coming soon: backend integration)</p>
      <Link href="/labs" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Go to Labs</Link>
    </div>
  )
}
