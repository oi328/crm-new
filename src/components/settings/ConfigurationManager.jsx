import React, { useEffect, useState } from 'react'
import { 
  ChevronDown, 
  Users, 
  Sparkles, 
  Copy, 
  Clock, 
  Phone, 
  CalendarClock, 
  TrendingUp, 
  Timer, 
  Flame, 
  CheckCircle, 
  XCircle, 
  Target, 
  BarChart2, 
  FileText, 
  PhoneOff, 
  Calendar, 
  Bookmark 
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@shared/context/ThemeProvider'

const ICON_OPTIONS = {
  Users: <Users className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Copy: <Copy className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Phone: <Phone className="w-5 h-5" />,
  CalendarClock: <CalendarClock className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Timer: <Timer className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  CheckCircle: <CheckCircle className="w-5 h-5" />,
  XCircle: <XCircle className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  BarChart2: <BarChart2 className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  PhoneOff: <PhoneOff className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Bookmark: <Bookmark className="w-5 h-5" />
};

const STORAGE_KEY = 'crmStages'

function loadStages() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistStages(stages) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stages))
  } catch { void 0 }
}


function sortByOrder(list) {
  return [...list].sort((a, b) => Number(a.order) - Number(b.order))
}

const DEFAULT_TYPE_OPTIONS = ['no_answer','follow_up','meeting','proposal','reservation','deal','cancel']


function normalizeStages(list) {
  const arr = Array.isArray(list) ? list : []
  return arr.map(s => ({
    name: s?.name || '',
    nameAr: s?.nameAr || '',
    type: s?.type || 'follow_up',
    order: s?.order ?? 0,
    color: s?.color || '#3B82F6',
    icon: s?.icon || 'BarChart2',
    iconUrl: s?.iconUrl || '',
  }))
}


function defaultPipelineStages() {
  return [
    { name: 'Follow up',    nameAr: '', type: 'follow_up',   order: 2, color: '#3B82F6', icon: 'CalendarClock' },
    { name: 'No Answer',    nameAr: '', type: 'follow_up',   order: 3, color: '#EF4444', icon: 'PhoneOff' },
    { name: 'Meeting',      nameAr: '', type: 'meeting',     order: 4, color: '#8B5CF6', icon: 'Calendar' },
    { name: 'Proposal',     nameAr: '', type: 'proposal',    order: 6, color: '#F59E0B', icon: 'FileText' },
    { name: 'Reservation',  nameAr: '', type: 'reservation', order: 7, color: '#10B981', icon: 'Bookmark' },
    { name: 'Closing Deal', nameAr: '', type: 'deal',        order: 8, color: '#22C55E', icon: 'CheckCircle' },
    { name: 'Cancelation',  nameAr: '', type: 'cancel',      order: 9, color: '#F97316', icon: 'XCircle' },
  ]
}


function StageTableRow({ s, idx, editingIndex, setEditingIndex, pipelineStages, setPipelineStages, t }) {
  const isEditing = editingIndex === idx
  return (
    <tr className="border-t">
      <td className="p-2">{idx + 1}</td>
      <td className="p-2">
        {isEditing ? (
          <input
            className="w-full border rounded p-1"
            value={s.name}
            onChange={e => {
              const next = [...pipelineStages]
              next[idx] = { ...next[idx], name: e.target.value }
              setPipelineStages(next)
            }}
          />
        ) : (
          s.name
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <input
            className="w-full border rounded p-1"
            value={s.nameAr || ''}
            onChange={e => {
              const next = [...pipelineStages]
              next[idx] = { ...next[idx], nameAr: e.target.value }
              setPipelineStages(next)
            }}
          />
        ) : (
          s.nameAr || ''
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <select
            className="w-full border rounded p-1"
            value={s.type}
            onChange={e => {
              const next = [...pipelineStages]
              next[idx] = { ...next[idx], type: e.target.value }
              setPipelineStages(next)
            }}
          >
            {DEFAULT_TYPE_OPTIONS.map(k => (
              <option key={k} value={k}>{t(k)}</option>
            ))}
          </select>
        ) : (
          t(s.type)
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <input
            className="w-full border rounded p-1"
            type="number"
            value={s.order}
            onChange={e => {
              const next = [...pipelineStages]
              next[idx] = { ...next[idx], order: e.target.value }
              setPipelineStages(next)
            }}
          />
        ) : (
          s.order
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <input
            className="border rounded p-0 h-8 w-12"
            type="color"
            value={s.color || '#3B82F6'}
            onChange={e => {
              const next = [...pipelineStages]
              next[idx] = { ...next[idx], color: e.target.value }
              setPipelineStages(next)
            }}
          />
        ) : (
          <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: s.color || '#3B82F6' }}></span>
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <select
              className="w-full border rounded p-1"
              value={s.icon || 'BarChart2'}
              onChange={e => {
                const next = [...pipelineStages]
                next[idx] = { ...next[idx], icon: e.target.value, iconUrl: '' }
                setPipelineStages(next)
              }}
            >
              {Object.keys(ICON_OPTIONS).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        ) : (
          s.iconUrl ? (
            <img src={s.iconUrl} alt="icon" className="w-6 h-6 inline-block rounded" />
          ) : (
            <span className="text-lg inline-block">
              {ICON_OPTIONS[s.icon] ? ICON_OPTIONS[s.icon] : (s.icon || <BarChart2 className="w-5 h-5" />)}
            </span>
          )
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 rounded bg-green-600 text-white"
              onClick={() => {
                const sorted = sortByOrder(pipelineStages)
                setPipelineStages(sorted)
                persistStages(sorted)
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
                const next = pipelineStages.filter((_, i) => i !== idx)
                const sorted = sortByOrder(next)
                setPipelineStages(sorted)
                persistStages(sorted)
              }}
            >{t('Delete')}</button>
          </div>
        )}
      </td>
    </tr>
  )
}


function StagesSetup() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const isRtl = String(i18n.language || '').startsWith('ar')

  const [pipelineStages, setPipelineStages] = useState(() => normalizeStages(sortByOrder(loadStages())))
  const [newStage, setNewStage] = useState({ name: '', nameAr: '', type: 'follow_up', order: '', color: '#3B82F6', icon: 'BarChart2', iconUrl: '' })
  const [editingIndex, setEditingIndex] = useState(null)
  const [showNewStage, setShowNewStage] = useState(false)

  useEffect(() => {
    const current = loadStages()
    if (current.length === 0) {
      const seed = normalizeStages(sortByOrder(defaultPipelineStages()))
      setPipelineStages(seed)
      persistStages(seed)
    } else {
      setPipelineStages(normalizeStages(sortByOrder(current)))
    }
  }, [])

  const headerClass = theme === 'dark' ? 'bg-[#0b2b4f]' : 'bg-gray-100'
  const thBase = 'text-left p-2 border-b'
  const thTone = theme === 'dark' ? ' border-gray-700 text-white/80' : ''

  const addStage = () => {
    if (!newStage.name.trim() || newStage.order === '') return
    const orderNum = Number(newStage.order)
    const next = [...pipelineStages, { name: newStage.name.trim(), nameAr: String(newStage.nameAr || '').trim(), type: newStage.type, order: isNaN(orderNum) ? pipelineStages.length + 1 : orderNum, color: newStage.color, icon: newStage.icon, iconUrl: newStage.iconUrl }]
    const sorted = sortByOrder(next)
    setPipelineStages(sorted)
    persistStages(sorted)
    setNewStage({ name: '', nameAr: '', type: 'follow_up', order: '', color: '#3B82F6', icon: 'BarChart2', iconUrl: '' })
    setShowNewStage(false)
  }


  

  return (
    <div className={`px-2 max-[480px]:px-1 py-4 md:px-6 md:py-6 min-h-screen ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`p-4 flex justify-between items-center gap-4 mb-6`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className={`relative inline-flex items-center ${isRtl ? 'flex-row-reverse' : ''} gap-2`}>
          <h1 className={`page-title text-2xl md:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`} style={{ textAlign: isRtl ? 'right' : 'left' }}>
            {t('Stages Setup')}
          </h1>
          <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isRtl ? 'auto' : '-4px', right: isRtl ? '-4px' : 'auto', bottom: '-4px' }}></span>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">{t('Pipeline Setup Stages')}</div>
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => setShowNewStage(v => !v)}>
            {t('New Stage')}
          </button>
        </div>

        {showNewStage && (
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 md:col-span-3 flex flex-col gap-1">
              <span className="text-xs font-medium opacity-70">{t('Stage Name')}</span>
              <input
                className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
                placeholder={t('Stage Name')}
                value={newStage.name}
                onChange={e => setNewStage(s => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="col-span-12 md:col-span-3 flex flex-col gap-1">
              <span className="text-xs font-medium opacity-70">{t('Stage Name (Arabic)')}</span>
              <input
                className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
                placeholder={t('Stage Name (Arabic)')}
                value={newStage.nameAr}
                onChange={e => setNewStage(s => ({ ...s, nameAr: e.target.value }))}
              />
            </div>
            <div className="col-span-12 md:col-span-3 flex flex-col gap-1">
              <span className="text-xs font-medium opacity-70">{t('Stage Type')}</span>
              <div className="relative">
                <select
                  className="w-full border rounded p-2 pr-10 dark:bg-gray-800 dark:text-white"
                  value={newStage.type}
                  onChange={e => setNewStage(s => ({ ...s, type: e.target.value }))}
                >
                  {DEFAULT_TYPE_OPTIONS.map(k => (
                    <option key={k} value={k}>{t(k)}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  onMouseDown={e => {
                    const el = e.currentTarget.previousElementSibling
                    if (el && typeof el.focus === 'function') el.focus()
                  }}
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>
            <div className="col-span-12 md:col-span-3 flex flex-col gap-1">
              <span className="text-xs font-medium opacity-70">{t('Stage Order')}</span>
              <input
                className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
                type="number"
                placeholder={t('Stage Order')}
                value={newStage.order}
                onChange={e => setNewStage(s => ({ ...s, order: e.target.value }))}
              />
            </div>
          </div>
          <div className="col-span-12 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 sm:col-span-6 md:col-span-3 flex flex-col gap-1">
              <span className="text-xs font-medium opacity-70">{t('Stage Color')}</span>
              <div className="flex items-center gap-2">
                <input
                  className="border rounded p-0 h-10 w-16"
                  type="color"
                  value={newStage.color}
                  onChange={e => setNewStage(s => ({ ...s, color: e.target.value }))}
                />
                <span className="text-xs opacity-70">{newStage.color}</span>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6 flex flex-col gap-1">
              <span className="text-xs font-medium opacity-70">{t('Stage Icon')}</span>
              <div className="flex items-center gap-2">
                <select
                  className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
                  value={newStage.icon || 'BarChart2'}
                  onChange={e => setNewStage(s => ({ ...s, icon: e.target.value, iconUrl: '' }))}
                >
                  {Object.keys(ICON_OPTIONS).map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                {(newStage.iconUrl || newStage.icon) && (
                  newStage.iconUrl ? (
                    <img src={newStage.iconUrl} alt="icon" className="w-7 h-7 rounded" />
                  ) : (
                    <span className="text-xl">
                      {ICON_OPTIONS[newStage.icon] || <BarChart2 className="w-5 h-5" />}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="col-span-12 flex items-center justify-end gap-2">
            <button className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white" onClick={addStage}>{t('Add')}</button>
          </div>
        </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded">
            <thead className={headerClass}>
              <tr>
                <th className={`${thBase}${thTone}`}>{t('No.')}</th>
                <th className={`${thBase}${thTone}`}>{t('Stage Name')}</th>
                <th className={`${thBase}${thTone}`}>{t('Stage Name (Arabic)')}</th>
                <th className={`${thBase}${thTone}`}>{t('Stage Type')}</th>
                <th className={`${thBase}${thTone}`}>{t('Stage Order')}</th>
                <th className={`${thBase}${thTone}`}>{t('Stage Color')}</th>
                <th className={`${thBase}${thTone}`}>{t('Stage Icon')}</th>
                <th className={`${thBase}${thTone}`}>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sortByOrder(pipelineStages).map((s, idx) => (
                <StageTableRow
                  key={`stage-${idx}-${s.name}`}
                  s={s}
                  idx={idx}
                  editingIndex={editingIndex}
                  setEditingIndex={setEditingIndex}
                  pipelineStages={pipelineStages}
                  setPipelineStages={setPipelineStages}
                  t={t}
                />
              ))}
              {pipelineStages.length === 0 && (
                <tr>
                  <td className="p-2 text-[var(--muted-text)]" colSpan={8}>{t('No data')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default StagesSetup
