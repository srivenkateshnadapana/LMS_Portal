"use client"

export default function Leaderboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Global Leaderboard</h1>
      <div className="bg-white shadow-lg rounded-xl p-6">
        <p>Redis real-time rankings (API: localhost:8080/api/leaderboard/{courseId})</p>
        <p>Coming soon: Kafka events → auto-updates</p>
      </div>
    </div>
  )
}

