'use client'

import { useQuery } from '@tanstack/react-query'
import { academicService } from '@/lib/academic-service'
import { userService } from '@/lib/user-service'
import { useMemo } from 'react'

export function useAcademic() {

  // Students list for counting
  const studentsQuery = useQuery({
    queryKey: ['students-all'],
    queryFn: () => userService.getStudents(),
    staleTime: 60_000,
  })

  // Academic years  (/api/academic-years)
  const yearsQuery = useQuery({
    queryKey: ['academic', 'years'],
    queryFn: async () => {
      const { data } = await academicService.getLevels()
      const d = data?.data ?? data
      return Array.isArray(d) ? d : (d?.content ?? [])
    },
    staleTime: 5 * 60_000,
  })

  // Programs / filières  (/api/programs)
  const programsQuery = useQuery({
    queryKey: ['academic', 'programs'],
    queryFn: async () => {
      const { data } = await academicService.getSectors()
      const d = data?.data ?? data
      return Array.isArray(d) ? d : (d?.content ?? [])
    },
    staleTime: 5 * 60_000,
  })

  // Compute counts
  const counts = useMemo(() => {
    const students = studentsQuery.data || []
    const sectorCounts = {}
    const levelCounts = {}
    
    students.forEach(s => {
      if (s.programId) {
        sectorCounts[s.programId] = (sectorCounts[s.programId] || 0) + 1
      }
      if (s.academicYearId) {
        levelCounts[s.academicYearId] = (levelCounts[s.academicYearId] || 0) + 1
      }
    })
    
    return { sectorCounts, levelCounts }
  }, [studentsQuery.data])

  return {
    // Backward-compatible aliases
    levels:             yearsQuery.data  ?? [],
    sectors:            programsQuery.data ?? [],
    
    // With dynamic counts
    levelsWithCounts: useMemo(() => {
      return (yearsQuery.data ?? []).map(l => ({
        ...l,
        studentCount: counts.levelCounts[l.id] || 0
      }))
    }, [yearsQuery.data, counts.levelCounts]),

    sectorsWithCounts: useMemo(() => {
      return (programsQuery.data ?? []).map(s => ({
        ...s,
        studentCount: counts.sectorCounts[s.id] || 0
      }))
    }, [programsQuery.data, counts.sectorCounts]),

    isLoadingLevels:    yearsQuery.isLoading,
    isLoadingSectors:   programsQuery.isLoading,
    isLoadingStudents:  studentsQuery.isLoading,

    levelsError:        yearsQuery.error,
    sectorsError:       programsQuery.error,
  }
}
