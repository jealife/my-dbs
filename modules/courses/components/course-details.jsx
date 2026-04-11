'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Clock, FileText, ArrowLeft, ChevronDown, ChevronRight,
  Download, ExternalLink, Play, Video, Globe, MapPin, Calendar,
  Target, BarChart2, Eye, EyeOff, Archive, Layers, GraduationCap,
  Award, BookMarked, CheckCircle, Circle, UserPlus, Loader2, X, Upload,
  School, Users2
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/lib/course-service'
import { useAuth } from '@/hooks/use-auth-hook'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { Trash2, Plus } from 'lucide-react'

function ModuleAccordion({ module, isStudent, canManage, courseId, onCreateLesson, onDeleteLesson, onDeleteModule }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['lessons', module.id],
    queryFn: () => courseService.getLessonsForModule(module.id),
    enabled: open,
  })

  const { data: progress } = useQuery({
    queryKey: ['course-progress', courseId, user?.id],
    queryFn: () => courseService.getProgress(courseId, user?.id),
    enabled: !!courseId && isStudent && open,
  })

  const markCompleteMutation = useMutation({
    mutationFn: (lessonId) => courseService.markLessonComplete(courseId, lessonId, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId, user?.id] })
      toast.success('Leçon marquée comme terminée')
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur'),
  })

  const completedLessons = progress?.completedLessons || []
  const minutes = module.estimatedMinutes || 0
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const durationLabel = hours > 0 ? `${hours}h${mins > 0 ? mins + 'min' : ''}` : mins > 0 ? `${mins}min` : null

  const isLessonCompleted = (lessonId) => completedLessons.includes(lessonId)

  return (
    <GlassCard className="border-none ring-1 ring-(--glass-border) overflow-hidden transition-all">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-primary/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="text-xs font-black">{module.displayOrder ?? '—'}</span>
          </div>
          <div className="text-left">
            <h4 className="font-black text-sm tracking-tight">{module.title}</h4>
            {module.description && (
              <p className="text-[11px] opacity-50 mt-0.5 line-clamp-1">{module.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {canManage && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteModule(module.id) }}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 opacity-0 group-button-hover:opacity-100 transition-all"
              title="Supprimer le module"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {durationLabel && (
            <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest opacity-40">{durationLabel}</span>
          )}
          {open ? <ChevronDown className="w-4 h-4 opacity-40" /> : <ChevronRight className="w-4 h-4 opacity-40" />}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 space-y-1 border-t border-(--glass-border) pt-4">
              {isLoading && (
                <div className="flex items-center gap-2 py-3 opacity-40">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-xs font-black uppercase tracking-widest">Chargement...</span>
                </div>
              )}
              {!isLoading && lessons.length === 0 && (
                <p className="text-xs opacity-40 italic py-3">Aucune leçon dans ce module.</p>
              )}
              {canManage && (
                <button
                  onClick={() => onCreateLesson(module.id)}
                  className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-(--glass-border) hover:border-primary/50 hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter une leçon
                </button>
              )}
              {lessons
                .slice()
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map(lesson => {
                  const completed = isLessonCompleted(lesson.id)
                  return (
                    <div key={lesson.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-primary/5 transition-colors group">
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                        completed ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-slate-800"
                      )}>
                        {completed ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3 h-3 fill-primary text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold truncate", completed && "line-through opacity-60")}>{lesson.title}</p>
                        {lesson.summary && <p className="text-[11px] opacity-40 truncate">{lesson.summary}</p>}
                      </div>
                      {lesson.estimatedMinutes > 0 && (
                        <span className="text-[10px] font-black opacity-30 shrink-0">{lesson.estimatedMinutes}min</span>
                      )}
                      {isStudent && !completed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markCompleteMutation.mutate(lesson.id)
                          }}
                          disabled={markCompleteMutation.isPending}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-all"
                          title="Marquer comme terminé"
                        >
                          {markCompleteMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      {canManage && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteLesson(lesson.id) }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-all"
                          title="Supprimer la leçon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}

export function CourseDetailsView({ courseId }) {
  const { isAdmin, isTeacher, isStudent, user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('plan')
  const [viewingPdf, setViewingPdf] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showCreateModule, setShowCreateModule] = useState(false)
  const [showCreateLesson, setShowCreateLesson] = useState(null) // moduleId
  const [uploadFile, setUploadFile] = useState(null)
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', displayOrder: 1 })
  const [lessonForm, setLessonForm] = useState({ title: '', summary: '', displayOrder: 1, estimatedMinutes: 10 })
  const [showAssignClass, setShowAssignClass] = useState(false)
  const [pendingClassIds, setPendingClassIds] = useState(new Set())

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourseById(courseId),
    enabled: !!courseId,
  })

  const { data: modules = [] } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: () => courseService.getModules(courseId),
    enabled: !!courseId,
  })

  const { data: resources = [] } = useQuery({
    queryKey: ['course-resources', courseId],
    queryFn: () => courseService.getResources(courseId),
    enabled: !!courseId,
  })

  const { data: sessions = [] } = useQuery({
    queryKey: ['course-sessions', courseId],
    queryFn: () => courseService.getSessions(courseId),
    enabled: !!courseId,
  })

  const { data: progress } = useQuery({
    queryKey: ['course-progress', courseId, user?.id],
    queryFn: () => courseService.getProgress(courseId, user?.id),
    enabled: !!courseId && isStudent,
  })

  const enrollMutation = useMutation({
    mutationFn: () => courseService.enroll(courseId, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId, user?.id] })
      toast.success('Inscription réussie au cours!')
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Erreur lors de l'inscription"),
  })

  const publishMutation = useMutation({
    mutationFn: () => courseService.publishCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      toast.success('Cours publié avec succès')
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur lors de la publication'),
  })

  const unpublishMutation = useMutation({
    mutationFn: () => courseService.unpublishCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      toast.success('Cours dépublié')
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur lors de la dépublication'),
  })

  const archiveMutation = useMutation({
    mutationFn: () => courseService.archiveCourse(courseId),
    onSuccess: () => {
      toast.success('Cours archivé')
      window.location.href = '/courses'
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Erreur lors de l'archivage"),
  })

  const uploadMutation = useMutation({
    mutationFn: (formData) => courseService.uploadResource(courseId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-resources', courseId] })
      toast.success('Ressource ajoutée avec succès')
      setShowUpload(false)
      setUploadFile(null)
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Erreur lors de l'upload"),
  })

  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId) => courseService.deleteResource(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-resources', courseId] })
      toast.success('Ressource supprimée')
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Erreur lors de la suppression"),
  })

  const createModuleMutation = useMutation({
    mutationFn: (data) => courseService.createModule(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] })
      toast.success('Module créé avec succès')
      setShowCreateModule(false)
      setModuleForm({ title: '', description: '', displayOrder: modules.length + 1 })
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur'),
  })

  const deleteModuleMutation = useMutation({
    mutationFn: (id) => courseService.deleteModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] })
      toast.success('Module supprimé')
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur'),
  })

  const createLessonMutation = useMutation({
    mutationFn: ({ moduleId, data }) => courseService.createLesson(moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      toast.success('Leçon créée avec succès')
      setShowCreateLesson(null)
      setLessonForm({ title: '', summary: '', displayOrder: 1, estimatedMinutes: 10 })
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur'),
  })

  const deleteLessonMutation = useMutation({
    mutationFn: (id) => courseService.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      toast.success('Leçon supprimée')
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur'),
  })

  // ── Classes assignées au cours ─────────────────────────────────────────
  const { data: assignedClasses = [], isLoading: loadingAssignedClasses } = useQuery({
    queryKey: ['course-classes', courseId],
    queryFn: () => courseService.getAssignedClasses(courseId),
    enabled: !!courseId,
  })

  const { data: allClasses = [], isLoading: loadingAllClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => courseService.getClasses(),
    enabled: showAssignClass,
  })

  const assignClassesMutation = useMutation({
    mutationFn: (classIds) => courseService.assignClasses(courseId, classIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-classes', courseId] })
      toast.success('Classes assignées avec succès')
      setShowAssignClass(false)
      setPendingClassIds(new Set())
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur lors de l\'affectation'),
  })

  const removeClassMutation = useMutation({
    mutationFn: (classId) => courseService.removeClassFromCourse(courseId, classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-classes', courseId] })
      toast.success('Classe retirée')
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur'),
  })

  const assignedClassIds = new Set(assignedClasses.map(c => c.id))
  const availableToAdd = allClasses.filter(c => !assignedClassIds.has(c.id))

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest italic">Chargement du cours...</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-black italic">Cours Introuvable</h2>
        <p className="text-muted-foreground italic">Ce cours n'est pas disponible ou a été archivé.</p>
        <Link href="/courses" className="inline-flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest mt-4">
          <ArrowLeft className="w-4 h-4" /> Retour au catalogue
        </Link>
      </div>
    )
  }

  const canManage = isAdmin || isTeacher
  const isEnrolled = progress?.enrolled || false
  const progressPercent = progress?.completionPercent || 0
  const totalLessons = progress?.totalLessons || 0
  const completedLessonsCount = progress?.completedLessons?.length || 0

  const tabs = [
    { id: 'plan', label: 'Plan du Cours', icon: BookOpen },
    { id: 'sessions', label: 'Séances', icon: Calendar },
    { id: 'resources', label: 'Ressources', icon: FileText },
    { id: 'objectives', label: 'Objectifs', icon: Target },
    ...(canManage ? [
      { id: 'classes', label: 'Classes', icon: School },
      { id: 'stats', label: 'Statistiques', icon: BarChart2 },
    ] : []),
    ...(isStudent && isEnrolled ? [{ id: 'progress', label: 'Progression', icon: Award }] : []),
  ]

  const sessionModeIcon = (mode) => {
    if (mode === 'ONLINE') return <Globe className="w-3.5 h-3.5" />
    if (mode === 'HYBRID') return <Video className="w-3.5 h-3.5" />
    return <MapPin className="w-3.5 h-3.5" />
  }

  const sessionStatusStyle = (status) => {
    if (status === 'ONGOING') return 'text-emerald-500 bg-emerald-500/10'
    if (status === 'COMPLETED') return 'text-slate-400 bg-slate-400/10'
    return 'text-primary bg-primary/10'
  }

  const sessionStatusLabel = (status) => {
    if (status === 'ONGOING') return 'En cours'
    if (status === 'COMPLETED') return 'Terminée'
    return 'Planifiée'
  }

  const formatDateTime = (dt) => {
    if (!dt) return '—'
    return new Date(dt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-2">
        <Link href="/courses" className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Retour Catalogue</span>
        </Link>

        <div className="flex gap-2">
          {/* Student: Enroll button */}
          {isStudent && !isEnrolled && course.published && (
            <button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {enrollMutation.isPending ? 'Inscription...' : "S'inscrire"}
            </button>
          )}

          {/* Student: Progress badge */}
          {isStudent && isEnrolled && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Award className="w-4 h-4" />
              <span className="text-xs font-black">{progressPercent}% complété</span>
            </div>
          )}

          {/* Admin/Teacher: Publish/Unpublish/Archive */}
          {canManage && (
            <>
              {course.published ? (
                <button
                  onClick={() => unpublishMutation.mutate()}
                  disabled={unpublishMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-400/40 text-amber-500 font-black text-xs uppercase tracking-widest hover:bg-amber-500/10 transition-all active:scale-95 disabled:opacity-50"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  {unpublishMutation.isPending ? 'En cours...' : 'Dépublier'}
                </button>
              ) : (
                <button
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {publishMutation.isPending ? 'Publication...' : 'Publier'}
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => {
                    if (confirm('Archiver ce cours ? Cette action est irréversible.')) {
                      archiveMutation.mutate()
                    }
                  }}
                  disabled={archiveMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-400/40 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Archiver
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-56 md:h-72 rounded-4xl overflow-hidden shadow-2xl group">
        <div className="absolute inset-0 premium-gradient opacity-90 z-10" />
        <div className="absolute inset-0 flex items-center justify-center z-20 text-white font-black text-7xl italic opacity-10 uppercase tracking-tighter transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
          {course.code}
        </div>
        <div className="absolute bottom-8 left-8 right-8 z-30 text-white space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/20">
              {course.code}
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/20">
              {course.status}
            </span>
            {course.published && (
              <span className="px-3 py-1 rounded-xl bg-emerald-500/80 text-[10px] font-black uppercase tracking-widest">
                Publié
              </span>
            )}
            {isStudent && isEnrolled && (
              <span className="px-3 py-1 rounded-xl bg-amber-500/80 text-[10px] font-black uppercase tracking-widest">
                Inscrit
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic leading-tight">{course.title}</h1>
          <div className="flex items-center gap-4 text-[11px] font-bold opacity-70 flex-wrap">
            {course.programName && <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> {course.programName}</span>}
            {course.academicYearName && <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {course.academicYearName}</span>}
            <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> {course.credits} crédits</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {course.totalHours}h</span>
          </div>
        </div>
      </div>

      {/* Student Progress Bar */}
      {isStudent && isEnrolled && (
        <GlassCard className="p-5 border-none ring-1 ring-(--glass-border)">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Progression du cours</span>
            <span className="text-sm font-black">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full premium-gradient"
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] opacity-50">
            <span>{completedLessonsCount} leçons terminées</span>
            <span>{totalLessons} leçons au total</span>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all text-left",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-xl shadow-primary/30 translate-x-2"
                  : "glass-card border-(--glass-border) opacity-60 hover:opacity-100 hover:bg-primary/5"
              )}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}

          {course.instructorName && (
            <GlassCard className="mt-6 p-5 border-none ring-1 ring-(--glass-border) space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Instructeur</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center text-white font-black shadow-md shadow-primary/20 shrink-0">
                  {course.instructorName[0]}
                </div>
                <div>
                  <p className="font-bold text-sm">{course.instructorName}</p>
                  <p className="text-[10px] font-black uppercase opacity-40">Enseignant</p>
                </div>
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-5 border-none ring-1 ring-(--glass-border) space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Infos rapides</p>
            {[
              { label: 'Modules', value: modules.length },
              { label: 'Séances', value: sessions.length },
              { label: 'Ressources', value: resources.length },
              { label: 'Heures totales', value: `${course.totalHours}h` },
              ...(canManage ? [{ label: 'Classes', value: assignedClasses.length }] : []),
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs opacity-50">{item.label}</span>
                <span className="text-xs font-black">{item.value}</span>
              </div>
            ))}
          </GlassCard>

          {/* Access status banner for students */}
          {isStudent && !isEnrolled && !loadingAssignedClasses && (
            <GlassCard className="p-4 border-none ring-1 ring-amber-400/30 bg-amber-500/5 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Accès restreint</p>
              <p className="text-[11px] opacity-70">Ce cours n&apos;est pas encore assigné à votre classe.</p>
            </GlassCard>
          )}
        </div>

        {/* Main content */}
        <div className="xl:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'plan' && (
              <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-lg font-black italic tracking-tight px-1">Plan du Cours</h2>
                {modules.length === 0 ? (
                  <GlassCard className="p-10 border-none ring-1 ring-(--glass-border) text-center">
                    <BookOpen className="w-10 h-10 mx-auto opacity-20 mb-3" />
                    <p className="text-sm opacity-40 italic">Aucun module défini pour ce cours.</p>
                  </GlassCard>
                ) : (
                  modules
                    .slice()
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                    .map(module => (
                      <ModuleAccordion 
                        key={module.id} 
                        module={module} 
                        isStudent={isStudent} 
                        canManage={canManage}
                        courseId={courseId} 
                        onCreateLesson={(mid) => setShowCreateLesson(mid)}
                        onDeleteLesson={(lid) => deleteLessonMutation.mutate(lid)}
                        onDeleteModule={(mid) => deleteModuleMutation.mutate(mid)}
                      />
                    ))
                )}
                {canManage && (
                  <button
                    onClick={() => setShowCreateModule(true)}
                    className="w-full py-5 rounded-2xl border-2 border-dashed border-(--glass-border) flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all opacity-60 hover:opacity-100"
                  >
                    <Plus className="w-6 h-6 text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary">Ajouter un nouveau module</span>
                  </button>
                )}
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div key="sessions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-lg font-black italic tracking-tight px-1">Séances</h2>
                {sessions.length === 0 ? (
                  <GlassCard className="p-10 border-none ring-1 ring-(--glass-border) text-center">
                    <Calendar className="w-10 h-10 mx-auto opacity-20 mb-3" />
                    <p className="text-sm opacity-40 italic">Aucune séance planifiée.</p>
                  </GlassCard>
                ) : (
                  sessions.map(session => (
                    <GlassCard key={session.id} className="p-5 border-none ring-1 ring-(--glass-border) hover:shadow-xl transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", sessionStatusStyle(session.status))}>
                              {sessionModeIcon(session.mode)}
                              {sessionStatusLabel(session.status)}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{session.mode}</span>
                          </div>
                          <h4 className="font-black text-sm tracking-tight">{session.title}</h4>
                          {session.description && <p className="text-xs opacity-50 line-clamp-2">{session.description}</p>}
                          <div className="flex items-center gap-3 text-[11px] opacity-50 flex-wrap">
                            <span>{formatDateTime(session.startAt)}</span>
                            {session.endAt && <span>→ {formatDateTime(session.endAt)}</span>}
                            {session.locationLabel && <span>• {session.locationLabel}</span>}
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col gap-2">
                          {(session.status === 'PLANNED' || session.status === 'ONGOING') &&
                            session.meetingLink &&
                            (session.mode === 'ONLINE' || session.mode === 'HYBRID') && (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              Rejoindre
                            </a>
                          )}
                          {session.status === 'COMPLETED' && session.recordingLink && (
                            <a
                              href={session.recordingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all"
                            >
                              <Video className="w-3 h-3" />
                              Enregistrement
                            </a>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'resources' && (
              <motion.div key="resources" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-lg font-black italic tracking-tight">Ressources</h2>
                  {canManage && (
                    <button
                      onClick={() => setShowUpload(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter Ressource
                    </button>
                  )}
                </div>
                {resources.length === 0 ? (
                  <GlassCard className="p-10 border-none ring-1 ring-(--glass-border) text-center">
                    <FileText className="w-10 h-10 mx-auto opacity-20 mb-3" />
                    <p className="text-sm opacity-40 italic">Aucune ressource disponible.</p>
                  </GlassCard>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map(resource => {
                      const isFile = resource.resourceType === 'FILE'
                      const isVideo = resource.resourceType === 'VIDEO_LINK'
                      const href = isFile ? resource.publicUrl : resource.externalUrl

                      return (
                        <GlassCard key={resource.id} className="p-5 border-none ring-1 ring-(--glass-border) hover:shadow-xl transition-all group">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                              isFile ? "bg-indigo-500/10 text-indigo-500" :
                              isVideo ? "bg-rose-500/10 text-rose-500" :
                              "bg-emerald-500/10 text-emerald-500"
                            )}>
                              {isFile ? <FileText className="w-5 h-5" /> :
                               isVideo ? <Video className="w-5 h-5" /> :
                               <ExternalLink className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm truncate">{resource.title}</h4>
                              {resource.description && (
                                <p className="text-[11px] opacity-50 line-clamp-1 mt-0.5">{resource.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5">
                                {resource.fileExtension && (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 opacity-60">
                                    {resource.fileExtension}
                                  </span>
                                )}
                                {resource.fileSize && (
                                  <span className="text-[10px] opacity-40">{formatFileSize(resource.fileSize)}</span>
                                )}
                              </div>
                            </div>
                            {href && (
                              <div className="flex gap-2">
                                {isFile && resource.fileExtension?.toLowerCase() === 'pdf' && (
                                  <button
                                    onClick={() => setViewingPdf(resource)}
                                    className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all group-hover:scale-110 shrink-0"
                                    title="Visualiser"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={isFile ? (resource.originalFileName || true) : undefined}
                                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-primary hover:bg-primary/10 transition-all group-hover:scale-110 shrink-0"
                                  title="Télécharger"
                                >
                                  {isFile ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                                </a>
                                {canManage && (
                                  <button
                                    onClick={() => {
                                      if (confirm('Supprimer cette ressource ?')) {
                                        deleteResourceMutation.mutate(resource.id)
                                      }
                                    }}
                                    disabled={deleteResourceMutation.isPending}
                                    className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all group-hover:scale-110 shrink-0 disabled:opacity-50"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </GlassCard>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'objectives' && (
              <motion.div key="objectives" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-lg font-black italic tracking-tight px-1">Objectifs & Programme</h2>
                {[
                  { label: 'Objectifs pédagogiques', content: course.objectives, icon: Target },
                  { label: 'Prérequis', content: course.prerequisites, icon: BookMarked },
                  { label: 'Syllabus', content: course.syllabus, icon: BookOpen },
                  { label: 'Description', content: course.description, icon: FileText },
                ]
                  .filter(s => s.content)
                  .map(section => (
                    <GlassCard key={section.label} className="p-6 border-none ring-1 ring-(--glass-border)">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <section.icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-black text-sm uppercase tracking-widest opacity-70">{section.label}</h3>
                      </div>
                      <p className="text-sm leading-relaxed opacity-80 whitespace-pre-line">{section.content}</p>
                    </GlassCard>
                  ))}
                {!course.objectives && !course.prerequisites && !course.syllabus && !course.description && (
                  <GlassCard className="p-10 border-none ring-1 ring-(--glass-border) text-center">
                    <Target className="w-10 h-10 mx-auto opacity-20 mb-3" />
                    <p className="text-sm opacity-40 italic">Aucun objectif renseigné pour ce cours.</p>
                  </GlassCard>
                )}
              </motion.div>
            )}

            {activeTab === 'progress' && isStudent && isEnrolled && (
              <motion.div key="progress" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-lg font-black italic tracking-tight px-1">Ma Progression</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Progression', value: `${progressPercent}%` },
                    { label: 'Leçons terminées', value: `${completedLessonsCount}/${totalLessons}` },
                    { label: 'Modules', value: modules.length },
                    { label: 'Séances', value: sessions.length },
                    { label: 'Ressources', value: resources.length },
                    { label: 'Crédits', value: course.credits },
                  ].map(stat => (
                    <GlassCard key={stat.label} className="p-5 border-none ring-1 ring-(--glass-border) text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">{stat.label}</p>
                      <p className="text-3xl font-black italic">{stat.value}</p>
                    </GlassCard>
                  ))}
                </div>
                <GlassCard className="p-6 border-none ring-1 ring-(--glass-border)">
                  <h3 className="font-black text-sm uppercase tracking-widest opacity-60 mb-4">Détail de la progression</h3>
                  <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full premium-gradient"
                    />
                  </div>
                  <p className="text-sm opacity-60">Continuez à suivre les leçons pour compléter ce cours et obtenir vos crédits!</p>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'classes' && canManage && (
              <motion.div key="classes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h2 className="text-lg font-black italic tracking-tight">Classes Assignées</h2>
                    <p className="text-xs opacity-50 mt-0.5 italic">
                      Seuls les étudiants des classes listées ci-dessous peuvent accéder à ce cours.
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowAssignClass(true); setPendingClassIds(new Set()) }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une classe
                  </button>
                </div>

                {loadingAssignedClasses ? (
                  <div className="flex items-center justify-center py-12 opacity-40">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : assignedClasses.length === 0 ? (
                  <GlassCard className="p-10 border-none ring-1 ring-(--glass-border) text-center">
                    <School className="w-10 h-10 mx-auto opacity-20 mb-3" />
                    <p className="text-sm opacity-40 italic font-bold">Aucune classe assignée à ce cours.</p>
                    <p className="text-xs opacity-30 mt-1">Les étudiants ne peuvent pas encore accéder à ce cours.</p>
                    <button
                      onClick={() => { setShowAssignClass(true); setPendingClassIds(new Set()) }}
                      className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Assigner une classe
                    </button>
                  </GlassCard>
                ) : (
                  <div className="space-y-3">
                    {assignedClasses.map(cls => (
                      <GlassCard key={cls.id} className="p-5 border-none ring-1 ring-(--glass-border) hover:shadow-xl transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Users2 className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-sm tracking-tight truncate">{cls.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {cls.code && (
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{cls.code}</span>
                              )}
                              {cls.deliveryMode && (
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest opacity-60">
                                  {cls.deliveryMode}
                                </span>
                              )}
                              {cls.capacity && (
                                <span className="text-[10px] opacity-40">· {cls.capacity} places</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm(`Retirer la classe "${cls.name}" de ce cours ?`)) {
                                removeClassMutation.mutate(cls.id)
                              }
                            }}
                            disabled={removeClassMutation.isPending}
                            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shrink-0"
                            title="Retirer cette classe"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'stats' && canManage && (
              <motion.div key="stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-lg font-black italic tracking-tight px-1">Statistiques du cours</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Modules', value: modules.length },
                    { label: 'Séances', value: sessions.length },
                    { label: 'Ressources', value: resources.length },
                    { label: 'Crédits', value: course.credits },
                    { label: 'Version', value: `v${course.currentVersionNumber}` },
                  ].map(stat => (
                    <GlassCard key={stat.label} className="p-5 border-none ring-1 ring-(--glass-border) text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">{stat.label}</p>
                      <p className="text-3xl font-black italic">{stat.value}</p>
                    </GlassCard>
                  ))}
                </div>
                <GlassCard className="p-6 border-none ring-1 ring-(--glass-border)">
                  <h3 className="font-black text-sm uppercase tracking-widest opacity-60 mb-4">Statut de publication</h3>
                  <div className="flex items-center gap-4">
                    <div className={cn("w-3 h-3 rounded-full", course.published ? "bg-emerald-500" : "bg-amber-400")} />
                    <span className="font-bold text-sm">{course.published ? 'Publié' : 'Non publié'}</span>
                    <span className="text-xs opacity-40 ml-auto">{course.status}</span>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {/* All Modals */}
      <AnimatePresence>
        {/* Assign Classes Modal */}
        {showAssignClass && canManage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAssignClass(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-card rounded-3xl border-(--glass-border) overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-8 border-b border-(--glass-border)">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter italic">Assigner des Classes</h2>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">
                    {pendingClassIds.size} classe{pendingClassIds.size !== 1 ? 's' : ''} sélectionnée{pendingClassIds.size !== 1 ? 's' : ''}
                  </p>
                </div>
                <button onClick={() => setShowAssignClass(false)} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:border-rose-500/50 hover:text-rose-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-4">
                {loadingAllClasses ? (
                  <div className="flex items-center justify-center py-10 opacity-40">
                    <Loader2 className="w-7 h-7 animate-spin text-primary" />
                  </div>
                ) : availableToAdd.length === 0 ? (
                  <div className="py-10 text-center opacity-40">
                    <School className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-black italic uppercase tracking-widest">Toutes les classes sont déjà assignées.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {availableToAdd.map(cls => {
                      const selected = pendingClassIds.has(cls.id)
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => setPendingClassIds(prev => {
                            const next = new Set(prev)
                            selected ? next.delete(cls.id) : next.add(cls.id)
                            return next
                          })}
                          className={cn(
                            "w-full flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all text-left",
                            selected
                              ? "bg-primary/10 border-primary/50 text-primary"
                              : "glass-card border-(--glass-border) hover:border-primary/30"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                            selected ? "bg-primary border-primary" : "border-slate-300 dark:border-slate-600"
                          )}>
                            {selected && <span className="text-white text-[10px] font-black">✓</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{cls.name}</p>
                            <p className="text-[10px] font-semibold opacity-40 uppercase tracking-wider">
                              {cls.code || ''}{cls.deliveryMode ? ` · ${cls.deliveryMode}` : ''}{cls.capacity ? ` · ${cls.capacity} places` : ''}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAssignClass(false)}
                    className="px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-rose-500/40 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={pendingClassIds.size === 0 || assignClassesMutation.isPending}
                    onClick={() => assignClassesMutation.mutate([...pendingClassIds])}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {assignClassesMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <School className="w-4 h-4" />}
                    Assigner
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* PDF Viewer Modal */}
        {viewingPdf && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setViewingPdf(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-6xl h-[90vh] glass-card rounded-3xl border-(--glass-border) overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-(--glass-border) bg-(--glass-bg)">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-tight">{viewingPdf.title}</h3>
                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Visionneuse PDF Intégrée</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a 
                    href={viewingPdf.publicUrl} 
                    download={viewingPdf.originalFileName || true}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger
                  </a>
                  <button 
                    onClick={() => setViewingPdf(null)} 
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-900/50 p-2">
                <iframe 
                  src={`${viewingPdf.publicUrl}#toolbar=0`} 
                  className="w-full h-full rounded-2xl border-none shadow-2xl"
                  title={viewingPdf.title}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card rounded-3xl border-(--glass-border) overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-8 border-b border-(--glass-border)">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter italic">Nouveau PDF / Ressource</h2>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Ajouter au cours</p>
                </div>
                <button onClick={() => setShowUpload(false)} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:border-rose-500/50 hover:text-rose-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!uploadFile) return
                  const formData = new FormData()
                  formData.append('file', uploadFile)
                  formData.append('title', uploadFile.name)
                  formData.append('resourceType', 'FILE')
                  uploadMutation.mutate(formData)
                }} 
                className="p-8 space-y-6"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Fichier * (PDF recommandé)</label>
                  <input
                    type="file"
                    required
                    onChange={e => setUploadFile(e.target.files[0])}
                    className="w-full px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none file:mr-4 file:py-1 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                  {uploadFile && (
                    <p className="text-xs font-bold opacity-60 mt-2">
                      Fichier: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowUpload(false)}
                    className="px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-rose-500/40 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={uploadMutation.isPending || !uploadFile}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Uploader
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Create Module Modal */}
        {showCreateModule && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModule(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card rounded-3xl border-(--glass-border) overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-8 border-b border-(--glass-border)">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter italic">Nouveau Module</h2>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Structurer le cours</p>
                </div>
                <button onClick={() => setShowCreateModule(false)} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:border-rose-500/50 hover:text-rose-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  createModuleMutation.mutate(moduleForm)
                }} 
                className="p-8 space-y-6"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Titre du module *</label>
                  <input
                    required
                    value={moduleForm.title}
                    onChange={e => setModuleForm(f => ({ ...f, title: e.target.value }))}
                    className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                    placeholder="ex: Introduction au cours"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Description</label>
                  <textarea
                    value={moduleForm.description}
                    onChange={e => setModuleForm(f => ({ ...f, description: e.target.value }))}
                    className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none resize-none"
                    rows={2}
                    placeholder="Brève description..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Ordre d'affichage</label>
                  <input
                    type="number"
                    value={moduleForm.displayOrder}
                    onChange={e => setModuleForm(f => ({ ...f, displayOrder: parseInt(e.target.value) }))}
                    className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateModule(false)}
                    className="px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-rose-500/40 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={createModuleMutation.isPending}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {createModuleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Créer le Module
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Create Lesson Modal */}
        {showCreateLesson && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCreateLesson(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card rounded-3xl border-(--glass-border) overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-8 border-b border-(--glass-border)">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter italic">Nouvelle Leçon</h2>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Contenu pédagogique</p>
                </div>
                <button onClick={() => setShowCreateLesson(null)} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:border-rose-500/50 hover:text-rose-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  createLessonMutation.mutate({ moduleId: showCreateLesson, data: lessonForm })
                }} 
                className="p-8 space-y-6 max-h-[60vh] overflow-y-auto"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Titre de la leçon *</label>
                  <input
                    required
                    value={lessonForm.title}
                    onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))}
                    className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                    placeholder="ex: Les bases de la thermodynamique"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Résumé / Contenu</label>
                  <textarea
                    value={lessonForm.summary}
                    onChange={e => setLessonForm(f => ({ ...f, summary: e.target.value }))}
                    className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none resize-none"
                    rows={3}
                    placeholder="Résumé de la leçon..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Durée (min)</label>
                    <input
                      type="number"
                      value={lessonForm.estimatedMinutes}
                      onChange={e => setLessonForm(f => ({ ...f, estimatedMinutes: parseInt(e.target.value) }))}
                      className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Ordre</label>
                    <input
                      type="number"
                      value={lessonForm.displayOrder}
                      onChange={e => setLessonForm(f => ({ ...f, displayOrder: parseInt(e.target.value) }))}
                      className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateLesson(null)}
                    className="px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-rose-500/40 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={createLessonMutation.isPending}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {createLessonMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Ajouter la Leçon
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}