'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/lib/auth-service'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

/**
 * Normalise le rôle utilisateur depuis différents formats possibles du backend :
 * - "ADMIN", "ROLE_ADMIN", ["ADMIN"], [{ authority: "ADMIN" }]
 */
function normalizeRole(user) {
  if (!user) return ''

  // 1. Champ direct `role` (ex: "ADMIN")
  if (user.role && typeof user.role === 'string') {
    return user.role.replace('ROLE_', '').toUpperCase()
  }

  // 2. Champ `role` qui est un objet avec `.name`
  if (user.role && typeof user.role === 'object' && user.role.name) {
    return user.role.name.replace('ROLE_', '').toUpperCase()
  }

  // 3. Champ `roles` (array)
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    const r = user.roles[0]
    if (typeof r === 'string') return r.replace('ROLE_', '').toUpperCase()
    if (r?.name) return r.name.replace('ROLE_', '').toUpperCase()
    if (r?.authority) return r.authority.replace('ROLE_', '').toUpperCase()
  }

  // 4. Champ `authorities` (Spring Security default)
  if (Array.isArray(user.authorities) && user.authorities.length > 0) {
    const a = user.authorities[0]
    if (typeof a === 'string') return a.replace('ROLE_', '').toUpperCase()
    if (a?.authority) return a.authority.replace('ROLE_', '').toUpperCase()
  }

  // 5. Champ `userType` ou `type` 
  if (user.userType) return user.userType.replace('ROLE_', '').toUpperCase()
  if (user.type) return user.type.replace('ROLE_', '').toUpperCase()

  console.warn('[MyDBS] Impossible de détecter le rôle dans:', user)
  return ''
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('dbs_user') : null
        const token = Cookies.get('dbs_token')

        if (raw) {
          const parsed = JSON.parse(raw)
          // Normalise le rôle et attache-le directement sur l'objet
          const normalizedRole = normalizeRole(parsed)
          const enrichedUser = { ...parsed, role: normalizedRole }
          
          console.log('[MyDBS DEBUG] User brut:', parsed)
          console.log('[MyDBS DEBUG] Rôle normalisé:', normalizedRole)
          console.log('[MyDBS DEBUG] Token présent:', !!token)
          
          setUser(enrichedUser)
        } else if (token) {
          // Token présent mais pas de user — on crée un user minimal avec role ADMIN par défaut
          // Cela peut arriver si le backend ne renvoie pas l'objet user
          console.warn('[MyDBS DEBUG] Token présent mais aucun user dans localStorage')
          setUser({ role: 'ADMIN', first_name: 'Admin', last_name: '', user_code: '' })
        }
      } catch (e) {
        console.error('[MyDBS] Erreur lecture user:', e)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const logout = () => {
    authService.logout()
    setUser(null)
    router.push('/login')
  }

  // Définition des permissions par défaut par rôle si non fournies par le backend
  const getPermissionsForRole = (role) => {
    switch (role) {
      case 'ADMIN':
      case 'DIRECTION':
        return [{ resource: 'all', actions: ['*'], scope: 'GLOBAL' }]
      case 'STUDENT':
        return [
          { resource: 'courses', actions: ['read'], scope: 'OWN' },
          { resource: 'exams', actions: ['read'], scope: 'OWN' },
          { resource: 'records', actions: ['read'], scope: 'OWN' },
          { resource: 'finance', actions: ['read'], scope: 'OWN' },
          { resource: 'career', actions: ['read', 'write'], scope: 'OWN' }
        ]
      case 'TEACHER':
        return [
          { resource: 'courses', actions: ['read', 'write'], scope: 'OWN' },
          { resource: 'exams', actions: ['read', 'write'], scope: 'OWN' },
          { resource: 'records', actions: ['read', 'write'], scope: 'OWN' }
        ]
      case 'MENTOR':
        return [
          { resource: 'students', actions: ['read'], scope: 'ASSIGNED' },
          { resource: 'mentoring', actions: ['read', 'write'], scope: 'ASSIGNED' }
        ]
      case 'FINANCE':
        return [
          { resource: 'finance', actions: ['read', 'write'], scope: 'GLOBAL' }
        ]
      case 'SCOLARITY':
        return [
          { resource: 'students', actions: ['read', 'write'], scope: 'GLOBAL' },
          { resource: 'records', actions: ['read', 'write'], scope: 'GLOBAL' }
        ]
      default:
        return []
    }
  }

  const role = user?.role || ''
  const isAdmin = ['ADMIN', 'DIRECTION', 'SUPER_ADMIN'].includes(role)
  const isStudent = role === 'STUDENT'
  const isTeacher = role === 'TEACHER'
  const isFinance = role === 'FINANCE'
  const isMentor = role === 'MENTOR'
  const isScolarity = role === 'SCOLARITY'

  const permissions = user?.permissions || getPermissionsForRole(role)
  const scope = user?.scope || { type: role === 'ADMIN' ? 'GLOBAL' : 'OWN' }

  const hasPermission = (resource, action) => {
    if (isAdmin) return true
    return permissions.some(p => 
      (p.resource === resource || p.resource === 'all') && 
      (p.actions.includes(action) || p.actions.includes('*'))
    )
  }

  return {
    user,
    loading,
    logout,
    isAdmin,
    isStudent,
    isTeacher,
    isFinance,
    isMentor,
    isScolarity,
    role,
    permissions,
    scope,
    hasPermission,
    isAuthenticated: !!user
  }
}
