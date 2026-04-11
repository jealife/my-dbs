'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2, CheckCircle, Search, FileText } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { evaluationService } from '@/lib/evaluation-service'
import { userService } from '@/lib/user-service'
import { useAuth } from '@/hooks/use-auth-hook'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export function GradeEntryView({ evaluation, onBack }) {
  const queryClient = useQueryClient()
  const { user, isStudent } = useAuth()
  const [grades, setGrades] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch all students (ideally filtered by cohort if the API supports it)
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students-list'],
    queryFn: () => userService.getUsersByRole('STUDENT'),
  })

  // Filter students if the evaluation belongs to a specific cohort
  // If user is a student, they can ONLY see themselves
  const cohortStudents = isStudent && user
    ? students.filter(s => s.id === user.id || s.id === user.userId)
    : (evaluation.cohortId 
      ? students.filter(s => s.cohortId === evaluation.cohortId) 
      : students)

  // Fetch existing grades for this evaluation
  const { data: existingGrades = [], isLoading: loadingGrades } = useQuery({
    queryKey: ['evaluation-grades', evaluation.id],
    queryFn: () => evaluationService.getGrades(evaluation.id),
  })

  // Sync existing grades into local state
  useEffect(() => {
    if (existingGrades.length > 0) {
      const initialGrades = {}
      existingGrades.forEach(g => {
        initialGrades[g.studentId] = {
          score: g.score || '',
          comments: g.comments || '',
          id: g.id // to know if we are updating (PATCH) or creating (POST)
        }
      })
      setGrades(initialGrades)
    }
  }, [existingGrades])

  const handleScoreChange = (studentId, val) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], score: val }
    }))
  }

  const handleCommentChange = (studentId, val) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], comments: val }
    }))
  }

  // Mutation to save all grades
  const saveGradesMutation = useMutation({
    mutationFn: async () => {
      const promises = []
      // We iterate over the edited grades and send them to the backend 
      // If `g.score` is set (and valid), we save it
      for (const [studentId, g] of Object.entries(grades)) {
        if (g.score !== undefined && g.score !== '' && g.score !== null) {
          const payload = {
            studentId: Number(studentId),
            score: Number(g.score),
            comments: g.comments
          }
          if (g.id) {
            // It has an ID, we update with the generic API client if available
            // If the endpoint is PUT/PATCH /api/v1/evaluations/grades/{resultId}
            // (Assuming we add this patch in the service if not present, but for now we just use submitGrade which might upsert, OR we add updateGrade)
            // Actually, we can just POST and maybe backend handles upsert, but wait! The controller has @PatchMapping("/grades/{resultId}")
            promises.push(
              import('@/lib/api-client').then(m => 
                m.apiClient.patch(`/v1/evaluations/grades/${g.id}`, payload)
              )
            )
          } else {
            // New grade
            promises.push(evaluationService.submitGrade(evaluation.id, payload))
          }
        }
      }
      await Promise.all(promises)
    },
    onSuccess: () => {
      toast.success("Toutes les notes ont été enregistrées avec succès !")
      queryClient.invalidateQueries({ queryKey: ['evaluation-grades', evaluation.id] })
    },
    onError: (err) => {
      toast.error("Une erreur est survenue lors de l'enregistrement : " + err.message)
    }
  })

  const filteredStudents = cohortStudents.filter(s => 
    !searchTerm || (`${s.firstName} ${s.lastName} ${s.code}`).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isSaving = saveGradesMutation.isPending
  const isLoading = loadingStudents || loadingGrades

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div className="flex flex-col gap-1">
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-colors self-start mb-2">
            <ArrowLeft className="w-4 h-4" /> Retour aux évaluations
          </button>
          <h1 className="text-3xl font-black tracking-tighter italic">Saisie des notes</h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Évaluation : <span className="font-bold text-foreground">{evaluation.title || evaluation.name}</span></p>
        </div>
        <div className="flex gap-4">
           {evaluation.status !== 'RESULTS_PUBLISHED' && (
             <button 
               onClick={() => saveGradesMutation.mutate()}
               disabled={isSaving}
               className={cn(
                 "flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.15em] shadow-xl transition-all",
                 isSaving ? "bg-slate-400 opacity-50 cursor-not-allowed" : "bg-primary shadow-primary/30 hover:scale-[1.02] active:scale-95"
               )}
             >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Enregistrer la grille
             </button>
           )}
        </div>
      </header>

      {/* Main Grid View */}
      <GlassCard className="p-0 border-none ring-1 ring-(--glass-border) shadow-none overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-(--glass-border) bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-xl text-primary">
               <FileText className="w-5 h-5" />
             </div>
             <div>
               <h3 className="font-black text-sm uppercase tracking-widest">Grille de la classe</h3>
               <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Barème sur 20</p>
             </div>
          </div>
          <div className="relative group w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Chercher un étudiant..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-xs uppercase outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100/30 dark:bg-slate-800/30 border-b border-(--glass-border)">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic w-16 text-center">N°</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Étudiant</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic w-40 text-center">Note (/20)</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Appréciation / Commentaire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--glass-border)">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-20 opacity-40"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" /><p className="text-xs font-black uppercase tracking-widest italic">Chargement de la classe...</p></td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-20 opacity-40"><p className="text-sm font-black italic uppercase tracking-widest">Aucun étudiant trouvé.</p></td></tr>
              ) : (
                filteredStudents.map((student, i) => {
                  const sId = student.id;
                  const rawGrade = grades[sId];
                  const currentGrade = { score: rawGrade?.score ?? '', comments: rawGrade?.comments ?? '', id: rawGrade?.id };
                  const isSaved = !!currentGrade.id;
                  const isReadOnly = isStudent || evaluation.status === 'RESULTS_PUBLISHED';

                  return (
                    <tr key={student.id} className="group hover:bg-primary/2 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-black opacity-30 italic">{i + 1}</span>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                          {student.firstName?.[0] || student.name?.[0] || 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-black whitespace-nowrap">{student.name || `${student.firstName} ${student.lastName}`}</p>
                          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{student.code}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative flex justify-center">
                          <input 
                            type="number" 
                            min="0" max="20" step="0.5"
                            value={currentGrade.score}
                            onChange={(e) => handleScoreChange(sId, e.target.value)}
                            disabled={isReadOnly}
                            className="w-24 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-(--glass-border) focus:border-primary/60 outline-none text-center font-black text-base shadow-inner disabled:opacity-50"
                            placeholder="—"
                          />
                          {isSaved && <CheckCircle className="absolute -right-2 -top-2 w-4 h-4 text-emerald-500 bg-white dark:bg-slate-950 rounded-full" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={currentGrade.comments}
                          onChange={(e) => handleCommentChange(sId, e.target.value)}
                          disabled={isReadOnly}
                          className="w-full px-4 py-3 rounded-xl bg-transparent border border-transparent hover:border-(--glass-border) focus:border-primary/40 focus:bg-slate-50 dark:focus:bg-slate-900 outline-none font-medium text-xs disabled:opacity-50 transition-all"
                          placeholder="Ajouter une observation..."
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
