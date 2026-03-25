import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const financeService = {
  /**
   * Get invoices for a student
   */
  async getStudentInvoices(studentId) {
    const res = await apiClient.get(`/finance/invoices/students/${studentId}`)
    return extractList(res.data)
  },

  /**
   * Get outstanding balance for a student
   */
  async getOutstandingBalance(studentId) {
    const res = await apiClient.get(`/finance/invoices/outstanding/${studentId}`)
    return extractItem(res.data)
  },

  /**
   * Get invoices by status (admin/school manager)
   */
  async getInvoicesByStatus(status = 'PENDING') {
    const res = await apiClient.get(`/finance/invoices/by-status`, { params: { status } })
    return extractList(res.data)
  },

  /**
   * Get payment history for an invoice
   */
  async getPayments(invoiceId) {
    const res = await apiClient.get(`/finance/invoices/${invoiceId}/payments`)
    return extractList(res.data)
  },

  /**
   * Get payment schedule for an invoice
   */
  async getSchedule(invoiceId) {
    const res = await apiClient.get(`/finance/invoices/${invoiceId}/schedule`)
    return extractList(res.data)
  },

  /**
   * Record a new payment on an invoice
   */
  async recordPayment(invoiceId, paymentData) {
    const res = await apiClient.post(`/finance/invoices/${invoiceId}/payments`, paymentData)
    return extractItem(res.data)
  },

  /**
   * Create an invoice (admin/school manager)
   */
  async createInvoice(data) {
    const res = await apiClient.post('/finance/invoices', data)
    return extractItem(res.data)
  },

  /**
   * Get all scholarships pending approval
   */
  async getPendingScholarships() {
    const res = await apiClient.get('/finance/scholarships/pending')
    return extractList(res.data)
  },
}
