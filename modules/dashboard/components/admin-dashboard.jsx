'use client'

import {
  Users, UserPlus, GraduationCap, BookOpen, Activity,
  ShieldCheck, RefreshCw, Search, X, Mail, Trash2,
  ChevronRight, Shield, Award
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AddUserModal } from '@/modules/users/components/add-user-modal'
import { apiClient } from '@/lib/api-client'
import { userService } from '@/lib/user-service'
import { formatPhotoUrl } from '@/lib/api-helpers'
import { toast } from 'react-hot-toast'

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function fetchStats() {
  const [studentsRes, teachersRes, usersRes, admissionsRes] = await Promise.allSettled([
    apiClient.get('/students'),
    apiClient.get('/teachers'),
    apiClient.get('/users'),
    apiClient.get('/v1/admissions'),
  ])

  const extract = (res) => {
    if (res.status !== 'fulfilled') return []
    const d = res.value.data?.data ?? res.value.data
    return Array.isArray(d) ? d : (d?.content ?? [])
  }

  const students   = extract(studentsRes)
  const teachers   = extract(teachersRes)
  const users      = extract(usersRes)
  const admissions = extract(admissionsRes)

  const activeStudents = students.filter(s => !s.archived && s.status !== 'ARCHIVED')
  const activeTeachers = teachers.filter(t => !t.archived && t.status !== 'ARCHIVED')
  const pendingAdm     = admissions.filter(a => ['DRAFT','SUBMITTED','UNDER_REVIEW'].includes(a.status))
  const activeUsers    = users.filter(u => !u.isDeleted && !u.deleted && u.status === 'ACTIVE')

  const admins = users.filter(u =>
    !u.isDeleted && !u.deleted &&
    ['ADMIN','SUPER_ADMIN','DIRECTION'].includes(u.role)
  )

  return {
    students: activeStudents.length,
    teachers: activeTeachers.length,
    users: activeUsers.length,
    admissions: admissions.length,
    pending: pendingAdm.length,
    admins: admins.length,
    recentUsers: [...users]
      .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
      .slice(0, 6),
    allStudents:  activeStudents,
    allTeachers:  activeTeachers,
    allAdmins:    admins,
    allUsers:     users,
  }
}

// ─── Avatar helper ────────────────────────────────────────────────────────────
function Avatar({ user, size = 'md' }) {
  const sz = size === 'sm' ? 'w-9 h-9 text-[10px]' : 'w-11 h-11 text-sm'
  const initials = `${(user?.firstName || user?.first_name || user?.email || '?')[0]}`.toUpperCase()
  const photo = formatPhotoUrl(user?.photoUrl || user?.photo_url)
  return (
    <div className={`${sz} rounded-2xl premium-gradient p-px shadow-lg shadow-primary/10 shrink-0`}>
      {photo
        ? <img src={photo} alt={initials} className="w-full h-full rounded-[10px] object-cover" />
        : <div className="w-full h-full rounded-[10px] bg-white dark:bg-slate-900 flex items-center justify-center font-black">{initials}</div>
      }
    </div>
  )
}

// ─── Generic user list ────────────────────────────────────────────────────────
function UserList({ users = [], emptyMsg = 'Aucun utilisateur.', showRole = false }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(u => {
      const name = `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.toLowerCase()
      return name.includes(q) || (u.email || '').toLowerCase().includes(q) || (u.department || '').toLowerCase().includes(q)
    })
  }, [users, search])

  const roleLabel = (r) => ({ SUPER_ADMIN: '👑 Super Admin', ADMIN: '🛡️ Admin', STUDENT: '🎓 Étudiant', TEACHER: '📚 Enseignant' }[r] ?? r)
  const statusColor = (s) => s === 'ACTIVE' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="w-full pl-9 pr-8 py-2.5 rounded-xl glass-card border-(--glass-border) text-sm font-medium outline-none focus:border-primary/50 transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {filtered.length === 0
          ? <p className="text-center py-8 text-sm opacity-40 italic font-bold">{search ? `Aucun résultat pour "${search}"` : emptyMsg}</p>
          : filtered.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all group"
            >
              <Avatar user={u} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">
                  {u.firstName || u.first_name || '—'} {u.lastName || u.last_name || ''}
                </p>
                <p className="text-[10px] font-medium opacity-40 truncate">{u.email}</p>
                {showRole && <span className="text-[9px] font-black uppercase tracking-wider opacity-50">{roleLabel(u.role)}</span>}
              </div>
              <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest shrink-0 ${statusColor(u.status)}`}>
                {u.status === 'ACTIVE' ? 'Actif' : u.status ?? '—'}
              </span>
            </motion.div>
          ))
        }
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, loading, i }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
      <GlassCard className="relative overflow-hidden group border-none ring-1 ring-(--glass-border) hover:ring-primary/40 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className={`${color} p-3 rounded-2xl shadow-xl shadow-slate-900/5 group-hover:scale-110 transition-transform duration-500`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10">Live</span>
        </div>
        <div>
          {loading
            ? <div className="h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse mb-2" />
            : <p className="text-3xl font-black tracking-tight">{value ?? '—'}</p>
          }
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest mt-1">{label}</p>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />
      </GlassCard>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',  label: 'Vue Générale',  icon: Activity },
  { key: 'students',  label: 'Étudiants',     icon: GraduationCap },
  { key: 'teachers',  label: 'Enseignants',   icon: BookOpen },
  { key: 'admins',    label: 'Administrateurs', icon: Shield },
]

export function AdminDashboard({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const queryClient = useQueryClient()

  const { data: stats, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: fetchStats,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  const statCards = [
    { label: 'Étudiants Actifs',     value: stats?.students,   icon: GraduationCap, color: 'bg-indigo-500' },
    { label: 'Corps Enseignant',      value: stats?.teachers,   icon: Users,         color: 'bg-emerald-500' },
    { label: 'Candidatures',         value: stats?.admissions, icon: UserPlus,      color: 'bg-amber-500'  },
    { label: 'En Attente',           value: stats?.pending,    icon: Activity,      color: 'bg-rose-500'   },
  ]

  const roleLabel = (r) => ({ SUPER_ADMIN: '👑 Super Admin', ADMIN: '🛡️ Admin', STUDENT: '🎓 Étudiant', TEACHER: '📚 Enseignant' }[r] ?? r)
  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] })
    queryClient.invalidateQueries({ queryKey: ['students'] })
    queryClient.invalidateQueries({ queryKey: ['teachers'] })
  }

  return (
    <div className="space-y-8 py-4 sm:py-8">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter italic">
            Console <span className="text-primary italic">ADMIN</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60 text-sm">
            Bienvenue, <span className="text-foreground font-black">{user?.first_name || 'Admin'}</span>. Vue d&apos;ensemble My DBS.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border) disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvelle Inscription</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all shrink-0 ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'glass-card border-(--glass-border) hover:border-primary/40 opacity-60 hover:opacity-100'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {/* Live count badges */}
            {tab.key === 'students' && stats?.students != null && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[9px]">{stats.students}</span>
            )}
            {tab.key === 'teachers' && stats?.teachers != null && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[9px]">{stats.teachers}</span>
            )}
            {tab.key === 'admins' && stats?.admins != null && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[9px]">{stats.admins}</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            {/* Stats KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s, i) => <StatCard key={i} {...s} loading={isLoading} i={i} />)}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Recent accounts */}
              <GlassCard className="xl:col-span-2 shadow-none border-none ring-1 ring-(--glass-border)" title="Derniers Comptes Créés" description="Utilisateurs récemment ajoutés.">
                <div className="space-y-2 pt-4">
                  {isLoading
                    ? [...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-2xl animate-pulse">
                        <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-36" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                        </div>
                      </div>
                    ))
                    : stats?.recentUsers?.length === 0
                    ? <p className="py-10 text-center opacity-40 italic text-sm font-bold">Aucun utilisateur.</p>
                    : stats?.recentUsers?.map((u, i) => (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all group"
                      >
                        <Avatar user={u} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{u.firstName || u.first_name || '—'} {u.lastName || u.last_name || ''}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-black italic uppercase tracking-wider opacity-40">{roleLabel(u.role)}</span>
                            <span className="text-[10px] opacity-30">•</span>
                            <span className="text-[10px] font-medium opacity-40">{formatDate(u.createdAt)}</span>
                          </div>
                        </div>
                        <span className={`hidden sm:inline-flex px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shrink-0 ${
                          u.status === 'ACTIVE' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'
                        }`}>
                          {u.status ?? 'N/A'}
                        </span>
                      </motion.div>
                    ))
                  }
                </div>
              </GlassCard>

              {/* Summary */}
              <GlassCard title="Récapitulatif" description="Compteurs base de données." className="shadow-none border-none ring-1 ring-(--glass-border)">
                <div className="space-y-6 pt-6">
                  <div className="p-5 rounded-3xl premium-gradient text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">Total Utilisateurs Actifs</p>
                    {isLoading
                      ? <div className="h-10 w-20 bg-white/20 rounded-xl animate-pulse mt-2" />
                      : <p className="text-4xl font-black mt-2 tracking-tighter italic">{stats?.users ?? '—'}</p>
                    }
                    <ShieldCheck className="absolute right-4 bottom-4 w-10 h-10 opacity-20" />
                  </div>
                  <div className="space-y-3 px-1">
                    {[
                      { label: 'Étudiants', count: stats?.students ?? 0, total: stats?.users ?? 1, color: 'bg-indigo-500' },
                      { label: 'Enseignants', count: stats?.teachers ?? 0, total: stats?.users ?? 1, color: 'bg-emerald-500' },
                      { label: 'Candidatures en attente', count: stats?.pending ?? 0, total: Math.max(stats?.admissions ?? 1, 1), color: 'bg-amber-500' },
                    ].map((item, idx) => {
                      const pct = stats ? Math.round((item.count / item.total) * 100) : 0
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60 italic">
                            <span>{item.label}</span>
                            <span>{isLoading ? '…' : `${item.count}`}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: isLoading ? '0%' : `${pct}%` }}
                              transition={{ duration: 1.2, delay: 0.3 + idx * 0.2 }}
                              className={`h-full ${item.color} shadow-lg`}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* ── STUDENTS TAB ── */}
        {activeTab === 'students' && (
          <motion.div key="students" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none" title={`Étudiants (${stats?.students ?? '…'})`} description="Liste des étudiants actifs.">
              <div className="pt-4">
                {isLoading
                  ? <p className="text-center py-10 opacity-40 text-sm animate-pulse">Chargement…</p>
                  : <UserList users={stats?.allStudents ?? []} emptyMsg="Aucun étudiant enregistré." />
                }
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── TEACHERS TAB ── */}
        {activeTab === 'teachers' && (
          <motion.div key="teachers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none" title={`Corps Enseignant (${stats?.teachers ?? '…'})`} description="Enseignants actifs et leurs informations.">
              <div className="pt-4">
                {isLoading
                  ? <p className="text-center py-10 opacity-40 text-sm animate-pulse">Chargement…</p>
                  : <UserList users={stats?.allTeachers ?? []} emptyMsg="Aucun enseignant enregistré." />
                }
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── ADMINS TAB ── */}
        {activeTab === 'admins' && (
          <motion.div key="admins" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none" title={`Administrateurs (${stats?.admins ?? '…'})`} description="Comptes administrateurs et super-admins.">
              <div className="pt-4">
                {isLoading
                  ? <p className="text-center py-10 opacity-40 text-sm animate-pulse">Chargement…</p>
                  : <UserList users={stats?.allAdmins ?? []} emptyMsg="Aucun administrateur trouvé." showRole />
                }
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
