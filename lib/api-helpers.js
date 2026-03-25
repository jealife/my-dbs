/**
 * API Helpers — Normalize responses from Spring Boot backend
 * Handles both standard arrays, paginated responses and ApiResponse<T> wrappers
 */

/**
 * Extract a list from a backend response, handles pagination automatically
 */
export function extractList(responseData) {
  if (!responseData) return []
  // Already a plain array
  if (Array.isArray(responseData)) return responseData
  // ApiResponse<T> wrapper: { success, data, ... }
  const data = responseData.data ?? responseData
  // Spring Page<T>: { content: [], totalElements, ... }
  if (Array.isArray(data?.content)) return data.content
  // Plain array inside data
  if (Array.isArray(data)) return data
  return []
}

/**
 * Extract a single object from response
 */
export function extractItem(responseData) {
  if (!responseData) return null
  return responseData.data ?? responseData
}

/**
 * Format a date string for display (fr locale)
 */
export function formatDateFr(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Format currency in XAF
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
}
