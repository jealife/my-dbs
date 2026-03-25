'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Bell, Send, Search, Paperclip, MoreVertical, CheckCheck, Star, Inbox, Archive, Users, Loader2, Plus } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-hook'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communicationsService } from '@/lib/communications-service'
import { formatDateFr } from '@/lib/api-helpers'
import { toast } from 'react-hot-toast'

export function CommunicationModuleView() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeBox, setActiveBox] = useState('inbox')
  const [selectedThread, setSelectedThread] = useState(null)
  const [message, setMessage] = useState('')

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
    queryKey: ['thread', selectedThread?.threadId],
    queryFn: () => communicationsService.getThread(selectedThread.threadId),
    enabled: !!selectedThread?.threadId,
  })

  const sendMutation = useMutation({
    mutationFn: () => communicationsService.sendMessage({
      recipientId: selectedThread?.senderId,
      threadId: selectedThread?.threadId,
      content: message,
      subject: selectedThread?.subject,
    }),
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['thread', selectedThread?.threadId] })
      toast.success('Message envoyé !')
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  })

  const markReadMutation = useMutation({
    mutationFn: (msgId) => communicationsService.markRead(msgId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages-inbox', userId] }),
  })

  const displayList = activeBox === 'notifs' ? notifications : inbox
  const isLoading = activeBox === 'notifs' ? loadingNotifs : loadingInbox

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col space-y-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2 shrink-0">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Messagerie & <span className="text-primary italic">COMMUNICATIONS</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Échanges académiques sécurisés entre étudiants, enseignants et administration.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all self-start">
          <Plus className="w-5 h-5" />
          Nouveau Message
        </button>
      </header>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Panel — Thread List */}
        <div className="w-full max-w-xs flex flex-col gap-4 shrink-0">
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
              inbox.map(msg => (
                <button key={msg.id}
                  onClick={() => { setSelectedThread(msg); if (!msg.read) markReadMutation.mutate(msg.id) }}
                  className={cn("w-full text-left p-4 rounded-3xl transition-all border group", selectedThread?.id === msg.id ? "bg-primary/5 border-primary/20 shadow-lg shadow-primary/5" : "border-transparent hover:border-(--glass-border) hover:bg-slate-50 dark:hover:bg-slate-900/50")}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl premium-gradient flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
                      {(msg.senderName || msg.from || 'U')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn("text-[0.85rem] font-bold truncate", !msg.read && "font-black")}>{msg.senderName || msg.from}</span>
                        <span className="text-[9px] opacity-40 font-bold ml-2 shrink-0">{msg.createdAt ? formatDateFr(msg.createdAt) : ''}</span>
                      </div>
                      <p className={cn("text-[11px] truncate mb-1 uppercase tracking-tight", !msg.read ? "font-black opacity-80" : "opacity-40 font-medium")}>{msg.subject}</p>
                      <p className="text-[10px] opacity-40 italic truncate">{msg.content || msg.preview}</p>
                    </div>
                    {!msg.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Message View */}
        <div className="flex-1 min-w-0 flex flex-col">
          <GlassCard className="flex-1 flex flex-col p-0 border-none ring-1 ring-(--glass-border) shadow-none overflow-hidden min-h-0">
            {!selectedThread ? (
              <div className="flex-1 flex items-center justify-center opacity-30">
                <div className="text-center space-y-4">
                  <MessageSquare className="w-16 h-16 mx-auto" />
                  <p className="text-sm font-black uppercase tracking-widest italic">Sélectionnez une conversation</p>
                </div>
              </div>
            ) : (
              <>
                {/* Thread Header */}
                <div className="flex items-center justify-between p-6 border-b border-(--glass-border) bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center text-white font-black text-lg shadow-md">
                      {(selectedThread.senderName || selectedThread.from || 'U')[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-[1rem] tracking-tight">{selectedThread.senderName || selectedThread.from}</h3>
                      <p className="text-[10px] uppercase tracking-widest opacity-40 italic font-bold">{selectedThread.subject}</p>
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
                        <p>{selectedThread.content || selectedThread.preview}</p>
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
                          <p>{msg.content || msg.text}</p>
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
