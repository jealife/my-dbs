'use client'

import { 
  Users, 
  UserCheck, 
  Calendar, 
  ClipboardList, 
  MessageSquare, 
  ArrowUpRight, 
  Plus, 
  Settings, 
  Activity, 
  Target,
  GraduationCap,
  Loader2,
  Clock,
  BookOpen
} from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/hooks/use-auth-hook'
import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/lib/course-service'
import { evaluationService } from '@/lib/evaluation-service'
import { planningService } from '@/lib/planning-service'
import { attendanceService } from '@/lib/attendance-service'
import Link from 'next/link'

export function TeacherDashboard({ user }) {
  const userId = user?.id || user?.userId

  // Fetch teacher courses
  const { data: myCourses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['teacher-courses', userId],
    queryFn: () => courseService.getTeacherCourses(userId),
    enabled: !!userId,
  })

  // Fetch evaluations
  const { data: evaluations = [], isLoading: loadingEvaluations } = useQuery({
    queryKey: ['teacher-evaluations'],
    queryFn: () => evaluationService.getAll({}),
  })

  // Fetch today's agenda
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString()
  
  const { data: agendaEvents = [], isLoading: loadingAgenda } = useQuery({
    queryKey: ['teacher-agenda', userId, todayStart, todayEnd],
    queryFn: () => planningService.getMyAgenda(userId, todayStart, todayEnd),
    enabled: !!userId,
  })

  // Calculate stats
  const totalStudents = myCourses.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0)
  const activeEvaluations = evaluations.filter(e => 
    e.status === 'SCHEDULED' || e.status === 'IN_PROGRESS'
  ).length
  
  // Get today's sessions
  const todaySessions = agendaEvents.filter(event => {
    const eventDate = new Date(event.startAt)
    return eventDate.toDateString() === today.toDateString()
  })

  const getSessionStatus = (session) => {
    const now = new Date()
    const start = new Date(session.startAt)
    const end = session.endAt ? new Date(session.endAt) : new Date(start.getTime() + 2 * 60 * 60 * 1000)
    
    if (now >= start && now <= end) return { label: 'En cours', color: 'text-emerald-500 bg-emerald-500/10' }
    if (now < start) return { label: 'À venir', color: 'text-amber-500 bg-amber-500/10' }
    return { label: 'Terminée', color: 'text-slate-400 bg-slate-400/10' }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-12 py-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            Portail <span className="text-primary italic">ENSEIGNANT</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">
            Bonne session de cours, Prof. {user?.last_name || user?.lastName}. Vous avez{' '}
            <span className="text-primary font-black uppercase">{todaySessions.length} session{todaySessions.length !== 1 ? 's' : ''}</span> aujourd'hui.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Link href="/exams">
            <button className="px-6 py-4 rounded-2xl glass-card border-(--glass-border) flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all active:scale-95">
               <Plus className="w-5 h-5 text-primary" />
               Créer Évaluation
            </button>
          </Link>
          <Link href="/agenda">
            <button className="px-6 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
               Appel / Présence
            </button>
          </Link>
        </div>
      </header>

      {/* Teacher Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Cours Attribués', 
            val: loadingCourses ? '...' : myCourses.length, 
            icon: BookOpen, 
            color: 'bg-indigo-500' 
          },
          { 
            label: 'Étudiants Totaux', 
            val: loadingCourses ? '...' : totalStudents, 
            icon: GraduationCap, 
            color: 'bg-emerald-500' 
          },
          { 
            label: 'Évaluations Actives', 
            val: loadingEvaluations ? '...' : activeEvaluations, 
            icon: ClipboardList, 
            color: 'bg-amber-500' 
          },
          { 
            label: "Sessions Aujourd'hui", 
            val: loadingAgenda ? '...' : todaySessions.length, 
            icon: Calendar, 
            color: 'bg-blue-500' 
          },
        ].map((item, i) => (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i}>
            <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none p-6 group">
               <div className="flex justify-between items-start mb-4">
                  <div className={`${item.color} p-3 rounded-2xl shadow-xl shadow-slate-900/5 group-hover:scale-110 transition-transform duration-500`}>
                     <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <Target className="w-4 h-4 text-muted-foreground opacity-20" />
               </div>
               <p className="text-2xl font-black tracking-tight">{item.val}</p>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">{item.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <GlassCard title="Sessions du jour" description="Votre emploi du temps de la journée." className="xl:col-span-2 shadow-none border-none ring-1 ring-(--glass-border)">
           <div className="space-y-4 pt-4">
              {loadingAgenda ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : todaySessions.length === 0 ? (
                <div className="text-center py-8 opacity-40">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm italic">Aucune session prévue aujourd'hui.</p>
                </div>
              ) : (
                todaySessions.map((session, idx) => {
                  const status = getSessionStatus(session)
                  return (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-(--glass-border) group">
                      <div className="w-16 flex flex-col items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-900 border border-(--glass-border) shadow-xl shadow-slate-900/5 group-hover:bg-primary group-hover:text-white transition-all">
                        <p className="text-[10px] font-black italic">{formatTime(session.startAt)}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[0.95rem]">{session.title || session.courseName || 'Session'}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                        </div>
                        <p className="text-xs font-semibold opacity-40 italic mt-0.5 uppercase tracking-tight">
                          {session.locationLabel || session.mode || ''}
                        </p>
                      </div>
                      <Link href="/agenda">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-primary hover:text-white transition-all text-[0.92rem] font-bold">
                          <UserCheck className="w-4 h-4" />
                          <span className="hidden sm:inline">Appel</span>
                        </button>
                      </Link>
                    </div>
                  )
                })
              )}
           </div>
        </GlassCard>

        <div className="space-y-8">
           <GlassCard title="Mes Cours" className="shadow-none border-none ring-1 ring-(--glass-border)">
              <div className="space-y-4 pt-4">
                  {loadingCourses ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : myCourses.length === 0 ? (
                    <p className="text-xs opacity-40 italic py-2">Aucun cours attribué.</p>
                  ) : (
                    myCourses.slice(0, 4).map((course, i) => (
                      <Link key={i} href={`/courses/${course.id || course.courseId}`}>
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-transparent hover:border-(--glass-border) transition-all cursor-pointer group">
                          <div className={`w-2 h-2 rounded-full ${course.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate tracking-tight">{course.name || course.title}</p>
                            <p className="text-[10px] opacity-40 font-semibold italic">{course.code} • {course.enrolledStudentsCount || 0} étudiants</p>
                          </div>
                          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all shadow-md active:scale-90">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                  {myCourses.length > 4 && (
                    <Link href="/courses" className="block text-center text-xs font-bold text-primary opacity-60 hover:opacity-100 transition-opacity pt-2">
                      Voir tous les cours ({myCourses.length})
                    </Link>
                  )}
              </div>
           </GlassCard>

           <GlassCard title="Évaluations Récentes" className="shadow-none border-none ring-1 ring-(--glass-border)">
              <div className="flex items-center gap-6 pt-2">
                 <div className="text-center">
                    <p className="text-3xl font-black text-amber-500">{loadingEvaluations ? '...' : activeEvaluations}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Actives</p>
                 </div>
                 <div className="h-10 w-px bg-(--glass-border) opacity-50" />
                 <div className="flex-1">
                    <div className="flex items-center gap-3">
                       <ClipboardList className="w-6 h-6 text-amber-500" />
                       <Link href="/exams" className="text-xs italic font-medium opacity-70 truncate line-clamp-1 hover:text-primary transition-colors">
                         Gérer les évaluations →
                       </Link>
                    </div>
                 </div>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  )
}