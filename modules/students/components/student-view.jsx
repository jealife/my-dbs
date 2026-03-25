'use client'

import { motion } from 'framer-motion'
import { Plus, Search, Users, UserPlus, Filter, Download, MoreVertical, GraduationCap, CheckCircle, XCircle, Clock, Calendar, Edit2, Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-hook'
import { AddUserModal } from '@/modules/users/components/add-user-modal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/lib/user-service'
import { admissionsService } from '@/lib/admissions-service'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function StudentModuleView() {
  const { isAdmin, isTeacher } = useAuth()
  const [activeTab, setActiveTab] = useState('directory') // directory, admissions
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Gestion <span className="text-primary italic">ÉTUDIANTS</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Annuaire centralisé et flux d'admissions.</p>
        </div>
        
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all">
              <Download className="w-4.5 h-4.5" />
              Exporter (XLSX)
           </button>
           {(isAdmin) && (
             <button 
               onClick={() => setIsAddModalOpen(true)}
               className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
             >
                <Plus className="w-5 h-5" />
                Inscrire Étudiant
             </button>
           )}
        </div>
      </header>

      {/* Module Navigation */}
      <div className="flex flex-wrap gap-4 px-2">
        <button 
           onClick={() => setActiveTab('directory')}
           className={cn(
             "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2",
             activeTab === 'directory' ? "bg-primary text-white shadow-xl shadow-primary/20" : "glass-card hover:bg-primary/5 opacity-60 hover:opacity-100"
           )}
        >
           <Users className="w-4 h-4" />
           Annuaire Étudiants
        </button>
        {(isAdmin) && (
          <button 
             onClick={() => setActiveTab('admissions')}
             className={cn(
               "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2",
               activeTab === 'admissions' ? "bg-primary text-white shadow-xl shadow-primary/20" : "glass-card hover:bg-primary/5 opacity-60 hover:opacity-100"
             )}
          >
             <UserPlus className="w-4 h-4" />
             Admissions (Phase 1)
          </button>
        )}
      </div>

      {activeTab === 'directory' ? <StudentDirectory /> : <AdmissionWorkflow />}

      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        initialRole="STUDENT"
      />
    </div>
  )
}

function StudentDirectory() {
  const queryClient = useQueryClient()
  
  const { data: students, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: userService.getStudents
  })

  const handleDelete = async (id, name) => {
    if (confirm(`⚠️ ATTENTION ⚠️\nÊtes-vous sûr de vouloir supprimer définitivement l'étudiant ${name} ? Cette action est irréversible.`)) {
      try {
        await userService.deleteUser(id, 'STUDENT')
        toast.success(`Étudiant ${name} supprimé avec succès.`)
        queryClient.invalidateQueries({ queryKey: ['students'] })
      } catch (err) {
        toast.error(`Impossible de supprimer l'étudiant ${name}.`)
        console.error("Erreur de suppression:", err)
      }
    }
  }

  const handleEdit = (student) => {
    // Dans une V2, on ouvrira le AddUserModal en mode édition avec les données pré-remplies
    toast('Modification bientôt disponible ! (Brancher la modale d\'édition)', { icon: '🚧' })
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
       <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
       <p className="text-xs font-black uppercase tracking-widest italic text-primary">Synchronisation BDD...</p>
    </div>
  )

  if (error) return (
    <div className="p-10 text-center glass-card border-rose-500/20 text-rose-500 rounded-3xl flex flex-col items-center gap-4">
       <XCircle className="w-10 h-10 opacity-50" />
       <p className="text-sm font-black italic">⚠️ Impossible de charger l'annuaire : {error.message || "Erreur Serveur (500)"}</p>
       <button 
         onClick={() => queryClient.invalidateQueries({ queryKey: ['students'] })}
         className="px-6 py-2 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
       >
         Réessayer
       </button>
    </div>
  )

  const studentListRaw = students || []
  const studentList = Array.isArray(studentListRaw) ? studentListRaw : (studentListRaw?.data || [])

  return (
    <div className="space-y-6">
       {/* Filters Bar */}
       <div className="flex gap-4 px-2">
          <div className="relative group flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <input type="text" placeholder="Rechercher par nom, code ou classe..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold" />
          </div>
          <button className="p-3.5 rounded-2xl glass-card border-(--glass-border) hover:bg-primary/5 transition-all active:scale-95 text-muted-foreground hover:text-primary">
             <Filter className="w-5 h-5" />
          </button>
       </div>

       <GlassCard className="p-0 border-none ring-1 ring-(--glass-border) shadow-none overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
             <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-(--glass-border)">
                   <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Étudiant</th>
                   <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic hidden sm:table-cell">Code / ID</th>
                   <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic hidden md:table-cell">Niveau / Filière</th>
                   <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Statut</th>
                   <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-(--glass-border)">
                {studentList.map((student) => (
                  <tr key={student.id} className="group hover:bg-primary/2 transition-colors">
                     <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full premium-gradient p-px overflow-hidden shadow-lg shadow-primary/10 shrink-0">
                               <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-black text-[10px] italic">
                                  {student.first_name ? student.first_name[0] : 'S'}
                               </div>
                            </div>
                            <div>
                               <p className="text-[0.92rem] font-bold tracking-tight">{student.first_name} {student.last_name}</p>
                               <p className="text-xs font-black italic tracking-tighter text-indigo-500/80 uppercase">
                            #{student.studentNumber || student.student_number || student.registration_number || student.userCode || 'N/A'}
                         </p>
                               <p className="text-[10px] font-medium opacity-40">{student.email}</p>
                            </div>
                         </div>
                     </td>
                     <td className="px-6 py-5 hidden sm:table-cell">
                        <span className="text-[0.85rem] font-mono font-black italic opacity-60">#{student.userCode || student.user_code || student.studentNumber || student.code || 'N/A'}</span>
                     </td>
                     <td className="px-6 py-5 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                           <GraduationCap className="w-4 h-4 text-primary opacity-40" />
                           <span className="text-[0.85rem] font-bold">{student.program?.name || student.programName || student.level || 'Non assigné'}</span>
                        </div>
                     </td>
                     <td className="px-6 py-5">
                         <span className={cn(
                            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic",
                            student.status === 'ACTIVE' ? "text-emerald-500 bg-emerald-500/10" : 
                            student.status === 'APPLIED' ? "text-blue-500 bg-blue-500/10" :
                            "text-amber-500 bg-amber-500/10"
                         )}>
                            {student.status === 'ACTIVE' ? 'Actif' : 
                             student.status === 'APPLIED' ? 'Candidat' : 
                             student.status || 'Statut Inconnu'}
                         </span>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => handleEdit(student)}
                             className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                             title="Modifier"
                           >
                              <Edit2 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleDelete(student.id, `${student.first_name} ${student.last_name}`)}
                             className="p-2 rounded-xl bg-rose-50/50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                             title="Supprimer"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
          </div>
       </GlassCard>
       
       <div className="flex items-center justify-between px-4 py-2 opacity-60 italic">
          <p className="text-xs font-medium">Affichage de {studentList.length} étudiants</p>
          <div className="flex gap-2">
             <button className="px-4 py-2 rounded-xl glass-card text-xs font-black uppercase">Précédent</button>
             <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase">Suivant</button>
          </div>
       </div>
    </div>
  )
}

function AdmissionWorkflow() {
  const queryClient = useQueryClient()
  const { data: admissions = [], isLoading, error } = useQuery({
    queryKey: ['admissions', 'PENDING_REVIEW'],
    queryFn: () => admissionsService.getAll({ status: 'PENDING_REVIEW' })
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }) => admissionsService.updateStatus(id, status, reason),
    onSuccess: (_, variables) => {
      toast.success(`Candidature ${variables.status === 'VALIDATED' ? 'approuvée' : 'rejetée'} !`)
      queryClient.invalidateQueries({ queryKey: ['admissions'] })
      if (variables.status === 'VALIDATED') {
        queryClient.invalidateQueries({ queryKey: ['students'] }) // Reload student directory if one was added
      }
    },
    onError: err => toast.error(`Erreur: ${err.message}`),
  })

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
       <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
       <p className="text-xs font-black uppercase tracking-widest italic text-indigo-500">Flux Admissions en cours...</p>
    </div>
  )

  if (error) return (
    <div className="p-10 text-center glass-card border-rose-500/20 text-rose-500 rounded-3xl flex flex-col items-center gap-4">
       <XCircle className="w-10 h-10 opacity-50" />
       <p className="text-sm font-black italic">⚠️ Erreur flux admissions : {error.message || "Erreur Serveur (500)"}</p>
       <button 
         onClick={() => queryClient.invalidateQueries({ queryKey: ['admissions'] })}
         className="px-6 py-2 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
       >
         Réessayer
       </button>
    </div>
  )

  const admissionList = Array.isArray(admissions) ? admissions : (admissions?.content || [])

  if (admissionList.length === 0) return (
    <div className="p-20 text-center glass-card opacity-40 rounded-3xl border-(--glass-border)">
       <p className="text-sm font-black italic uppercase tracking-widest">Aucune candidature en attente de revue.</p>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-1">
       {admissionList.map((adm) => (
         <GlassCard key={adm.id} className="relative group overflow-hidden border-none ring-1 ring-(--glass-border) hover:ring-primary/40 transition-all p-8 flex flex-col justify-between h-[300px]">
           <div>
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-xl shadow-slate-900/5 group-hover:scale-110 transition-transform duration-500">
                    <UserPlus className="w-6 h-6" />
                 </div>
                 <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest italic animate-pulse">
                    <Clock className="w-3 h-3" />
                    {adm.status || 'En attente'}
                 </span>
              </div>
              <h3 className="text-xl font-black tracking-tight">{adm.firstName} {adm.lastName}</h3>
              <p className="text-[10px] font-black text-muted-foreground opacity-60 mt-1 uppercase tracking-widest">
                Ref: {adm.applicationNumber || adm.application_number || `#${adm.id}`} — {adm.email}
              </p>
              
              {adm.priority && (
                <div className={cn(
                  "mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
                  adm.priority === 'URGENT' ? "bg-rose-500/10 text-rose-500" :
                  adm.priority === 'HIGH' ? "bg-orange-500/10 text-orange-500" :
                  "bg-slate-500/10 text-slate-500"
                )}>
                   {adm.priority}
                </div>
              )}
              
              <div className="mt-4 flex items-center gap-2 opacity-40">
                 <Calendar className="w-3 h-3" />
                 <span className="text-[10px] font-bold italic">Soumis le {adm.createdAt ? format(new Date(adm.createdAt), 'dd MMMM yyyy', { locale: fr }) : 'Récemment'}</span>
              </div>
           </div>

           <div className="flex gap-4 pt-6 border-t border-(--glass-border)">
              <button 
                onClick={() => statusMutation.mutate({ id: adm.id, status: 'VALIDATED', reason: 'Dossier approuvé par direction' })}
                disabled={statusMutation.isPending}
                className="flex-1 px-4 py-3 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                 <CheckCircle className="w-4 h-4" />
                 Approuver
              </button>
              <button 
                onClick={() => statusMutation.mutate({ id: adm.id, status: 'REJECTED', reason: 'Dossier incomplet' })}
                disabled={statusMutation.isPending}
                className="flex-1 px-4 py-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                 <XCircle className="w-4 h-4" />
                 Rejeter
              </button>
           </div>
         </GlassCard>
       ))}
    </div>
  )
}
