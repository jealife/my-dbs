'use client'

import { Settings, User, Bell, Palette, Shield, Info, Keyboard } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { ThemeSwitcher } from '@/components/theme-switcher'

const settingsItems = [
  { 
    label: 'Profil Utilisateur', 
    desc: 'Gérez vos informations personnelles et votre avatar.', 
    icon: User,
    color: 'bg-blue-500'
  },
  { 
    label: 'Apparence', 
    desc: 'Personnalisez le thème et les couleurs de l\'interface.', 
    icon: Palette,
    color: 'bg-purple-500',
    component: <ThemeSwitcher />
  },
  { 
    label: 'Notifications', 
    desc: 'Configurez vos préférences d\'alertes système.', 
    icon: Bell,
    color: 'bg-amber-500'
  },
  { 
    label: 'Sécurité', 
    desc: 'Mot de passe, authentification et journaux d\'accès.', 
    icon: Shield,
    color: 'bg-emerald-500'
  },
  { 
    label: 'Raccourcis Clavier', 
    desc: 'Améliorez votre efficacité avec des raccourcis.', 
    icon: Keyboard,
    color: 'bg-slate-500'
  },
  { 
    label: 'À Propos', 
    desc: 'Version du système, licence et informations légales.', 
    icon: Info,
    color: 'bg-rose-500'
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom duration-700">
       <header className="px-2">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Paramètres Système</h1>
        <p className="text-muted-foreground mt-2 text-[0.95rem] font-medium font-serif italic">Configuration globale de votre expérience My DBS.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {settingsItems.map((item, idx) => (
          <GlassCard 
            key={idx} 
            className="group cursor-pointer hover:border-primary/30 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-5">
              <div className={`${item.color} p-4 rounded-2xl text-white shadow-lg transition-transform group-hover:rotate-12`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                   <h3 className="font-bold text-lg">{item.label}</h3>
                   {item.component && item.component}
                </div>
                <p className="text-sm text-muted-foreground mt-1 font-medium italic opacity-80">{item.desc}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
