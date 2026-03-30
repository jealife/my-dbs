'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Settings, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth-hook'
import { NAVIGATION } from '@/lib/nav-config'

export function Sidebar({ className }) {
  const pathname = usePathname()
  const { user, logout, isAdmin, loading } = useAuth()
  const userRole = user?.role || ''

  // Filter items/sections visible to this role
  const filteredNav = NAVIGATION.filter(item => {
    if (!item.roles) return false
    if (item.roles.includes('ALL')) return true
    
    // Le SUPER_ADMIN voit tout ce que l'ADMIN voit
    if (userRole === 'SUPER_ADMIN' && item.roles.includes('ADMIN')) return true
    
    if (!userRole) return false  // hide if role unknown during loading
    return item.roles.includes(userRole)
  })

  return (
    <aside className={cn("w-[280px] h-screen border-r border-white/5 flex flex-col p-5 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.2)]", className)} style={{backgroundColor: '#301D00'}}>
      {/* Logo */}
      <div className="flex items-center justify-center px-2 gap-2 py-2 ">
        <Image 
          src="/logo-mydbs.png" 
          alt="MyDBS Logo" 
          width={160} 
          height={70} 
          className="object-contain h-18 w-auto" 
          priority 
        />
        <span className='text-gray-200 font-bold '>
            My DBS Portail
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto no-scrollbar py-2 pr-1">
        {loading ? (
          // Skeleton loader for sidebar items
          <div className="space-y-4 px-4 pt-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 w-full rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredNav.map((item, idx) => {
          // Section label
          if (item.type === 'section') {
            return (
              <p key={idx} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 px-4 pt-6 pb-2 italic">
                {item.label}
              </p>
            )
          }

          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link key={item.href} href={item.href} className="block">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-primary text-white shadow-xl shadow-primary/40"
                    : "hover:bg-white/5 text-slate-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3.5 relative z-10">
                  <item.icon className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  )} />
                  <span className="text-[0.82rem] font-bold tracking-tight uppercase whitespace-nowrap">{item.name}</span>
                </div>

                {isActive ? (
                  <motion.div layoutId="active-nav-dot" className="w-1.5 h-1.5 rounded-full bg-white z-10 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary shrink-0" />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="mt-4 pt-5 border-t border-gray-800 space-y-3">
        {/* <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-gray-800 transition-all cursor-pointer group">
          <div className="w-10 h-10 rounded-full premium-gradient p-px shrink-0">
            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-white">
              {user ? (user.first_name?.[0] || '') + (user.last_name?.[0] || '') : 'AD'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.88rem] font-bold truncate tracking-tight text-white group-hover:text-primary transition-colors">
              {user ? `${user.first_name} ${user.last_name}` : 'Administrateur'}
            </p>
            <p className="text-[9px] text-slate-400 truncate italic opacity-60 uppercase tracking-widest">
              {user?.role || 'ADMIN'} • {user?.user_code?.toLowerCase() || 'admin'}
            </p>
          </div>
        </Link> */}

        <div className="grid grid-cols-2 gap-2">
          <Link href="/settings" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white" title="Paramètres">
            <Settings className="w-4 h-4" />
          </Link>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  )
}
