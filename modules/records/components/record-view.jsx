'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Calendar, AlertTriangle, CheckCircle, ArrowUpRight,
  FileText, Activity, Clock, SlidersHorizontal, UserX, Loader2,
  Download, X, Upload, BookOpen, Award, TrendingUp, ChevronDown, ChevronRight
} from 'lucide-react'
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
  PRESENT: 'Présent', ABSENT: 'Absent', LATE: 'Retard', EXCUSED: 'Excusé', REMOTE: 'À distance',
}
const ATTENDANCE_STATUS_COLORS = {
  PRESENT: 'text-emerald-500 bg-emerald-500/10',
  ABSENT: 'text-rose-500 bg-rose-500/10',
  LATE: 'text-amber-500 bg-amber-500/10',
  EXCUSED: 'text-blue-500 bg-blue-500/10',
  REMOTE: 'text-indigo-500 bg-indigo-500/10',
}

const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']

// ── Bulletin LMD ─────────────────────────────────────────────────────────────

function NoteCell({ value }) {
  if (value === null || value === undefined || value === '—') {
    return <span className="text-slate-400 text-xs">—</span>
  }
  const n = parseFloat(value)
  return (
    <span className={cn('font-bold text-sm', n >= 10 ? 'text-emerald-600' : 'text-rose-500')}>
      {typeof value === 'number' ? value.toFixed(2) : value}
    </span>
  )
}

function ResultBadge({ validated }) {
  return (
    <span className={cn(
      'px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest',
      validated ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'
    )}>
      {validated ? 'ADMIS' : 'AJOURNÉ'}
    </span>
  )
}

function UeSection({ ue, courses }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-2">
      {/* Ligne UE */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl text-left hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
      >
        {open ? <ChevronDown className="w-4 h-4 text-blue-600 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />}
        <span className="text-[11px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">
          {ue.ueCode && ue.ueCode !== '' ? `${ue.ueCode} : ` : ''}{ue.ueName}
        </span>
        <span className="ml-auto text-[10px] font-bold text-blue-500 opacity-60">{courses.length} matière{courses.length > 1 ? 's' : ''}</span>
      </button>

      {/* Cours de l'UE */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <table className="w-full text-left border-collapse mt-1">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest opacity-40 text-left w-[28%]">Matière</th>
                  <th className="px-2 py-2 text-[9px] font-black uppercase tracking-widest opacity-40 text-center">N1</th>
                  <th className="px-2 py-2 text-[9px] font-black uppercase tracking-widest opacity-40 text-center">N2</th>
                  <th className="px-2 py-2 text-[9px] font-black uppercase tracking-widest opacity-40 text-center">N3</th>
                  <th className="px-2 py-2 text-[9px] font-black uppercase tracking-widest opacity-40 text-center">Examen</th>
                  <th className="px-2 py-2 text-[9px] font-black uppercase tracking-widest opacity-40 text-center">Crédits</th>
                  <th className="px-2 py-2 text-[9px] font-black uppercase tracking-widest opacity-40 text-center">Acq.</th>
                  <th className="px-2 py-2 text-[9px] font-black uppercase tracking-widest opacity-40 text-center">Moy.</th>
                  <th className="px-2 py-2 text-[9px] font-black uppercase tracking-widest opacity-40 text-center">Résultat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {courses.map((book, i) => {
                  const items = book.items || []
                  const ccItems = items.filter(it => it.itemType === 'CONTINUOUS_ASSESSMENT')
                  const examItem = items.find(it => it.itemType === 'FINAL_EXAM' || it.itemType === 'EVALUATION')
                  const n1 = ccItems[0]?.scoreOn20
                  const n2 = ccItems[1]?.scoreOn20
                  const n3 = ccItems[2]?.scoreOn20
                  const exam = examItem?.scoreOn20
                  const credits = book.courseCredits || book.credits || 0
                  const creditsAcq = book.validated ? credits : 0
                  return (
                    <tr key={book.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-[0.88rem] font-bold tracking-tight truncate max-w-[200px]">
                          {book.courseTitle || `Cours #${book.courseId}`}
                        </p>
                        {book.courseCode && (
                          <p className="text-[9px] font-medium opacity-30 uppercase">{book.courseCode}</p>
                        )}
                      </td>
                      <td className="px-2 py-3 text-center"><NoteCell value={n1} /></td>
                      <td className="px-2 py-3 text-center"><NoteCell value={n2} /></td>
                      <td className="px-2 py-3 text-center"><NoteCell value={n3} /></td>
                      <td className="px-2 py-3 text-center"><NoteCell value={exam} /></td>
                      <td className="px-2 py-3 text-center">
                        <span className="text-xs font-bold text-slate-500">{credits}</span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className={cn('text-xs font-bold', creditsAcq > 0 ? 'text-emerald-600' : 'text-slate-400')}>
                          {creditsAcq}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <NoteCell value={book.weightedAverage} />
                      </td>
                      <td className="px-2 py-3 text-center">
                        <ResultBadge validated={book.validated} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LmdBulletinView({ bulletin }) {
  if (!bulletin) return null

  const ueGroups = bulletin.ueGroups || []
  const flatBooks = bulletin.gradeBooks || []

  // Grouper les cours plats par UE si ueGroups est vide
  const groups = ueGroups.length > 0 ? ueGroups : [{
    ueId: null, ueCode: '', ueName: 'Matières', semester: bulletin.semester, ueOrderIndex: 1,
    courses: flatBooks
  }]

  const avg = bulletin.generalAverage
  const passed = avg !== null && avg !== undefined && avg >= 10

  return (
    <div className="space-y-6">
      {/* Barre récapitulative */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-primary text-white relative overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Moyenne Générale</p>
          <p className="text-3xl font-black mt-1 tracking-tighter">
            {avg !== null && avg !== undefined ? Number(avg).toFixed(2) : '—'}
            <span className="text-sm opacity-60 ml-1">/20</span>
          </p>
          <TrendingUp className="absolute -right-3 -bottom-3 w-16 h-16 opacity-10" />
        </div>
        <div className="p-5 rounded-2xl glass-card border-(--glass-border)">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Crédits Acquis</p>
          <p className="text-2xl font-black mt-1 tracking-tight text-emerald-500">
            {bulletin.totalCreditsAcquired ?? '—'}
            <span className="text-xs opacity-50 ml-1">/ {bulletin.totalCreditsPossible ?? '—'}</span>
          </p>
        </div>
        <div className="p-5 rounded-2xl glass-card border-(--glass-border)">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Rang Promotion</p>
          <p className="text-2xl font-black mt-1 tracking-tight">
            {bulletin.rankInCohort ?? '—'}
            {bulletin.totalStudentsInCohort && <span className="text-xs opacity-40 ml-1">/ {bulletin.totalStudentsInCohort}</span>}
          </p>
        </div>
        <div className={cn('p-5 rounded-2xl', passed ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Résultat</p>
          <p className={cn('text-xl font-black mt-1 tracking-tight', passed ? 'text-emerald-600' : 'text-rose-500')}>
            {passed ? 'VALIDÉ' : 'AJOURNÉ'}
          </p>
          {bulletin.councilDecision && (
            <p className="text-[10px] mt-1 opacity-60 font-bold">{bulletin.councilDecision}</p>
          )}
        </div>
      </div>

      {/* Tableau de notes par UE */}
      <GlassCard className="p-0 border-none ring-1 ring-(--glass-border) shadow-none overflow-hidden">
        <div className="px-6 py-4 border-b border-(--glass-border) flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-primary opacity-60" />
          <h3 className="text-[11px] font-black uppercase tracking-widest opacity-60">
            Relevé de Notes — Semestre {bulletin.semester}
          </h3>
        </div>
        <div className="overflow-x-auto p-4 space-y-3 min-w-[700px]">
          {groups.map((group, idx) => (
            <UeSection key={group.ueId || idx} ue={group} courses={group.courses || []} />
          ))}
        </div>

        {/* Pied bulletin */}
        <div className="px-6 py-4 border-t border-(--glass-border) bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Moyenne de Classe</p>
            <p className="text-sm font-black">
              {bulletin.classAverage !== null && bulletin.classAverage !== undefined
                ? Number(bulletin.classAverage).toFixed(2) : '—'} /20
            </p>
          </div>
          {bulletin.headTeacherComment && (
            <p className="text-xs italic opacity-60">Appréciation : {bulletin.headTeacherComment}</p>
          )}
        </div>
      </GlassCard>

      {/* Bouton téléchargement PDF */}
      {bulletin.id && (
        <div className="flex justify-end">
          <a
            href={`/api/v1/pdf/bulletins/${bulletin.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            Télécharger Bulletin PDF
          </a>
        </div>
      )}
    </div>
  )
}

// ── Vue principale ────────────────────────────────────────────────────────────

export function RecordModuleView() {
  const { isStudent, isTeacher, isAdmin, user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('attendance')
  const [activeSemester, setActiveSemester] = useState('S1')
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

  const { data: attendanceRecords = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', studentId],
    queryFn: () => attendanceService.getStudentAttendance(studentId),
    enabled: !!studentId,
  })

  const { data: attendanceStats, isLoading: loadingStats } = useQuery({
    queryKey: ['attendance-stats', studentId],
    queryFn: () => attendanceService.getStudentStats(studentId),
    enabled: !!studentId,
  })

  const { data: bulletin, isLoading: loadingBulletin } = useQuery({
    queryKey: ['bulletin', studentId, activeSemester],
    queryFn: () => gradesService.getStudentBulletin(studentId, { academicYearId: 1, semester: activeSemester }),
    enabled: !!studentId && activeTab === 'grades',
    retry: false,
  })

  const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length
  const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT').length
  const lateCount = attendanceRecords.filter(r => r.status === 'LATE').length
  const attendanceRate = attendanceStats?.attendanceRate
    || (attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 0)

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Suivi <span className="text-primary italic">RECORDS</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Absences, présences et bulletins de notes LMD.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a href={`/api/v1/pdf/transcripts/${studentId}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all">
            <FileText className="w-4.5 h-4.5" />
            Relevé Général PDF
          </a>
          {isStudent && (
            <button onClick={() => setShowJustify(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/30 active:scale-95 transition-all">
              <AlertTriangle className="w-5 h-5" />
              Justifier Absence
            </button>
          )}
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl premium-gradient text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Taux de Présence</p>
          <h3 className="text-4xl font-black mt-2 tracking-tighter italic">
            {loadingStats ? '—' : attendanceRate}<span className="text-xs opacity-60 ml-1">%</span>
          </h3>
          <div className="mt-8 flex gap-1">
            {[1,1,1,1,1,1,1, attendanceRate >= 80 ? 1 : 0].map((v, i) => (
              <div key={i} className={cn("flex-1 h-3 rounded-full", v ? 'bg-white' : 'bg-white/20')} />
            ))}
          </div>
          <Activity className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
        </div>

        <GlassCard className="p-8 border-none ring-1 ring-(--glass-border) shadow-none bg-rose-500/5 relative overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Absences Non-Justifiées</p>
          <h3 className="text-4xl font-black mt-2 tracking-tighter italic text-rose-500">
            {loadingAttendance ? '—' : String(absentCount).padStart(2, '0')}
          </h3>
          <div className="mt-8 flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-tight">
            <AlertTriangle className="w-4 h-4" />Seuil critique : 5 absences
          </div>
        </GlassCard>

        <GlassCard className="p-8 border-none ring-1 ring-(--glass-border) shadow-none bg-emerald-500/5 relative overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Crédits ECTS Validés</p>
          <h3 className="text-4xl font-black mt-2 tracking-tighter italic text-emerald-500">
            {attendanceStats?.ectsEarned ?? '—'} <span className="text-xs opacity-60">crédits</span>
          </h3>
          <div className="mt-8 flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-tight">
            <Award className="w-4 h-4" />Depuis le début d&apos;année
          </div>
        </GlassCard>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-4 px-2">
        {[
          { key: 'attendance', label: 'Présence & Absences' },
          { key: 'grades', label: 'Bulletins de Notes LMD' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
              activeTab === tab.key ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" : "glass-card hover:bg-primary/5 opacity-60 hover:opacity-100"
            )}
          >{tab.label}</button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'attendance' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2">
            <GlassCard className="p-0 border-none ring-1 ring-(--glass-border) shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-(--glass-border)">
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Matière / Session</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic hidden sm:table-cell">Date</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Statut</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic text-right">Justificatif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--glass-border)">
                    {loadingAttendance ? (
                      <tr><td colSpan={4} className="text-center py-20">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="text-xs font-black uppercase tracking-widest italic">Chargement...</p>
                        </div>
                      </td></tr>
                    ) : attendanceRecords.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-20 opacity-40">
                        <p className="text-sm font-black italic uppercase tracking-widest">Aucun enregistrement trouvé.</p>
                      </td></tr>
                    ) : attendanceRecords.map((record, i) => (
                      <tr key={record.id || i} className="group hover:bg-primary/2 transition-colors cursor-pointer">
                        <td className="px-6 py-5">
                          <p className="text-[0.92rem] font-bold tracking-tight">{record.courseName || `Session #${record.sessionId}`}</p>
                          <p className="text-[10px] font-medium opacity-40 uppercase tracking-widest">{record.teacherNote || '—'}</p>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

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
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 1, delay: i * 0.2 }} className={cn("h-full rounded-full", s.color)} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
            <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden">
              <h3 className="text-xl font-black italic">Conseil Académique</h3>
              <p className="text-sm font-medium mt-3 opacity-70">
                {attendanceRate >= 80
                  ? 'Votre taux de présence est excellent. Continuez ainsi pour valider votre semestre.'
                  : 'Attention : votre taux de présence est en dessous du seuil requis (80%).'}
              </p>
              <UserX className="absolute -right-6 -bottom-6 w-32 h-32 opacity-5 rotate-12" />
            </div>
          </div>
        </div>
      ) : (
        /* ── Tab Bulletins LMD ─────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* Sélecteur de semestre */}
          <div className="flex flex-wrap gap-3">
            {SEMESTERS.map(sem => (
              <button key={sem} onClick={() => setActiveSemester(sem)}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                  activeSemester === sem ? "bg-primary text-white shadow-lg shadow-primary/20" : "glass-card hover:bg-primary/5 opacity-50 hover:opacity-100"
                )}
              >{sem}</button>
            ))}
          </div>

          {loadingBulletin ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-40">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-xs font-black uppercase tracking-widest italic">Chargement du bulletin {activeSemester}...</p>
            </div>
          ) : bulletin ? (
            <LmdBulletinView bulletin={bulletin} />
          ) : (
            <div className="py-24 text-center glass-card opacity-40 rounded-3xl border-(--glass-border)">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm font-black italic uppercase tracking-widest">
                Aucun bulletin disponible pour le semestre {activeSemester}.
              </p>
              <p className="text-xs opacity-50 mt-2 font-medium">Le bulletin est généré après la saisie des notes par les enseignants.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal — Justifier Absence */}
      {showJustify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card border border-(--glass-border) rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black italic tracking-tight">Justifier une Absence</h2>
              <button onClick={() => { setShowJustify(false); setSelectedRecord(null) }} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Date de l&apos;absence</label>
                <input type="date" value={justifyForm.date} onChange={e => setJustifyForm({ ...justifyForm, date: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Motif</label>
                <textarea rows={4} placeholder="Expliquez la raison de votre absence..." value={justifyForm.reason}
                  onChange={e => setJustifyForm({ ...justifyForm, reason: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none resize-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Justificatif (PDF, image)</label>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setJustifyFile(e.target.files?.[0] || null)} className="hidden" />
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
              <button onClick={() => justifyMutation.mutate()}
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
