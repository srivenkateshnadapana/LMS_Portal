"use client"

import { UserButton, SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Welcome to Next-Gen LMS</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/courses" className="card p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl">
          <h2>Courses</h2>
          <p>Google Drive video proxy streaming</p>
        </Link>
        <Link href="/labs" className="card p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-xl">
          <h2>Virtual Labs</h2>
          <p>Monaco + Xterm + Docker containers</p>
        </Link>
        <Link href="/leaderboard" className="card p-6 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-xl">
          <h2>Leaderboards</h2>
          <p>Real-time Redis rankings</p>
        </Link>
      </div>

      <div className="mt-12 flex gap-4">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </div>
  )
}

