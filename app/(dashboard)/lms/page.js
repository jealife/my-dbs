'use client'

import { BookOpen, Plus, FileText, Loader2, Users, GraduationCap, LayoutGrid } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/lib/course-service'
import { useAuth } from '@/hooks/use-auth-hook'
import { cn } from '@/lib/utils'
import { MaintenanceZone } from '@/components/ui/maintenance-zone'

const COURSE_COLORS = [
  'border-blue-500',
  'border-purple-500',
  'border-amber-500',
  'border-emerald-500',
  'border-rose-500',
  'border-indigo-500',
]

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-600',
  DRAFT: 'bg-amber-500/10 text-amber-600',
  ARCHIVED: 'bg-slate-100 text-slate-500',
}

export default function LMSPage() {
  const { isAdmin, isTeacher } = useAuth()

  const { data: courses = [], isLoading, error, refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getCourses(),
  })

  if (error) {
    return (
      <div className="p-4">
        <MaintenanceZone error={error} reset={refetch} zone="Catalogue LMS" />
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between px-2 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black uppercase tracking-widest ring-1 ring-primary/20 italic">LMS - Système</div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">Catalogue des Cours</h1>
          <p className="text-muted-foreground mt-3 text-[0.95rem] font-medium font-serif italic max-w-xl">
            Explorez les programmes de formation, assignez les professeurs et suivez les crédits ECTS par académie.
          </p>
        </div>
        {(isAdmin || isTeacher) && (
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-black shadow-lg hover:shadow-primary/40 transition-all active:scale-95 group">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span>Nouveau Cours</span>
            </button>
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-40">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest italic">Chargement des cours...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-24 text-center glass-card opacity-40 rounded-3xl border-(--glass-border)">
          <LayoutGrid className="w-14 h-14 mx-auto mb-4 opacity-40" />
          <p className="text-sm font-black italic uppercase tracking-widest">Aucun cours disponible.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, idx) => (
            <motion.div
              key={course.id || idx}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.07 }}
            >
              <GlassCard
                className={cn(
                  'border-l-4 group hover:shadow-2xl transition-all h-full flex flex-col',
                  COURSE_COLORS[idx % COURSE_COLORS.length]
                )}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className={cn(
                    'text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full',
                    STATUS_STYLES[course.status] || STATUS_STYLES.DRAFT
                  )}>
                    {course.status || 'DRAFT'}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-extrabold text-xl tracking-tight mb-2 group-hover:text-primary transition-colors">
                    {course.name || course.title}
                  </h3>
                  <p className="text-sm font-bold opacity-60 italic mb-6">
                    {course.code || course.courseCode || `ID: ${course.id}`}
                  </p>

                  <div className="space-y-3">
                    {(course.teacherName || course.teacher) && (
                      <div className="flex items-center justify-between text-xs font-bold tracking-tight py-2 border-b border-(--glass-border)">
                        <span className="opacity-70 uppercase flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" /> Professeur
                        </span>
                        <span className="truncate max-w-[140px]">{course.teacherName || course.teacher}</span>
                      </div>
                    )}
                    {course.credits !== undefined && (
                      <div className="flex items-center justify-between text-xs font-bold tracking-tight py-2 border-b border-(--glass-border)">
                        <span className="opacity-70 uppercase">Crédits ECTS</span>
                        <span className="text-primary font-black">{course.credits}</span>
                      </div>
                    )}
                    {course.coefficient !== undefined && (
                      <div className="flex items-center justify-between text-xs font-bold tracking-tight py-2 border-b border-(--glass-border)">
                        <span className="opacity-70 uppercase">Coefficient</span>
                        <span className="font-black">{course.coefficient}</span>
                      </div>
                    )}
                    {course.enrolledCount !== undefined && (
                      <div className="flex items-center justify-between text-xs font-bold tracking-tight py-2 border-b border-(--glass-border)">
                        <span className="opacity-70 uppercase flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> Inscrits
                        </span>
                        <span className="font-black">{course.enrolledCount}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-(--glass-border)/20 hover:bg-primary hover:text-white rounded-xl transition-all active:scale-95">
                    Voir
                  </button>
                  {(isAdmin || isTeacher) && (
                    <button className="px-4 py-3 bg-(--glass-border)/20 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                      <FileText className="w-4 h-4 opacity-70" />
                    </button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
