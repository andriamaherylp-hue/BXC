let csrfToken = ''

export async function ensureCsrf(force = false) {
  if (csrfToken && !force) return csrfToken
  const response = await fetch('/api/auth/csrf/', {
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('Unable to initialize secure session.')
  const data = await response.json()
  csrfToken = data.csrfToken || ''
  if (!csrfToken) throw new Error('Unable to initialize secure session.')
  return csrfToken
}

async function parseResponse(response) {
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
  return data
}

export async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const unsafe = method !== 'GET' && method !== 'HEAD'

  const execute = async (forceCsrf = false) => {
    const headers = {
      Accept: 'application/json',
      ...(options.headers || {}),
    }
    if (unsafe) headers['X-CSRFToken'] = await ensureCsrf(forceCsrf)
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    }
    return fetch(path, {
      credentials: 'include',
      ...options,
      headers,
    })
  }

  let response = await execute(false)
  let data = await parseResponse(response)

  // A deploy, login/logout, or session rotation can invalidate a cached CSRF token.
  // Refresh once and repeat the exact same request instead of surfacing a false 403.
  if (response.status === 403 && unsafe) {
    csrfToken = ''
    try {
      response = await execute(true)
      data = await parseResponse(response)
    } catch (_) {
      // Keep the original request semantics; the normal error handling below will run.
    }
  }

  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`)
    error.payload = data
    error.status = response.status
    throw error
  }
  return data
}
