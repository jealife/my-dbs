'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useAuth } from './use-auth-hook'

/**
 * Résout le studentId (clé primaire de la table students) pour l'utilisateur connecté.
 *
 * userId (users.id) ≠ studentId (students.id) — ils ne sont pas identiques.
 * Ce hook utilise d'abord user.studentId (stocké au login), puis interroge
 * GET /api/students/me si absent (sessions existantes sans studentId).
 *
 * Retourne undefined tant que la résolution n'est pas terminée.
 */
export function useStudentId() {
  const { user } = useAuth()
  const userId = user?.id || user?.userId

  const { data: studentProfile } = useQuery({
    queryKey: ['student-me', userId],
    queryFn: async () => {
      const res = await apiClient.get('/students/me')
      return res.data?.data || null
    },
    enabled: !!userId && !user?.studentId,
    retry: false,
    staleTime: Infinity,
  })

  const rawId = user?.studentId || studentProfile?.id
  // Guard: converts to number and rejects string "undefined", NaN, 0, etc.
  const id = rawId != null ? Number(rawId) : NaN
  return !isNaN(id) && id > 0 ? id : undefined
}
