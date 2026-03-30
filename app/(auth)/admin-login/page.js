'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { authService } from '@/lib/auth-service'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  // Test de connexion silencieux au backend au chargement
  useEffect(() => {
    const testConnection = async () => {
      try {
        await authService.testConnection();
        console.log("✅ [MyDBS] Connexion au backend établie avec succès.");
      } catch (error) {
        console.warn("⚠️ [MyDBS] Impossible de contacter le backend.");
      }
    };
    testConnection();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Intégration backend réelle
      const response = await authService.login(email, password)
      
      // Vérification facultative si c'est bien un admin (optionnel si le backend gère déjà)
      const user = response.data?.user || response.user
      const role = user?.role || ''
      if (!['ADMIN', 'DIRECTION', 'SUPER_ADMIN'].includes(role.toUpperCase())) {
        // throw new Error("Accès refusé. Cette page est réservée aux administrateurs.")
      }

      router.replace('/overview')
    } catch (err) {
      setError(err.message || "Impossible de se connecter au serveur backend.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-slate-950 overflow-hidden">
      {/* Background elements specific to Admin */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg z-10"
      >
        <div className="flex flex-col items-center mb-10">
           <div className="w-20 h-20 bg-white/5 backdrop-blur-3xl border border-white/10 p-5 rounded-3xl shadow-2xl mb-6 relative group">
              <ShieldCheck className="w-full h-full text-primary group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping" />
           </div>
           <h1 className="text-4xl font-black tracking-tighter italic text-white text-center">CONSOLE <span className="text-primary underline decoration-2 underline-offset-8 decoration-primary/30">ADMINISTRATEUR</span></h1>
           <p className="text-slate-400 mt-4 font-bold text-xs uppercase tracking-[0.3em] opacity-60">Accès sécurisé de haut niveau</p>
        </div>

        <GlassCard className="border-none shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 bg-black/40 p-10">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-4 text-rose-500"
              >
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-black italic">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-slate-500">Identifiant Master / Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@mydbs.com"
                  className="w-full pl-14 pr-4 py-5 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-white font-bold placeholder:italic placeholder:opacity-20 transition-all text-[0.95rem]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-slate-500">Clé d'Accès Sécurisée</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Admin@123456"
                  className="w-full pl-14 pr-14 py-5 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-white font-bold placeholder:opacity-20 transition-all text-[0.95rem]"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-primary text-white font-black shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="tracking-widest uppercase text-xs">DÉVERROUILLER L'ACCÈS</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </GlassCard>

        <div className="mt-12 text-center space-y-4">
           <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
              Retour au portail standard
           </Link>
           <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">
              Système de Sécurité Avancé • v3.8.2
           </p>
        </div>
      </motion.div>
    </div>
  )
}
