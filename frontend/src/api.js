let csrfToken = ''

export async function ensureCsrf(force = false) {
  if (csrfToken && !force) return csrfToken
  const response = await fetch('/api/auth/csrf/', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('Unable to initialize secure session.')
  const data = await response.json()
  csrfToken = data.csrfToken || ''
  if (!csrfToken) throw new Error('Unable to initialize secure session.')
  return csrfToken
}

export async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  }

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
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try { data = await response.json() } catch (_) {}
  } else {
    try {
      const text = await response.text()
      if (text && !response.ok) data = { error: `Server returned ${response.status}.` }
    } catch (_) {}
  }

  if (response.status === 403 && method !== 'GET' && method !== 'HEAD' && !data.error) {
    // Refresh the token for the next attempt if the session/CSRF cookie was rotated.
    csrfToken = ''
  }

  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`)
    error.payload = data
    error.status = response.status
    throw error
  }
  return data
}
