'use client'

import { 
  GraduationCap, 
  BookOpen, 
  ClipboardList, 
  Calendar, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  Award, 
  Star,
  Loader2,
  FileText
} from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/hooks/use-auth-hook'
import { useStudentId } from '@/hooks/use-student-id'
import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/lib/course-service'
import { gradesService } from '@/lib/grades-service'
import { planningService } from '@/lib/planning-service'
import { evaluationService } from '@/lib/evaluation-service'
import { attendanceService } from '@/lib/attendance-service'
import Link from 'next/link'

export function StudentDashboard({ user }) {
  const userId = user?.id || user?.userId
  const studentId = useStudentId()

  // Fetch enrolled courses
  const { data: myCourses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['my-courses', userId],
    queryFn: () => courseService.getMyCourses(userId),
    enabled: !!userId,
  })

  // Fetch grade books
  const { data: gradeBooks = [], isLoading: loadingGrades } = useQuery({
    queryKey: ['student-grades', studentId],
    queryFn: () => gradesService.getStudentGradeBooks(studentId),
    enabled: !!studentId,
  })

  // Fetch today's agenda
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString()
  
  const { data: agendaEvents = [], isLoading: loadingAgenda } = useQuery({
    queryKey: ['student-agenda', userId, todayStart, todayEnd],
    queryFn: () => planningService.getMyAgenda(userId, todayStart, todayEnd),
    enabled: !!userId,
  })

  // Fetch upcoming evaluations
  const { data: evaluations = [], isLoading: loadingEvaluations } = useQuery({
    queryKey: ['student-evaluations'],
    queryFn: () => evaluationService.getAll({}),
  })

  // Fetch attendance stats
  const { data: attendanceStats, isLoading: loadingAttendance } = useQuery({
    queryKey: ['student-attendance-stats', studentId],
    queryFn: () => attendanceService.getStudentStats(studentId),
    enabled: !!studentId,
  })

  // Calculate average grade
  const calculateAverage = () => {
    if (!gradeBooks || gradeBooks.length === 0) return null
    const validGrades = gradeBooks.filter(g => g.averageGrade || g.finalGrade)
    if (validGrades.length === 0) return null
    const sum = validGrades.reduce((acc, g) => acc + (g.averageGrade || g.finalGrade || 0), 0)
    return (sum / validGrades.length).toFixed(1)
  }

  const averageGrade = calculateAverage()

  // Get today's courses
  const todayCourses = agendaEvents.filter(event => {
    const eventDate = new Date(event.startAt)
    return eventDate.toDateString() === today.toDateString()
  })

  // Get upcoming evaluations (scheduled)
  const upcomingEvaluations = evaluations
    .filter(e => e.status === 'SCHEDULED')
    .slice(0, 3)

  // Calculate progress
  const totalCourses = myCourses.length
  const academicProgress = attendanceStats?.attendanceRate 
    ? Math.round(attendanceStats.attendanceRate) 
    : (totalCourses > 0 ? Math.round((gradeBooks.filter(g => g.averageGrade && g.averageGrade >= 10).length / totalCourses) * 100) : 0)

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatEvaluationDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
    if (date.toDateString() === tomorrow.toDateString()) return 'Demain'
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="space-y-12 py-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic">
              Hello, <span className="text-primary italic">{user?.first_name || user?.firstName || 'Étudiant'}</span>
            </h1>
            <p className="text-muted-foreground mt-1 font-medium italic opacity-60">
              Prêt pour vos cours d'aujourd'hui ? Réussite académique :{' '}
              <span className="text-primary font-black uppercase tracking-widest">{academicProgress}%</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Link href="/records">
            <button className="px-6 py-3 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border)">
              Mon Bulletin
            </button>
          </Link>
          <Link href="/courses">
            <button className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
              Inscriptions
            </button>
          </Link>
        </div>
      </header>

      {/* Student Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="glass-card border-none ring-1 ring-(--glass-border) shadow-none p-6 relative group overflow-hidden">
           <div className="flex gap-4 items-center mb-6">
             <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <BookOpen className="w-6 h-6" />
             </div>
             <div>
                <p className="text-2xl font-black">{loadingCourses ? '...' : totalCourses}</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Cours Actifs</p>
             </div>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center text-[11px] font-black uppercase italic tracking-widest opacity-60">
                 <span>Progression Semestre</span>
                 <span>{academicProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: `${academicProgress}%` }} className="h-full bg-indigo-500 rounded-full shadow-lg" />
              </div>
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
        </GlassCard>

        <GlassCard className="glass-card border-none ring-1 ring-(--glass-border) shadow-none p-6 relative group overflow-hidden">
           <div className="flex gap-4 items-center mb-6">
             <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                <Star className="w-6 h-6" />
             </div>
             <div>
                <p className="text-2xl font-black">{loadingGrades ? '...' : (averageGrade || '—')}</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Moyenne Générale</p>
             </div>
           </div>
           <div className="flex gap-2">
              {[1, 1, 1, averageGrade && averageGrade >= 14 ? 1 : 0.5, averageGrade && averageGrade >= 16 ? 1 : 0].map((s, i) => (
                <Star key={i} className={`w-4 h-4 ${s === 1 ? 'fill-amber-500 text-amber-500' : 'text-amber-500'}`} />
              ))}
           </div>
           <p className="text-xs font-bold italic mt-4 opacity-70">
            {averageGrade && parseFloat(averageGrade) >= 14 ? 'Excellent travail !' : averageGrade ? 'Continuez vos efforts !' : 'En attente de notes'}
           </p>
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-amber-500/10 transition-colors" />
        </GlassCard>

        <GlassCard className="glass-card border-none ring-1 ring-(--glass-border) shadow-none p-6 relative group overflow-hidden">
           <div className="flex gap-4 items-center mb-6">
             <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <ClipboardList className="w-6 h-6" />
             </div>
             <div>
                <p className="text-2xl font-black">{loadingEvaluations ? '...' : upcomingEvaluations.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Examens à venir</p>
             </div>
           </div>
           {upcomingEvaluations.length > 0 ? (
             <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <Clock className="w-4 h-4 text-emerald-500" />
                <p className="text-[10px] font-black uppercase tracking-tight text-emerald-600">
                  Prochain : {upcomingEvaluations[0].title || upcomingEvaluations[0].courseName} ({formatEvaluationDate(upcomingEvaluations[0].scheduledAt)})
                </p>
             </div>
           ) : (
             <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-(--glass-border)">
                <Clock className="w-4 h-4 opacity-40" />
                <p className="text-[10px] font-black uppercase tracking-tight opacity-40">Aucun examen prévu</p>
             </div>
           )}
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <GlassCard title="Cours du jour" description="Votre emploi du temps personnalisé pour aujourd'hui." className="shadow-none border-none ring-1 ring-(--glass-border)">
           <div className="space-y-6 pt-6">
              {loadingAgenda ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : todayCourses.length === 0 ? (
                <div className="text-center py-8 opacity-40">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm italic">Aucun cours prévu aujourd'hui.</p>
                </div>
              ) : (
                todayCourses.map((course, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-(--glass-border) group">
                    <div className="flex flex-col items-center justify-center p-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-(--glass-border) shadow-xl shadow-slate-900/5 group-hover:bg-primary group-hover:text-white transition-all">
                      <p className="text-sm font-black italic">{formatTime(course.startAt)}</p>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[0.95rem]">{course.title || course.courseName || 'Cours'}</h4>
                      <p className="text-xs font-semibold opacity-40 italic mt-0.5">
                        {course.locationLabel || course.mode || ''} {course.instructorName ? `• ${course.instructorName}` : ''}
                      </p>
                    </div>
                    <Link href={`/courses/${course.courseId || course.id}`}>
                      <button className="p-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                        <ArrowUpRight className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </button>
                    </Link>
                  </div>
                ))
              )}
           </div>
        </GlassCard>

        <div className="space-y-8">
           <GlassCard title="Ressources Récentes" className="shadow-none border-none ring-1 ring-(--glass-border)">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                 {loadingCourses ? (
                   <div className="col-span-2 flex items-center justify-center py-4">
                     <Loader2 className="w-6 h-6 animate-spin text-primary" />
                   </div>
                 ) : myCourses.length === 0 ? (
                   <p className="col-span-2 text-xs opacity-40 italic py-2">Aucune ressource disponible.</p>
                 ) : (
                   myCourses.slice(0, 4).map((course, i) => (
                     <Link key={i} href={`/courses/${course.id || course.courseId}`}>
                       <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-(--glass-border) flex items-center gap-4 hover:border-primary/50 transition-all cursor-pointer group">
                          <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center text-white font-black text-[10px]">{course.code?.slice(0, 2) || 'CR'}</div>
                          <div className="flex-1 min-w-0">
                             <p className="text-xs font-bold truncate">{course.name || course.title}</p>
                             <p className="text-[10px] opacity-40">{course.code}</p>
                          </div>
                       </div>
                     </Link>
                   ))
                 )}
              </div>
           </GlassCard>

           <div className="p-8 rounded-3xl bg-primary text-white shadow-2xl shadow-primary/30 relative overflow-hidden group cursor-pointer">
              <h3 className="text-xl font-black italic">Besoin d'aide ?</h3>
              <p className="text-sm font-medium mt-2 opacity-80 max-w-xs">Contactez un mentor ou posez votre question à l'assistance académique.</p>
              <Link href="/mentoring">
                <button className="mt-6 px-6 py-3 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl group-hover:scale-105 transition-transform active:scale-95">
                   Ouvrir un ticket
                </button>
              </Link>
              <Calendar className="absolute right-[-20px] bottom-[-20px] w-40 h-40 opacity-10 rotate-12" />
           </div>
        </div>
      </div>
    </div>
  )
}