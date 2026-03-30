'use client'

import { motion } from 'framer-motion'
import { Plus, Search, Calendar, AlertTriangle, CheckCircle, ArrowUpRight, FileText, Activity, Clock, SlidersHorizontal, UserX, Loader2, Download, X, Upload } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-hook'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceService } from '@/lib/attendance-service'
import { gradesService } from '@/lib/grades-service'
import { formatDateFr } from '@/lib/api-helpers'
import { toast } from 'react-hot-toast'

const ATTENDANCE_STATUS_LABELS = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  LATE: 'Retard',
  EXCUSED: 'Excusé',
  REMOTE: 'À distance',
}

const ATTENDANCE_STATUS_COLORS = {
  PRESENT: 'text-emerald-500 bg-emerald-500/10',
  ABSENT: 'text-rose-500 bg-rose-500/10',
  LATE: 'text-amber-500 bg-amber-500/10',
  EXCUSED: 'text-blue-500 bg-blue-500/10',
  REMOTE: 'text-indigo-500 bg-indigo-500/10',
}

export function RecordModuleView() {
  const { isStudent, isTeacher, isAdmin, user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('attendance')
  const [showJustify, setShowJustify] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [justifyForm, setJustifyForm] = useState({ reason: '', date: '' })
  const [justifyFile, setJustifyFile] = useState(null)
  const fileRef = useRef(null)

  const studentId = user?.id || user?.userId

  const justifyMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('studentId', studentId)
      fd.append('attendanceRecordId', selectedRecord?.id || '')
      fd.append('reason', justifyForm.reason)
      fd.append('absenceDate', justifyForm.date)
      if (justifyFile) fd.append('file', justifyFile)
      return attendanceService.submitJustification(fd)
    },
    onSuccess: () => {
      toast.success('Justificatif soumis !')
      queryClient.invalidateQueries({ queryKey: ['attendance', studentId] })
      setShowJustify(false)
      setJustifyForm({ reason: '', date: '' })
      setJustifyFile(null)
      setSelectedRecord(null)
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  })

  const { data: attendanceRecords = [], isLoading: loadingAttendance, error: attendanceError } = useQuery({
    queryKey: ['attendance', studentId],
    queryFn: () => attendanceService.getStudentAttendance(studentId),
    enabled: !!studentId,
  })

  const { data: attendanceStats, isLoading: loadingStats } = useQuery({
    queryKey: ['attendance-stats', studentId],
    queryFn: () => attendanceService.getStudentStats(studentId),
    enabled: !!studentId,
  })

  const { data: gradeBooks = [], isLoading: loadingGrades } = useQuery({
    queryKey: ['grade-books', studentId],
    queryFn: () => gradesService.getStudentGradeBooks(studentId),
    enabled: !!studentId,
  })

  const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length
  const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT').length
  const lateCount = attendanceRecords.filter(r => r.status === 'LATE').length
  const attendanceRate = attendanceStats?.attendanceRate || (attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 0)

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Suivi <span className="text-primary italic">RECORDS</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Absences, retards et relevés de notes centralisés.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a href={`/api/v1/pdf/transcripts/${studentId}`} target="_blank" className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all">
            <FileText className="w-4.5 h-4.5" />
            Exporter Relevé PDF
          </a>
          {isStudent && (
            <button
              onClick={() => setShowJustify(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/30 active:scale-95 transition-all">
              <AlertTriangle className="w-5 h-5" />
              Justifier Absence
            </button>
          )}
        </div>
      </header>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl premium-gradient text-white shadow-2xl shadow-primary/30 relative overflow-hidden group border-none ring-1 ring-(--glass-border)">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Taux de Présence</p>
          <h3 className="text-4xl font-black mt-2 tracking-tighter italic">
            {loadingStats ? '—' : `${attendanceRate} `}
            <span className="text-xs opacity-60">%</span>
          </h3>
          <div className="mt-8 flex gap-1">
            {[1, 1, 1, 1, 1, 1, 1, attendanceRate >= 80 ? 1 : 0].map((v, i) => (
              <div key={i} className={cn("flex-1 h-3 rounded-full shadow-lg", v ? 'bg-white' : 'bg-white/20')} />
            ))}
          </div>
          <Activity className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
        </div>

        <GlassCard className="p-8 border-none ring-1 ring-(--glass-border) shadow-none bg-rose-500/5 relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Absences Non-Justifiées</p>
          <h3 className="text-4xl font-black mt-2 tracking-tighter italic text-rose-500">
            {loadingAttendance ? '—' : String(absentCount).padStart(2, '0')}
          </h3>
          <div className="mt-8 flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-tight">
            <AlertTriangle className="w-4 h-4" />
            Seuil critique : 5 absences
          </div>
        </GlassCard>

        <GlassCard className="p-8 border-none ring-1 ring-(--glass-border) shadow-none bg-emerald-500/5 relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Crédits ECTS Validés</p>
          <h3 className="text-4xl font-black mt-2 tracking-tighter italic text-emerald-500">
            {attendanceStats?.ectsEarned ?? '—'} <span className="text-xs opacity-60">crédits</span>
          </h3>
          <div className="mt-8 flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-tight">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Depuis le début d&apos;année
          </div>
        </GlassCard>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-6 px-2">
        <div className="flex gap-4">
          {[
            { key: 'attendance', label: 'Présence & Absences' },
            { key: 'grades', label: 'Relevés de Notes' },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                activeTab === tab.key ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" : "glass-card hover:bg-primary/5 opacity-60 hover:opacity-100"
              )}
            >{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main View */}
        <div className="xl:col-span-2 space-y-6">
          <GlassCard className="p-0 border-none ring-1 ring-(--glass-border) shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-(--glass-border)">
                    {activeTab === 'attendance' ? (
                      <>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Matière / Session</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic hidden sm:table-cell">Date</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Statut</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic text-right">Justificatif</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Cours</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic hidden sm:table-cell">Appréciation</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Moyenne</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--glass-border)">
                  {activeTab === 'attendance' ? (
                    loadingAttendance ? (
                      <tr><td colSpan={4} className="text-center py-20"><div className="flex flex-col items-center gap-4 opacity-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-xs font-black uppercase tracking-widest italic">Chargement présences...</p></div></td></tr>
                    ) : attendanceRecords.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-20 opacity-40"><p className="text-sm font-black italic uppercase tracking-widest">Aucun enregistrement trouvé.</p></td></tr>
                    ) : (
                      attendanceRecords.map((record, i) => (
                        <tr key={record.id || i} className="group hover:bg-primary/2 transition-colors cursor-pointer">
                          <td className="px-6 py-5">
                            <p className="text-[0.92rem] font-bold tracking-tight">{record.courseName || record.sessionId || `Session #${record.sessionId}`}</p>
                            <p className="text-[10px] font-medium opacity-40 uppercase tracking-widest">{record.teacherNote || record.note || '—'}</p>
                          </td>
                          <td className="px-6 py-5 hidden sm:table-cell">
                            <span className="text-[0.85rem] font-black italic opacity-60">{formatDateFr(record.recordedAt || record.createdAt)}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic", ATTENDANCE_STATUS_COLORS[record.status] || 'text-slate-400 bg-slate-400/10')}>
                              {ATTENDANCE_STATUS_LABELS[record.status] || record.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {record.status === 'ABSENT' ? (
                              <button
                                onClick={() => { setSelectedRecord(record); setJustifyForm({ reason: '', date: record.recordedAt?.split('T')[0] || '' }); setShowJustify(true) }}
                                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-(--glass-border) hover:bg-amber-500/10 transition-all text-[0.85rem] font-black opacity-60 italic group-hover:opacity-100 uppercase tracking-tighter">
                                Justifier
                              </button>
                            ) : <CheckCircle className="inline-block w-5 h-5 text-emerald-500/30" />}
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    loadingGrades ? (
                      <tr><td colSpan={3} className="text-center py-20"><div className="flex flex-col items-center gap-4 opacity-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-xs font-black uppercase tracking-widest italic">Chargement notes...</p></div></td></tr>
                    ) : gradeBooks.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-20 opacity-40"><p className="text-sm font-black italic uppercase tracking-widest">Aucun relevé de notes trouvé.</p></td></tr>
                    ) : (
                      gradeBooks.map((book, i) => (
                        <tr key={book.id || i} className="group hover:bg-primary/2 transition-colors cursor-pointer">
                          <td className="px-6 py-5">
                            <p className="text-[0.92rem] font-bold tracking-tight">{book.courseName || `Cours #${book.courseId}`}</p>
                            <p className="text-[10px] font-medium opacity-40 uppercase tracking-widest">{book.academicYearName || ''}</p>
                          </td>
                          <td className="px-6 py-5 hidden sm:table-cell">
                            <span className="text-[0.85rem] font-black italic opacity-60">{book.teacherAppreciation || '—'}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn("text-xl font-black italic tracking-tighter", book.average >= 10 ? 'text-emerald-500' : 'text-rose-500')}>
                              {book.average !== null && book.average !== undefined ? Number(book.average).toFixed(2) : '—'}
                              <span className="text-xs opacity-60 ml-1">/20</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Stats */}
        <div className="xl:col-span-1 space-y-8">
          <GlassCard title="Synthèse Annuelle" className="border-none ring-1 ring-(--glass-border) shadow-none">
            <div className="pt-6 space-y-6">
              {[
                { label: 'Présences', val: presentCount, pct: attendanceRecords.length > 0 ? Math.round(presentCount / attendanceRecords.length * 100) : 0, color: 'bg-emerald-500' },
                { label: 'Absences', val: absentCount, pct: attendanceRecords.length > 0 ? Math.round(absentCount / attendanceRecords.length * 100) : 0, color: 'bg-rose-500' },
                { label: 'Retards', val: lateCount, pct: attendanceRecords.length > 0 ? Math.round(lateCount / attendanceRecords.length * 100) : 0, color: 'bg-amber-500' },
              ].map((s, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between text-[11px] font-black uppercase italic tracking-widest opacity-60">
                    <span>{s.label} ({s.val})</span>
                    <span>{s.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 1, delay: i * 0.2 }} className={cn("h-full rounded-full shadow-lg", s.color)} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
            <h3 className="text-xl font-black italic">Conseil Académique</h3>
            <p className="text-sm font-medium mt-3 opacity-70">
              {attendanceRate >= 80
                ? 'Votre taux de présence est excellent. Continuez ainsi pour valider votre semestre.'
                : 'Attention : votre taux de présence est en dessous du seuil requis (80%). Prenez contact avec votre responsable pédagogique.'}
            </p>
            <UserX className="absolute -right-6 -bottom-6 w-32 h-32 opacity-5 rotate-12" />
          </div>
        </div>
      </div>

      {/* Modal — Justifier Absence */}
      {showJustify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card border border-(--glass-border) rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black italic tracking-tight">Justifier une Absence</h2>
              <button onClick={() => { setShowJustify(false); setSelectedRecord(null) }} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Date de l&apos;absence</label>
                <input type="date" value={justifyForm.date}
                  onChange={e => setJustifyForm({ ...justifyForm, date: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Motif</label>
                <textarea rows={4} placeholder="Expliquez la raison de votre absence..."
                  value={justifyForm.reason}
                  onChange={e => setJustifyForm({ ...justifyForm, reason: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none resize-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Justificatif (PDF, image)</label>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setJustifyFile(e.target.files?.[0] || null)}
                  className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-dashed border-(--glass-border) hover:border-primary/50 text-sm font-medium text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  {justifyFile ? justifyFile.name : 'Joindre un fichier'}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowJustify(false); setSelectedRecord(null) }}
                className="flex-1 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/30 transition-all">
                Annuler
              </button>
              <button
                onClick={() => justifyMutation.mutate()}
                disabled={!justifyForm.reason || !justifyForm.date || justifyMutation.isPending}
                className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {justifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Soumettre
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
