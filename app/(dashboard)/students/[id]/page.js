'use client'

import { use } from 'react'
import { StudentProfileView } from '@/modules/students/components/student-profile'

export default function StudentProfilePage({ params }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id

  return (
    <div className="container mx-auto max-w-7xl pt-4">
      <StudentProfileView studentId={id} />
    </div>
  )
}
