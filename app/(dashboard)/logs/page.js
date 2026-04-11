'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Terminal, RefreshCcw, Pause, Play, Download, Search, Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/hooks/use-auth-hook'
import { useRouter } from 'next/navigation'

export default function SystemLogsPage() {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()
  
  const [logs, setLogs] = useState('')
  const [isLive, setIsLive] = useState(true)
  const [filter, setFilter] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [activeTab, setActiveTab] = useState('backend') // 'backend' or 'frontend'

  
  const bottomRef = useRef(null)
  
  // Protect route
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/overview')
    }
  }, [isAdmin, loading, router])

  const fetchLogs = async () => {
    if (!isLive && logs.length > 0) return
    setIsFetching(true)
    try {
      const res = await fetch(`/api-local-logs?lines=1000&type=${activeTab}`)
      let data;
      try {
        data = await res.json()
      } catch (err) {
        setLogs(`>>> ERREUR DE RÉSEAU: La route a retourné une réponse invalide.\nVérifiez l'URL ou le format.\nStatus: ${res.status} ${res.statusText}`)
        setIsFetching(false)
        return
      }
      if (data.success) {
        setLogs(data.logs)
      } else {
        setLogs(`>>> ERREUR LECTURE LOGS: ${data.error}\n>>> ${data.fallback}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsFetching(false)
    }
  }

  // Polling every 2 seconds if live
  useEffect(() => {
    let interval;
    if (isLive) {
      fetchLogs(); // initial fetch
      interval = setInterval(fetchLogs, 2000);
    }
    return () => clearInterval(interval);
  }, [isLive, activeTab])

  // Reset logs and fetch when changing tabs
  useEffect(() => {
    setLogs('')
    if (!isLive) fetchLogs()
  }, [activeTab])

  // Auto scroll to bottom
  useEffect(() => {
    if (isLive && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, isLive])
  
  const filteredLogs = logs
    .split('\n')
    .filter(line => filter ? line.toLowerCase().includes(filter.toLowerCase()) : true)
    .join('\n')

  const downloadLogs = () => {
    const blob = new Blob([logs], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mydbs_${activeTab}_logs_${new Date().toISOString()}.txt`
    a.click()
  }

  if (loading) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-80px)] flex flex-col pt-4 px-2">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3 italic">
            <Terminal className="w-8 h-8 text-primary" />
            Console <span className="text-primary italic">SYSTÈME</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60 text-sm">
            Moniteur des flux du serveur backend et frontend en temps réel.
          </p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shrink-0 h-10">
          <button
            onClick={() => setActiveTab('backend')}
            className={`px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'backend' ? 'bg-white dark:bg-slate-950 text-emerald-500 shadow' : 'text-slate-500 hover:text-white'}`}
          >
            Backend (Spring)
          </button>
          <button
            onClick={() => setActiveTab('frontend')}
            className={`px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'frontend' ? 'bg-white dark:bg-slate-950 text-indigo-500 shadow' : 'text-slate-500 hover:text-white'}`}
          >
            Frontend (Next)
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filtrer (ex: ERROR, Hibernate)..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl glass-card border-(--glass-border) focus:border-primary/50 text-xs font-bold outline-none w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isLive ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white'}`}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isLive ? 'Pause' : 'Live'}
          </button>
          <button 
            onClick={() => { fetchLogs(); if(bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' }) }}
            className="p-2.5 rounded-xl border border-(--glass-border) text-muted-foreground hover:text-primary transition-all active:scale-90"
            title="Rafraîchir"
          >
            <RefreshCcw className={`w-4 h-4 ${isFetching && !isLive ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={downloadLogs}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </header>

      <GlassCard className="flex-1 border-none ring-1 ring-(--glass-border) p-0 overflow-hidden flex flex-col bg-[#0d1117] dark:bg-[#0d1117] rounded-2xl shadow-2xl relative">
         <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/60 shrink-0">
           <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-rose-500" />
             <div className="w-3 h-3 rounded-full bg-amber-500" />
             <div className="w-3 h-3 rounded-full bg-emerald-500" />
           </div>
           
           <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'frontend' ? 'text-indigo-400' : 'text-emerald-500'}`}>
             {isLive && <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeTab === 'frontend' ? 'bg-indigo-400' : 'bg-emerald-500'}`} />}
             {activeTab === 'frontend' ? 'Next.js Server: localhost:3000' : 'Spring Boot Backend: localhost:8080'}
           </div>
           
           <button onClick={() => setLogs('')} className="p-1 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
           </button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative font-mono text-[11px] leading-relaxed">
           {logs.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-white/20 italic">
               <Terminal className="w-12 h-12 mb-4 opacity-50" />
               <p>En attente des logs système...</p>
             </div>
           ) : (
              <pre className="text-slate-300 whitespace-pre-wrap break-all">
                {filteredLogs.split('\n').map((line, i) => {
                  let colorClass = 'text-slate-300';
                  // General rules
                  if (line.includes(' INFO ')) colorClass = 'text-blue-400';
                  else if (line.includes(' WARN ') || line.includes('Warning:')) colorClass = 'text-amber-400 font-bold';
                  else if (line.includes(' ERROR ') || line.includes('Exception:') || line.includes('⨯') || line.includes('TypeError')) colorClass = 'text-rose-500 font-bold bg-rose-500/10 block px-1 -mx-1';
                  else if (line.includes('Hibernate:')) colorClass = 'text-emerald-400/70 italic';
                  // Next.js specific rules
                  else if (line.includes('wait ') || line.includes('event ')) colorClass = 'text-indigo-400';
                  else if (line.includes(' GET ') || line.includes(' POST ')) colorClass = 'text-emerald-400 font-bold';
                  else if (line.trim().startsWith('at ') || line.trim().startsWith('...')) colorClass = 'text-rose-400/80 pl-4';
                  
                  return (
                    <span key={i} className={colorClass}>
                      {line}
                      {i < filteredLogs.split('\n').length - 1 && '\n'}
                    </span>
                  )
                })}
                <div ref={bottomRef} />
              </pre>
           )}
         </div>
      </GlassCard>
    </div>
  )
}
