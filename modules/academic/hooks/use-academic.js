'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { academicService } from '@/lib/academic-service'
import { toast } from 'react-hot-toast'

export function useAcademic() {
  const queryClient = useQueryClient()

  const levelsQuery = useQuery({
    queryKey: ['academic', 'levels'],
    queryFn: async () => {
      const { data } = await academicService.getLevels()
      return data
    }
  })

  const sectorsQuery = useQuery({
    queryKey: ['academic', 'sectors'],
    queryFn: async () => {
      const { data } = await academicService.getSectors()
      return data
    }
  })

  // Combinaison pour la structure complète si besoin
  const structureQuery = useQuery({
    queryKey: ['academic', 'full-structure'],
    queryFn: async () => {
      const { data } = await academicService.getFullStructure()
      return data
    }
  })

  return {
    levels: levelsQuery.data || [],
    isLoadingLevels: levelsQuery.isLoading,
    levelsError: levelsQuery.error,
    
    sectors: sectorsQuery.data || [],
    isLoadingSectors: sectorsQuery.isLoading,
    sectorsError: sectorsQuery.error,

    structure: structureQuery.data || null,
    isLoadingStructure: structureQuery.isLoading
  }
}
