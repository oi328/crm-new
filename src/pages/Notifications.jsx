import React, { useEffect, useMemo, useState, useCallback } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import NotificationItem from '@shared/components/NotificationItem'
import SearchableSelect from '@shared/components/SearchableSelect'

function seedNotifications() {
  const now = Date.now()
  return [
    { id: 'n1', type: 'task', title: 'New task assigned', body: 'Call client Ibrahim about contract details', createdAt: now - 1000 * 60 * 20, read: false, archived: false, source: 'Tasks' },
    { id: 'n2', type: 'lead', title: 'New lead imported', body: 'Lead "Sara Ali" added from Meta campaign', createdAt: now - 1000 * 60 * 60 * 2, read: false, archived: false, source: 'Leads' },
    { id: 'n3', type: 'campaign', title: 'Campaign budget alert', body: 'Google Ads daily budget reached 90%', createdAt: now - 1000 * 60 * 60 * 6, read: true, archived: false, source: 'Marketing' },
    { id: 'n4', type: 'inventory', title: 'Low stock threshold', body: 'Item "SKU-AX12" is running low', createdAt: now - 1000 * 60 * 60 * 12, read: false, archived: false, source: 'Inventory' },
    { id: 'n5', type: 'comment', title: 'New comment on Task', body: 'Omar: Please update the deadline to Friday', createdAt: now - 1000 * 60 * 60 * 26, read: true, archived: false, source: 'Tasks' },
    { id: 'n6', type: 'system', title: 'System updated', body: 'CRM Ibrahim v1.2.3 deployed successfully', createdAt: now - 1000 * 60 * 60 * 48, read: true, archived: false, source: 'System' },
    { id: 'n7', type: 'task', title: 'Task deadline tomorrow', body: 'Prepare product demo materials', createdAt: now - 1000 * 60 * 60 * 4, read: false, archived: false, source: 'Tasks' },
    { id: 'n8', type: 'lead', title: 'Lead status changed', body: 'Lead "Mohamed" moved to Qualified', createdAt: now - 1000 * 60 * 10, read: false, archived: false, source: 'Leads' },
  ]
}

const TYPES = [
  { value: 'All', label: 'All' },
  { value: 'task', label: 'Tasks' },
  { value: 'lead', label: 'Leads' },
  { value: 'campaign', label: 'Campaigns' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'comment', label: 'Comments' },
  { value: 'system', label: 'System' },
]

export function NotificationsContent({ embedded = false }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [notifications, setNotifications] = useState([])
  const [tab, setTab] = useState('all') // all | unread | archived
  const [q, setQ] = useState('')
  const [type, setType] = useState('All')

  // Load/seed data
  useEffect(() => {
    try {
      const raw = localStorage.getItem('notificationsData')
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) setNotifications(arr)
        else throw new Error('Invalid notifications')
      } else {
        const seed = seedNotifications()
        setNotifications(seed)
        localStorage.setItem('notificationsData', JSON.stringify(seed))
      }
    } catch {
      const seed = seedNotifications()
      setNotifications(seed)
      try { localStorage.setItem('notificationsData', JSON.stringify(seed)) } catch {}
    }
  }, [])

  const save = useCallback((list) => {
    setNotifications(list)
    try {
      localStorage.setItem('notificationsData', JSON.stringify(list))
      window.dispatchEvent(new Event('notificationsUpdated'))
    } catch {}
  }, [])

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase()
    return notifications.filter(n => {
      if (tab === 'unread' && n.read) return false
      if (tab === 'archived' && !n.archived) return false
      if (tab !== 'archived' && n.archived) return false
      if (type !== 'All' && (n.type || '') !== type) return false
      if (query) {
        const text = `${n.title || ''} ${n.body || ''}`.toLowerCase()
        if (!text.includes(query)) return false
      }
      return true
    })
  }, [notifications, tab, q, type])

  const unreadCount = useMemo(() => notifications.filter(n => !n.read && !n.archived).length, [notifications])

  const markAllRead = () => {
    const list = notifications.map(n => ({ ...n, read: true }))
    save(list)
  }

  const clearRead = () => {
    const list = notifications.filter(n => !n.read)
    save(list)
  }

  const toggleRead = (id) => {
    const list = notifications.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    save(list)
  }

  const setArchived = (id, value) => {
    const list = notifications.map(n => (n.id === id ? { ...n, archived: value } : n))
    save(list)
  }

  return (
      <div className={`space-y-6 ${embedded ? 'p-0' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="page-title text-xl font-semibold">{t('Notifications', 'Notifications')}</h1>
            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {unreadCount} {t('Unread', 'Unread')}
            </span>
          </div>
          {!embedded && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={markAllRead} className="btn btn-sm">
              {t('Mark all as read', 'Mark all as read')}
            </button>
            <button type="button" onClick={clearRead} className="btn btn-sm btn-outline">
              {t('Clear read', 'Clear read')}
            </button>
          </div>
          )}
        </div>
        <div className="h-3" aria-hidden="true"></div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs: All / Unread / Archived */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setTab('all')}
              className={`px-3 py-1.5 text-sm rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-[0.98] ${tab==='all' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-50 dark:bg-transparent border-gray-300 dark:border-gray-700 text-gray-800 dark:text-[var(--content-text)] hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:shadow'}`}
            >
              {t('All')}
            </button>
            <button
              onClick={() => setTab('unread')}
              className={`px-3 py-1.5 text-sm rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-[0.98] ${tab==='unread' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-50 dark:bg-transparent border-gray-300 dark:border-gray-700 text-gray-800 dark:text-[var(--content-text)] hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:shadow'}`}
            >
              {t('Unread', 'Unread')}
            </button>
            <button
              onClick={() => setTab('archived')}
              className={`px-3 py-1.5 text-sm rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-[0.98] ${tab==='archived' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-50 dark:bg-transparent border-gray-300 dark:border-gray-700 text-gray-800 dark:text-[var(--content-text)] hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:shadow'}`}
            >
              {t('Archived', 'Archived')}
            </button>
          </div>

          {/* Search + Filter side-by-side */}
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <input
                value={q}
                onChange={e=>setQ(e.target.value)}
                placeholder={t('Search')}
                className="w-full rounded-lg border px-3 py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 border-gray-300 placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 opacity-70 text-gray-600 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="11" cy="11" r="6" /><path d="M21 21l-4.5-4.5" /></svg>
              </span>
            </div>
            <div className="w-40">
              <SearchableSelect
                options={TYPES}
                value={type}
                onChange={setType}
                placeholder={t('All')}
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {visible.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-md text-sm opacity-75">
              {t('No notifications', 'No notifications')}
            </div>
          ) : (
            visible.map(n => (
              <NotificationItem
                key={n.id}
                data={n}
                onToggleRead={() => toggleRead(n.id)}
                onArchive={() => setArchived(n.id, true)}
                onUnarchive={() => setArchived(n.id, false)}
              />
            ))
          )}
        </div>
      </div>
  )
}

export default function Notifications() {
  return (
    <Layout>
      <NotificationsContent embedded={false} />
    </Layout>
  )
}
