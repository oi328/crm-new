import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@shared/context/ThemeProvider'

const CANCEL_STORAGE_KEY = 'crmCancelReasons'

function loadCancelReasons() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(CANCEL_STORAGE_KEY) : null
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistCancelReasons(reasons) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(CANCEL_STORAGE_KEY, JSON.stringify(reasons))
  } catch { void 0 }
}

function normalizeCancelReasons(list) {
  const arr = Array.isArray(list) ? list : []
  return arr.map(r => ({
    title: r?.title || '',
    titleAr: r?.titleAr || '',
  }))
}

function defaultCancelReasons() {
  return [
    { title: 'Not Interested',  titleAr: '' },
    { title: 'Wrong Number',    titleAr: '' },
    { title: 'Payment Plan',    titleAr: '' },
    { title: 'Low Budget',      titleAr: '' },
  ]
}

function CancelReasonRow({ r, idx, editingIndex, setEditingIndex, reasons, setReasons, t }) {
  const isEditing = editingIndex === idx
  return (
    <tr className="border-t">
      <td className="p-2">{idx + 1}</td>
      <td className="p-2">
        {isEditing ? (
          <input
            className="w-full border rounded p-1"
            value={r.title}
            onChange={e => {
              const next = [...reasons]
              next[idx] = { ...next[idx], title: e.target.value }
              setReasons(next)
            }}
          />
        ) : (
          r.title
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <input
            className="w-full border rounded p-1"
            value={r.titleAr || ''}
            onChange={e => {
              const next = [...reasons]
              next[idx] = { ...next[idx], titleAr: e.target.value }
              setReasons(next)
            }}
          />
        ) : (
          r.titleAr || ''
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 rounded bg-green-600 text-white"
              onClick={() => {
                persistCancelReasons(reasons)
                setEditingIndex(null)
              }}
            >{t('Save')}</button>
            <button
              className="px-2 py-1 rounded bg-gray-300 dark:bg-gray-700"
              onClick={() => setEditingIndex(null)}
            >{t('Cancel')}</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 rounded bg-blue-600 text-white"
              onClick={() => setEditingIndex(idx)}
            >{t('Edit')}</button>
            <button
              className="px-2 py-1 rounded bg-red-600 text-white"
              onClick={() => {
                const next = reasons.filter((_, i) => i !== idx)
                setReasons(next)
                persistCancelReasons(next)
              }}
            >{t('Delete')}</button>
          </div>
        )}
      </td>
    </tr>
  )
}

export default function CancelReasons() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const isRtl = String(i18n.language || '').startsWith('ar')

  const [reasons, setReasons] = useState(() => normalizeCancelReasons(loadCancelReasons()))
  const [newReason, setNewReason] = useState({ title: '', titleAr: '' })
  const [editingIndex, setEditingIndex] = useState(null)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    const existingReasons = loadCancelReasons()
    if (existingReasons.length === 0) {
      const seed = normalizeCancelReasons(defaultCancelReasons())
      setReasons(seed)
      persistCancelReasons(seed)
    } else {
      setReasons(normalizeCancelReasons(existingReasons))
    }
  }, [])

  const headerClass = theme === 'dark' ? 'bg-[#0b2b4f]' : 'bg-gray-100'
  const thBase = 'text-left p-2 border-b'
  const thTone = theme === 'dark' ? ' border-gray-700 text-white/80' : ''

  const addReason = () => {
    if (!newReason.title.trim()) return
    const next = [...reasons, { title: newReason.title.trim(), titleAr: String(newReason.titleAr || '').trim() }]
    setReasons(next)
    persistCancelReasons(next)
    setNewReason({ title: '', titleAr: '' })
    setShowNew(false)
  }

  return (
    <div className={`px-2 max-[480px]:px-1 py-4 md:px-6 md:py-6 min-h-screen ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`p-4 flex justify-between items-center gap-4 mb-6`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className={`relative inline-flex items-center ${isRtl ? 'flex-row-reverse' : ''} gap-2`}>
          <h1 className={`page-title text-2xl md:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`} style={{ textAlign: isRtl ? 'right' : 'left' }}>
            {t('Cancel Reasons')}
          </h1>
          <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isRtl ? 'auto' : '-4px', right: isRtl ? '-4px' : 'auto', bottom: '-4px' }}></span>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">{t('Cancel Reasons')}</div>
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => setShowNew(v => !v)}>
            {t('Add Cancel Reason')}
          </button>
        </div>

        {showNew && (
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 md:col-span-6 flex flex-col gap-1">
              <span className="text-xs font-medium opacity-70">{t('Reason Title')}</span>
              <input
                className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
                placeholder={t('Reason Title')}
                value={newReason.title}
                onChange={e => setNewReason(s => ({ ...s, title: e.target.value }))}
              />
            </div>
            <div className="col-span-12 md:col-span-6 flex flex-col gap-1">
              <span className="text-xs font-medium opacity-70">{t('Reason Title (Arabic)')}</span>
              <input
                className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
                placeholder={t('Reason Title (Arabic)')}
                value={newReason.titleAr}
                onChange={e => setNewReason(s => ({ ...s, titleAr: e.target.value }))}
              />
            </div>
          </div>
          <div className="col-span-12 flex items-center justify-end gap-2">
            <button className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white" onClick={addReason}>{t('Add')}</button>
          </div>
        </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded">
            <thead className={headerClass}>
              <tr>
                <th className={`${thBase}${thTone}`}>{t('No.')}</th>
                <th className={`${thBase}${thTone}`}>{t('Reason Title')}</th>
                <th className={`${thBase}${thTone}`}>{t('Reason Title (Arabic)')}</th>
                <th className={`${thBase}${thTone}`}>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {reasons.map((r, idx) => (
                <CancelReasonRow
                  key={`reason-${idx}-${r.title}`}
                  r={r}
                  idx={idx}
                  editingIndex={editingIndex}
                  setEditingIndex={setEditingIndex}
                  reasons={reasons}
                  setReasons={setReasons}
                  t={t}
                />
              ))}
              {reasons.length === 0 && (
                <tr>
                  <td className="p-2 text-[var(--muted-text)]" colSpan={4}>{t('No cancel reasons yet. Add your first reason above.')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

