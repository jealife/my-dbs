'use client'

import { useRouter } from 'next/navigation'
import { ShieldOff, ArrowLeft, Home, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { authService } from '@/lib/auth-service'
import Link from 'next/link'

export default function AccesRefusePage() {
  const router = useRouter()

  const handleLogout = async () => {
    await authService.logout()
    router.replace('/login')
  }

  const user = typeof window !== 'undefined' ? authService.getCurrentUser() : null
  const role = user?.role || user?.roles?.[0] || null

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-linear-to-br from-destructive/5 to-orange-500/5 -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard className="border-none shadow-2xl ring-1 ring-(--glass-border) text-center">
          {/* Icône */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-destructive/10 flex items-center justify-center">
                <ShieldOff className="w-12 h-12 text-destructive" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-black">!</span>
              </div>
            </div>
          </motion.div>

          {/* Titre */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-black tracking-tight mb-2">Accès refusé</h1>
            <p className="text-xs font-black uppercase tracking-widest text-destructive opacity-70 mb-6">
              Autorisation insuffisante
            </p>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-sm text-muted-foreground font-serif italic leading-relaxed">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              {role && (
                <> Votre rôle actuel est <strong className="not-italic font-black text-foreground">{role}</strong>.</>
              )}
            </p>
          </motion.div>

          {/* Séparateur */}
          <div className="border-t border-(--glass-border) mb-8" />

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <button
              onClick={() => router.back()}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>RETOUR À LA PAGE PRÉCÉDENTE</span>
            </button>

            <Link
              href="/overview"
              className="w-full py-4 rounded-2xl border border-(--glass-border) font-black text-sm hover:bg-(--glass-border)/10 transition-all active:scale-95 flex items-center justify-center gap-2 group text-muted-foreground"
            >
              <Home className="w-5 h-5" />
              <span>TABLEAU DE BORD</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-2 opacity-60 hover:opacity-100"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </motion.div>
        </GlassCard>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center space-y-2"
        >
          <p className="text-xs text-muted-foreground opacity-50 font-bold">
            Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur.
          </p>
          <p className="text-xs font-bold opacity-20 cursor-default font-serif italic">
            &copy; 2026 My DBS Inc. Tous droits réservés.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
