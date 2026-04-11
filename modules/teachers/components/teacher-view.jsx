'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, BookOpen, Star, Clock, Search, Download,
  Mail, Edit2, Trash2, Phone, Building2, UserPlus, ChevronRight, X, Eye
} from 'lucide-react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth-hook'
import { AddUserModal } from '@/modules/users/components/add-user-modal'
import { EditUserModal } from '@/modules/users/components/edit-user-modal'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/lib/user-service'
import { formatPhotoUrl } from '@/lib/api-helpers'
import { DeleteConfirmationModal } from '@/modules/users/components/DeleteConfirmationModal'
import { toast } from 'react-hot-toast'
import { MaintenanceZone } from '@/components/ui/maintenance-zone'

// ─── Skeleton row ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl animate-pulse">
      <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-56" />
      </div>
      <div className="hidden md:flex gap-2">
        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  )
}

// ─── Teacher row ─────────────────────────────────────────────────────────────
function TeacherRow({ teacher: t, index, onEdit, onDelete }) {
  const initials = `${(t.firstName || t.first_name || '?')[0]}${(t.lastName || t.last_name || '')[0] || ''}`.toUpperCase()
  const fullName = `${t.firstName || t.first_name || ''} ${t.lastName || t.last_name || ''}`.trim()
  const isActive = t.status === 'ACTIVE'

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ delay: index * 0.04 }}
      className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-900/50 border border-transparent hover:border-(--glass-border) transition-all"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-2xl premium-gradient p-px shadow-lg shadow-primary/10">
          <div className="w-full h-full rounded-[10px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-sm overflow-hidden">
            {(() => {
               const photo = formatPhotoUrl(t.photoUrl || t.photo_url)
               return photo
                 ? <img src={photo} alt={fullName} className="w-full h-full object-cover" />
                 : initials
            })()}
          </div>
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      </div>

      {/* Name + Email */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm truncate">{fullName || '—'}</p>
        <p className="text-[11px] font-medium opacity-50 truncate flex items-center gap-1">
          <Mail className="w-3 h-3 shrink-0" /> {t.email || '—'}
        </p>
      </div>

      {/* Badges — hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
          {t.department || 'Général'}
        </span>
        <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-wider">
          {t.employmentType || t.employment_type || 'Temps plein'}
        </span>
        {t.phoneNumber && (
          <span className="flex items-center gap-1 text-[10px] font-bold opacity-40">
            <Phone className="w-3 h-3" /> {t.phoneNumber}
          </span>
        )}
      </div>

      {/* Status badge */}
      <span className={`hidden sm:inline-flex px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shrink-0 ${
        isActive ? 'text-emerald-600 bg-emerald-500/10' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'
      }`}>
        {isActive ? 'Actif' : t.status || 'N/A'}
      </span>

      {/* Actions */}
      <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/teachers/${t.id}`}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
          title="Voir Profil"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => onEdit(t)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
          title="Modifier le dossier"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <a
          href={`mailto:${t.email}`}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
          title="Envoyer un email"
        >
          <Mail className="w-3.5 h-3.5" />
        </a>
        <button
          onClick={() => onDelete(t, fullName)}
          className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
          title="Supprimer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main list component ──────────────────────────────────────────────────────
function TeacherList({ search, onEditTeacher, onDeleteTeacher }) {
  const queryClient = useQueryClient()

  const { data: teachers, isLoading, error, refetch } = useQuery({
    queryKey: ['teachers'],
    queryFn: userService.getTeachers,
  })

  const handleDelete = (teacher, name) => {
    onDeleteTeacher(teacher, name)
  }

  const raw = useMemo(() => Array.isArray(teachers) ? teachers : (teachers?.data ?? []), [teachers])

  const filtered = useMemo(() => {
    if (!search.trim()) return raw
    const q = search.toLowerCase()
    return raw.filter(t => {
      const name = `${t.firstName || t.first_name || ''} ${t.lastName || t.last_name || ''}`.toLowerCase()
      const dept = (t.department || '').toLowerCase()
      const email = (t.email || '').toLowerCase()
      return name.includes(q) || dept.includes(q) || email.includes(q)
    })
  }, [raw, search])

  if (isLoading) return (
    <div className="space-y-1 px-1">
      {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
    </div>
  )

  if (error) return (
    <div className="p-4">
      <MaintenanceZone 
        error={error} 
        reset={refetch} 
        zone="Corps Enseignant"
      />
    </div>
  )

  if (filtered.length === 0) return (
    <div className="py-20 text-center opacity-40 italic text-sm font-bold">
      {search ? `Aucun résultat pour "${search}"` : 'Aucun enseignant enregistré.'}
    </div>
  )

  return (
    <div className="space-y-1 px-1">
      <AnimatePresence>
        {filtered.map((t, i) => (
          <TeacherRow key={t.id} teacher={t} index={i} onEdit={onEditTeacher} onDelete={handleDelete} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Module shell ─────────────────────────────────────────────────────────────
export function TeacherModuleView() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, teacher: null, name: '' })
  const [isDeleting, setIsDeleting] = useState(false)
  const [search, setSearch] = useState('')

  // Live count from cache
  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: userService.getTeachers, staleTime: 60_000 })
  const raw = Array.isArray(teachers) ? teachers : (teachers?.data ?? [])
  const total = raw.length

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher)
  }

  const handleDeleteClick = (teacher, name) => {
    setDeleteModal({ isOpen: true, teacher, name })
  }

  const handleConfirmDelete = async () => {
    const { teacher, name } = deleteModal
    setIsDeleting(true)
    try {
      await userService.deleteUser(teacher, 'TEACHER')
      toast.success(`${name} supprimé avec succès.`)
      setDeleteModal({ isOpen: false, teacher: null, name: '' })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] })
    } catch (err) {
      if (err.response?.status === 404) {
        toast.success(`L'élément n'existe plus sur le serveur.`)
        setDeleteModal({ isOpen: false, teacher: null, name: '' })
        queryClient.invalidateQueries({ queryKey: ['teachers'] })
      } else {
        toast.error(`Impossible de supprimer ${name}.`)
        console.error("Erreur de suppression:", err)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['teachers'] })
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            Corps <span className="text-primary italic">ENSEIGNANT</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">
            Répertoire des enseignants, affectations et évaluations pédagogiques.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all">
            <Download className="w-4 h-4" /> Exporter
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" /> Nouvel Enseignant
            </button>
          )}
        </div>
      </header>

      {/* Stats Row — live count */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Enseignants', val: total || '—', icon: Users, color: 'bg-primary' },
          { label: 'Cours Actifs', val: '—', icon: BookOpen, color: 'bg-indigo-500' },
          { label: 'Satisfaction Moy.', val: '—', icon: Star, color: 'bg-amber-500' },
          { label: 'Heures/Semaine', val: '—', icon: Clock, color: 'bg-emerald-500' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <GlassCard className="p-5 border-none ring-1 ring-(--glass-border) shadow-none group">
              <div className={`w-10 h-10 rounded-2xl mb-4 flex items-center justify-center text-white ${s.color} group-hover:scale-110 transition-transform duration-500`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black tracking-tight">{s.val}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-40 mt-1">{s.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative group px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, département, email…"
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-medium text-sm outline-none transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* List */}
      <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-(--glass-border) text-[10px] font-black uppercase tracking-widest opacity-40">
          <span className="w-11 shrink-0" />
          <span className="flex-1">Enseignant</span>
          <span className="hidden md:inline w-48">Département / Type</span>
          <span className="hidden sm:inline w-20">Statut</span>
          <span className="w-20 text-right">Actions</span>
        </div>
        <TeacherList search={search} onEditTeacher={handleEdit} onDeleteTeacher={handleDeleteClick} />
      </GlassCard>

      {/* Modals — refresh list on success */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialRole="TEACHER"
      />

      <EditUserModal
        isOpen={!!editingTeacher}
        onClose={() => setEditingTeacher(null)}
        user={editingTeacher}
        onUpdateSuccess={handleModalSuccess}
      />

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        itemName={deleteModal.name}
        title="Supprimer l'enseignant ?"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce profil enseignant ?"
      />
    </div>
  )
}
