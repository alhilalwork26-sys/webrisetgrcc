const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const TOKEN_KEY = 'grcc-api-token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || 'API tidak merespons dengan benar.')
  }
  return payload
}

export const api = {
  baseUrl: API_BASE,
  async login(email, password) {
    const payload = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(payload.token)
    return payload
  },
  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' })
    } finally {
      setToken(null)
    }
  },
  async getState() {
    return request('/api/state')
  },
  async saveState(state) {
    return request('/api/state', {
      method: 'PUT',
      body: JSON.stringify({ state }),
    })
  },
}
