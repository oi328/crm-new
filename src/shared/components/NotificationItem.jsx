import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const typeIcon = (type) => {
  const common = { className: 'w-5 h-5' }
  switch (type) {
    case 'task':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 11l2 2 4-4" />
          <rect x="3" y="4" width="18" height="16" rx="2" />
        </svg>
      )
    case 'lead':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a6.5 6.5 0 0113 0" />
        </svg>
      )
    case 'campaign':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 12h14" />
          <path d="M7 9l3-3 3 3" />
          <path d="M17 15l-3 3-3-3" />
        </svg>
      )
    case 'inventory':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
        </svg>
      )
    case 'comment':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 15a4 4 0 01-4 4H7l-4 4V7a4 4 0 014-4h10a4 4 0 014 4z" />
        </svg>
      )
    case 'system':
    default:
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
  }
}

const timeAgo = (ts) => {
  try {
    const diff = Date.now() - Number(ts || 0)
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'now'
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    const d = Math.floor(h / 24)
    return `${d}d`
  } catch { return '' }
}

export default function NotificationItem({ data, onToggleRead, onArchive, onUnarchive }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const tone = useMemo(() => {
    switch (data?.type) {
      case 'task': return 'text-green-600 dark:text-green-400'
      case 'lead': return 'text-blue-600 dark:text-blue-400'
      case 'campaign': return 'text-purple-600 dark:text-purple-400'
      case 'inventory': return 'text-amber-600 dark:text-amber-400'
      case 'comment': return 'text-pink-600 dark:text-pink-400'
      case 'system':
      default: return 'text-gray-600 dark:text-gray-300'
    }
  }, [data?.type])

  const borderUnread = !data?.read ? 'border-blue-300 dark:border-blue-700' : 'border-gray-200 dark:border-gray-800'
  const bgUnread = !data?.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-[var(--content-bg)]'

  return (
    <div className={`rounded-md border ${borderUnread} ${bgUnread} p-3 sm:p-4 flex items-start gap-3`}> 
      <div className={`flex-shrink-0 mt-0.5 ${tone}`}>{typeIcon(data?.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{data?.title || ''}</h3>
              {data?.archived && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{t('Archived', 'Archived')}</span>
              )}
              {!data?.read && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white">{t('New', 'New')}</span>
              )}
            </div>
            <p className="text-sm opacity-80 truncate">{data?.body || ''}</p>
            <div className="text-xs opacity-60 mt-0.5">{timeAgo(data?.createdAt)} • {t(data?.source) || data?.source}</div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setOpen(v => !v)} className="btn btn-xs btn-ghost text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" aria-expanded={open} title={open ? t('Collapse', 'Collapse') : t('Expand', 'Expand')}>
              <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <button onClick={onToggleRead} className="btn btn-xs" title={data?.read ? t('Mark as unread', 'Mark as unread') : t('Mark as read', 'Mark as read')}>
              {data?.read ? t('Unread', 'Unread') : t('Read', 'Read')}
            </button>
            {!data?.archived ? (
              <button onClick={onArchive} className="btn btn-xs btn-outline" title={t('Archive', 'Archive')}>
                {t('Archive', 'Archive')}
              </button>
            ) : (
              <button onClick={onUnarchive} className="btn btn-xs btn-outline" title={t('Unarchive', 'Unarchive')}>
                {t('Unarchive', 'Unarchive')}
              </button>
            )}
          </div>
        </div>
        {open && (
          <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-800 text-sm">
            <div className="opacity-90 whitespace-pre-wrap">{data?.body || ''}</div>
          </div>
        )}
      </div>
    </div>
  )
}
