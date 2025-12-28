import { api } from '@utils/api'
import { useMutation, useQuery } from '@tanstack/react-query'

export const listVisits = async (params) => {
  const res = await api.get('/api/visits', { params })
  return res?.data?.data || res?.data
}
export const getVisit = async (id) => {
  const res = await api.get(`/api/visits/${id}`)
  return res?.data?.data || res?.data
}
export const createVisit = async (payload) => {
  const res = await api.post('/api/visits', payload)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'Visit created' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}
export const updateVisit = async (id, payload) => {
  const res = await api.put(`/api/visits/${id}`, payload)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'Visit updated' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}
export const deleteVisit = async (id) => {
  const res = await api.delete(`/api/visits/${id}`)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'Visit deleted' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}

export const useVisits = (params) => useQuery({ queryKey: ['visits', params], queryFn: () => listVisits(params) })
export const useCreateVisit = () => useMutation({ mutationFn: (payload) => createVisit(payload) })
export const useUpdateVisit = () => useMutation({ mutationFn: ({ id, payload }) => updateVisit(id, payload) })
export const useDeleteVisit = () => useMutation({ mutationFn: (id) => deleteVisit(id) })