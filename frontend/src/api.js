let csrfToken = ''

export async function ensureCsrf() {
  if (csrfToken) return csrfToken
  const response = await fetch('/api/auth/csrf/', { credentials: 'include' })
  if (!response.ok) throw new Error('Unable to initialize secure session.')
  const data = await response.json()
  csrfToken = data.csrfToken
  return csrfToken
}

export async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = { ...(options.headers || {}) }
  if (method !== 'GET' && method !== 'HEAD') {
    headers['X-CSRFToken'] = await ensureCsrf()
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers,
  })
  let data = {}
  try { data = await response.json() } catch (_) {}
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`)
    error.payload = data
    throw error
  }
  return data
}
