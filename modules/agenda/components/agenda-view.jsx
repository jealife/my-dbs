'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Plus, Users, LayoutList, Share2, MoreHorizontal, Loader2, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-hook'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { planningService } from '@/lib/planning-service'
import { formatDateFr } from '@/lib/api-helpers'
import { MaintenanceZone } from '@/components/ui/maintenance-zone'
import { toast } from 'react-hot-toast'

const EVENT_TYPE_COLORS = {
  COURSE_SESSION: 'bg-indigo-500',
  EXAM: 'bg-rose-500',
  DEADLINE: 'bg-amber-500',
  MENTOR_SESSION: 'bg-emerald-500',
  HOLIDAY: 'bg-slate-400',
  MEETING: 'bg-blue-500',
  OTHER: 'bg-primary',
}

function getWeekBounds(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday start
  const monday = new Date(d.setDate(diff))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    from: monday.toISOString(),
    to: sunday.toISOString(),
    monday: new Date(monday),
    sunday: new Date(sunday),
  }
}

export function AgendaModuleView() {
  const { isTeacher, isAdmin, user } = useAuth()
  const queryClient = useQueryClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [eventForm, setEventForm] = useState({ title: '', eventType: 'COURSE_SESSION', startAt: '', endAt: '', location: '', cohortId: '' })

  const createEventMutation = useMutation({
    mutationFn: () => planningService.createEvent({
      title: eventForm.title,
      eventType: eventForm.eventType,
      startAt: eventForm.startAt,
      endAt: eventForm.endAt,
      location: eventForm.location,
      teacherId: userId,
      ...(eventForm.cohortId && { cohortId: Number(eventForm.cohortId) }),
    }),
    onSuccess: () => {
      toast.success('Événement créé !')
      queryClient.invalidateQueries({ queryKey: ['agenda'] })
      setShowNewEvent(false)
      setEventForm({ title: '', eventType: 'COURSE_SESSION', startAt: '', endAt: '', location: '', cohortId: '' })
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  })

  const { from, to, monday, sunday } = useMemo(() => getWeekBounds(currentDate), [currentDate])

  const userId = user?.id || user?.userId
  const cohortId = user?.cohortId || user?.classRoomId || user?.classId || null

  const { data: personalEvents = [], isLoading, error, refetch } = useQuery({
    queryKey: ['agenda', userId, from, to],
    queryFn: () => planningService.getMyAgenda(userId, from, to),
    enabled: !!userId,
  })

  const { data: cohortEvents = [] } = useQuery({
    queryKey: ['agenda-cohort', cohortId, from, to],
    queryFn: () => planningService.getCohortAgenda(cohortId, from, to),
    enabled: !!cohortId,
  })

  const events = [
    ...personalEvents,
    ...cohortEvents.filter(ce => !personalEvents.some(pe => pe.id === ce.id)),
  ]

  if (error) return (
    <div className="p-4">
      <MaintenanceZone 
        error={error} 
        reset={refetch} 
        zone="Agenda & Sessions"
      />
    </div>
  )

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  function getEventsForDay(dayDate) {
    return events.filter(ev => {
      const eventDate = new Date(ev.startAt || ev.startDate || ev.date)
      return eventDate.toDateString() === dayDate.toDateString()
    })
  }

  const goToPrevWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }

  const goToNextWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }

  const formatWeekLabel = () => {
    const opts = { day: 'numeric', month: 'short' }
    return `${monday.toLocaleDateString('fr-FR', opts)} — ${sunday.toLocaleDateString('fr-FR', opts)}`
  }

  // Next upcoming event
  const nextEvent = events.find(ev => new Date(ev.startAt || ev.startDate) >= new Date())

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Agenda & <span className="text-primary italic">SESSIONS</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Planification des cours, examens et évènements académiques.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex glass-card border-(--glass-border) rounded-2xl p-1">
            <button onClick={goToPrevWeek} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <button className="px-4 py-2.5 text-xs font-black uppercase tracking-widest italic whitespace-nowrap">{formatWeekLabel()}</button>
            <button onClick={goToNextWeek} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
          {(isTeacher || isAdmin) && (
            <button
              onClick={() => setShowNewEvent(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:-rotate-1 active:scale-95 transition-all">
              <Plus className="w-5 h-5" />
              Planifier Session
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Weekly Timeline */}
        <GlassCard className="lg:col-span-3 p-0 border-none ring-1 ring-(--glass-border) shadow-none overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-(--glass-border) bg-slate-50/50 dark:bg-slate-900/50">
            {dates.map((date, i) => (
              <div key={i} className={cn("text-center py-5 border-r border-(--glass-border) last:border-none", date.toDateString() === new Date().toDateString() && "bg-primary/5")}>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{days[i]}</p>
                <p className={cn("text-xl font-black italic", date.toDateString() === new Date().toDateString() && "text-primary")}>{date.getDate()}</p>
              </div>
            ))}
          </div>

          {/* Schedule Content */}
          <div className="grid grid-cols-7 min-h-[500px] bg-white/20 dark:bg-slate-950/20">
            {isLoading ? (
              <div className="col-span-7 flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-widest italic text-primary">Chargement agenda...</p>
              </div>
            ) : (
              dates.map((date, i) => {
                const dayEvents = getEventsForDay(date)
                return (
                  <div key={i} className="border-r border-(--glass-border) last:border-none p-2 space-y-3 min-h-[120px]">
                    {dayEvents.map((ev, j) => (
                      <AgendaItem
                        key={ev.id || j}
                        time={ev.startAt ? new Date(ev.startAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        course={ev.title}
                        room={ev.location || ev.room || ''}
                        color={EVENT_TYPE_COLORS[ev.eventType] || EVENT_TYPE_COLORS.OTHER}
                      />
                    ))}
                  </div>
                )
              })
            )}
          </div>
        </GlassCard>

        {/* Focus Card */}
        <div className="space-y-6">
          <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl" />
            <div className="flex items-center gap-2 mb-8 text-primary font-black uppercase tracking-widest text-[10px]">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Prochaine Session
            </div>

            {!nextEvent ? (
              <p className="text-sm opacity-40 italic">Aucun événement à venir cette semaine.</p>
            ) : (
              <>
                <h3 className="text-2xl font-black italic tracking-tighter leading-tight">{nextEvent.title}</h3>
                <p className="text-[11px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest mt-2 italic">
                  {nextEvent.eventType?.replace('_', ' ')}
                </p>
                <div className="mt-10 space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold italic opacity-70">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{nextEvent.startAt ? new Date(nextEvent.startAt).toLocaleString('fr-FR') : '—'}</span>
                  </div>
                  {nextEvent.location && (
                    <div className="flex items-center gap-3 text-xs font-bold italic opacity-70">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{nextEvent.location}</span>
                    </div>
                  )}
                  {nextEvent.teacherName && (
                    <div className="flex items-center gap-3 text-xs font-bold italic opacity-70">
                      <User className="w-4 h-4 text-primary" />
                      <span>{nextEvent.teacherName}</span>
                    </div>
                  )}
                </div>
                <button className="w-full mt-10 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <LayoutList className="w-5 h-5" />
                  Voir détails
                </button>
              </>
            )}
          </GlassCard>

          <GlassCard title="Types d'événements" className="border-none ring-1 ring-(--glass-border) shadow-none">
            <div className="space-y-3 pt-4">
              {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", color)} />
                  <span className="text-xs font-bold italic opacity-60">{type.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Modal — Créer un événement */}
      {showNewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card border border-(--glass-border) rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black italic tracking-tight">Planifier un Événement</h2>
              <button onClick={() => setShowNewEvent(false)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Titre</label>
                <input type="text" placeholder="Ex: Cours de Mathématiques" value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Type d&apos;événement</label>
                <select value={eventForm.eventType}
                  onChange={e => setEventForm({ ...eventForm, eventType: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent">
                  {Object.keys(EVENT_TYPE_COLORS).map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Début</label>
                  <input type="datetime-local" value={eventForm.startAt}
                    onChange={e => setEventForm({ ...eventForm, startAt: e.target.value })}
                    className="w-full mt-1 p-3 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Fin</label>
                  <input type="datetime-local" value={eventForm.endAt}
                    onChange={e => setEventForm({ ...eventForm, endAt: e.target.value })}
                    className="w-full mt-1 p-3 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Lieu (optionnel)</label>
                  <input type="text" placeholder="Ex: Salle A102" value={eventForm.location}
                    onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full mt-1 p-3 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">ID Cohorte (optionnel)</label>
                  <input type="number" placeholder="Ex: 3" value={eventForm.cohortId}
                    onChange={e => setEventForm({ ...eventForm, cohortId: e.target.value })}
                    className="w-full mt-1 p-3 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowNewEvent(false)}
                className="flex-1 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/30 transition-all">
                Annuler
              </button>
              <button
                onClick={() => createEventMutation.mutate()}
                disabled={!eventForm.title || !eventForm.startAt || !eventForm.endAt || createEventMutation.isPending}
                className="flex-1 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {createEventMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                Créer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function AgendaItem({ time, course, room, color }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group cursor-pointer">
      <div className={cn("p-3 rounded-2xl shadow-xl shadow-slate-900/5 transition-all group-hover:shadow-primary/20", color)}>
        <p className="text-[9px] font-black text-white/60 mb-1">{time}</p>
        <h4 className="text-xs font-black text-white leading-tight mb-2 italic line-clamp-2">{course}</h4>
        {room && (
          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-white/80 tracking-widest">
            <MapPin className="w-3 h-3" />
            {room}
          </div>
        )}
      </div>
    </motion.div>
  )
}
