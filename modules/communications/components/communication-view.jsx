'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Bell, Send, Search, Paperclip, MoreVertical, CheckCheck, Star, Inbox, Archive, Users, Loader2, Plus, X, ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-hook'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communicationsService } from '@/lib/communications-service'
import { userService } from '@/lib/user-service'
import { formatDateFr } from '@/lib/api-helpers'
import { toast } from 'react-hot-toast'

export function CommunicationModuleView() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeBox, setActiveBox] = useState('inbox')
  const [selectedThread, setSelectedThread] = useState(null)
  const [message, setMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [composeForm, setComposeForm] = useState({ recipientId: '', subject: '', body: '' })

  const userId = user?.id || user?.userId

  const { data: inbox = [], isLoading: loadingInbox } = useQuery({
    queryKey: ['messages-inbox', userId],
    queryFn: () => communicationsService.getInbox(userId),
    enabled: !!userId,
  })

  const { data: notifications = [], isLoading: loadingNotifs } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => communicationsService.getNotifications(userId),
    enabled: !!userId && activeBox === 'notifs',
  })

  const { data: threadMessages = [], isLoading: loadingThread } = useQuery({
    queryKey: ['thread', selectedThread?.threadId || selectedThread?.id],
    queryFn: () => communicationsService.getThread(selectedThread?.threadId || selectedThread?.id),
    enabled: !!(selectedThread?.threadId || selectedThread?.id),
  })

  const { data: usersList = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.getUsersByRole(''),
    enabled: isComposing,
  })

  // Original mutation for sending messages inside an existing thread
  const sendMutation = useMutation({
    mutationFn: () => communicationsService.sendMessage({
      senderId: userId,
      recipientId: selectedThread?.senderId === userId ? selectedThread?.recipientId : selectedThread?.senderId,
      threadId: selectedThread?.threadId || (selectedThread?.id ? String(selectedThread.id) : undefined),
      body: message,
      subject: selectedThread?.subject,
    }),
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['thread', selectedThread?.threadId || selectedThread?.id] })
      toast.success('Message envoyé !')
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  })

  // New mutation for creating a new message (starting a thread)
  const sendNewMutation = useMutation({
    mutationFn: () => communicationsService.sendMessage({
      senderId: userId,
      recipientId: composeForm.recipientId,
      body: composeForm.body,
      subject: composeForm.subject,
    }),
    onSuccess: () => {
      setComposeForm({ recipientId: '', subject: '', body: '' })
      setIsComposing(false)
      queryClient.invalidateQueries({ queryKey: ['messages-inbox', userId] })
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
      toast.success('Nouveau message envoyé !')
    },
    onError: (err) => toast.error(`Erreur lors de l'envoi: ${err.message}`),
  })

  const markReadMutation = useMutation({
    mutationFn: (msgId) => communicationsService.markRead(msgId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages-inbox', userId] })
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('refresh-notifs'))
    },
  })

  // Real-time SSE Stream & Push Notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    if (!userId) return

    let eventSource
    import('js-cookie').then(m => {
      const token = m.default.get('dbs_token')
      if (!token) return
      
      const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8080'
      eventSource = new EventSource(`${backendBase}/api/v1/communications/notifications/stream?userId=${userId}&token=${token}`)
      
      const handleSseEvent = (event) => {
        try {
          const data = JSON.parse(event.data)
          // Invalidating queries when new events arrive
          queryClient.invalidateQueries({ queryKey: ['messages-inbox', userId] })
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
          if (data.threadId) {
            queryClient.invalidateQueries({ queryKey: ['thread', data.threadId] })
          }
        } catch (e) {
          console.error("SSE parsing error", e)
        }
      }

      eventSource.onmessage = handleSseEvent
      eventSource.addEventListener('message', handleSseEvent)
      eventSource.addEventListener('notification', handleSseEvent)
      eventSource.addEventListener('announcement', handleSseEvent)

      eventSource.onerror = () => {
        console.log("SSE error / reconnecting...")
      }
    })

    return () => {
      if (eventSource) eventSource.close()
    }
  }, [userId, queryClient])

  // Automatically mark all unread messages as read when viewing a thread
  useEffect(() => {
    if (threadMessages && threadMessages.length > 0 && userId) {
      const unreadIds = threadMessages
        .filter(m => (m.recipientId === userId) && !m.isRead)
        .map(m => m.id)
      
      if (unreadIds.length > 0) {
        unreadIds.forEach(id => {
          communicationsService.markRead(id, userId)
        })
        // Refresh after a small delay to let the backend process the patches
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['messages-inbox', userId] })
          queryClient.invalidateQueries({ queryKey: ['thread', selectedThread?.threadId || selectedThread?.id] })
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('refresh-notifs'))
        }, 300)
      }
    }
  }, [threadMessages, userId, queryClient, selectedThread])

  // Helper to group inbox by thread
  const groupedInbox = []
  const threads = new Set()
  inbox.forEach(msg => {
    const tId = msg.threadId || String(msg.senderId)
    if (!threads.has(tId)) {
      threads.add(tId)
      groupedInbox.push(msg)
    }
  })

  const displayList = activeBox === 'notifs' ? notifications : groupedInbox
  const isLoading = activeBox === 'notifs' ? loadingNotifs : loadingInbox

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col space-y-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2 shrink-0">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Messagerie & <span className="text-primary italic">COMMUNICATIONS</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Échanges académiques sécurisés entre étudiants, enseignants et administration.</p>
        </div>
        <button 
          onClick={() => { setIsComposing(true); setSelectedThread(null); }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all self-start">
          <Plus className="w-5 h-5" />
          Nouveau Message
        </button>
      </header>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Panel — Thread List */}
        <div className={cn("w-full md:max-w-xs flex flex-col gap-4 shrink-0", (isComposing || selectedThread) ? "hidden md:flex" : "flex")}>
          {/* Mailbox Nav */}
          <div className="flex gap-2">
            {[
              { key: 'inbox', label: 'Boîte', icon: Inbox },
              { key: 'notifs', label: 'Notifs', icon: Bell },
              { key: 'starred', label: 'Favoris', icon: Star },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key}
                onClick={() => setActiveBox(key)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all",
                  activeBox === key ? "bg-primary text-white shadow-xl shadow-primary/20" : "glass-card opacity-60 hover:opacity-100 border-(--glass-border)"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input type="text" placeholder="Rechercher..." className="w-full pl-12 pr-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-xs outline-none" />
          </div>

          {/* Thread/Notif List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {isLoading ? (
              <div className="flex flex-col items-center py-10 gap-3 opacity-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-widest italic">Chargement...</p>
              </div>
            ) : displayList.length === 0 ? (
              <div className="py-10 text-center opacity-40">
                <p className="text-xs font-black uppercase tracking-widest italic">Aucun message.</p>
              </div>
            ) : activeBox === 'notifs' ? (
              notifications.map(notif => (
                <div key={notif.id}
                  onClick={() => communicationsService.markNotifRead(notif.id).then(() => queryClient.invalidateQueries({ queryKey: ['notifications', userId] }))}
                  className={cn("w-full text-left p-4 rounded-3xl transition-all border cursor-pointer group", !notif.read ? "bg-primary/5 border-primary/20" : "border-transparent hover:border-(--glass-border) hover:bg-slate-50 dark:hover:bg-slate-900/50")}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-[0.82rem] font-bold truncate", !notif.read && "font-black")}>{notif.title || notif.message}</p>
                      <p className="text-[10px] opacity-40 italic mt-1 truncate">{notif.createdAt ? formatDateFr(notif.createdAt) : ''}</p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse" />}
                  </div>
                </div>
              ))
            ) : (
              displayList.map(msg => (
                <button key={msg.id}
                  onClick={() => { setSelectedThread(msg); if (!msg.isRead) markReadMutation.mutate(msg.id) }}
                  className={cn("w-full text-left p-4 rounded-3xl transition-all border group", selectedThread?.id === msg.id ? "bg-primary/5 border-primary/20 shadow-lg shadow-primary/5" : "border-transparent hover:border-(--glass-border) hover:bg-slate-50 dark:hover:bg-slate-900/50")}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl premium-gradient flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
                      {(msg.senderName || msg.from || 'U')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn("text-[0.85rem] font-bold truncate", !msg.isRead && "font-black")}>{msg.senderName || msg.from}</span>
                        <span className="text-[9px] opacity-40 font-bold ml-2 shrink-0">{msg.createdAt ? formatDateFr(msg.createdAt) : ''}</span>
                      </div>
                      <p className={cn("text-[11px] truncate mb-1 uppercase tracking-tight", !msg.isRead ? "font-black opacity-80" : "opacity-40 font-medium")}>{msg.subject}</p>
                      <p className="text-[10px] opacity-40 italic truncate">{msg.body || msg.preview}</p>
                    </div>
                    {!msg.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Message View */}
        <div className={cn("flex-1 min-w-0 flex-col", (isComposing || selectedThread) ? "flex" : "hidden md:flex")}>
          <GlassCard className="flex-1 flex flex-col p-0 border-none ring-1 ring-(--glass-border) shadow-none overflow-hidden min-h-0">
            {isComposing ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="w-full max-w-lg glass-card border border-(--glass-border) p-6 md:p-8 rounded-3xl shadow-xl space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between pb-4 border-b border-(--glass-border)">
                    <div className="flex items-center gap-3">
                      <button className="md:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setIsComposing(false)}>
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                      </button>
                      <h2 className="text-xl font-black italic tracking-tight">Nouveau Message</h2>
                    </div>
                    <button onClick={() => setIsComposing(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden md:block">
                      <X className="w-5 h-5 opacity-60" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Destinataire</label>
                      <select
                        value={composeForm.recipientId}
                        onChange={(e) => setComposeForm({ ...composeForm, recipientId: e.target.value })}
                        className="w-full p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent"
                      >
                        <option value="" disabled className="dark:bg-slate-900">Sélectionner un utilisateur...</option>
                        {usersList.map((u) => (
                          <option key={u.id} value={u.id} className="dark:bg-slate-900">
                            {u.name || (u.firstName + ' ' + u.lastName)} ({u.email}) - {u.role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Sujet</label>
                      <input
                        type="text"
                        placeholder="Objet de votre message"
                        value={composeForm.subject}
                        onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                        className="w-full p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Message</label>
                      <textarea
                        placeholder="Écrivez votre message..."
                        rows={6}
                        value={composeForm.body}
                        onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                        className="w-full p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none resize-none bg-transparent"
                      />
                    </div>
                    <button
                      onClick={() => sendNewMutation.mutate()}
                      disabled={!composeForm.recipientId || !composeForm.body.trim() || sendNewMutation.isPending}
                      className="w-full py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sendNewMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      Envoyer le message
                    </button>
                  </div>
                </div>
              </div>
            ) : !selectedThread ? (
              <div className="flex-1 flex items-center justify-center opacity-30">
                <div className="text-center space-y-4">
                  <MessageSquare className="w-16 h-16 mx-auto" />
                  <p className="text-sm font-black uppercase tracking-widest italic">Sélectionnez une conversation</p>
                </div>
              </div>
            ) : (
              <>
                {/* Thread Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-(--glass-border) bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                  <div className="flex items-center gap-3 md:gap-4">
                    <button className="md:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setSelectedThread(null)}>
                      <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-primary" />
                    </button>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl premium-gradient flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                      {(selectedThread.senderName || selectedThread.from || 'U')[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-[0.95rem] md:text-[1rem] tracking-tight truncate">{selectedThread.senderName || selectedThread.from}</h3>
                      <p className="text-[9px] md:text-[10px] uppercase tracking-widest opacity-40 italic font-bold truncate">{selectedThread.subject}</p>
                    </div>
                  </div>
                  <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-muted-foreground hover:text-primary">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {loadingThread ? (
                    <div className="flex justify-center py-10 opacity-40"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : threadMessages.length === 0 ? (
                    // Show the selected message itself if no thread messages
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl premium-gradient flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md">
                        {(selectedThread.senderName || selectedThread.from || 'U')[0]}
                      </div>
                      <div className="max-w-[70%] px-5 py-4 rounded-3xl text-sm font-medium leading-relaxed shadow-lg glass-card border-(--glass-border) rounded-bl-lg">
                        <p>{selectedThread.body || selectedThread.preview}</p>
                        <div className="flex items-center gap-1 mt-2 text-[9px] opacity-30">
                          <span>{selectedThread.createdAt ? formatDateFr(selectedThread.createdAt) : ''}</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    threadMessages.map((msg, i) => (
                      <motion.div key={msg.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className={cn("flex gap-3", msg.mine || msg.senderId === userId ? "flex-row-reverse" : "flex-row")}
                      >
                        {!(msg.mine || msg.senderId === userId) && (
                          <div className="w-8 h-8 rounded-xl premium-gradient flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md">
                            {(msg.senderName || 'U')[0]}
                          </div>
                        )}
                        <div className={cn(
                          "max-w-[70%] px-5 py-4 rounded-3xl text-sm font-medium leading-relaxed shadow-lg",
                          (msg.mine || msg.senderId === userId)
                            ? "bg-primary text-white rounded-br-lg shadow-primary/20"
                            : "glass-card border-(--glass-border) rounded-bl-lg"
                        )}>
                          <p>{msg.body || msg.text || msg.content}</p>
                          <div className={cn("flex items-center gap-1 mt-2 text-[9px]", (msg.mine || msg.senderId === userId) ? "justify-end text-white/50" : "opacity-30")}>
                            <span>{msg.createdAt ? formatDateFr(msg.createdAt) : ''}</span>
                            {(msg.mine || msg.senderId === userId) && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Compose */}
                <div className="p-4 border-t border-(--glass-border) bg-slate-50/30 dark:bg-slate-950/30 shrink-0">
                  <div className="flex items-center gap-3 glass-card border-(--glass-border) rounded-3xl px-6 py-4">
                    <input
                      type="text"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !sendMutation.isPending && sendMutation.mutate()}
                      placeholder="Écrire un message..."
                      className="flex-1 bg-transparent outline-none font-medium text-[0.9rem] placeholder:opacity-30"
                    />
                    <button className="p-2.5 text-muted-foreground hover:text-primary transition-colors"><Paperclip className="w-5 h-5" /></button>
                    <button
                      onClick={() => sendMutation.mutate()}
                      disabled={!message.trim() || sendMutation.isPending}
                      className="p-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 active:scale-90 transition-all hover:shadow-primary/50 disabled:opacity-50"
                    >
                      {sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
