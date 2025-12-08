import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { api } from '@utils/api'
import { login as svcLogin, getProfile } from '@services/auth'
import { captureDeviceInfo, saveDeviceForUser } from '@utils/device'

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const [user, setUser] = useState({ id: 1, name: 'Demo User', role: 'admin' })
  const [company, setCompany] = useState({ id: 1, name: 'Demo Company' })
  const [subscription, setSubscription] = useState({ status: 'active', end_date: null })
  const [activeModules, setActiveModules] = useState(['leads','campaigns','settings'])
  const [bootstrapped, setBootstrapped] = useState(true)
  const isSubscriptionActive = useMemo(() => {
    if (!subscription) return false
    const status = String(subscription.status || '').toLowerCase()
    if (status !== 'active') return false
    const end = subscription.end_date ? new Date(subscription.end_date) : null
    return end ? end.getTime() >= Date.now() : true
  }, [subscription])

  const setProfile = useCallback((payload) => {
    if (!payload) return
    setUser(payload.user || { id: 1, name: 'Demo User', role: 'admin' })
    setCompany(payload.company || { id: 1, name: 'Demo Company' })
    setSubscription(payload.subscription || { status: 'active', end_date: null })
    setActiveModules(Array.isArray(payload.activeModules) ? payload.activeModules : ['leads','campaigns','settings'])
  }, [])

  const fetchCompanyInfo = useCallback(async () => {
    const payload = await getProfile()
    setProfile(payload)
    return payload
  }, [setProfile])

  const login = useCallback(async (email, password) => {
    const token = await svcLogin(email, password)
    const payload = await fetchCompanyInfo()
    try {
      const uid = payload?.user?.id || email
      const device = captureDeviceInfo()
      saveDeviceForUser(uid, device)
    } catch {}
    return token
  }, [fetchCompanyInfo])

  const canAccess = useCallback((moduleKey) => {
    if (!moduleKey) return false
    return activeModules.includes(moduleKey)
  }, [activeModules])

  const value = useMemo(() => ({
    user,
    company,
    subscription,
    activeModules,
    isSubscriptionActive,
    setProfile,
    fetchCompanyInfo,
    login,
    canAccess,
    bootstrapped,
  }), [user, company, subscription, activeModules, isSubscriptionActive, setProfile, fetchCompanyInfo, login, canAccess])

  useEffect(() => {
    setBootstrapped(true)
  }, [])

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
