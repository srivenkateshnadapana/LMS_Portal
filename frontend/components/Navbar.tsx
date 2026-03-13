"use client"

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LMS Portal
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/courses" className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">Courses</Link>
            <Link href="/labs" className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">Labs</Link>
            <Link href="/leaderboard" className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">Leaderboard</Link>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{user.phone.slice(0,12)}...</span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/sign-up" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200">
                  Sign Up
                </Link>
                <Link href="/sign-in" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

