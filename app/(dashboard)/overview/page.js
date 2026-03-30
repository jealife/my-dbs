'use client'

import { useAuth } from '@/hooks/use-auth-hook'
import { AdminDashboard } from '@/modules/dashboard/components/admin-dashboard'
import { StudentDashboard } from '@/modules/dashboard/components/student-dashboard'
import { TeacherDashboard } from '@/modules/dashboard/components/teacher-dashboard'
import { FinanceDashboard } from '@/modules/dashboard/components/finance-dashboard'
import { MentorDashboard } from '@/modules/dashboard/components/mentor-dashboard'
import { ScolarityDashboard } from '@/modules/dashboard/components/scolarity-dashboard'

export default function OverviewPage() {
  const { user, loading, isAdmin, isStudent, isTeacher, isFinance, isMentor, isScolarity, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-bold opacity-40 uppercase tracking-widest animate-pulse">Initialisation du Dashboard...</p>
      </div>
    )
  }

  // Dashboard dispatching based on roles
  if (isAuthenticated) {
    if (isAdmin) return <AdminDashboard user={user} />
    if (isStudent) return <StudentDashboard user={user} />
    if (isTeacher) return <TeacherDashboard user={user} />
    if (isFinance) return <FinanceDashboard user={user} />
    if (isScolarity) return <ScolarityDashboard user={user} />
    if (isMentor) return <MentorDashboard user={user} />
    
    // Fallback if role is authenticated but no specific dashboard
    return <AdminDashboard user={user} />
  }

  // Non authenticated state
  return (
    <div className="w-full flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
      <h1 className="text-2xl font-black italic tracking-tighter">Session expirée</h1>
      <p className="text-muted-foreground font-medium max-w-sm italic opacity-60">Veuillez vous reconnecter pour accéder à MyDBS.</p>
      <a href="/login" className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 active:scale-95 transition-all">
        Se Connecter
      </a>
    </div>
  )
}
