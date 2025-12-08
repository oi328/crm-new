import { api } from '@utils/api'
import { useMutation, useQuery } from '@tanstack/react-query'

export const listCustomers = async (params) => {
  const res = await api.get('/api/customers', { params })
  return res?.data?.data || res?.data
}
export const getCustomer = async (id) => {
  const res = await api.get(`/api/customers/${id}`)
  return res?.data?.data || res?.data
}
export const createCustomer = async (payload) => {
  const res = await api.post('/api/customers', payload)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'Customer created' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}
export const updateCustomer = async (id, payload) => {
  const res = await api.put(`/api/customers/${id}`, payload)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'Customer updated' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}
export const deleteCustomer = async (id) => {
  const res = await api.delete(`/api/customers/${id}`)
  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: 'Customer deleted' } })
  window.dispatchEvent(evt)
  return res?.data?.data || res?.data
}

export const useCustomers = (params) => useQuery({ queryKey: ['customers', params], queryFn: () => listCustomers(params) })
export const useCreateCustomer = () => useMutation({ mutationFn: (payload) => createCustomer(payload) })
export const useUpdateCustomer = () => useMutation({ mutationFn: ({ id, payload }) => updateCustomer(id, payload) })
export const useDeleteCustomer = () => useMutation({ mutationFn: (id) => deleteCustomer(id) })