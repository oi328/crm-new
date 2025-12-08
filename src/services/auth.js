import { api } from '@utils/api'
import { useMutation, useQuery } from '@tanstack/react-query'

export const login = async (email, password) => {
  const res = await api.post('/api/login', { email, password })
  const token = res?.data?.data?.token || res?.data?.token
  if (token) window.localStorage.setItem('token', token)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'Logged in' } })
  window.dispatchEvent(evt)
  return token
}

export const logout = async () => {
  try {
    await api.post('/api/logout')
  } catch {}
  window.localStorage.removeItem('token')
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'Logged out' } })
  window.dispatchEvent(evt)
}

export const getProfile = async () => {
  const res = await api.get('/api/company-info')
  return res?.data?.data || res?.data
}

export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: getProfile })

export const useLogin = () => useMutation({ mutationFn: ({ email, password }) => login(email, password) })