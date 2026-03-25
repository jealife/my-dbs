'use client'

import { motion } from 'framer-motion'
import { Plus, Search, BookOpen, Clock, Users, PlayCircle, Star, TrendingUp, Layers, Loader2, Lock } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-hook'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/lib/course-service'
import { toast } from 'react-hot-toast'

const COURSE_LEVEL_COLORS = {
  BEGINNER: 'text-emerald-500 bg-emerald-500/10',
  INTERMEDIATE: 'text-amber-500 bg-amber-500/10',
  ADVANCED: 'text-rose-500 bg-rose-500/10',
}

const COURSE_LEVEL_LABELS = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
}

export function CourseModuleView() {
  const { isStudent, isTeacher, isAdmin, user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('catalog')
  const [searchTerm, setSearchTerm] = useState('')

  const userId = user?.id || user?.userId

  const { data: catalog = [], isLoading: loadingCatalog } = useQuery({
    queryKey: ['courses-catalog', searchTerm],
    queryFn: () => courseService.getCourses(searchTerm ? { search: searchTerm } : {}),
  })

  const { data: myCourses = [], isLoading: loadingMine } = useQuery({
    queryKey: ['my-courses', userId],
    queryFn: () => isTeacher
      ? courseService.getTeacherCourses(userId)
      : courseService.getMyCourses(userId),
    enabled: !!userId,
  })

  const enrollMutation = useMutation({
    mutationFn: courseService.enroll,
    onSuccess: () => {
      toast.success('Inscription réussie !')
      queryClient.invalidateQueries({ queryKey: ['my-courses', userId] })
    },
    onError: err => toast.error(`Erreur: ${err.message}`),
  })

  const enrolledIds = new Set(myCourses.map(c => c.id || c.courseId))
  const displayedCourses = activeTab === 'catalog' ? catalog : myCourses
  const isLoading = activeTab === 'catalog' ? loadingCatalog : loadingMine

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Espace <span className="text-primary italic">LMS & COURS</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Gestion des savoirs, contenus pédagogiques et progression.</p>
        </div>
        <div className="flex gap-4">
          {(isTeacher || isAdmin) ? (
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
              <Plus className="w-5 h-5" />
              Créer Nouveau Cours
            </button>
          ) : (
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all">
              <Clock className="w-4.5 h-4.5" />
              Historique Apprentissage
            </button>
          )}
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
        <div className="p-8 rounded-3xl bg-primary text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
          <h3 className="text-xl font-black italic">Catalogue Complet</h3>
          <p className="text-sm font-medium mt-2 opacity-80 max-w-xs line-clamp-2">
            {catalog.length > 0 ? `${catalog.length} cours disponibles dans votre catalogue.` : 'Chargement du catalogue en cours...'}
          </p>
          <div className="mt-8">
            <p className="text-3xl font-black italic">{loadingCatalog ? '—' : catalog.length}</p>
            <p className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Cours Disponibles</p>
          </div>
          <BookOpen className="absolute -right-6 -bottom-6 w-40 h-40 opacity-10 rotate-12" />
        </div>

        <div className="p-8 rounded-3xl glass-card border-(--glass-border) relative overflow-hidden group border-none ring-1 ring-(--glass-border)">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{isTeacher ? 'Mes Enseignements' : 'Mes Inscriptions'}</p>
          <p className="text-3xl font-black mt-2 tracking-tighter italic">{loadingMine ? '—' : myCourses.length}</p>
          <div className="mt-6 flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-tight">
            <TrendingUp className="w-4 h-4" />
            Cours actifs
          </div>
        </div>

        <div className="p-8 rounded-3xl glass-card border-(--glass-border) relative overflow-hidden group border-none ring-1 ring-(--glass-border)">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Inscrits</p>
          <p className="text-xl font-black mt-2 tracking-tight italic">
            {loadingMine ? '—' : myCourses.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0)}
          </p>
          <div className="mt-6 flex items-center gap-2 text-muted-foreground text-xs font-bold italic">
            <Users className="w-4 h-4" />
            Tous cours confondus
          </div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center justify-between gap-6 px-2">
        <div className="flex gap-4">
          {[
            { key: 'catalog', label: 'Catalogue Complet' },
            { key: 'mine', label: isStudent ? 'Mes Inscriptions' : isTeacher ? 'Mes Enseignements' : 'Affectations' },
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
        <div className="relative group max-w-sm w-full hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Rechercher un module, code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-xs uppercase outline-none"
          />
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest italic text-primary">Chargement des cours...</p>
        </div>
      ) : displayedCourses.length === 0 ? (
        <div className="py-20 text-center glass-card opacity-40 rounded-3xl border-(--glass-border)">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-black italic uppercase tracking-widest">
            {activeTab === 'mine' ? 'Aucun cours inscrit.' : 'Aucun cours trouvé.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-1">
          {displayedCourses.map((course, idx) => {
            const isEnrolled = enrolledIds.has(course.id)
            const progress = course.progressPercentage || course.completionRate || 0
            return (
              <motion.div key={course.id || idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <GlassCard className="relative overflow-hidden group border-none ring-1 ring-(--glass-border) hover:ring-primary/40 transition-all p-0">
                  <div className="h-40 w-full relative overflow-hidden">
                    <div className="absolute inset-0 premium-gradient opacity-80 z-10" />
                    <div className="absolute inset-0 flex items-center justify-center z-20 text-white transform rotate-3 scale-150 opacity-10 font-bold text-4xl italic group-hover:rotate-6 transition-all">{course.code || course.id}</div>
                    <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                      {COURSE_LEVEL_LABELS[course.level] || course.level || 'Cours'}
                    </div>
                    <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-primary transition-colors">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-xl font-black tracking-tighter truncate">{course.name || course.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1 italic">
                      {course.code} {course.teacherName ? `• ${course.teacherName}` : ''}
                    </p>
                    {course.enrolledStudentsCount !== undefined && (
                      <div className="flex items-center gap-2 mt-2 opacity-40">
                        <Users className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{course.enrolledStudentsCount} inscrits</span>
                      </div>
                    )}

                    {isEnrolled && (
                      <>
                        <div className="mt-8 flex items-center justify-between text-[11px] font-black uppercase italic tracking-widest opacity-60">
                          <span>Progression</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-primary rounded-full shadow-lg" />
                        </div>
                      </>
                    )}

                    <div className="mt-8 pt-6 border-t border-(--glass-border)">
                      {isEnrolled ? (
                        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest group-hover:shadow-xl group-hover:shadow-primary/30 transition-all active:scale-95">
                          <PlayCircle className="w-5 h-5" />
                          Reprendre
                        </button>
                      ) : (
                        <button
                          onClick={() => enrollMutation.mutate(course.id)}
                          disabled={enrollMutation.isPending}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl glass-card border-(--glass-border) hover:bg-primary hover:text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                        >
                          {enrollMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> S'inscrire</>}
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
