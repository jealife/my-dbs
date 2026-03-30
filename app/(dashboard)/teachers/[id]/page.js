'use client'

import { use } from 'react'
import { TeacherProfileView } from '@/modules/teachers/components/teacher-profile'

export default function TeacherProfilePage({ params }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id

  return (
    <div className="container mx-auto max-w-7xl pt-4">
      <TeacherProfileView teacherId={id} />
    </div>
  )
}
