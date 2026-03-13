"use client"

import { useAuth } from '@/lib/auth-context'

export default function LabsPage() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h1 className="text-3xl font-bold mb-4">Virtual Labs</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">Please sign in to access labs.</p>
        <a href="/sign-in" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
          Sign In
        </a>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Virtual Labs</h1>
      <p>Interactive coding labs with Monaco Editor + Xterm. (Coming soon)</p>
    </div>
  )
}
