'use client'

import { Search, Bell, User, Menu, X, Hammer, MessageSquare } from 'lucide-react'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth-hook'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatPhotoUrl } from '@/lib/api-helpers'
import { userService } from '@/lib/user-service'
import { communicationsService } from '@/lib/communications-service'
import { toast } from 'react-hot-toast'
import { playNotifSound, playMessageSound } from '@/lib/notification-sound'

export function Header({ onMenuClick }) {
  const { user, isAdmin } = useAuth()
  const [notifications, setNotifications]   = useState([])
  const [unreadCount, setUnreadCount]       = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [showNotifs, setShowNotifs]         = useState(false)
  const [selectedNotif, setSelectedNotif]   = useState(null)
  const [notificationsError, setNotificationsError] = useState(null)
  // Track previous counts to detect new arrivals (not on initial load)
  const prevUnread   = useRef(null)
  const prevMessages = useRef(null)

  // ── Request browser notification permission ─────────────────────
  const requestBrowserPermission = useCallback(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // ── Show a browser push notification ───────────────────────────
  const showBrowserNotif = useCallback((title, body, tag = 'mydbs-notif') => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    try {
      new Notification(title, {
        body: body?.substring(0, 120) || '',
        tag,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        silent: true,  // We handle our own sound
      })
    } catch { /* non-critical */ }
  }, [])

  // ── Fetch notifications + message counts ───────────────────────
  const fetchNotifs = useCallback(async () => {
    if (!user?.id) return
    try {
      const [data, count, msgCount] = await Promise.all([
        userService.getNotifications(user.id),
        userService.getUnreadCount(user.id),
        communicationsService.getUnreadCount(user.id).catch(() => 0),
      ])

      const newCount    = Number(count)    || 0
      const newMsgCount = Number(msgCount) || 0

      setNotifications(data)
      setUnreadCount(newCount)
      setUnreadMessages(newMsgCount)
      setNotificationsError(null)

      // Detect new notifications (skip on first fetch)
      if (prevUnread.current !== null && newCount > prevUnread.current) {
        playNotifSound()
      }
      if (prevMessages.current !== null && newMsgCount > prevMessages.current) {
        playMessageSound()
      }
      prevUnread.current   = newCount
      prevMessages.current = newMsgCount
    } catch (err) {
      console.error('[MyDBS] Erreur fetch notifications:', err)
      setNotificationsError(err)
    }
  }, [user?.id])

  // ── SSE + periodic refresh ──────────────────────────────────────
  useEffect(() => {
    fetchNotifs()
    requestBrowserPermission()

    if (!user?.id) return

    // Custom event for manual refresh
    const handleRefresh = () => fetchNotifs()
    window.addEventListener('refresh-notifs', handleRefresh)

    // SSE real-time stream
    let eventSource
    import('js-cookie').then(m => {
      const token = m.default.get('dbs_token')
      if (!token) return

      const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api'
      eventSource = new EventSource(
        `${apiBase}/v1/communications/notifications/stream?userId=${user.id}&token=${token}`
      )

      // CONNECT event (silent — no sound/notif)
      eventSource.addEventListener('CONNECT', () => {
        console.log('[MyDBS] SSE notifications connectées')
      })

      const handleNotifEvent = (event) => {
        try {
          const data = JSON.parse(event.data)
          const isMessage = event.type === 'message'
          const title   = data.subject || data.title || (isMessage ? 'Nouveau message' : 'Notification')
          const body    = data.body    || data.content || data.message || ''

          // Play sound immediately on SSE event (real-time, no debounce needed)
          if (isMessage) {
            playMessageSound()
          } else {
            playNotifSound()
          }

          // Browser push notification
          showBrowserNotif(title, body, isMessage ? 'mydbs-msg' : 'mydbs-notif')

          // Toast in-app
          if (isMessage) {
            toast(`💬 ${title}`, { duration: 4000 })
          } else {
            toast.success(`🔔 ${title}`, { duration: 4000 })
          }

          // Refresh counts + list
          fetchNotifs()
        } catch {
          fetchNotifs()
        }
      }

      eventSource.onmessage = handleNotifEvent
      eventSource.addEventListener('message',      handleNotifEvent)
      eventSource.addEventListener('notification', handleNotifEvent)
      eventSource.addEventListener('announcement', handleNotifEvent)

      eventSource.onerror = () => {
        console.warn('[MyDBS] SSE déconnectée, reconnexion automatique...')
      }
    })

    // Periodic fallback refresh every 60 s (in case SSE is down)
    const interval = setInterval(fetchNotifs, 60_000)

    return () => {
      window.removeEventListener('refresh-notifs', handleRefresh)
      clearInterval(interval)
      if (eventSource) eventSource.close()
    }
  }, [user?.id, fetchNotifs, requestBrowserPermission, showBrowserNotif])

  // ── Actions ────────────────────────────────────────────────────
  const markAllRead = async () => {
    if (!user?.id) return
    try {
      await userService.markAllAsRead(user.id)
      fetchNotifs()
      toast.success('Notifications marquées comme lues')
    } catch {}
  }

  const cleanNotifs = async () => {
    await markAllRead()
    setShowNotifs(false)
  }

  const markRead = async (id) => {
    try {
      await userService.markAsRead(id)
      fetchNotifs()
    } catch {}
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-40 p-4 md:p-6 pb-2 transition-all duration-300">
      <div className="glass-card px-4 md:px-6 py-4 flex items-center justify-between gap-4 border-(--glass-border) shadow-xl shadow-slate-900/5">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-3 rounded-2xl glass-card hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90 border-(--glass-border)"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="relative group max-w-lg w-full hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Rechercher dossiers, cours, notes..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-100/30 dark:bg-slate-800/20 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-primary/50 transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 text-[0.92rem] font-bold"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">

            {/* Messages */}
            <Link href="/communications" className="relative p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 group">
              <MessageSquare className="w-5.5 h-5.5 text-muted-foreground group-hover:text-primary transition-colors" />
              {unreadMessages > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-orange-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </Link>

            {/* Notifications bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 group"
              >
                <Bell className="w-5.5 h-5.5 text-muted-foreground group-hover:text-primary transition-colors" />
                {unreadCount > 0 && (
                  <motion.span
                    key={unreadCount}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowNotifs(false)}
                      className="fixed inset-0 z-40 bg-black/5 md:bg-transparent"
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="fixed inset-x-4 top-[85px] md:absolute md:inset-auto md:right-0 md:top-full md:mt-4 w-auto md:w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden z-50 p-2"
                    >
                      {/* Header */}
                      <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black uppercase tracking-widest italic text-primary">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Browser permission hint */}
                          {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && (
                            <button
                              onClick={() => Notification.requestPermission()}
                              title="Autoriser les notifications navigateur"
                              className="text-[9px] font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
                            >
                              <Bell className="w-3 h-3" /> Autoriser
                            </button>
                          )}
                          <button onClick={markAllRead} className="text-[9px] font-bold opacity-40 hover:opacity-100 transition-opacity uppercase tracking-tighter">Tout lire</button>
                          <button onClick={cleanNotifs} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* List */}
                      <div className="max-h-[350px] overflow-y-auto space-y-1 scrollbar-hide md:scrollbar-default pr-1">
                        {notificationsError ? (
                          <div className="p-6 text-center">
                            <Hammer className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-bounce" />
                            <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Service en maintenance</p>
                            <p className="text-[9px] font-medium opacity-50 italic">Nous travaillons sur l&apos;amélioration de vos notifications.</p>
                            {isAdmin && (
                              <div className="mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[8px] font-mono text-red-500 text-left break-all">
                                ERROR: {notificationsError.message}
                              </div>
                            )}
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-10 text-center opacity-40 italic text-xs font-medium">Aucune notification...</div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (!n.isRead) markRead(n.id)
                                setSelectedNotif(n)
                                setShowNotifs(false)
                              }}
                              className={cn(
                                'p-4 rounded-2xl transition-all cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-900/50',
                                !n.isRead ? 'bg-primary/5 border-l-4 border-primary' : 'opacity-60'
                              )}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-xs font-black uppercase leading-tight line-clamp-1">{n.title}</h4>
                                <span className="text-[9px] font-bold opacity-30 italic shrink-0 ml-2">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[10px] font-medium leading-relaxed opacity-60 line-clamp-2">{n.message}</p>
                              {!n.isRead && (
                                <span className="mt-1.5 inline-block w-1.5 h-1.5 bg-primary rounded-full" />
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer: link to all notifications */}
                      {notifications.length > 0 && (
                        <div className="p-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                          <Link
                            href="/communications"
                            onClick={() => setShowNotifs(false)}
                            className="block text-center text-[9px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity py-1"
                          >
                            Voir toutes les notifications →
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="h-8 w-px bg-(--glass-border) opacity-50 hidden sm:block" />

          <Link href="/profile" className="flex items-center gap-3 p-1.5 pr-4 rounded-full glass-card hover:border-primary/50 transition-all active:scale-95 group border-(--glass-border)">
            <div className="w-9 h-9 premium-gradient rounded-full flex items-center justify-center text-white font-bold group-hover:rotate-12 transition-transform shadow-md overflow-hidden shrink-0">
              {(user?.photoUrl || user?.photo_url) ? (
                <img
                  src={formatPhotoUrl(user.photoUrl || user.photo_url)}
                  alt={user.first_name || ''}
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                user ? (user.first_name?.[0]?.toUpperCase() || <User className="w-5 h-5" />) : <User className="w-5 h-5" />
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
              <span className="text-[0.85rem] font-black truncate max-w-[120px] uppercase tracking-tight">
                {user ? user.last_name : 'Profil'}
              </span>
              <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{user?.role || 'Guest'}</span>
            </div>
          </Link>
        </div>
      </div>
    </header>

    {/* Notification detail modal */}
    <AnimatePresence>
      {selectedNotif && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNotif(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-950 rounded-4xl p-6 lg:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-6"
          >
            <button
              onClick={() => setSelectedNotif(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Bell className="w-6 h-6" />
              </div>
              <div className="flex-1 pr-10">
                <h3 className="font-black text-xl leading-tight text-slate-900 dark:text-white capitalize tracking-tight">
                  {selectedNotif.title}
                </h3>
                <span className="text-xs font-bold opacity-50 uppercase tracking-widest text-primary mt-1 block">
                  {new Date(selectedNotif.createdAt).toLocaleDateString()} à{' '}
                  {new Date(selectedNotif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
              <p className="text-[0.95rem] font-medium leading-relaxed opacity-80 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                {selectedNotif.message}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-4xl font-black tracking-wide transition-all active:scale-95 shadow-lg shadow-slate-900/20"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  )
}
