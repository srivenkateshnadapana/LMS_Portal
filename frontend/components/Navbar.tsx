"use client"

import Link from 'next/link'
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

export function Navbar() {
  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LMS Pro
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/courses" className="px-4 py-2 rounded-lg hover:bg-gray-100 transition">Courses</Link>
            <Link href="/labs" className="px-4 py-2 rounded-lg hover:bg-gray-100 transition">Labs</Link>
            <Link href="/leaderboard" className="px-4 py-2 rounded-lg hover:bg-gray-100 transition">Leaderboard</Link>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  )
}

