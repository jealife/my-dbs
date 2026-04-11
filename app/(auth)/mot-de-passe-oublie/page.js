'use client'

import { useState } from 'react'
import { Mail, ArrowRight, AlertCircle, CheckCircle2, School, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import Link from 'next/link'
import axios from 'axios'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await axios.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      // Même en cas d'erreur 404, on affiche le succès pour ne pas exposer
      // les emails existants (sécurité UX)
      if (err.response?.status === 404 || err.response?.status === 400) {
        setSent(true)
      } else {
        setError(err.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-purple-500/5 -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="premium-gradient p-4 rounded-2xl shadow-xl shadow-primary/20 mb-4">
            <School className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter italic">My School DBS</h1>
          <p className="text-muted-foreground mt-2 font-medium opacity-60">Réinitialisation du mot de passe</p>
        </div>

        <GlassCard className="border-none shadow-2xl ring-1 ring-(--glass-border)">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Mot de passe oublié ?</h2>
                  <p className="text-sm text-muted-foreground mt-1 font-medium font-serif italic">
                    Saisissez votre email institutionnel. Nous vous enverrons un lien de réinitialisation.
                  </p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-4 text-destructive"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-xs font-black italic">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">
                      Email Institutionnel
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="votre.email@mydbs.com"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-(--glass-border)/10 border border-(--glass-border) focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-bold placeholder:italic placeholder:opacity-30"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>ENVOYER LE LIEN</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-3">Email envoyé !</h2>
                <p className="text-sm text-muted-foreground font-serif italic leading-relaxed mb-8">
                  Si un compte est associé à <strong className="not-italic font-black">{email}</strong>,
                  vous recevrez un lien de réinitialisation dans quelques minutes.
                  Vérifiez également vos spams.
                </p>
                <p className="text-xs text-muted-foreground opacity-60 font-bold">
                  Le lien expire dans <span className="text-primary">30 minutes</span>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors opacity-60 hover:opacity-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>

        <p className="mt-6 text-center text-xs font-bold opacity-30 hover:opacity-100 transition-opacity cursor-default font-serif italic">
          &copy; 2026 My DBS Inc. Tous droits réservés.
        </p>
      </motion.div>
    </div>
  )
}
