import router from '@/router'
import { globalRefs } from '@/constants'

/**
 * Clears authentication data and redirects the user to the admin login page.
 */
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('guests')
  if (router.currentRoute.value.path !== '/admin') {
    router.push('/admin')
  }
}

/**
 * Constructs standard headers including Authorization header if token exists.
 *
 * @param {HeadersInit} [customHeaders={}]
 * @returns {Record<string, string>}
 */
export const authHeaders = (customHeaders = {}) => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  }
}

/**
 * Wrapper around native fetch that includes authorization headers
 * and automatically triggers logout on 401 or 403 responses.
 *
 * @param {string} endpoint - Endpoint path (e.g. '/api/admin/guests') or full URL
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<Response>}
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${globalRefs.BACKEND_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const headers = authHeaders(options.headers)

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401 || response.status === 403) {
    logout()
  }

  return response
}
