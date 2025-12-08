import axios from 'axios'

const base = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE
  : '/'

export const api = axios.create({
  baseURL: base,
})

api.interceptors.request.use((config) => {
  try {
    const token = window.localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {}
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      const status = err?.response?.status
      if (status === 401) {
        window.localStorage.removeItem('token')
        const evt = new CustomEvent('app:toast', { detail: { type: 'error', message: 'Authentication required' } })
        window.dispatchEvent(evt)
        if (typeof window !== 'undefined') window.location.hash = '#/login'
      } else {
        const msg = err?.response?.data?.message || err?.message || 'Request failed'
        const evt = new CustomEvent('app:toast', { detail: { type: 'error', message: msg } })
        window.dispatchEvent(evt)
      }
    } catch {}
    return Promise.reject(err)
  }
)
// Demo mode: intercept calls and return dummy data to allow browsing without backend
const DEMO_MODE = true

function mockData(method, url, body) {
  if (url.startsWith('/api/users')) {
    if (method === 'GET') {
      if (/\/api\/users\/.+/.test(url)) return { id: 1, name: 'Demo User', email: 'demo@example.com', role: 'admin' }
      return [{ id: 1, name: 'Demo User', role: 'admin' }, { id: 2, name: 'Agent 1', role: 'agent' }]
    }
    return { ok: true }
  }
  if (url.startsWith('/api/customers')) {
    if (method === 'GET') {
      if (/\/api\/customers\/.+/.test(url)) return { id: 101, name: 'Acme Corp', phone: '+201234567890' }
      return [
        { id: 101, name: 'Acme Corp', phone: '+201234567890' },
        { id: 102, name: 'Globex', phone: '+201112223334' },
      ]
    }
    return { ok: true }
  }
  if (url.startsWith('/api/visits')) {
    if (method === 'GET') {
      if (/\/api\/visits\/.+/.test(url)) return { id: 201, customerId: 101, date: '2025-01-01', notes: 'Site visit' }
      return [
        { id: 201, customerId: 101, date: '2025-01-01', notes: 'Site visit' },
        { id: 202, customerId: 102, date: '2025-01-02', notes: 'Follow-up' },
      ]
    }
    return { ok: true }
  }
  if (url.startsWith('/api/tasks')) {
    if (method === 'GET') {
      if (/\/api\/tasks\/.+/.test(url)) return { id: 301, title: 'Call customer', status: 'open', assigneeId: 1 }
      return [
        { id: 301, title: 'Call customer', status: 'open', assigneeId: 1 },
        { id: 302, title: 'Prepare quotation', status: 'in_progress', assigneeId: 2 },
      ]
    }
    return { ok: true }
  }
  if (url.startsWith('/api/reports')) {
    return { summary: { leads: 120, deals: 35, revenue: 250000 }, activities: [{ id: 1, action: 'login', user: 'Demo User' }] }
  }
  if (url.startsWith('/api/login')) {
    return { token: 'demo-token' }
  }
  if (url.startsWith('/api/company-info')) {
    return { user: { id: 1, name: 'Demo User', role: 'admin' }, company: { id: 1, name: 'Demo Company' }, activeModules: ['leads','campaigns','settings'], subscription: { status: 'active' } }
  }
  return { ok: true }
}

if (DEMO_MODE) {
  const wrap = (method) => async (url, configOrData) => {
    const data = mockData(method, url, configOrData)
    return { data }
  }
  api.get = wrap('GET')
  api.post = wrap('POST')
  api.put = wrap('PUT')
  api.delete = wrap('DELETE')
}