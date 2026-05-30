const BASE = '/api'

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers: any = { ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Erro ${res.status}`)
  }
  return res.json()
}

async function requestBlob(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers: any = { ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Erro ${res.status}`)
  }
  return res.blob()
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      }),
    users: {
      list: () => request('/auth/users'),
      create: (data: { username: string; password: string; role: string }) =>
        request('/auth/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      delete: (id: number) => request(`/auth/users/${id}`, { method: 'DELETE' }),
    },
  },
   produtos: {
     list: (search = '', page = 1, limit?: number) => {
       const url = `/produtos?search=${encodeURIComponent(search)}&page=${page}${limit !== undefined ? `&limit=${limit}` : ''}`;
       return request(url);
     },
     import: (file: File) => {
       const form = new FormData()
       form.append('file', file)
       return request('/produtos/import', {
         method: 'POST',
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
         body: form,
       })
     },
   },
  notas: {
    list: (search = '', status = '') =>
      request(`/notas?search=${encodeURIComponent(search)}&status=${status}`),
    get: (nunota: number) => request(`/notas/${nunota}`),
    import: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return request('/notas/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      })
    },
  },
  locks: {
    check: (nunota: number) => request('/locks/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nunota }),
    }),
    acquire: (nunota: number) => request('/locks/acquire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nunota }),
    }),
    release: (nunota: number) => request('/locks/release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nunota }),
    }),
  },
  sync: {
    send: (data: any) =>
      request('/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    pendentes: () => request('/sync/pendentes'),
  },
  reports: {
    conferencias: (search = '', page = 1) =>
      request(`/reports/conferencias?search=${encodeURIComponent(search)}&page=${page}`),
    export: () => request('/reports/export'),
    exportXlsx: () => requestBlob('/reports/export-xlsx'),
  },
  health: () => request('/health'),
}
