'use client'

import { BookOpen, Plus, FileText, Loader2, Users, GraduationCap, LayoutGrid, X, Edit, Trash2, Upload, Eye, EyeOff, Archive, Download, School } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/lib/course-service'
import { useAuth } from '@/hooks/use-auth-hook'
import { cn } from '@/lib/utils'
import { MaintenanceZone } from '@/components/ui/maintenance-zone'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

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

const EMPTY_FORM = {
  title: '', code: '', description: '', objectives: '',
  credits: '', totalHours: '',
  academicYearId: '', programId: '',
}

export default function LMSPage() {
  const { isAdmin, isTeacher, user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id || user?.userId
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(null)
  const [showUpload, setShowUpload] = useState(null)
  const [showAssignClass, setShowAssignClass] = useState(null) // course object
  const [selectedClassId, setSelectedClassId] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [uploadFile, setUploadFile] = useState(null)

  const { data: courses = [], isLoading, error, refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getCourses(),
  })

  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn: courseService.getAcademicYears,
    enabled: showCreate || !!showEdit,
  })

  const { data: allClasses = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => courseService.getClasses(),
    enabled: !!showAssignClass,
  })

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: courseService.getPrograms,
    enabled: showCreate || !!showEdit,
  })

  const createMutation = useMutation({
    mutationFn: (data) => courseService.createCourse(data),
    onSuccess: () => {
      toast.success('Cours créé avec succès !')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      setShowCreate(false)
      setForm(EMPTY_FORM)
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
      queryClient.invalidateQueries({ queryKey: ['courses'] })
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
      queryClient.invalidateQueries({ queryKey: ['courses'] })
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
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
    onError: err => toast.error(`Erreur: ${err.response?.data?.message || err.message}`),
  })

  const unpublishMutation = useMutation({
    mutationFn: (id) => courseService.unpublishCourse(id),
    onSuccess: () => {
      toast.success('Cours dépublié !')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
    onError: err => toast.error(`Erreur: ${err.response?.data?.message || err.message}`),
  })

  const assignClassMutation = useMutation({
    mutationFn: ({ courseId, classRoomId }) => courseService.assignClassRoom(courseId, classRoomId),
    onSuccess: () => {
      toast.success('Classe assignée avec succès !')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      setShowAssignClass(null)
      setSelectedClassId('')
    },
    onError: err => toast.error(err.response?.data?.message || err.message),
  })

  const uploadMutation = useMutation({
    mutationFn: ({ courseId, formData }) => courseService.uploadResource(courseId, formData),
    onSuccess: () => {
      toast.success('Fichier uploadé avec succès !')
      queryClient.invalidateQueries({ queryKey: ['course-resources'] })
      setShowUpload(null)
      setUploadFile(null)
    },
    onError: err => {
      const msg = err.response?.data?.message || err.message
      toast.error(`Erreur: ${msg}`)
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    
    if (!form.title || !form.credits || !form.totalHours || !form.academicYearId || !form.programId) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    const courseData = {
      title: form.title.trim(),
      code: form.code?.trim()?.toUpperCase() || null,
      description: form.description?.trim() || null,
      objectives: form.objectives?.trim() || null,
      credits: Number(form.credits),
      totalHours: Number(form.totalHours),
      academicYearId: Number(form.academicYearId),
      programId: Number(form.programId),
    }

    if (isTeacher && userId) {
      courseData.instructorUserId = userId
    }

    if (showEdit) {
      updateMutation.mutate({ id: showEdit, data: courseData })
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
      credits: course.credits?.toString() || '',
      totalHours: course.totalHours?.toString() || '',
      academicYearId: course.academicYearId?.toString() || '',
      programId: course.programId?.toString() || '',
    })
    setShowEdit(course.id)
  }

  function handleDelete(course) {
    if (confirm(`Archiver le cours "${course.title || course.name}" ? Cette action est irréversible.`)) {
      deleteMutation.mutate(course.id)
    }
  }

  function handleUpload(e) {
    e.preventDefault()
    if (!uploadFile || !showUpload) return

    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('title', uploadFile.name)
    formData.append('resourceType', 'FILE')

    uploadMutation.mutate({ courseId: showUpload, formData })
  }

  if (error) {
    return (
      <div className="p-4">
        <MaintenanceZone error={error} reset={refetch} zone="Catalogue LMS" />
      </div>
    )
  }

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || uploadMutation.isPending

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
            <button 
              onClick={() => { setForm(EMPTY_FORM); setShowCreate(true) }}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-black shadow-lg hover:shadow-primary/40 transition-all active:scale-95 group"
            >
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
                    course.published ? STATUS_STYLES.ACTIVE : STATUS_STYLES.DRAFT
                  )}>
                    {course.published ? 'PUBLIÉ' : 'BROUILLON'}
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
                    {course.classRoomName && (
                      <div className="flex items-center justify-between text-xs font-bold tracking-tight py-2 border-b border-(--glass-border)">
                        <span className="opacity-70 uppercase flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5" /> Classe
                        </span>
                        <span className="truncate max-w-[140px] text-violet-500">{course.classRoomName}</span>
                      </div>
                    )}
                    {(course.teacherName || course.instructorName) && (
                      <div className="flex items-center justify-between text-xs font-bold tracking-tight py-2 border-b border-(--glass-border)">
                        <span className="opacity-70 uppercase flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" /> Professeur
                        </span>
                        <span className="truncate max-w-[140px]">{course.teacherName || course.instructorName}</span>
                      </div>
                    )}
                    {course.credits !== undefined && (
                      <div className="flex items-center justify-between text-xs font-bold tracking-tight py-2 border-b border-(--glass-border)">
                        <span className="opacity-70 uppercase">Crédits ECTS</span>
                        <span className="text-primary font-black">{course.credits}</span>
                      </div>
                    )}

                    {course.enrolledStudentsCount !== undefined && (
                      <div className="flex items-center justify-between text-xs font-bold tracking-tight py-2 border-b border-(--glass-border)">
                        <span className="opacity-70 uppercase flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> Inscrits
                        </span>
                        <span className="font-black">{course.enrolledStudentsCount}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-2">
                  <Link href={`/courses/${course.id}`} className="flex-1">
                    <button className="w-full py-3 text-xs font-black uppercase tracking-widest bg-(--glass-border)/20 hover:bg-primary hover:text-white rounded-xl transition-all active:scale-95">
                      Voir
                    </button>
                  </Link>
                  {(isAdmin || isTeacher) && (
                    <>
                      <button 
                        onClick={() => handleEdit(course)}
                        disabled={isMutating}
                        className="px-3 py-3 bg-(--glass-border)/20 rounded-xl hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowUpload(course.id)}
                        disabled={isMutating}
                        className="px-3 py-3 bg-(--glass-border)/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-50"
                        title="Upload fichier"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setShowAssignClass(course); setSelectedClassId(course.classRoomId?.toString() || '') }}
                        disabled={isMutating}
                        className={cn(
                          "px-3 py-3 rounded-xl transition-colors disabled:opacity-50",
                          course.classRoomId ? "bg-violet-500/10 text-violet-500 hover:bg-violet-500 hover:text-white" : "bg-(--glass-border)/20 hover:bg-violet-500 hover:text-white"
                        )}
                        title="Assigner une classe"
                      >
                        <School className="w-4 h-4" />
                      </button>
                      {course.published ? (
                        <button 
                          onClick={() => unpublishMutation.mutate(course.id)}
                          disabled={isMutating}
                          className="px-3 py-3 bg-(--glass-border)/20 rounded-xl hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-50"
                          title="Dépublier"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => publishMutation.mutate(course.id)}
                          disabled={isMutating}
                          className="px-3 py-3 bg-(--glass-border)/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-50"
                          title="Publier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(course)}
                          disabled={isMutating}
                          className="px-3 py-3 bg-(--glass-border)/20 rounded-xl hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                          title="Archiver"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Création/Édition Cours */}
      <AnimatePresence>
        {(showCreate || showEdit) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowCreate(false); setShowEdit(null); setForm(EMPTY_FORM) } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl glass-card rounded-3xl border-(--glass-border) overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-8 border-b border-(--glass-border)">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter italic">{showEdit ? 'Modifier le Cours' : 'Nouveau Cours'}</h2>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Renseigner les informations du cours</p>
                </div>
                <button onClick={() => { setShowCreate(false); setShowEdit(null); setForm(EMPTY_FORM) }} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:border-rose-500/50 hover:text-rose-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Titre *</label>
                    <input
                      required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="ex: Algèbre Linéaire"
                      className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Code (facultatif : auto-généré)</label>
                    <input
                      value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                      placeholder="ex: MATH101"
                      className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Crédits *</label>
                    <input
                      required type="number" min="1" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))}
                      placeholder="3"
                      className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Heures *</label>
                    <input
                      required type="number" min="1" value={form.totalHours} onChange={e => setForm(f => ({ ...f, totalHours: e.target.value }))}
                      placeholder="45"
                      className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Année Académique *</label>
                    <select
                      required value={form.academicYearId} onChange={e => setForm(f => ({ ...f, academicYearId: e.target.value }))}
                      className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                    >
                      <option value="">Sélectionner...</option>
                      {academicYears.map(y => (
                        <option key={y.id} value={y.id}>{y.name || y.label || y.year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Programme *</label>
                    <select
                      required value={form.programId} onChange={e => setForm(f => ({ ...f, programId: e.target.value }))}
                      className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                    >
                      <option value="">Sélectionner...</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.name || p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Objectifs</label>
                  <textarea
                    rows={2} value={form.objectives} onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))}
                    placeholder="Objectifs pédagogiques du cours..."
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

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowCreate(false); setShowEdit(null); setForm(EMPTY_FORM) }}
                    className="px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-rose-500/40 transition-all"
                  >
                    Annuler
                  </button>
                  <button type="submit" disabled={isMutating}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {showEdit ? 'Modifier le Cours' : 'Créer le Cours'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Upload Fichier */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowUpload(null); setUploadFile(null) } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card rounded-3xl border-(--glass-border) overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-8 border-b border-(--glass-border)">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter italic">Upload Fichier</h2>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Ajouter une ressource au cours</p>
                </div>
                <button onClick={() => { setShowUpload(null); setUploadFile(null) }} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:border-rose-500/50 hover:text-rose-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-8 space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Fichier *</label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      onChange={e => setUploadFile(e.target.files[0])}
                      className="w-full px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none file:mr-4 file:py-1 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary file:text-white hover:file:bg-primary/90"
                    />
                  </div>
                  {uploadFile && (
                    <p className="text-xs font-bold opacity-60 mt-2">
                      Fichier sélectionné: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowUpload(null); setUploadFile(null) }}
                    className="px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-rose-500/40 transition-all"
                  >
                    Annuler
                  </button>
                  <button type="submit" disabled={isMutating || !uploadFile}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Uploader
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Assigner une Classe */}
      <AnimatePresence>
        {showAssignClass && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowAssignClass(null); setSelectedClassId('') } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card rounded-3xl border-(--glass-border) overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-8 border-b border-(--glass-border)">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter italic">Assigner une Classe</h2>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1 truncate max-w-[260px]">
                    {showAssignClass.title || showAssignClass.name}
                  </p>
                </div>
                <button onClick={() => { setShowAssignClass(null); setSelectedClassId('') }} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:border-rose-500/50 hover:text-rose-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {showAssignClass.classRoomName && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-violet-500/10 text-violet-600">
                    <School className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest">Classe actuelle : {showAssignClass.classRoomName}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Nouvelle classe</label>
                  <select
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                    className="px-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-sm outline-none"
                  >
                    <option value="">— Aucune classe (désassigner) —</option>
                    {allClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} — {cls.programName || cls.code}
                        {cls.capacity ? ` (${cls.studentCount ?? 0}/${cls.capacity})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAssignClass(null); setSelectedClassId('') }}
                    className="px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-rose-500/40 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => assignClassMutation.mutate({
                      courseId: showAssignClass.id,
                      classRoomId: selectedClassId ? Number(selectedClassId) : null,
                    })}
                    disabled={assignClassMutation.isPending}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-violet-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-500/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {assignClassMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <School className="w-4 h-4" />}
                    Confirmer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}