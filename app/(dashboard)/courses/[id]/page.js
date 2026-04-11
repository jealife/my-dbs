'use client'

import { use } from 'react'
import { CourseDetailsView } from '@/modules/courses/components/course-details'

export default function CourseDetailsPage({ params }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id

  return (
    <div className="container mx-auto max-w-7xl pt-4">
      <CourseDetailsView courseId={id} />
    </div>
  )
}
