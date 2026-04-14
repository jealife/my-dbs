'use client'

import { motion } from 'framer-motion'
import { CreditCard, TrendingUp, Clock, CheckCircle, AlertTriangle, Download, Plus, Receipt, DollarSign, ArrowUpRight, Wallet, Loader2, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-hook'
import { useStudentId } from '@/hooks/use-student-id'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeService } from '@/lib/finance-service'
import { formatCurrency, formatDateFr } from '@/lib/api-helpers'
import { toast } from 'react-hot-toast'

const PAYMENT_METHOD_LABELS = {
  CASH: 'Espèces',
  BANK_TRANSFER: 'Virement',
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Carte',
  CHECK: 'Chèque',
}

const INVOICE_STATUS_LABELS = {
  DRAFT: 'Brouillon',
  ISSUED: 'En attente',   // Émise = en attente de paiement
  PARTIAL: 'Partiel',
  PAID: 'Payé',
  OVERDUE: 'En retard',
  CANCELLED: 'Annulé',
}

const INVOICE_STATUS_COLORS = {
  DRAFT: 'text-slate-400 bg-slate-400/10',
  ISSUED: 'text-amber-500 bg-amber-500/10',
  PARTIAL: 'text-blue-500 bg-blue-500/10',
  PAID: 'text-emerald-500 bg-emerald-500/10',
  OVERDUE: 'text-rose-500 bg-rose-500/10',
  CANCELLED: 'text-slate-400 bg-slate-400/10',
}

export function FinanceModuleView() {
  const { user, isStudent, isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('invoices')
  const [showNewInvoice, setShowNewInvoice] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoiceForm, setInvoiceForm] = useState({ studentId: '', description: '', amount: '', dueDate: '' })
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'CASH', reference: '' })

  const studentId = useStudentId()

  const createInvoiceMutation = useMutation({
    mutationFn: () => financeService.createInvoice({
      studentId: invoiceForm.studentId,
      description: invoiceForm.description,
      amount: invoiceForm.amount,
      dueDate: invoiceForm.dueDate,
    }),
    onSuccess: () => {
      toast.success('Facture créée !')
      queryClient.invalidateQueries({ queryKey: ['finance-invoices'] })
      setShowNewInvoice(false)
      setInvoiceForm({ studentId: '', description: '', amount: '', dueDate: '' })
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  })

  const recordPaymentMutation = useMutation({
    mutationFn: () => financeService.recordPayment(selectedInvoice?.id, {
      amount: paymentForm.amount,
      paymentMethod: paymentForm.method,
      reference: paymentForm.reference,
    }),
    onSuccess: () => {
      toast.success('Paiement enregistré !')
      queryClient.invalidateQueries({ queryKey: ['finance-invoices'] })
      setShowPayment(false)
      setPaymentForm({ amount: '', method: 'CASH', reference: '' })
      setSelectedInvoice(null)
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  })

  // Fetch invoices for current student (or all if admin)
  const { data: invoices = [], isLoading: isLoadingInvoices, error: invoicesError } = useQuery({
    queryKey: ['finance-invoices', studentId],
    queryFn: () => isStudent && studentId
      ? financeService.getStudentInvoices(studentId)
      : financeService.getInvoicesByStatus('ISSUED'),  // ISSUED = "en attente de paiement" dans le backend
    enabled: !!studentId || isAdmin,
  })

  const paidInvoices = invoices.filter(inv => ['PAID'].includes(inv.status))
  const pendingInvoices = invoices.filter(inv => ['ISSUED', 'PARTIAL', 'OVERDUE', 'DRAFT'].includes(inv.status))
  const totalPaid = paidInvoices.reduce((acc, inv) => acc + parseFloat(inv.amountPaid || inv.amount_paid || 0), 0)
  const totalDue = invoices.reduce((acc, inv) => acc + parseFloat(inv.totalAmount || inv.total_amount || inv.amount || 0), 0)
  const paidPct = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Finance & <span className="text-primary italic">PAIEMENTS</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Suivi des frais de scolarité, reçus et historique de transactions.</p>
        </div>
        <div className="flex gap-4">
          <a href="/api/v1/pdf/transcripts/1" target="_blank" className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all">
            <Download className="w-4.5 h-4.5" />
            Reçu PDF
          </a>
          {isAdmin && (
            <button
              onClick={() => setShowNewInvoice(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
              <Plus className="w-5 h-5" />
              Nouvelle Facture
            </button>
          )}
        </div>
      </header>

      {/* Finance Summary Hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-10 rounded-3xl premium-gradient text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Bilan Scolarité</p>
          {isLoadingInvoices ? (
            <div className="flex items-center gap-3 mt-4">
              <Loader2 className="w-6 h-6 animate-spin opacity-60" />
              <p className="text-sm opacity-60">Chargement...</p>
            </div>
          ) : (
            <>
              <h2 className="text-5xl font-black mt-3 tracking-tighter italic">
                {new Intl.NumberFormat('fr-FR').format(totalDue - totalPaid)} <span className="text-2xl opacity-60">XAF</span>
              </h2>
              <p className="mt-3 text-sm font-medium opacity-70 italic">Solde restant à acquitter</p>
              <div className="mt-10 flex items-center gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-50">Versé</p>
                  <p className="text-xl font-black italic">{new Intl.NumberFormat('fr-FR').format(totalPaid)} XAF</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-50">Total Attendu</p>
                  <p className="text-xl font-black italic">{new Intl.NumberFormat('fr-FR').format(totalDue)} XAF</p>
                </div>
              </div>
              <div className="mt-8 h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${paidPct}%` }} transition={{ duration: 1.5 }} className="h-full bg-white rounded-full" />
              </div>
              <p className="mt-2 text-[10px] opacity-40 italic">{paidPct}% payé</p>
            </>
          )}
          <Wallet className="absolute -right-8 -bottom-8 w-48 h-48 opacity-5 rotate-12" />
        </div>

        <div className="space-y-6">
          {pendingInvoices.length > 0 && (
            <GlassCard className="p-8 border-none ring-1 ring-(--glass-border) shadow-none bg-amber-500/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Facture en Attente</p>
              <h3 className="text-2xl font-black mt-2 tracking-tighter italic text-amber-500">
                {formatCurrency(pendingInvoices[0]?.amount)}
              </h3>
              <p className="text-[10px] italic opacity-40 mt-1">Échéance : {formatDateFr(pendingInvoices[0]?.dueDate)}</p>
            </GlassCard>
          )}
          <GlassCard className="p-8 border-none ring-1 ring-(--glass-border) shadow-none bg-emerald-500/5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Factures Payées</p>
            <h3 className="text-2xl font-black mt-2 tracking-tighter italic text-emerald-500">{paidInvoices.length}</h3>
            <p className="text-[10px] italic opacity-40 mt-1">/{invoices.length} total</p>
          </GlassCard>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-2 flex-wrap">
        {[
          { key: 'invoices', label: 'Toutes les Factures' },
          { key: 'pending', label: 'En Attente' },
          { key: 'paid', label: 'Payées' },
        ].map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
              activeTab === tab.key ? "bg-primary text-white shadow-xl shadow-primary/20" : "glass-card opacity-60 hover:opacity-100"
            )}
          >{tab.label}</button>
        ))}
      </div>

      {/* Modal — Nouvelle Facture */}
      {showNewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card border border-(--glass-border) rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black italic tracking-tight">Nouvelle Facture</h2>
              <button onClick={() => setShowNewInvoice(false)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">ID Étudiant</label>
                <input type="number" placeholder="Ex: 42" value={invoiceForm.studentId}
                  onChange={e => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Description</label>
                <input type="text" placeholder="Ex: Frais de scolarité Semestre 1" value={invoiceForm.description}
                  onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Montant (XAF)</label>
                <input type="number" min={0} placeholder="Ex: 500000" value={invoiceForm.amount}
                  onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Date d'échéance</label>
                <input type="date" value={invoiceForm.dueDate}
                  onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowNewInvoice(false)}
                className="flex-1 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/30 transition-all">
                Annuler
              </button>
              <button
                onClick={() => createInvoiceMutation.mutate()}
                disabled={!invoiceForm.studentId || !invoiceForm.amount || createInvoiceMutation.isPending}
                className="flex-1 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {createInvoiceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Créer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal — Enregistrer Paiement */}
      {showPayment && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card border border-(--glass-border) rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black italic tracking-tight">Enregistrer un Paiement</h2>
                <p className="text-xs opacity-50 italic mt-1">{selectedInvoice.invoiceNumber || selectedInvoice.description}</p>
              </div>
              <button onClick={() => { setShowPayment(false); setSelectedInvoice(null) }} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Montant (XAF)</label>
                <input type="number" min={0} placeholder="Ex: 250000" value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Mode de paiement</label>
                <select value={paymentForm.method}
                  onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent">
                  <option value="CASH">Espèces</option>
                  <option value="BANK_TRANSFER">Virement bancaire</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="CARD">Carte</option>
                  <option value="CHECK">Chèque</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Référence (optionnel)</label>
                <input type="text" placeholder="N° de transaction..." value={paymentForm.reference}
                  onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowPayment(false); setSelectedInvoice(null) }}
                className="flex-1 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/30 transition-all">
                Annuler
              </button>
              <button
                onClick={() => recordPaymentMutation.mutate()}
                disabled={!paymentForm.amount || recordPaymentMutation.isPending}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {recordPaymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Valider
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invoice Table */}
      <GlassCard className="p-0 border-none ring-1 ring-(--glass-border) shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-(--glass-border)">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Facture</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic hidden sm:table-cell">Date</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic hidden md:table-cell">Échéance</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Montant</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic">Statut</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic text-right">Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--glass-border)">
              {isLoadingInvoices ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-xs font-black uppercase tracking-widest italic">Chargement des factures...</p>
                    </div>
                  </td>
                </tr>
              ) : invoicesError ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-rose-500">
                    <p className="text-sm font-black italic">⚠️ Erreur : {invoicesError.message}</p>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 opacity-40">
                    <p className="text-sm font-black italic uppercase tracking-widest">Aucune facture trouvée.</p>
                  </td>
                </tr>
              ) : (
                (activeTab === 'pending' ? pendingInvoices : activeTab === 'paid' ? paidInvoices : invoices).map((inv, i) => (
                  <tr key={inv.id || i} className="group hover:bg-primary/2 transition-colors cursor-pointer">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm shrink-0">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <span className="text-[0.92rem] font-bold">{inv.invoiceNumber || inv.description || `Facture #${inv.id}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[0.85rem] font-black italic opacity-60 hidden sm:table-cell">{formatDateFr(inv.createdAt || inv.issueDate)}</td>
                    <td className="px-6 py-5 text-[0.85rem] font-black italic opacity-60 hidden md:table-cell">{formatDateFr(inv.dueDate)}</td>
                    <td className="px-6 py-5 text-[0.92rem] font-black">{new Intl.NumberFormat('fr-FR').format(inv.amount || 0)} <span className="text-[10px] opacity-40">XAF</span></td>
                    <td className="px-6 py-5">
                      <span className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic", INVOICE_STATUS_COLORS[inv.status] || 'text-slate-400 bg-slate-400/10')}>
                        {INVOICE_STATUS_LABELS[inv.status] || inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin && inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <button
                            onClick={() => { setSelectedInvoice(inv); setShowPayment(true) }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest active:scale-90"
                          >
                            Payer
                          </button>
                        )}
                        <a href={`/api/v1/pdf/transcripts/${inv.studentId || studentId}`} target="_blank" className="p-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90 inline-block">
                          <Download className="w-4.5 h-4.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
