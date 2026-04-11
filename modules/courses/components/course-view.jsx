'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, BookOpen, Clock, Users, PlayCircle, Star, TrendingUp, Loader2, X, Edit, Trash2, Upload, Eye, EyeOff, Archive, Layers } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth-hook'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/lib/course-service'
import { teachingUnitService } from '@/lib/teaching-unit-service'
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

const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']

const EMPTY_FORM = {
  title: '', code: '', description: '', objectives: '', syllabus: '',
  credits: '', totalHours: '',
  academicYearId: '', programId: '', semester: '', teachingUnitId: '',
  status: 'DRAFT', visibility: 'INTERNAL',
}

const EMPTY_UE_FORM = {
  code: '', name: '', description: '', semester: '', orderIndex: '1', programId: '',
}

export function CourseModuleView() {
  const { isStudent, isTeacher, isAdmin, user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('catalog')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createStep, setCreateStep] = useState(1) // 1 | 2 | 3
  const [selectedClassIds, setSelectedClassIds] = useState(new Set())
  const [showEdit, setShowEdit] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  // Gestion des UE (prof/admin uniquement)
  const [showUeManager, setShowUeManager] = useState(false)
  const [ueForm, setUeForm] = useState(EMPTY_UE_FORM)
  const [editUeId, setEditUeId] = useState(null)
  const [filterUeProgramId, setFilterUeProgramId] = useState('')

  const userId = user?.id || user?.userId

  const { data: catalog = [], isLoading: loadingCatalog } = useQuery({
    queryKey: ['courses-catalog', searchTerm],
    queryFn: () => courseService.getCourses(searchTerm ? { search: searchTerm } : {}),
    enabled: !isStudent, // Students see only their class courses — no global catalog
  })

  const { data: myCourses = [], isLoading: loadingMine } = useQuery({
    queryKey: ['my-courses', userId],
    queryFn: () => isTeacher
      ? courseService.getTeacherCourses(userId)
      : courseService.getMyCourses(userId),
    enabled: !!userId,
  })

  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn: courseService.getAcademicYears,
    enabled: showCreate,
  })

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: courseService.getPrograms,
    enabled: showCreate || !!showEdit || showUeManager,
  })

  const { data: teachingUnits = [] } = useQuery({
    queryKey: ['teaching-units', form.programId, form.semester],
    queryFn: () => {
      const params = {}
      if (form.programId) params.programId = form.programId
      if (form.semester) params.semester = form.semester
      return courseService.getTeachingUnits(params)
    },
    enabled: (showCreate || !!showEdit) && !!form.programId,
  })

  // Classes pour l'affectation (étape 3 de la création)
  const { data: allClasses = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => courseService.getClasses(),
    enabled: showCreate && createStep === 3,
  })
  const filteredClasses = form.programId
    ? allClasses.filter(c => String(c.programId || c.program?.id || '') === String(form.programId))
    : allClasses

  // UEs affichées dans le gestionnaire (filtrées par filière choisie)
  const { data: allUes = [], isLoading: loadingUes } = useQuery({
    queryKey: ['teaching-units-manager', filterUeProgramId],
    queryFn: () => teachingUnitService.getAll(filterUeProgramId ? { programId: filterUeProgramId } : {}),
    enabled: showUeManager,
  })

  const createUeMutation = useMutation({
    mutationFn: (data) => teachingUnitService.create(data),
    onSuccess: () => {
      toast.success('UE créée avec succès !')
      queryClient.invalidateQueries({ queryKey: ['teaching-units-manager'] })
      queryClient.invalidateQueries({ queryKey: ['teaching-units'] })
      setUeForm(EMPTY_UE_FORM)
      setEditUeId(null)
    },
    onError: err => toast.error(`Erreur: ${err.response?.data?.message || err.message}`),
  })

  const updateUeMutation = useMutation({
    mutationFn: ({ id, data }) => teachingUnitService.update(id, data),
    onSuccess: () => {
      toast.success('UE mise à jour !')
      queryClient.invalidateQueries({ queryKey: ['teaching-units-manager'] })
      queryClient.invalidateQueries({ queryKey: ['teaching-units'] })
      setUeForm(EMPTY_UE_FORM)
      setEditUeId(null)
    },
    onError: err => toast.error(`Erreur: ${err.response?.data?.message || err.message}`),
  })

  const deleteUeMutation = useMutation({
    mutationFn: (id) => teachingUnitService.delete(id),
    onSuccess: () => {
      toast.success('UE supprimée.')
      queryClient.invalidateQueries({ queryKey: ['teaching-units-manager'] })
      queryClient.invalidateQueries({ queryKey: ['teaching-units'] })
    },
    onError: err => toast.error(`Erreur: ${err.response?.data?.message || err.message}`),
  })

  function handleUeSubmit(e) {
    e.preventDefault()
    if (!ueForm.code || !ueForm.name || !ueForm.semester || !ueForm.programId) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    const payload = {
      code: ueForm.code.trim().toUpperCase(),
      name: ueForm.name.trim(),
      description: ueForm.description?.trim() || null,
      semester: ueForm.semester,
      orderIndex: Number(ueForm.orderIndex) || 1,
      programId: Number(ueForm.programId),
    }
    if (editUeId) {
      updateUeMutation.mutate({ id: editUeId, data: payload })
    } else {
      createUeMutation.mutate(payload)
    }
  }

  function handleEditUe(ue) {
    setUeForm({
      code: ue.code,
      name: ue.name,
      description: ue.description || '',
      semester: ue.semester,
      orderIndex: String(ue.orderIndex || 1),
      programId: String(ue.programId),
    })
    setEditUeId(ue.id)
  }

  function handleDeleteUe(ue) {
    if (confirm(`Supprimer l'UE "${ue.code} — ${ue.name}" ? Cette action est irréversible.`)) {
      deleteUeMutation.mutate(ue.id)
    }
  }

  const enrollMutation = useMutation({
    mutationFn: courseService.enroll,
    onSuccess: () => {
      toast.success('Inscription réussie !')
      queryClient.invalidateQueries({ queryKey: ['my-courses', userId] })
    },
    onError: err => toast.error(`Erreur: ${err.message}`),
  })

  const createMutation = useMutation({
    mutationFn: (data) => courseService.createCourse(data),
    onSuccess: async (newCourse) => {
      const courseId = newCourse?.id
      if (courseId && selectedClassIds.size > 0) {
        try {
          await courseService.assignClasses(courseId, [...selectedClassIds])
        } catch {
          toast.error('Cours créé, mais l\'affectation des classes a échoué.')
        }
      }
      toast.success('Cours créé avec succès !')
      queryClient.invalidateQueries({ queryKey: ['courses-catalog'] })
      queryClient.invalidateQueries({ queryKey: ['my-courses', userId] })
      setShowCreate(false)
      setCreateStep(1)
      setSelectedClassIds(new Set())
      setForm(EMPTY_FORM)
      if (courseId) window.location.href = `/courses/${courseId}`
    },
    onError: err => {
      const msg = err.response?.data?.message || err.message
      toast.error(`Erreur: ${msg}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => courseService.updateCourse(id, data),
    onSuccess: () => {
      toast.success('Cours modifié avec succès !')
      queryClient.invalidateQueries({ queryKey: ['courses-catalog'] })
      queryClient.invalidateQueries({ queryKey: ['my-courses', userId] })
      setShowEdit(null)
      setForm(EMPTY_FORM)
    },
    onError: err => {
      const msg = err.response?.data?.message || err.message
      toast.error(`Erreur: ${msg}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => courseService.archiveCourse(id),
    onSuccess: () => {
      toast.success('Cours archivé avec succès !')
      queryClient.invalidateQueries({ queryKey: ['courses-catalog'] })
      queryClient.invalidateQueries({ queryKey: ['my-courses', userId] })
    },
    onError: err => {
      const msg = err.response?.data?.message || err.message
      toast.error(`Erreur: ${msg}`)
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id) => courseService.publishCourse(id),
    onSuccess: () => {
      toast.success('Cours publié !')
      queryClient.invalidateQueries({ queryKey: ['courses-catalog'] })
      queryClient.invalidateQueries({ queryKey: ['my-courses', userId] })
    },
    onError: err => toast.error(`Erreur: ${err.response?.data?.message || err.message}`),
  })

  const unpublishMutation = useMutation({
    mutationFn: (id) => courseService.unpublishCourse(id),
    onSuccess: () => {
      toast.success('Cours dépublié !')
      queryClient.invalidateQueries({ queryKey: ['courses-catalog'] })
      queryClient.invalidateQueries({ queryKey: ['my-courses', userId] })
    },
    onError: err => toast.error(`Erreur: ${err.response?.data?.message || err.message}`),
  })

  function handleSubmit(e) {
    e.preventDefault?.()

    if (!form.title || !form.code || !form.credits || !form.totalHours || !form.academicYearId || !form.programId) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    const courseData = {
      title: form.title.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description?.trim() || null,
      objectives: form.objectives?.trim() || null,
      syllabus: form.syllabus?.trim() || null,
      credits: Number(form.credits),
      totalHours: Number(form.totalHours),
      academicYearId: Number(form.academicYearId),
      programId: Number(form.programId),
      semester: form.semester || null,
      teachingUnitId: form.teachingUnitId ? Number(form.teachingUnitId) : null,
    }

    if (isTeacher && userId) courseData.instructorUserId = userId

    if (showEdit) {
      updateMutation.mutate({ id: showEdit, data: { ...courseData, status: form.status, visibility: form.visibility } })
    } else {
      createMutation.mutate(courseData)
    }
  }

  function handleEdit(course) {
    setForm({
      title: course.title || course.name || '',
      code: course.code || '',
      description: course.description || '',
      objectives: course.objectives || '',
      syllabus: course.syllabus || '',
      credits: course.credits?.toString() || '',
      totalHours: course.totalHours?.toString() || '',
      academicYearId: course.academicYearId?.toString() || '',
      programId: course.programId?.toString() || '',
      semester: course.semester || '',
      teachingUnitId: course.teachingUnitId?.toString() || '',
      status: course.status || 'DRAFT',
      visibility: course.visibility || 'INTERNAL',
    })
    setShowEdit(course.id)
    setCreateStep(1)
    setShowCreate(true)
  }

  function handleDelete(course) {
    if (confirm(`Archiver le cours "${course.title || course.name}" ? Cette action est irréversible.`)) {
      deleteMutation.mutate(course.id)
    }
  }

  const enrolledIds = new Set(myCourses.map(c => c.id || c.courseId))
  // Students always see their class courses; others use the tab selection
  const displayedCourses = isStudent ? myCourses : (activeTab === 'catalog' ? catalog : myCourses)
  const isLoading = isStudent ? loadingMine : (activeTab === 'catalog' ? loadingCatalog : loadingMine)

  // For students: group courses by filière (programName)
  const coursesByProgram = isStudent
    ? Object.entries(
        displayedCourses.reduce((acc, course) => {
          const key = course.programName || 'Sans filière'
          if (!acc[key]) acc[key] = []
          acc[key].push(course)
          return acc
        }, {})
      ).sort(([a], [b]) => a.localeCompare(b))
    : null

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Espace <span className="text-primary italic">LMS & COURS</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Gestion des savoirs, contenus pédagogiques et progression.</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          {(isTeacher || isAdmin) ? (
            <>
              <button
                onClick={() => setShowUeManager(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all"
              >
                <Layers className="w-4 h-4" />
                Gérer les UE
              </button>
              <button
                onClick={() => { setShowCreate(true); setCreateStep(1); setShowEdit(null); setSelectedClassIds(new Set()); setForm(EMPTY_FORM) }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
                Créer Nouveau Cours
              </button>
            </>
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
          {isStudent ? (
            <>
              <h3 className="text-xl font-black italic">Mes Cours</h3>
              <p className="text-sm font-medium mt-2 opacity-80 max-w-xs line-clamp-2">
                {loadingMine ? 'Chargement...' : `${myCourses.length} cours disponibles dans votre classe.`}
              </p>
              <div className="mt-8">
                <p className="text-3xl font-black italic">{loadingMine ? '—' : myCourses.length}</p>
                <p className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Cours de votre classe</p>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-black italic">Catalogue Complet</h3>
              <p className="text-sm font-medium mt-2 opacity-80 max-w-xs line-clamp-2">
                {catalog.length > 0 ? `${catalog.length} cours disponibles dans votre catalogue.` : 'Chargement du catalogue en cours...'}
              </p>
              <div className="mt-8">
                <p className="text-3xl font-black italic">{loadingCatalog ? '—' : catalog.length}</p>
                <p className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Cours Disponibles</p>
              </div>
            </>
          )}
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

      {/* Tabs + Search — hidden for students */}
      {!isStudent && (
        <div className="flex flex-wrap items-center justify-between gap-6 px-2">
          <div className="flex gap-4">
            {[
              { key: 'catalog', label: 'Catalogue Complet' },
              { key: 'mine', label: isTeacher ? 'Mes Enseignements' : 'Affectations' },
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
      )}

      {/* Course Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest italic text-primary">Chargement des cours...</p>
        </div>
      ) : displayedCourses.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-3xl border-(--glass-border)">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm font-black italic uppercase tracking-widest opacity-40">
            {isStudent ? 'Aucun cours assigné à votre classe.' : activeTab === 'mine' ? 'Aucun cours attribué.' : 'Aucun cours trouvé.'}
          </p>
          {isStudent && (
            <p className="text-xs opacity-30 mt-2 italic">Les cours apparaissent ici lorsqu'un responsable les assigne à votre classe.</p>
          )}
        </div>
      ) : isStudent ? (
        /* ── Student view: grouped by filière ─────────────────────────── */
        <div className="space-y-10">
          {coursesByProgram.map(([programName, courses]) => (
            <div key={programName}>
              <div className="flex items-center gap-3 mb-5 px-1">
                <Layers className="w-4 h-4 text-primary opacity-70" />
                <h2 className="text-xs font-black uppercase tracking-widest text-primary opacity-80">{programName}</h2>
                <span className="text-[10px] font-bold opacity-30 italic">{courses.length} cours</span>
                <div className="flex-1 h-px bg-border opacity-30" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-1">
                {courses.map((course, idx) => {
                  const progress = course.progressPercentage || course.completionRate || 0
                  return (
                    <motion.div key={course.id || idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                      <Link href={`/courses/${course.id || course.courseId}`}>
                        <GlassCard className="relative overflow-hidden group border-none ring-1 ring-(--glass-border) hover:ring-primary/40 transition-all p-0">
                          <div className="h-40 w-full relative overflow-hidden">
                            <div className="absolute inset-0 premium-gradient opacity-80 z-10" />
                            <div className="absolute inset-0 flex items-center justify-center z-20 text-white transform rotate-3 scale-150 opacity-10 font-bold text-4xl italic group-hover:rotate-6 transition-all">{course.code || course.id}</div>
                            <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                              {COURSE_LEVEL_LABELS[course.level] || course.level || 'Cours'}
                            </div>
                          </div>
                          <div className="p-8">
                            <h3 className="text-xl font-black tracking-tighter truncate">{course.name || course.title}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1 italic">
                              {course.code}{course.teacherName ? ` • ${course.teacherName}` : ''}
                            </p>
                            {progress > 0 && (
                              <>
                                <div className="mt-6 flex items-center justify-between text-[11px] font-black uppercase italic tracking-widest opacity-60">
                                  <span>Progression</span>
                                  <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-primary rounded-full shadow-lg" />
                                </div>
                              </>
                            )}
                            <div className="mt-6 pt-5 border-t border-(--glass-border)">
                              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest group-hover:shadow-xl group-hover:shadow-primary/30 transition-all active:scale-95">
                                <PlayCircle className="w-5 h-5" />
                                {progress > 0 ? 'Reprendre' : 'Commencer'}
                              </button>
                            </div>
                          </div>
                        </GlassCard>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Teacher / Admin flat grid ─────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-1">
          {displayedCourses.map((course, idx) => {
            const isEnrolled = enrolledIds.has(course.id)
            const progress = course.progressPercentage || course.completionRate || 0
            return (
              <motion.div key={course.id || idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Link href={`/courses/${course.id || course.courseId}`}>
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
                      {activeTab === 'mine' && (isTeacher || isAdmin) ? (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(course) }}
                            disabled={updateMutation.isPending || deleteMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl glass-card border-(--glass-border) hover:bg-blue-500 hover:text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault(); e.stopPropagation()
                              if (course.published) {
                                unpublishMutation.mutate(course.id)
                              } else {
                                publishMutation.mutate(course.id)
                              }
                            }}
                            disabled={publishMutation.isPending || unpublishMutation.isPending}
                            className={`px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${course.published ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white'}`}
                          >
                            {course.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(course) }}
                            disabled={deleteMutation.isPending}
                            className="px-4 py-3 rounded-2xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      ) : isEnrolled ? (
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
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Wizard Création / Édition Cours ─────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowCreate(false); setShowEdit(null) } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl glass-card rounded-3xl border-(--glass-border) overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-8 border-b border-(--glass-border)">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter italic">
                    {showEdit ? 'Modifier le Cours' : 'Nouveau Cours'}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    {(showEdit ? [1, 2] : [1, 2, 3]).map(s => (
                      <div key={s} className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        s === createStep ? "w-8 bg-primary" : s < createStep ? "w-4 bg-primary/40" : "w-4 bg-slate-200 dark:bg-slate-700"
                      )} />
                    ))}
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">
                      Étape {createStep}/{showEdit ? 2 : 3}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCreate(false); setShowEdit(null) }}
                  className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:border-rose-500/50 hover:text-rose-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

                {/* ── Step 1 : Informations de base ─── */}
                {createStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Informations générales</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Titre *</label>
                        <input
                          value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="ex: Algèbre Linéaire"
                          className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Code *</label>
                        <input
                          value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                          placeholder="ex: MATH101"
                          className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Crédits *</label>
                        <input
                          type="number" min="1" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))}
                          placeholder="3"
                          className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Heures *</label>
                        <input
                          type="number" min="1" value={form.totalHours} onChange={e => setForm(f => ({ ...f, totalHours: e.target.value }))}
                          placeholder="45"
                          className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Année Académique *</label>
                        <select
                          value={form.academicYearId} onChange={e => setForm(f => ({ ...f, academicYearId: e.target.value }))}
                          className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                        >
                          <option value="">Sélectionner...</option>
                          {academicYears.map(y => (
                            <option key={y.id} value={y.id}>{y.name || y.label || y.year}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Programme (Filière) *</label>
                        <select
                          value={form.programId} onChange={e => setForm(f => ({ ...f, programId: e.target.value, teachingUnitId: '' }))}
                          className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                        >
                          <option value="">Sélectionner...</option>
                          {programs.map(p => (
                            <option key={p.id} value={p.id}>{p.name || p.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => { setShowCreate(false); setShowEdit(null) }}
                        className="px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-rose-500/40 transition-all"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!form.title || !form.code || !form.credits || !form.totalHours || !form.academicYearId || !form.programId) {
                            toast.error('Veuillez remplir tous les champs obligatoires')
                            return
                          }
                          setCreateStep(2)
                        }}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
                      >
                        Suivant →
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2 : Contenu pédagogique ─── */}
                {createStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Contenu pédagogique</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Semestre LMD</label>
                        <select
                          value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value, teachingUnitId: '' }))}
                          className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                        >
                          <option value="">Sélectionner un semestre...</option>
                          {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Unité d&apos;Enseignement (UE)
                          {!form.programId && <span className="text-amber-500 ml-1">— filière requise</span>}
                        </label>
                        <select
                          value={form.teachingUnitId} onChange={e => setForm(f => ({ ...f, teachingUnitId: e.target.value }))}
                          disabled={!form.programId}
                          className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none disabled:opacity-40"
                        >
                          <option value="">Aucune UE (cours libre)</option>
                          {teachingUnits.map(ue => (
                            <option key={ue.id} value={ue.id}>{ue.code} — {ue.name} ({ue.semester})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Objectifs <span className="text-amber-500">*requis pour publier</span></label>
                      <textarea
                        rows={2} value={form.objectives} onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))}
                        placeholder="Objectifs pédagogiques du cours..."
                        className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none resize-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Syllabus <span className="text-amber-500">*requis pour publier</span></label>
                      <textarea
                        rows={2} value={form.syllabus} onChange={e => setForm(f => ({ ...f, syllabus: e.target.value }))}
                        placeholder="Plan détaillé du cours, chapitres, contenus..."
                        className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none resize-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Description</label>
                      <textarea
                        rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Description du cours..."
                        className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none resize-none"
                      />
                    </div>
                    <div className="flex justify-between gap-3 pt-2">
                      <button type="button" onClick={() => setCreateStep(1)}
                        className="px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/40 transition-all"
                      >
                        ← Précédent
                      </button>
                      {showEdit ? (
                        <button
                          type="button"
                          onClick={() => handleSubmit({ preventDefault: () => {} })}
                          disabled={updateMutation.isPending}
                          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Enregistrer
                        </button>
                      ) : (
                        <button type="button" onClick={() => setCreateStep(3)}
                          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
                        >
                          Suivant →
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3 : Affecter aux classes (création uniquement) ─── */}
                {createStep === 3 && !showEdit && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Affecter aux classes</p>
                      <p className="text-xs opacity-50 mt-1 italic">
                        Sélectionnez les classes qui auront accès à ce cours. Les étudiants ne verront le cours que si leur classe est assignée.
                      </p>
                    </div>

                    {loadingClasses ? (
                      <div className="flex items-center justify-center py-8 opacity-40">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : filteredClasses.length === 0 ? (
                      <div className="py-8 text-center rounded-2xl border-2 border-dashed border-(--glass-border) opacity-50">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-black uppercase tracking-widest">Aucune classe disponible</p>
                        <p className="text-[10px] opacity-60 mt-1">Vous pourrez affecter des classes depuis la page du cours.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {filteredClasses.map(cls => {
                          const isSelected = selectedClassIds.has(cls.id)
                          return (
                            <button
                              key={cls.id}
                              type="button"
                              onClick={() => {
                                setSelectedClassIds(prev => {
                                  const next = new Set(prev)
                                  isSelected ? next.delete(cls.id) : next.add(cls.id)
                                  return next
                                })
                              }}
                              className={cn(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all text-left",
                                isSelected
                                  ? "bg-primary/10 border-primary/50 text-primary"
                                  : "glass-card border-(--glass-border) hover:border-primary/30"
                              )}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                                isSelected ? "bg-primary border-primary" : "border-slate-300 dark:border-slate-600"
                              )}>
                                {isSelected && <span className="text-white text-[10px] font-black">✓</span>}
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

                    {selectedClassIds.size > 0 && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                        {selectedClassIds.size} classe{selectedClassIds.size > 1 ? 's' : ''} sélectionnée{selectedClassIds.size > 1 ? 's' : ''}
                      </p>
                    )}

                    <div className="flex justify-between gap-3 pt-2">
                      <button type="button" onClick={() => setCreateStep(2)}
                        className="px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/40 transition-all"
                      >
                        ← Précédent
                      </button>
                      <button
                        type="button"
                        disabled={createMutation.isPending}
                        onClick={() => {
                          const courseData = {
                            title: form.title.trim(),
                            code: form.code.trim().toUpperCase(),
                            description: form.description?.trim() || null,
                            objectives: form.objectives?.trim() || null,
                            syllabus: form.syllabus?.trim() || null,
                            credits: Number(form.credits),
                            totalHours: Number(form.totalHours),
                            academicYearId: Number(form.academicYearId),
                            programId: Number(form.programId),
                            semester: form.semester || null,
                            teachingUnitId: form.teachingUnitId ? Number(form.teachingUnitId) : null,
                          }
                          if (isTeacher && userId) courseData.instructorUserId = userId
                          createMutation.mutate(courseData)
                        }}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Créer le Cours
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Gestion des UE (profs/admins uniquement) ────────────────── */}
      <AnimatePresence>
        {showUeManager && (isTeacher || isAdmin) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowUeManager(false); setUeForm(EMPTY_UE_FORM); setEditUeId(null) } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl glass-card rounded-3xl border-(--glass-border) overflow-hidden shadow-2xl"
            >
              {/* Header modal */}
              <div className="flex items-center justify-between p-8 border-b border-(--glass-border)">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter italic flex items-center gap-3">
                    <Layers className="w-6 h-6 text-primary" />
                    Gestion des Unités d&apos;Enseignement
                  </h2>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Réservé aux enseignants et administrateurs</p>
                </div>
                <button onClick={() => { setShowUeManager(false); setUeForm(EMPTY_UE_FORM); setEditUeId(null) }}
                  className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:border-rose-500/50 hover:text-rose-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-(--glass-border) max-h-[75vh] overflow-hidden">

                {/* Formulaire création / édition UE */}
                <div className="p-6 overflow-y-auto">
                  <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">
                    {editUeId ? 'Modifier l\'UE' : 'Nouvelle UE'}
                  </h3>
                  <form onSubmit={handleUeSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Code UE *</label>
                        <input required value={ueForm.code} onChange={e => setUeForm(f => ({ ...f, code: e.target.value }))}
                          placeholder="ex: UE1" className="px-3 py-2.5 rounded-xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Semestre *</label>
                        <select required value={ueForm.semester} onChange={e => setUeForm(f => ({ ...f, semester: e.target.value }))}
                          className="px-3 py-2.5 rounded-xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none">
                          <option value="">Choisir...</option>
                          {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Nom de l&apos;UE *</label>
                      <input required value={ueForm.name} onChange={e => setUeForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="ex: GRAPHIC DESIGN" className="px-3 py-2.5 rounded-xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Filière (Programme) *</label>
                      <select required value={ueForm.programId} onChange={e => setUeForm(f => ({ ...f, programId: e.target.value }))}
                        className="px-3 py-2.5 rounded-xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none">
                        <option value="">Sélectionner...</option>
                        {programs.map(p => <option key={p.id} value={p.id}>{p.name || p.label}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Ordre d&apos;affichage</label>
                        <input type="number" min="1" value={ueForm.orderIndex} onChange={e => setUeForm(f => ({ ...f, orderIndex: e.target.value }))}
                          className="px-3 py-2.5 rounded-xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Description</label>
                      <textarea rows={2} value={ueForm.description} onChange={e => setUeForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Description optionnelle..."
                        className="px-3 py-2.5 rounded-xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none resize-none" />
                    </div>

                    <div className="flex gap-2 pt-1">
                      {editUeId && (
                        <button type="button" onClick={() => { setUeForm(EMPTY_UE_FORM); setEditUeId(null) }}
                          className="px-4 py-2.5 rounded-xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-rose-500/40 transition-all">
                          Annuler
                        </button>
                      )}
                      <button type="submit" disabled={createUeMutation.isPending || updateUeMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50">
                        {(createUeMutation.isPending || updateUeMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {editUeId ? 'Enregistrer' : 'Créer l\'UE'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Liste des UEs existantes */}
                <div className="p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">UEs existantes</h3>
                    <select value={filterUeProgramId} onChange={e => setFilterUeProgramId(e.target.value)}
                      className="px-2 py-1.5 rounded-lg glass-card border-(--glass-border) font-bold text-xs outline-none">
                      <option value="">Toutes les filières</option>
                      {programs.map(p => <option key={p.id} value={p.id}>{p.name || p.label}</option>)}
                    </select>
                  </div>

                  {loadingUes ? (
                    <div className="flex justify-center py-10 opacity-40">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : allUes.length === 0 ? (
                    <div className="py-10 text-center opacity-30">
                      <Layers className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs font-black uppercase tracking-widest">Aucune UE créée.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allUes.map(ue => (
                        <div key={ue.id} className="flex items-center justify-between p-3 rounded-xl glass-card border-(--glass-border) hover:border-primary/30 transition-all group">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">{ue.semester}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{ue.code}</span>
                            </div>
                            <p className="text-sm font-bold mt-0.5 truncate">{ue.name}</p>
                            <p className="text-[10px] opacity-30 font-medium">{ue.programName}</p>
                          </div>
                          <div className="flex gap-1.5 ml-2 flex-shrink-0">
                            <button onClick={() => handleEditUe(ue)}
                              className="w-8 h-8 rounded-lg glass-card flex items-center justify-center hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30 transition-all opacity-0 group-hover:opacity-100">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {isAdmin && (
                              <button onClick={() => handleDeleteUe(ue)} disabled={deleteUeMutation.isPending}
                                className="w-8 h-8 rounded-lg glass-card flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
