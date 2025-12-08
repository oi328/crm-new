import { api } from '@utils/api'
import { useMutation, useQuery } from '@tanstack/react-query'

export const listTasks = async (params) => {
  const res = await api.get('/api/tasks', { params })
  return res?.data?.data || res?.data
}
export const getTask = async (id) => {
  const res = await api.get(`/api/tasks/${id}`)
  return res?.data?.data || res?.data
}
export const createTask = async (payload) => {
  const res = await api.post('/api/tasks', payload)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'Task created' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}
export const updateTask = async (id, payload) => {
  const res = await api.put(`/api/tasks/${id}`, payload)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'Task updated' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}
export const deleteTask = async (id) => {
  const res = await api.delete(`/api/tasks/${id}`)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'Task deleted' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}
export const assignTask = async (id, userId) => {
  const res = await api.post(`/api/tasks/${id}/assign`, { userId })
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'Task assigned' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}

export const useTasks = (params) => useQuery({ queryKey: ['tasks', params], queryFn: () => listTasks(params) })
export const useCreateTask = () => useMutation({ mutationFn: (payload) => createTask(payload) })
export const useUpdateTask = () => useMutation({ mutationFn: ({ id, payload }) => updateTask(id, payload) })
export const useDeleteTask = () => useMutation({ mutationFn: (id) => deleteTask(id) })
export const useAssignTask = () => useMutation({ mutationFn: ({ id, userId }) => assignTask(id, userId) })