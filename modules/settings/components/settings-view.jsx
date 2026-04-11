'use client'

import { Sun, Moon, Monitor, Volume2, VolumeX, Bell, BellOff, User, Key, ChevronRight, ExternalLink } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useTheme } from '@/components/theme-provider'
import { isSoundEnabled, toggleSound } from '@/lib/notification-sound'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const THEME_OPTIONS = [
  { value: 'light', label: 'Clair',  icon: Sun   },
  { value: 'auto',  label: 'Auto',   icon: Monitor },
  { value: 'dark',  label: 'Sombre', icon: Moon  },
]

export function SettingsView() {
  const { theme, setTheme, mounted } = useTheme()
  const [soundOn, setSoundOn]               = useState(true)
  const [browserPermission, setBrowserPermission] = useState('default')

  useEffect(() => {
    setSoundOn(isSoundEnabled())
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission)
    }
  }, [])

  const handleSoundToggle = () => {
    const next = toggleSound()
    setSoundOn(next)
  }

  const handleBrowserPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    try {
      const result = await Notification.requestPermission()
      setBrowserPermission(result)
    } catch {
      // Firefox throws if called without user gesture — just update state
      setBrowserPermission(Notification.permission)
    }
  }

  // Displayed theme label for live preview
  const activeLabel = THEME_OPTIONS.find(t => t.value === (mounted ? theme : 'light'))?.label || 'Clair'

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-1">
        <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter">
          Para<span className="text-primary">mètres</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm font-medium italic opacity-70">
          Personnalisez l'apparence et le comportement de l'application.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Apparence ─────────────────────────────────────────────── */}
        <GlassCard className="border-none ring-1 ring-(--glass-border) p-5 sm:p-6 space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Apparence</p>
            <p className="text-xs font-medium opacity-40">Mode d'affichage de l'application</p>
          </div>

          {/* Theme toggle buttons */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
              const active = mounted ? theme === value : value === 'light'
              return (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 py-4 sm:py-5 rounded-2xl ring-1 transition-all duration-200 font-black text-[10px] sm:text-xs uppercase tracking-widest active:scale-95 select-none',
                    active
                      ? 'ring-primary bg-primary/10 text-primary shadow-lg shadow-primary/15'
                      : 'ring-(--glass-border) opacity-50 hover:opacity-80 hover:ring-primary/30 hover:bg-slate-50 dark:hover:bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className={cn(
              'w-2 h-2 rounded-full shrink-0',
              (mounted ? theme : 'light') === 'dark'
                ? 'bg-slate-500'
                : (mounted ? theme : 'light') === 'auto'
                  ? 'bg-primary animate-pulse'
                  : 'bg-amber-400'
            )} />
            <span className="text-[10px] font-bold opacity-40 italic">Mode actif : {activeLabel}</span>
          </div>
        </GlassCard>

        {/* ── Son ───────────────────────────────────────────────────── */}
        <GlassCard className="border-none ring-1 ring-(--glass-border) p-5 sm:p-6 space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Son</p>
            <p className="text-xs font-medium opacity-40">Alertes sonores des notifications</p>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/60 dark:bg-white/5 ring-1 ring-(--glass-border)">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                soundOn ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-800 text-muted-foreground'
              )}>
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black uppercase tracking-tight truncate">Son des notifications</p>
                <p className="text-[10px] font-medium opacity-40 italic">Chime à chaque alerte</p>
              </div>
            </div>
            {/* Toggle switch */}
            <button
              onClick={handleSoundToggle}
              aria-label={soundOn ? 'Désactiver le son' : 'Activer le son'}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0',
                soundOn ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
              )}
            >
              <span className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200',
                soundOn ? 'left-6' : 'left-1'
              )} />
            </button>
          </div>
        </GlassCard>

        {/* ── Notifications navigateur ──────────────────────────────── */}
        <GlassCard className="border-none ring-1 ring-(--glass-border) p-5 sm:p-6 space-y-5 lg:col-span-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Notifications navigateur</p>
            <p className="text-xs font-medium opacity-40">Recevoir des alertes même hors de l'application</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/60 dark:bg-white/5 ring-1 ring-(--glass-border)">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                browserPermission === 'granted'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : browserPermission === 'denied'
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'bg-amber-500/10 text-amber-500'
              )}>
                {browserPermission === 'granted' ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black uppercase tracking-tight">
                  {browserPermission === 'granted'
                    ? 'Notifications activées'
                    : browserPermission === 'denied'
                      ? 'Notifications bloquées'
                      : 'Notifications désactivées'}
                </p>
                <p className="text-[10px] font-medium opacity-40 italic">
                  {browserPermission === 'granted'
                    ? 'Vous recevrez des alertes en temps réel'
                    : browserPermission === 'denied'
                      ? 'Autorisez manuellement dans les réglages navigateur'
                      : 'Cliquez sur Autoriser pour activer'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {browserPermission === 'granted' && (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                  Actif
                </span>
              )}

              {browserPermission === 'default' && (
                <button
                  onClick={handleBrowserPermission}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-primary/20"
                >
                  Autoriser
                </button>
              )}

              {browserPermission === 'denied' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <button
                    onClick={handleBrowserPermission}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Bell className="w-3 h-3" />
                    Réessayer
                  </button>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault()
                      // Open browser settings help - varies by browser
                      alert('Pour autoriser les notifications :\n1. Cliquez sur 🔒 dans la barre d\'adresse\n2. Allez dans "Paramètres du site"\n3. Autorisez les Notifications')
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors active:scale-95 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Aide
                  </a>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* ── Raccourcis Compte ─────────────────────────────────────── */}
        <GlassCard className="border-none ring-1 ring-(--glass-border) p-5 sm:p-6 space-y-3 lg:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Compte</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/profile"
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-100/60 dark:bg-white/5 ring-1 ring-(--glass-border) hover:ring-primary/40 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-tight truncate">Informations personnelles</p>
                  <p className="text-[9px] font-medium opacity-40 italic">Nom, photo, contact…</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
            </Link>

            <Link href="/profile"
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-100/60 dark:bg-white/5 ring-1 ring-(--glass-border) hover:ring-primary/40 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-muted-foreground flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-tight truncate">Sécurité & Mot de passe</p>
                  <p className="text-[9px] font-medium opacity-40 italic">Modifier le mot de passe…</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
