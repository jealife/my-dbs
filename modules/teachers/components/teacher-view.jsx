'use client'

import { motion } from 'framer-motion'
import { Users, BookOpen, Star, Clock, Calendar, ArrowUpRight, Award, Filter, Search, Download, Mail, Edit2, Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-hook'
import { AddUserModal } from '@/modules/users/components/add-user-modal'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/lib/user-service'
import { toast } from 'react-hot-toast'

function TeacherList() {
  const queryClient = useQueryClient()
  
  const { data: teachers, isLoading, error } = useQuery({
    queryKey: ['teachers'],
    queryFn: userService.getTeachers
  })

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
       <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
       <p className="text-xs font-black uppercase tracking-widest italic text-primary">Chargement de la faculté...</p>
    </div>
  )

  const handleDelete = async (id, name) => {
    if (confirm(`⚠️ ATTENTION ⚠️\nÊtes-vous sûr de vouloir supprimer définitivement l'enseignant ${name} ?`)) {
      try {
        await userService.deleteUser(id, 'TEACHER')
        toast.success(`Enseignant ${name} supprimé avec succès.`)
        queryClient.invalidateQueries({ queryKey: ['teachers'] })
      } catch (err) {
        toast.error(`Impossible de supprimer l'enseignant ${name}.`)
        console.error("Erreur de suppression:", err)
      }
    }
  }

  const handleEdit = (teacher) => {
    toast('Modification bientôt disponible ! (Brancher la modale d\'édition)', { icon: '🚧' })
  }

  if (error) return (
    <div className="p-10 text-center glass-card border-rose-500/20 text-rose-500 rounded-3xl">
       <p className="text-sm font-black italic">⚠️ Erreur de synchronisation : {error.message}</p>
    </div>
  )

  const facultyRaw = teachers || []
  const faculty = Array.isArray(facultyRaw) ? facultyRaw : (facultyRaw?.data || [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-1">
      {faculty.map((t, i) => (
        <motion.div key={t.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }}>
          <GlassCard className="relative overflow-hidden group border-none ring-1 ring-(--glass-border) hover:ring-primary/40 transition-all p-8 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-3xl premium-gradient p-px shadow-2xl shadow-primary/15 mb-5 group-hover:scale-105 transition-transform duration-500">
              <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-2xl italic">
                {t.last_name ? t.last_name[0] : 'T'}
              </div>
            </div>

            <span className={cn(
              "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest italic mb-4",
              t.status === 'ACTIVE' || t.status === 'Actif' ? "text-emerald-500 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10"
            )}>{t.status || 'Actif'}</span>

            <h3 className="text-[1rem] font-black tracking-tight leading-tight">{t.first_name} {t.last_name}</h3>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1 italic">{t.department || 'Enseignant'}</p>

            <div className="mt-6 flex justify-center gap-4 text-center">
              <div>
                <p className="text-lg font-black text-primary">{t.courses_count || 0}</p>
                <p className="text-[9px] opacity-40 uppercase tracking-widest font-black">Cours</p>
              </div>
              <div className="w-px bg-(--glass-border)" />
              <div>
                <p className="text-lg font-black text-amber-500">⭐ {t.rating || 'N/A'}</p>
                <p className="text-[9px] opacity-40 uppercase tracking-widest font-black">Satisfaction</p>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-(--glass-border) w-full flex gap-3">
              <button className="flex-1 py-2.5 rounded-2xl glass-card border-(--glass-border) text-[10px] font-black uppercase tracking-widest hover:border-primary/50 transition-all group-hover:bg-primary/5 flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Message
              </button>
              <button onClick={() => handleEdit(t)} className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-slate-100 dark:border-slate-800" title="Modifier">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(t.id, `${t.first_name} ${t.last_name}`)} className="p-2.5 rounded-2xl bg-rose-50/50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-95" title="Supprimer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </GlassCard>
        </motion.div>
      ))}
    </div>
  )
}

export function TeacherModuleView() {
  const { isAdmin } = useAuth()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Corps <span className="text-primary italic">ENSEIGNANT</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Répertoire des enseignants, affectations et évaluations pédagogiques.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all">
            <Download className="w-4.5 h-4.5" />
            Exporter
          </button>
           {(isAdmin) && (
             <button 
               onClick={() => setIsAddModalOpen(true)}
               className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
             >
                <Users className="w-5 h-5" />
                Nouvel Enseignant
             </button>
           )}
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Enseignants', val: '48', icon: Users, color: 'bg-primary' },
          { label: 'Cours Actifs', val: '124', icon: BookOpen, color: 'bg-indigo-500' },
          { label: 'Satisfaction Moy.', val: '4.7/5', icon: Star, color: 'bg-amber-500' },
          { label: 'Heures/Semaine', val: '386h', icon: Clock, color: 'bg-emerald-500' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard className="p-6 border-none ring-1 ring-(--glass-border) shadow-none group">
              <div className={cn("w-12 h-12 rounded-2xl mb-5 flex items-center justify-center text-white shadow-xl shadow-slate-900/5 group-hover:scale-110 transition-transform duration-500", s.color)}>
                <s.icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-black tracking-tight">{s.val}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-40 mt-1">{s.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 px-2">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input type="text" placeholder="Rechercher par nom, département..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold" />
        </div>
        <button className="p-3.5 rounded-2xl glass-card border-(--glass-border) hover:bg-primary/5 transition-all active:scale-95 text-muted-foreground hover:text-primary">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Teacher Cards Grid */}
      <TeacherList />

      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        initialRole="TEACHER"
      />
    </div>
  )
}
