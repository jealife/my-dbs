import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

/**
 * Statuts de facture valides côté backend (InvoiceStatus enum) :
 *   DRAFT | ISSUED | PAID | PARTIAL | OVERDUE | CANCELLED
 *
 * NB : "PENDING" n'existe PAS dans le backend — utiliser ISSUED pour les factures émises non payées.
 */
export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',      // = "en attente de paiement"
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
}

export const financeService = {
  /**
   * Get invoices for a student
   */
  async getStudentInvoices(studentId) {
    const res = await apiClient.get(`/v1/finance/invoices/students/${studentId}`)
    // L'API retourne un Page<Invoice> — on extrait le content
    const d = res.data?.data ?? res.data
    if (d && typeof d === 'object' && 'content' in d) return d.content
    return extractList(res.data)
  },

  /**
   * Get outstanding balance for a student
   */
  async getOutstandingBalance(studentId) {
    const res = await apiClient.get(`/v1/finance/invoices/outstanding/${studentId}`)
    return extractItem(res.data)
  },

  /**
   * Get invoices by status (admin) — status must be a valid InvoiceStatus value
   */
  async getInvoicesByStatus(status = INVOICE_STATUS.ISSUED) {
    // Guard: if caller passes 'PENDING' (old frontend value), map it to ISSUED
    const safeStatus = status === 'PENDING' ? INVOICE_STATUS.ISSUED : status
    const res = await apiClient.get(`/v1/finance/invoices/by-status`, { params: { status: safeStatus } })
    const d = res.data?.data ?? res.data
    if (d && typeof d === 'object' && 'content' in d) return d.content
    return extractList(res.data)
  },

  /**
   * Get payment history for an invoice
   */
  async getPayments(invoiceId) {
    const res = await apiClient.get(`/v1/finance/invoices/${invoiceId}/payments`)
    return extractList(res.data)
  },

  /**
   * Get payment schedule for an invoice
   */
  async getSchedule(invoiceId) {
    const res = await apiClient.get(`/v1/finance/invoices/${invoiceId}/schedule`)
    return extractList(res.data)
  },

  /**
   * Record a new payment on an invoice
   */
  async recordPayment(invoiceId, paymentData) {
    // Backend uses @RequestParam, not @RequestBody
    const res = await apiClient.post(`/v1/finance/invoices/${invoiceId}/payments`, null, {
      params: paymentData,
    })
    return extractItem(res.data)
  },

  /**
   * Create an invoice (admin) — uses @RequestParam, not @RequestBody
   */
  async createInvoice(data) {
    const res = await apiClient.post('/v1/finance/invoices', null, { params: data })
    return extractItem(res.data)
  },

  /**
   * Get all scholarships pending approval
   */
  async getPendingScholarships() {
    const res = await apiClient.get('/v1/finance/scholarships/pending')
    return extractList(res.data)
  },

  /**
   * Apply a scholarship to an invoice
   */
  async applyScholarship(invoiceId, scholarshipId) {
    const res = await apiClient.post(`/v1/finance/invoices/${invoiceId}/apply-scholarship/${scholarshipId}`)
    return extractItem(res.data)
  },

  /**
   * Create a payment schedule (installments)
   */
  async createSchedule(invoiceId, installments) {
    const res = await apiClient.post(`/v1/finance/invoices/${invoiceId}/schedule`, null, {
      params: { installments },
    })
    return extractList(res.data)
  },

  /**
   * Create a scholarship / discount
   * data: { studentId, type, amount, percentage, reason, academicYearId }
   */
  async createScholarship(data) {
    const res = await apiClient.post('/v1/finance/scholarships', data)
    return extractItem(res.data)
  },

  /**
   * Approve a scholarship
   */
  async approveScholarship(id) {
    const res = await apiClient.patch(`/v1/finance/scholarships/${id}/approve`)
    return extractItem(res.data)
  },
}
