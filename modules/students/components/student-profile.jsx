'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Calendar, GraduationCap, 
  BookOpen, ClipboardList, FileText, ChevronRight, 
  ArrowLeft, Edit2, Trash2, Key, Star, Clock, 
  Activity, AlertTriangle, CheckCircle, Download,
  MoreVertical, Shield
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/lib/user-service'
import { attendanceService } from '@/lib/attendance-service'
import { gradesService } from '@/lib/grades-service'
import { formatPhotoUrl, formatDateFr } from '@/lib/api-helpers'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { EditUserModal } from '@/modules/users/components/edit-user-modal'

export function StudentProfileView({ studentId }) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // 1. Fetch Student Core Data
  const { data: student, isLoading: loadingStudent, error: studentError } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => userService.getStudentById(studentId),
    enabled: !!studentId,
  })

  // 2. Fetch Academics (Grades)
  const { data: gradeBooks = [], isLoading: loadingGrades } = useQuery({
    queryKey: ['grade-books', studentId],
    queryFn: () => gradesService.getStudentGradeBooks(studentId),
    enabled: !!studentId,
  })

  // 3. Fetch Attendance
  const { data: attendance = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', studentId],
    queryFn: () => attendanceService.getStudentAttendance(studentId),
    enabled: !!studentId,
  })

  // 4. Send Credentials Mutation
  const sendCredsMutation = useMutation({
    mutationFn: (email) => userService.sendCredentials(email),
    onSuccess: () => toast.success('Identifiants envoyés à l&apos;étudiant.'),
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  })

  if (loadingStudent) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest italic">Chargement du dossier...</p>
      </div>
    )
  }

  if (studentError || !student) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-black italic">Étudiant Introuvable</h2>
        <p className="text-muted-foreground italic">Le dossier demandé n&apos;existe pas ou a été archivé.</p>
        <Link href="/students" className="inline-flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest mt-4">
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;annuaire
        </Link>
      </div>
    )
  }

  const fullName = `${student.firstName || student.first_name || ''} ${student.lastName || student.last_name || ''}`
  const photo = formatPhotoUrl(student.photoUrl || student.photo_url)
  const averageGPA = gradeBooks.length > 0 
    ? (gradeBooks.reduce((acc, b) => acc + (b.average || 0), 0) / gradeBooks.length).toFixed(2)
    : '—'
  
  const presentCount = attendance.filter(r => r.status === 'PRESENT').length
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Top Navigation / Breadcrumbs */}
      <div className="flex items-center justify-between px-2">
        <Link href="/students" className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Retour Annuaire</span>
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="p-2.5 rounded-xl glass-card border-(--glass-border) hover:text-primary transition-all"
          >
            <Edit2 className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => sendCredsMutation.mutate(student.email)}
            disabled={sendCredsMutation.isPending}
            className="p-2.5 rounded-xl glass-card border-(--glass-border) hover:text-indigo-500 transition-all"
          >
            <Key className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <GlassCard className="p-8 border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5 overflow-hidden relative">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          {/* Large Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] premium-gradient p-1 shadow-2xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-full rounded-[2.2rem] bg-white dark:bg-slate-950 overflow-hidden">
                {photo 
                  ? <img src={photo} alt={fullName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl font-black italic opacity-40 uppercase">
                      {(student.firstName || 'S')[0]}
                    </div>
                }
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-emerald-500 text-white shadow-lg border-4 border-white dark:border-slate-950">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
              <h1 className="text-4xl font-black tracking-tighter italic">{fullName}</h1>
              <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest italic">
                {student.status || 'Actif'}
              </span>
            </div>
            <p className="text-lg font-bold opacity-60 italic mb-6">
              {student.program?.name || student.programName || student.level || 'Non assigné'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400"><Mail className="w-4 h-4" /></div>
                <div className="min-w-0"><p className="text-[10px] font-black uppercase opacity-40">Email</p><p className="text-xs font-bold truncate">{student.email}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400"><Phone className="w-4 h-4" /></div>
                <div className="min-w-0"><p className="text-[10px] font-black uppercase opacity-40">Téléphone</p><p className="text-xs font-bold">{student.phoneNumber || '—'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400"><Calendar className="w-4 h-4" /></div>
                <div className="min-w-0"><p className="text-[10px] font-black uppercase opacity-40">Depuis le</p><p className="text-xs font-bold">{formatDateFr(student.createdAt)}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400"><Shield className="w-4 h-4" /></div>
                <div className="min-w-0"><p className="text-[10px] font-black uppercase opacity-40">Matricule</p><p className="text-xs font-black text-primary">#{student.userCode || student.studentNumber}</p></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-5 pointer-events-none">
          <GraduationCap className="w-80 h-80 -mr-20" />
        </div>
      </GlassCard>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-1 space-y-4">
          {[
            { id: 'overview', label: 'Vue d&apos;ensemble', icon: Activity },
            { id: 'academic', label: 'Notes & Crédits', icon: BookOpen },
            { id: 'attendance', label: 'Suivi Présence', icon: ClipboardList },
            { id: 'documents', label: 'Documents GED', icon: FileText },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all text-left",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-xl shadow-primary/30 translate-x-2" 
                  : "glass-card border-(--glass-border) opacity-60 hover:opacity-100 hover:bg-primary/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          
          <div className="mt-8 p-6 rounded-4xl bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
            <h4 className="text-lg font-black italic">Actions Rapides</h4>
            <div className="mt-6 space-y-3">
              <button className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-black uppercase transition-all">Générer Bulletin</button>
              <button className="w-full py-3 rounded-2xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white text-xs font-black uppercase transition-all">Archiver Dossier</button>
            </div>
            <Shield className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10" />
          </div>
        </div>

        <div className="xl:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <GlassCard className="p-6 bg-emerald-500/5 ring-emerald-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Moyenne Générale</p>
                    <div className="flex items-end gap-2">
                      <h3 className={cn("text-4xl font-black italic tracking-tighter", Number(averageGPA) >= 10 ? 'text-emerald-500' : 'text-rose-500')}>
                        {averageGPA}
                      </h3>
                      <span className="text-xs opacity-60 font-bold mb-1">/ 20</span>
                    </div>
                  </GlassCard>
                  <GlassCard className="p-6 bg-indigo-500/5 ring-indigo-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Taux Assiduité</p>
                    <div className="flex items-end gap-2 text-indigo-500">
                      <h3 className="text-4xl font-black italic tracking-tighter">{attendanceRate}%</h3>
                      <span className="text-[10px] font-bold opacity-60 mb-1">Dossier Complet</span>
                    </div>
                  </GlassCard>
                  <GlassCard className="p-6 bg-amber-500/5 ring-amber-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Crédits ECTS</p>
                    <div className="flex items-end gap-2 text-amber-600">
                      <h3 className="text-4xl font-black italic tracking-tighter">42</h3>
                      <span className="text-xs opacity-60 font-bold mb-1">/ 60</span>
                    </div>
                  </GlassCard>
                </div>

                <GlassCard title="Graphique de Performance" className="h-64 border-none ring-1 ring-(--glass-border) flex items-center justify-center italic opacity-30">
                  Visualisation des données bientôt disponible...
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest italic opacity-60 px-2">Dernières Notes</h4>
                    {gradeBooks.slice(0, 3).map((book, i) => (
                      <div key={i} className="flex items-center justify-between p-5 rounded-4xl glass-card border-(--glass-border)">
                        <div>
                          <p className="text-[0.9rem] font-bold truncate max-w-[150px]">{book.courseName || `Cours #${book.courseId}`}</p>
                          <p className="text-[10px] font-black opacity-40 uppercase tracking-tighter">{book.academicYearName}</p>
                        </div>
                        <div className={cn("text-lg font-black italic", book.average >= 10 ? 'text-emerald-500' : 'text-rose-500')}>
                          {book.average?.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest italic opacity-60 px-2">Présences Récentes</h4>
                    {attendance.slice(0, 3).map((record, i) => (
                      <div key={i} className="flex items-center justify-between p-5 rounded-4xl glass-card border-(--glass-border)">
                        <div>
                          <p className="text-[0.9rem] font-bold truncate max-w-[150px]">{record.courseName || 'Cours'}</p>
                          <p className="text-[10px] font-black opacity-40 uppercase tracking-tighter">{formatDateFr(record.recordedAt)}</p>
                        </div>
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase",
                          record.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        )}>
                          {record.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'academic' && (
              <motion.div key="academic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <GlassCard className="p-0 border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-(--glass-border)">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 italic">Matière / Unité</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 italic">Moyenne</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 italic">Appréciation</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 italic text-right">Crédits</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--glass-border)">
                        {gradeBooks.length === 0 ? (
                          <tr><td colSpan={4} className="py-20 text-center opacity-40 text-xs italic font-black uppercase">Aucun relevé disponible</td></tr>
                        ) : gradeBooks.map((book, i) => (
                          <tr key={i} className="group hover:bg-primary/2 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><BookOpen className="w-5 h-5" /></div>
                                <div><p className="font-bold text-[0.95rem]">{book.courseName || `Cours #${book.courseId}`}</p><p className="text-[10px] font-black opacity-40 uppercase">{book.academicYearName}</p></div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className={cn("text-xl font-black italic", book.average >= 10 ? 'text-emerald-500' : 'text-rose-500')}>
                                {book.average?.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-sm font-medium opacity-60 italic">{book.teacherAppreciation || 'Pas d&apos;appréciation.'}</td>
                            <td className="px-8 py-6 text-right font-black italic opacity-40">{book.ects || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'attendance' && (
              <motion.div key="attendance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <GlassCard className="p-0 border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5 overflow-hidden">
                   <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-(--glass-border)">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 italic">Session</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 italic">Date / Heure</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 italic">Statut</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 italic text-right">Justificatif</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--glass-border)">
                        {attendance.length === 0 ? (
                          <tr><td colSpan={4} className="py-20 text-center opacity-40 text-xs italic font-black uppercase">Aucune donnée de présence</td></tr>
                        ) : attendance.map((rec, i) => (
                          <tr key={i} className="group hover:bg-primary/2 transition-colors">
                            <td className="px-8 py-6">
                              <p className="font-bold text-[0.95rem]">{rec.courseName || `Session #${rec.sessionId}`}</p>
                              <p className="text-[10px] font-black opacity-40 uppercase truncate">{rec.teacherNote || rec.note || '—'}</p>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-sm font-bold opacity-60">{formatDateFr(rec.recordedAt)}</p>
                            </td>
                            <td className="px-8 py-6">
                              <span className={cn(
                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest",
                                rec.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                              )}>
                                {rec.status}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <button className="p-2 rounded-xl glass-card border-(--glass-border) hover:text-primary opacity-50"><Download className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div key="documents" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fallback pattern for GED docs */}
                {[
                  { title: 'Diplôme Baccalauréat', type: 'DIPLOMA', date: 'Juillet 2023' },
                  { title: 'Relevé Semestre 1', type: 'TRANSCRIPT', date: 'Février 2024' },
                  { title: 'Contrat d&apos;Apprentissage', type: 'CONTRACT', date: 'Septembre 2023' },
                ].map((doc, i) => (
                  <GlassCard key={i} className="p-6 border-none ring-1 ring-(--glass-border) hover:shadow-2xl transition-all cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <FileText className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-[0.95rem] truncate">{doc.title}</h4>
                        <div className="flex items-center gap-3 mt-1 opacity-40 text-[10px] font-black uppercase tracking-widest italic">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.date}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-primary transition-all"><Download className="w-4 h-4" /></button>
                        <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isEditModalOpen && (
        <EditUserModal 
          isOpen={isEditModalOpen}
          user={student}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['student', studentId] })
            setIsEditModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
