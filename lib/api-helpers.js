/**
 * API Helpers — Normalize responses from Spring Boot backend
 * Handles both standard arrays, paginated responses and ApiResponse<T> wrappers
 */

/**
 * Extract a list from a backend response, handles pagination automatically
 */
export function extractList(responseData) {
  if (!responseData || responseData === null) return []
  // Already a plain array
  if (Array.isArray(responseData)) return responseData
  
  // ApiResponse<T> wrapper: { success, data, ... }
  const data = responseData.data ?? responseData
  
  // Spring Page<T>: { content: [], totalElements, ... }
  if (data && typeof data === 'object' && Array.isArray(data.content)) return data.content
  
  // Plain array inside data
  if (Array.isArray(data)) return data
  
  // Empty array fallback
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
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch (e) {
    return '—'
  }
}

/**
 * Format currency in XAF
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
}

/**
 * Format and proxy photo URLs to avoid CORS and handle relative paths from backend
 */
export function formatPhotoUrl(url) {
  if (!url) return null;

  // 1. Path relative to proxy /api
  if (url.startsWith('/api/') || url.startsWith('/uploads/')) {
    return url;
  }

  // 2. Absolute backend URL: http://localhost:8080/api/... → proxy through Next.js
  if (url.includes('localhost:8080')) {
    return url.replace('http://localhost:8080', '');
  }

  // 3. Raw storage path (e.g. "profiles/xxxx.jpg" or "courses/1/file.pdf")
  if (!url.startsWith('http') && !url.startsWith('/')) {
    return `/api/course-resources/download-by-path?path=${encodeURIComponent(url)}`;
  }

  return url;
}
