import { api } from '@utils/api'
import { useQuery } from '@tanstack/react-query'

export const getAnalytics = async (params) => {
  const res = await api.get('/api/reports/analytics', { params })
  return res?.data?.data || res?.data
}
export const getActivityLogs = async (params) => {
  const res = await api.get('/api/reports/activity-logs', { params })
  return res?.data?.data || res?.data
}

export const useAnalytics = (params) => useQuery({ queryKey: ['reports','analytics', params], queryFn: () => getAnalytics(params) })
export const useActivityLogs = (params) => useQuery({ queryKey: ['reports','activity', params], queryFn: () => getActivityLogs(params) })