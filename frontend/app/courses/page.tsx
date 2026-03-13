"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  description: string
  lessons?: Array<{
    id: string
    title: string
    google_drive_file_id: string
  }>
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    fetch('http://localhost:8080/api/courses')
      .then(res => res.json())
      .then(setCourses)
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Courses</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <Link key={course.id} href={`/courses/${course.id}`} className="card p-6 bg-white shadow-lg rounded-xl hover:shadow-2xl">
            <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {course.lessons?.length || 0} lessons
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

