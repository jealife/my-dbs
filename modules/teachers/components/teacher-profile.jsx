'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Phone, Calendar, BookOpen, 
  ArrowLeft, Edit2, Trash2, Star, Clock, 
  Activity, CheckCircle, Download,
  MoreVertical, Shield, Building2, Briefcase
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/lib/user-service'
import { formatPhotoUrl, formatDateFr } from '@/lib/api-helpers'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { EditUserModal } from '@/modules/users/components/edit-user-modal'

export function TeacherProfileView({ teacherId }) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // 1. Fetch Teacher Data
  const { data: teacher, isLoading, error } = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: () => userService.getTeacherById(teacherId),
    enabled: !!teacherId,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest italic">Chargement du dossier enseignant...</p>
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-black italic">Enseignant Introuvable</h2>
        <p className="text-muted-foreground italic">Le dossier demandé n&apos;existe pas ou a été supprimé.</p>
        <Link href="/teachers" className="inline-flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest mt-4">
          <ArrowLeft className="w-4 h-4" /> Retour au corps enseignant
        </Link>
      </div>
    )
  }

  const fullName = `${teacher.firstName || teacher.first_name || ''} ${teacher.lastName || teacher.last_name || ''}`
  const photo = formatPhotoUrl(teacher.photoUrl || teacher.photo_url)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-2">
        <Link href="/teachers" className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Retour Enseignants</span>
        </Link>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="p-2.5 rounded-xl glass-card border-(--glass-border) hover:text-primary transition-all"
        >
          <Edit2 className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Header Profile */}
      <GlassCard className="p-8 border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5 overflow-hidden relative">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div className="w-32 h-32 rounded-4xl premium-gradient p-1 shadow-2xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full rounded-[2.2rem] bg-white dark:bg-slate-950 overflow-hidden">
              {photo 
                ? <img src={photo} alt={fullName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-4xl font-black italic opacity-40 uppercase">
                    {(teacher.firstName || 'T')[0]}
                  </div>
              }
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
              <h1 className="text-4xl font-black tracking-tighter italic">{fullName}</h1>
              <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest italic">
                {teacher.status || 'Actif'}
              </span>
            </div>
            <p className="text-lg font-bold opacity-60 italic mb-6">
              {teacher.department || 'Département Polyvalent'} • {teacher.employmentType || 'CDI'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400"><Mail className="w-4 h-4" /></div>
                <div className="min-w-0"><p className="text-[10px] font-black uppercase opacity-40">Email</p><p className="text-xs font-bold truncate">{teacher.email}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400"><Phone className="w-4 h-4" /></div>
                <div className="min-w-0"><p className="text-[10px] font-black uppercase opacity-40">Téléphone</p><p className="text-xs font-bold">{teacher.phoneNumber || '—'}</p></div>
              </div>
               <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400"><Briefcase className="w-4 h-4" /></div>
                <div className="min-w-0"><p className="text-[10px] font-black uppercase opacity-40">Spécialité</p><p className="text-xs font-bold">{teacher.specialization || 'Général'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400"><Shield className="w-4 h-4" /></div>
                <div className="min-w-0"><p className="text-[10px] font-black uppercase opacity-40">Matricule</p><p className="text-xs font-black text-indigo-500">#{teacher.teacherNumber || teacher.userCode || teacher.id}</p></div>
              </div>
            </div>
          </div>
        </div>
        <Building2 className="absolute top-1/2 right-0 -translate-y-1/2 opacity-5 pointer-events-none w-80 h-80 -mr-20" />
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <GlassCard title="Cours Assignés" description="Modules et sessions sous la responsabilité de l&apos;enseignant.">
             <div className="py-10 text-center opacity-30 italic font-black uppercase tracking-widest text-xs">
                Aucune affectation trouvée pour le semestre en cours.
             </div>
          </GlassCard>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard title="Statistiques Pédagogiques">
              <div className="pt-4 space-y-6">
                {[
                  { label: 'Evaluation Etudiants', val: '4.8/5', pct: 96, color: 'bg-amber-500' },
                  { label: 'Taux de Complétion', val: '92%', pct: 92, color: 'bg-emerald-500' },
                  { label: 'Assiduité Moyenne', val: '88%', pct: 88, color: 'bg-indigo-500' },
                ].map((s, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                      <span>{s.label}</span>
                      <span>{s.val}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} className={cn("h-full rounded-full shadow-lg", s.color)} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

             <GlassCard title="Disponibilité & Planning">
                <div className="pt-4 space-y-4">
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-xs font-bold text-emerald-600">Actuellement disponible</p>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                   </div>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Prochaine Session</p>
                      <p className="text-sm font-bold">Lundi 08:30 • Algo Avancée</p>
                   </div>
                </div>
             </GlassCard>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-8">
          <div className="p-8 rounded-4xl bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
             <h3 className="text-xl font-black italic">Dossier RH</h3>
             <p className="text-sm opacity-60 mt-3 font-medium">Documents administratifs, contrats et fiches de paie centralisés.</p>
             <button className="mt-8 px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Accéder au Coffre</button>
             <Shield className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 rotate-12" />
          </div>

          <GlassCard title="Dernières Activités">
             <div className="pt-4 space-y-4">
                {[
                  { msg: 'Notes publiées : Mathématiques', date: 'Il y a 2h' },
                  { msg: 'Absence marquée : Session #104', date: 'Hier' },
                  { msg: 'Document déposé : Syllabus', date: 'Il y a 3 jours' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <div>
                       <p className="font-bold opacity-80">{act.msg}</p>
                       <p className="opacity-40 italic font-medium">{act.date}</p>
                    </div>
                  </div>
                ))}
             </div>
          </GlassCard>
        </div>
      </div>

      {isEditModalOpen && (
        <EditUserModal 
          isOpen={isEditModalOpen}
          user={teacher}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['teacher', teacherId] })
            setIsEditModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
