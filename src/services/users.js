import { api } from '@utils/api'
import { useMutation, useQuery } from '@tanstack/react-query'

export const listUsers = async (params) => {
  const res = await api.get('/api/users', { params })
  return res?.data?.data || res?.data
}
export const getUser = async (id) => {
  const res = await api.get(`/api/users/${id}`)
  return res?.data?.data || res?.data
}
export const createUser = async (payload) => {
  const res = await api.post('/api/users', payload)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'User created' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}
export const updateUser = async (id, payload) => {
  const res = await api.put(`/api/users/${id}`, payload)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'User updated' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}
export const deleteUser = async (id) => {
  const res = await api.delete(`/api/users/${id}`)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'User deleted' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}

export const useUsers = (params) => useQuery({ queryKey: ['users', params], queryFn: () => listUsers(params) })
export const useCreateUser = () => useMutation({ mutationFn: (payload) => createUser(payload) })
export const useUpdateUser = () => useMutation({ mutationFn: ({ id, payload }) => updateUser(id, payload) })
export const useDeleteUser = () => useMutation({ mutationFn: (id) => deleteUser(id) })