'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Users, UserPlus, Filter, Download, MoreVertical, GraduationCap, CheckCircle, CheckCircle2, XCircle, Clock, Calendar, Edit2, Trash2, AlertCircle, Copy, Key, Eye } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-hook'
import { AddUserModal } from '@/modules/users/components/add-user-modal'
import { EditUserModal } from '@/modules/users/components/edit-user-modal'
import { DeleteConfirmationModal } from '@/modules/users/components/DeleteConfirmationModal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/lib/user-service'
import { formatPhotoUrl } from '@/lib/api-helpers'
import { admissionsService } from '@/lib/admissions-service'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { MaintenanceZone } from '@/components/ui/maintenance-zone'

function exportStudentsCSV(students) {
  const headers = ['Prénom', 'Nom', 'Email', 'Matricule', 'Filière', 'Statut']
  const rows = students.map(s => [
    s.first_name || '',
    s.last_name || '',
    s.email || '',
    s.studentNumber || s.student_number || s.userCode || '',
    s.program?.name || s.programName || s.level || '',
    s.status || '',
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `etudiants_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function ExportButton({ activeTab }) {
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: userService.getStudents })

  if (activeTab !== 'directory') return null

  const handleExport = () => {
    const list = Array.isArray(students) ? students : (students?.data || [])
    if (!list.length) { toast.error('Aucun étudiant à exporter.'); return }
    exportStudentsCSV(list)
    toast.success(`${list.length} étudiant(s) exporté(s) en CSV.`)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all"
    >
      <Download className="w-4.5 h-4.5" />
      Exporter (CSV)
    </button>
  )
}

export function StudentModuleView() {
  const { isAdmin, isTeacher } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('directory') // directory, admissions
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleStudentAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['students'] })
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] })
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Gestion <span className="text-primary italic">ÉTUDIANTS</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Annuaire centralisé et flux d&apos;admissions.</p>
        </div>
        
        <div className="flex gap-4">
           <ExportButton activeTab={activeTab} />

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
        onSuccess={handleStudentAdded}
        initialRole="STUDENT"
      />
    </div>
  )
}

function StudentDirectory() {
  const queryClient = useQueryClient()
  const [editingUser, setEditingUser] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, student: null, name: '' })
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: students, isLoading, error, refetch } = useQuery({
    queryKey: ['students'],
    queryFn: userService.getStudents
  })

  const handleDeleteClick = (student, name) => {
    setDeleteModal({ isOpen: true, student, name })
  }

  const handleConfirmDelete = async () => {
    const { student, name } = deleteModal
    setIsDeleting(true)
    try {
      await userService.deleteUser(student, 'STUDENT')
      toast.success(`Étudiant ${name} supprimé avec succès.`)
      setDeleteModal({ isOpen: false, student: null, name: '' })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['admissions'] })
    } catch (err) {
      if (err.response?.status === 404) {
        toast.success(`L'élément n'existe plus sur le serveur (déjà supprimé).`)
        setDeleteModal({ isOpen: false, student: null, name: '' })
        queryClient.invalidateQueries({ queryKey: ['students'] })
      } else {
        toast.error(`Impossible de supprimer ${name}.`)
        console.error("Erreur de suppression:", err)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (student) => {
    setEditingUser(student)
  }

  const handleSendCredentials = async (student) => {
    try {
      const identifier = student.email || student.userCode;
      if (!identifier) {
        toast.error("Format de l'étudiant invalide (E-mail introuvable).");
        return;
      }
      
      await userService.sendCredentials(identifier)
      toast.success(`Les identifiants ont été envoyés au compte de ${student.first_name || student.firstName || 'l\'étudiant'} !`)
    } catch (err) {
      toast.error(`Erreur lors de l'envoi des identifiants.`)
      console.error("Credentials error:", err)
    }
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
       <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
       <p className="text-xs font-black uppercase tracking-widest italic text-primary">Synchronisation BDD...</p>
    </div>
  )

  if (error) return (
    <div className="p-4">
      <MaintenanceZone 
        error={error} 
        reset={refetch} 
        zone="Annuaire Étudiants"
      />
    </div>
  )

  const studentListRaw = students || []
  let studentList = Array.isArray(studentListRaw) ? studentListRaw : (studentListRaw?.data || [])

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    studentList = studentList.filter(s => 
      (s.first_name && s.first_name.toLowerCase().includes(q)) ||
      (s.last_name && s.last_name.toLowerCase().includes(q)) ||
      ((s.userCode || s.user_code || s.studentNumber || s.code) && String(s.userCode || s.user_code || s.studentNumber || s.code).toLowerCase().includes(q)) ||
      (s.program?.name && s.program.name.toLowerCase().includes(q)) ||
      (s.programName && s.programName.toLowerCase().includes(q))
    )
  }

  return (
    <div className="space-y-6">
       <div className="flex gap-4 px-2">
          <div className="relative group flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Rechercher par nom, code ou classe..." 
                 className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold" 
             />
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
                     <td className="px-4 py-4 sm:px-6 sm:py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full premium-gradient p-px overflow-hidden shadow-lg shadow-primary/10 shrink-0">
                               {(() => {
                                 const photo = formatPhotoUrl(student.photoUrl || student.photo_url)
                                 return photo 
                                   ? <img src={photo} alt={`${student.first_name} ${student.last_name}`} className="w-full h-full rounded-full object-cover" />
                                   : <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-black text-[10px] italic">
                                       {student.first_name ? student.first_name[0].toUpperCase() : 'S'}
                                     </div>
                               })()}
                            </div>
                            <div className="min-w-0">
                               <p className="text-[0.92rem] font-bold tracking-tight truncate">{student.first_name} {student.last_name}</p>
                               <p className="text-[10px] font-black italic tracking-tighter text-indigo-500/80 uppercase">
                                  #{student.studentNumber || student.student_number || student.registration_number || student.userCode || 'N/A'}
                               </p>
                               <p className="text-[10px] font-medium opacity-40 truncate">{student.email}</p>
                               <p className="text-[10px] font-bold opacity-50 md:hidden truncate">
                                 {student.program?.name || student.programName || student.level || ''}
                               </p>
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
                           <Link
                             href={`/students/${student.id}`}
                             className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                             title="Voir Profil"
                           >
                              <Eye className="w-4 h-4" />
                           </Link>
                           <button 
                             onClick={() => handleSendCredentials(student)}
                             className="p-2 rounded-xl bg-indigo-50/50 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all active:scale-95"
                             title="Envoyer Identifiants"
                           >
                              <Key className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleEdit(student)}
                             className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                             title="Modifier"
                           >
                              <Edit2 className="w-4 h-4" />
                           </button>
                            <button 
                              onClick={() => {
                                const fullName = `${student.firstName || student.first_name || ''} ${student.lastName || student.last_name || ''}`.trim() || 'Étudiant'
                                handleDeleteClick(student, fullName)
                              }}
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

       <DeleteConfirmationModal 
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
          onConfirm={handleConfirmDelete}
          loading={isDeleting}
          itemName={deleteModal.name}
          title="Supprimer l'étudiant ?"
          message="Êtes-vous sûr de vouloir supprimer définitivement cet étudiant ? Cette action est irréversible."
       />

       {editingUser && (
          <EditUserModal 
             isOpen={!!editingUser}
             user={editingUser}
             onClose={() => setEditingUser(null)}
             onUpdateSuccess={() => queryClient.invalidateQueries({ queryKey: ['students'] })}
          />
        )}
       
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
  const [enrolledStudent, setEnrolledStudent] = useState(null)
  const [editingAdmission, setEditingAdmission] = useState(null)

  const { data: admissions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admissions', 'all'],
    queryFn: () => admissionsService.getAll()
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }) => admissionsService.updateStatus(id, status, reason),
    onSuccess: (data, variables) => {
      const actionWord = variables.status === 'VALIDATED' ? 'approuvée' : 
                        (variables.status === 'PENDING_REVIEW' ? 'soumise' : 
                        (variables.status === 'UNDER_REVIEW' ? 'mise en examen' : 
                        (variables.status === 'ENROLLED' ? 'inscrite' : 'rejetée')));
      toast.success(`Candidature ${actionWord} avec succès !`)
      queryClient.invalidateQueries({ queryKey: ['admissions'] })

      if (variables.status === 'ENROLLED') {
         queryClient.invalidateQueries({ queryKey: ['students'] })
         const appData = data?.data || data;
         setEnrolledStudent({
            firstName: appData.firstName,
            lastName: appData.lastName,
            email: appData.email,
            studentNumber: appData.studentNumber,
            password: `${appData.firstName.toLowerCase()}.${appData.studentNumber}`
         })
      } else if (variables.status === 'VALIDATED') {
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
    <div className="p-4">
      <MaintenanceZone 
        error={error} 
        reset={refetch} 
        zone="Flux des Admissions"
      />
    </div>
  )

  const admissionList = Array.isArray(admissions) ? admissions : (admissions?.content || [])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Copié dans le presse-papier !")
  }

  const SuccessModal = (
      <AnimatePresence>
        {enrolledStudent && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
             />
             <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md z-101 relative"
             >
                <GlassCard className="p-8 border-none ring-1 ring-emerald-500/30 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden text-center">
                   <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                   </div>
                   <h2 className="text-2xl font-black italic uppercase tracking-tight text-emerald-500 mb-2">Inscription Validée</h2>
                   <p className="text-sm font-medium text-muted-foreground italic mb-6">
                     Le compte étudiant a été généré avec succès.
                   </p>

                   <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-left space-y-4 mb-6">
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Identifiant (Email)</label>
                         <p className="font-bold text-sm tracking-wide mt-1">{enrolledStudent.email}</p>
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Matricule</label>
                         <p className="font-bold text-sm tracking-wide text-primary mt-1">{enrolledStudent.studentNumber}</p>
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                             <Key className="w-3.5 h-3.5" /> Mot de passe temporaire
                         </label>
                         <div className="flex gap-2 mt-1">
                             <div className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-black text-primary text-sm tracking-wider">
                                 {enrolledStudent.password}
                             </div>
                             <button 
                                 type="button" 
                                 onClick={() => copyToClipboard(enrolledStudent.password)}
                                 className="px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white transition-all"
                             >
                                 <Copy className="w-4 h-4" />
                             </button>
                         </div>
                      </div>
                   </div>

                   <button 
                      onClick={() => setEnrolledStudent(null)}
                      className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
                   >
                     Fermer et Retourner
                   </button>
                </GlassCard>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
  )

  if (admissionList.length === 0) return (
    <>
      {SuccessModal}
      <div className="p-20 text-center glass-card opacity-40 rounded-3xl border-(--glass-border)">
         <p className="text-sm font-black italic uppercase tracking-widest">Aucune candidature en attente de revue.</p>
      </div>
     
     {editingAdmission && (
       <EditUserModal 
          isOpen={!!editingAdmission}
          user={editingAdmission}
          onClose={() => setEditingAdmission(null)}
          onUpdateSuccess={() => queryClient.invalidateQueries({ queryKey: ['admissions'] })}
       />
     )}
    </>
  )

  const getStatusConfig = (status) => {
    switch (status) {
      case 'DRAFT': return { label: 'Brouillon', color: 'slate', icon: Clock, progress: 20 };
      case 'PENDING_REVIEW': return { label: 'En attente', color: 'blue', icon: Search, progress: 40 };
      case 'UNDER_REVIEW': return { label: 'Examen en cours', color: 'indigo', icon: Clock, progress: 60 };
      case 'VALIDATED': return { label: 'Approuvé', color: 'emerald', icon: CheckCircle, progress: 85 };
      case 'ENROLLED': return { label: 'Inscrit', color: 'purple', icon: GraduationCap, progress: 100 };
      case 'REJECTED': return { label: 'Rejeté', color: 'rose', icon: XCircle, progress: 0 };
      default: return { label: status || 'Inconnu', color: 'slate', icon: Clock, progress: 10 };
    }
  }

  return (
    <>
      {SuccessModal}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 px-1 pb-10">
        {admissionList.map((adm) => {
         const config = getStatusConfig(adm.status);
         const StatusIcon = config.icon;
         
         return (
           <motion.div 
             key={adm.id}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
           >
             <GlassCard className="p-6 flex flex-col justify-between h-full bg-white/60 dark:bg-slate-900/60 border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5 hover:ring-primary/30 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-5">
                     <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                           <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-lg font-black tracking-tight leading-none mb-1">
                             {adm.firstName} {adm.lastName}
                           </h3>
                           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                             REF: #{adm.applicationNumber || adm.id}
                           </p>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                         <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                        config.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
                        config.color === 'rose' ? "bg-rose-500/10 text-rose-500" :
                        config.color === 'blue' ? "bg-blue-500/10 text-blue-500" :
                        "bg-slate-500/10 text-slate-500"
                      )}>
                          {config.label}
                       </span>
                       <button 
                         onClick={() => setEditingAdmission(adm)}
                         className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                       >
                         <Edit2 className="w-3.5 h-3.5" />
                       </button>
                      </div>
                   </div>
                  <p className="text-[10px] font-medium text-muted-foreground opacity-80 mb-5">
                    Email: {adm.email} <br />
                    Date: {adm.createdAt ? format(new Date(adm.createdAt), 'dd MMMM yyyy', { locale: fr }) : 'Non précisée'}
                  </p>

                  <div className="space-y-2 mb-6">
                     <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest opacity-60">
                        <span>Avancement du dossier</span>
                        <span>{config.progress}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000",
                            config.color === 'emerald' ? "bg-emerald-500" :
                            config.color === 'rose' ? "bg-rose-500" :
                            "bg-primary"
                          )} 
                          style={{ width: `${config.progress}%` }}
                        />
                     </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto pt-4 border-t border-(--glass-border)">
                  {adm.status !== 'ENROLLED' && adm.status !== 'REJECTED' && (
                    <button 
                      onClick={() => {
                        let nextStatus = adm.status;
                        let reason = 'Action administrative';
                        if (adm.status === 'DRAFT') nextStatus = 'PENDING_REVIEW';
                        else if (adm.status === 'PENDING_REVIEW') nextStatus = 'UNDER_REVIEW';
                        else if (adm.status === 'UNDER_REVIEW') nextStatus = 'VALIDATED';
                        else if (adm.status === 'VALIDATED') nextStatus = 'ENROLLED';

                        if (nextStatus !== adm.status) {
                          statusMutation.mutate({ id: adm.id, status: nextStatus, reason })
                        }
                      }}
                      disabled={statusMutation.isPending}
                      className="flex-1 py-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                       <CheckCircle className="w-3.5 h-3.5" />
                       {adm.status === 'DRAFT' ? 'Soumettre' : 
                        (adm.status === 'PENDING_REVIEW' ? 'Examiner' : 
                        (adm.status === 'UNDER_REVIEW' ? 'Approuver' : 'Inscrire'))}
                    </button>
                  )}
                  {adm.status !== 'ENROLLED' && adm.status !== 'REJECTED' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: adm.id, status: 'REJECTED', reason: 'Dossier incomplet' })}
                      disabled={statusMutation.isPending}
                      className="flex-1 py-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                       <XCircle className="w-3.5 h-3.5" />
                       Rejeter
                    </button>
                  )}
                </div>
             </GlassCard>
           </motion.div>
         )
       })}
    </div>
    
    {editingAdmission && (
      <EditUserModal 
         isOpen={!!editingAdmission}
         user={editingAdmission}
         onClose={() => setEditingAdmission(null)}
         onUpdateSuccess={() => queryClient.invalidateQueries({ queryKey: ['admissions'] })}
      />
    )}
    </>
  )
}
