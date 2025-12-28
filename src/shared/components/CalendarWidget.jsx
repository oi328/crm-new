import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@shared/context/ThemeProvider'
import AddActionModal from '@components/AddActionModal'
import SearchableSelect from '@shared/components/SearchableSelect'

// Local storage helpers for actions per day
const STORAGE_KEY = 'userActionsByDate'

const loadActions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const allActions = raw ? JSON.parse(raw) : {}
    
    // Filter to only show meeting actions
    const meetingActions = {}
    Object.keys(allActions).forEach(date => {
      if (allActions[date] && Array.isArray(allActions[date])) {
        // Filter actions that contain meeting-related keywords
        meetingActions[date] = allActions[date].filter(action => {
          const actionText = String(action).toLowerCase()
          return actionText.includes('meeting') || 
                 actionText.includes('اجتماع') ||
                 actionText.includes('اجتماع تعريفي') ||
                 actionText.includes('اجتماع متابعة') ||
                 actionText.includes('اجتماع عرض') ||
                 actionText.includes('اجتماع تفاوض')
        })
      }
    })
    
    return meetingActions
  } catch (e) {
    return {}
  }
}

const saveActions = (data) => {
  try {
    // Filter to only save meeting actions
    const meetingData = {}
    Object.keys(data).forEach(date => {
      if (data[date] && Array.isArray(data[date])) {
        meetingData[date] = data[date].filter(action => {
          const actionText = String(action).toLowerCase()
          return actionText.includes('meeting') || 
                 actionText.includes('اجتماع') ||
                 actionText.includes('اجتماع تعريفي') ||
                 actionText.includes('اجتماع متابعة') ||
                 actionText.includes('اجتماع عرض') ||
                 actionText.includes('اجتماع تفاوض')
        })
      }
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetingData))
  } catch (e) {}
}

// Utility: get days for a month view
const getMonthGrid = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay() // 0 Sun - 6 Sat
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const cells = []
  // Leading days from previous month
  for (let i = 0; i < startWeekday; i++) {
    const day = prevMonthDays - startWeekday + 1 + i
    cells.push({ date: new Date(year, month - 1, day), inMonth: false })
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true })
  }
  // Trailing days to complete weeks (42 cells = 6 weeks grid)
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date
    const next = new Date(last)
    next.setDate(last.getDate() + 1)
    cells.push({ date: next, inMonth: false })
  }
  return cells
}

export default function CalendarWidget({ tone }) {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const effectiveTone = tone || theme || 'light'
  const isLight = effectiveTone === 'light'
  const [today] = useState(new Date())
  const [cursor, setCursor] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [hoverDate, setHoverDate] = useState(null)
  const [actionsByDate, setActionsByDate] = useState({})
  const [showAddActionModal, setShowAddActionModal] = useState(false)
  const [showDailyActions, setShowDailyActions] = useState(false)
  const [actionsView, setActionsView] = useState('selected')
  const [selectedAction, setSelectedAction] = useState(null)
  // Dynamic column height for calendar and actions column
  const [columnHeight, setColumnHeight] = useState(520)
  const adjustColumnHeight = (delta) => {
    setColumnHeight((h) => Math.max(380, Math.min(800, h + delta)))
  }

  // Filters state
  const [selectedStage, setSelectedStage] = useState(t('All Stages'))
  const [selectedManager, setSelectedManager] = useState(t('All Managers'))
  const [selectedEmployee, setSelectedEmployee] = useState(t('All Employees'))
  const [selectedLeadFilter, setSelectedLeadFilter] = useState(t('All Leads'))
  const [query, setQuery] = useState('')
  const [showLeadDetails, setShowLeadDetails] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)

  // Load actions on mount
  useEffect(() => {
    setActionsByDate(loadActions())
  }, [])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const grid = useMemo(() => getMonthGrid(year, month), [year, month])

  const weekdayNames = useMemo(() => {
    const d = new Date(2023, 0, 1) // Sunday
    return Array.from({ length: 7 }).map((_, i) => {
      const w = new Date(2023, 0, 1 + i)
      return w.toLocaleString(i18n.language, { weekday: 'short' })
    })
  }, [i18n.language])

  const actionsFor = (date) => {
    const k = date.toDateString() // Basic key
    // Also try ISO date key
    const iso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 10)
    
    let list = []
    // Check various key formats
    if (actionsByDate[k]) list = [...list, ...actionsByDate[k]]
    if (actionsByDate[iso]) list = [...list, ...actionsByDate[iso]]
    
    // Filter by search query if any
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(a => {
        const title = typeof a === 'string' ? a : (a.title || '')
        return title.toLowerCase().includes(q)
      })
    }
    return list
  }

  // Helper to get actions for the current view
  const getActionsByTimeframe = (view) => {
    let all = []
    if (view === 'selected') {
      if (selectedDate) all = actionsFor(selectedDate)
    } else if (view === 'week') {
      // Find week start/end for selectedDate
      const d = selectedDate || today
      const day = d.getDay()
      const start = new Date(d)
      start.setDate(d.getDate() - day)
      for (let i=0; i<7; i++) {
        const curr = new Date(start)
        curr.setDate(start.getDate() + i)
        all = [...all, ...actionsFor(curr)]
      }
    } else if (view === 'month') {
      // All days in current month view
      grid.forEach(cell => {
        if (cell.inMonth) {
          all = [...all, ...actionsFor(cell.date)]
        }
      })
    } else if (view === 'upcoming') {
      // Next 7 days from today
      for (let i=0; i<7; i++) {
        const curr = new Date(today)
        curr.setDate(today.getDate() + i)
        all = [...all, ...actionsFor(curr)]
      }
    }
    return all
  }

  const handleSaveAction = (action) => {
    const map = loadActions()
    const key = action?.date || new Date().toISOString().slice(0,10)
    // Ensure we save a proper object if possible, or string
    // Here we adapt to the existing saveActions logic
    const entry = action
    map[key] = [ ...(map[key] || []), entry ]
    saveActions(map)
    setActionsByDate(map)
    setShowAddActionModal(false)
  }
  
  const handleLeadPreview = (leadId) => {
    // Find lead in local storage
    try {
      const saved = localStorage.getItem('leadsData')
      if (saved) {
        const leads = JSON.parse(saved)
        const found = leads.find(l => l.id === leadId)
        if (found) {
          setSelectedLead(found)
          setShowLeadDetails(true)
        }
      }
    } catch (e) {}
  }

  // Mock options
  const stages = [t('All Stages'), t('New'), t('Contacted'), t('Qualified'), t('Proposal'), t('Won'), t('Lost')]
  const managers = [t('All Managers'), 'Manager 1', 'Manager 2']
  const employees = [t('All Employees'), 'Employee 1', 'Employee 2']
  const leadOptions = [t('All Leads'), 'Ahmed Ali', 'Sarah Smith']

  return (
    <div className={`rounded-xl border shadow-sm ${
      isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-gray-900 border-gray-700 text-gray-100'
    }`}>
        <div className="p-4 pt-4 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
              <div>
                <h2 className={`text-base font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{t('Calendar')}</h2>
                <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{t('Calendar Subtitle')}</p>
              </div>
            </div>
        {/* Header */}
        <div className={`flex items-center justify-between px-3 py-2 border-b gap-2 ${
          isLight ? 'bg-gray-50 border-gray-200' : 'bg-gray-800 border-gray-700'
        } flex-row flex-nowrap`}>
          <div className="flex items-center gap-4 flex-1">
          <span className={`font-bold text-base ${isLight ? 'text-gray-800' : 'text-white'} whitespace-nowrap`}>
              {cursor.toLocaleString(i18n.language, { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-2">
              <select
                value={month}
                onChange={(e) => {
                  const m = parseInt(e.target.value, 10)
                  setCursor(new Date(year, m, 1))
                }}
                className={`px-2 py-1 text-xs rounded-md border ${isLight ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-700 border-gray-600 text-gray-200'}`}
                aria-label="Select month"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(2000, i, 1).toLocaleString(i18n.language, { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => {
                  const y = parseInt(e.target.value, 10)
                  setCursor(new Date(y, month, 1))
                }}
                className={`px-2 py-1 text-xs rounded-md border ${isLight ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-700 border-gray-600 text-gray-200'}`}
                aria-label="Select year"
              >
                {Array.from({ length: 21 }).map((_, idx) => {
                  const y = today.getFullYear() - 10 + idx
                  return (
                    <option key={y} value={y}>{y}</option>
                  )
                })}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`p-1 rounded-md ${isLight ? 'hover:bg-gray-200' : 'hover:bg-gray-700'}`}
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                aria-label="Prev month"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </button>
              <button
                className={`p-1 rounded-md ${isLight ? 'hover:bg-gray-200' : 'hover:bg-gray-700'}`}
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                aria-label="Next month"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 text-sm font-semibold rounded-md ${isLight ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => { const now = new Date(); setCursor(now); setSelectedDate(now); setActionsView('selected') }}
            >
              {t('Today')}
            </button>
          </div>
        </div>

        {/* Filters + Calendar */}
        <div className="p-3">
          {/* Filters Row */}
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Stage Dropdown */}
              <SearchableSelect
                value={selectedStage}
                onChange={(val) => setSelectedStage(val)}
                options={stages}
              />
              
              {/* Manager Dropdown */}
              <SearchableSelect
                value={selectedManager}
                onChange={(val) => setSelectedManager(val)}
                options={managers}
              />
              
              {/* Employee Dropdown */}
              <SearchableSelect
                value={selectedEmployee}
                onChange={(val) => setSelectedEmployee(val)}
                options={employees}
              />

              {/* Leads Dropdown */}
              <SearchableSelect
                value={selectedLeadFilter}
                onChange={(val) => setSelectedLeadFilter(val)}
                options={leadOptions}
              />
            </div>
            <div className="flex-1 md:flex-none">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Search...')}
                className={`w-full md:w-64 px-3 py-1 text-sm rounded-md border ${isLight ? 'bg-white border-gray-300 text-gray-700 placeholder-gray-400' : 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'}`}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Calendar Column */}
            <div className="min-h-[360px] flex flex-col" style={{ minHeight: columnHeight }}>
              {/* Month Header */}
              <div className={`grid grid-cols-7 text-xs mb-2 ${isLight ? 'text-gray-600 opacity-70' : 'text-gray-300 opacity-80'}`}>
                {weekdayNames.map((w) => (
                  <div key={w} className="text-center py-1">{w}</div>
                ))}
              </div>
              {/* Month Grid */}
              <div className="grid grid-cols-7 gap-1 flex-1">
                {grid.map(({ date, inMonth }, idx) => {
                  const isToday = date.toDateString() === today.toDateString()
                  const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
                  let acts = actionsFor(date)
                  // Apply person and lead filters
                  if (selectedEmployee && selectedEmployee !== t('All Employees')) {
                    acts = acts.filter(a => a.assignedTo === selectedEmployee)
                  } else if (selectedManager && selectedManager !== t('All Managers')) {
                    acts = acts.filter(a => a.assignedTo === selectedManager)
                  }
                  if (selectedLeadFilter && selectedLeadFilter !== t('All Leads')) {
                    acts = acts.filter(a => a.leadName === selectedLeadFilter)
                  }
                  // Decide popover placement: show above for bottom rows
                  const rowIndex = Math.floor(idx / 7)
                  const popoverPlacement = rowIndex >= 4 ? 'bottom-full mb-1' : 'top-full mt-1'
                  return (
                    <div className="relative group" key={idx}>
                      <button
                        onClick={() => { setSelectedDate(date); setActionsView('selected') }}
                        onMouseEnter={() => setHoverDate(date)}
                        onMouseLeave={() => setHoverDate(null)}
                        className={`text-center rounded-lg border p-2 min-h-[70px] w-full transition-colors duration-150 ${
                          inMonth
                            ? isLight
                              ? 'bg-white border-gray-200 hover:bg-gray-100'
                              : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                            : isLight
                              ? 'bg-gray-50 border-gray-200 opacity-50'
                              : 'bg-gray-900 border-gray-800 opacity-50'
                        } ${isToday ? 'ring-2 ring-indigo-500' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <span className="text-sm font-medium">{date.getDate()}</span>
                        {acts.length > 0 && (
                          <span className={`mt-1 inline-block w-2 h-2 rounded-full ${isLight ? 'bg-indigo-500' : 'bg-indigo-400'}`}></span>
                        )}
                      </button>
                      
                      </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Actions + Notifications stacked */}
            <div className="min-h-[360px] flex flex-col" style={{ minHeight: columnHeight }}>
              {/* Actions List */}
              <div className={`rounded-xl border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} shadow-sm flex-1 flex flex-col overflow-hidden`}>
                <div className={`px-4 py-2 border-b flex items-center justify-between ${isLight ? 'border-gray-200' : 'border-gray-700 bg-gray-800'}`}>
                  <span className="font-semibold text-sm">{t('Actions')}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        {[
                        { key: 'selected', label: (selectedDate && selectedDate.toDateString() === today.toDateString()) ? t('Today') : t('Selected') },
                        { key: 'week', label: t('Week') },
                        { key: 'month', label: t('Month') },
                        { key: 'upcoming', label: t('Upcoming') }
                      ].map(btn => (
                        <button
                          key={btn.key}
                          className={`px-2 py-1 text-xs rounded-md border ${isLight ? 'border-gray-300' : 'border-gray-600'} ${actionsView === btn.key ? (isLight ? 'bg-gray-200' : 'bg-gray-700') : ''}`}
                          onClick={() => setActionsView(btn.key)}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                    
                  </div>
                </div>
                <div className="p-3 space-y-2 flex-1 pb-4">
                  {getActionsByTimeframe(actionsView).map((a, i) => {
                    const title = typeof a === 'string' ? a : (a.title || 'Action')
                    const pr = typeof a === 'string' ? 'medium' : (a.priority || 'medium')
                    const bg = pr === 'high' ? (isLight ? 'bg-red-100' : 'bg-red-900/40') : pr === 'medium' ? (isLight ? 'bg-yellow-100' : 'bg-yellow-900/40') : (isLight ? 'bg-emerald-100' : 'bg-emerald-900/40')
                    const text = pr === 'high' ? (isLight ? 'text-red-800' : 'text-red-200') : pr === 'medium' ? (isLight ? 'text-yellow-800' : 'text-yellow-200') : (isLight ? 'text-emerald-800' : 'text-emerald-200')
                    const sub = typeof a === 'string' ? '' : (a.leadName ? a.leadName : '')
                    return (
                      <button
                        key={i}
                        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl ${bg} cursor-pointer`}
                        onClick={() => {
                          if (typeof a !== 'string' && a.leadId) {
                            handleLeadPreview(a.leadId)
                          } else {
                            setSelectedAction(a)
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${text} bg-current`}></span>
                          <div>
                            <div className={`text-sm font-medium ${text}`}>{title}</div>
                            {sub && <div className="text-xs opacity-70">{sub}</div>}
                          </div>
                        </div>
                        <span className="text-white bg-gray-400/60 rounded-full w-5 h-5 flex items-center justify-center">✓</span>
                      </button>
                    )
                  })}
                  {getActionsByTimeframe(actionsView).length === 0 && (
                    <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'} opacity-80`}>{t('No actions for selected range.')}</div>
                  )}
                </div>
              </div>

              {/* Notifications */}
              <div className={`mt-3 rounded-xl border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} shadow-sm`}>
                <div className={`px-4 py-2 border-b font-semibold text-sm ${isLight ? 'border-gray-200' : 'border-gray-700 text-gray-100'}`}>{t('Notifications')}</div>
                <div className="p-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>{t('Reminder: Meeting in 15 min.')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>{t('New Lead assigned')}: John Smith</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>{t('Update: Project status changed to In Progress')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    <span>{t('New message received')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Action Modal from calendar */}
        {showAddActionModal && (
          <AddActionModal
            isOpen={true}
            onClose={() => setShowAddActionModal(false)}
            onSave={handleSaveAction}
            lead={null}
          />
        )}

        {/* Action Details Modal */}
        {selectedAction && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedAction(null)} />
            <div className={`relative w-[92%] sm:w-[480px] rounded-2xl border shadow-xl ${
              isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-gray-800 border-gray-700 text-gray-100'
            }`}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="font-semibold text-sm">تفاصيل الأكشن</div>
                <button className={`px-2 py-1 rounded-md text-xs ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'}`} onClick={() => setSelectedAction(null)}>✕</button>
              </div>
              <div className="px-4 py-3 space-y-2 text-sm">
                <div className="font-medium">{typeof selectedAction === 'string' ? selectedAction : (selectedAction.title || 'Action')}</div>
                {typeof selectedAction !== 'string' && (
                  <>
                    {selectedAction.description && <div className="opacity-80">{selectedAction.description}</div>}
                    <div className="opacity-75">👤 {selectedAction.leadName || '—'} | 🧑‍💼 {selectedAction.assignedTo || '—'}</div>
                    {selectedAction.location && <div className="opacity-75">📍 {selectedAction.location}</div>}
                    {selectedAction.leadPhone && <div className="opacity-75">📞 {selectedAction.leadPhone}</div>}
                  </>
                )}
                <div className="flex items-center gap-2 pt-2">
                  {typeof selectedAction !== 'string' && selectedAction.leadId && (
                    <button className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => handleLeadPreview(selectedAction.leadId)}>معاينة العميل</button>
                  )}
                  {typeof selectedAction !== 'string' && selectedAction.leadPhone && (
                    <button className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => window.open(`tel:${selectedAction.leadPhone}`, '_self')}>اتصال</button>
                  )}
                  {typeof selectedAction !== 'string' && selectedAction.leadPhone && (
                    <button className="text-xs px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600" onClick={() => window.open(`https://wa.me/${selectedAction.leadPhone.replace('+', '')}`, '_blank')}>واتساب</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lead Details Modal */}
        <LeadDetailsModal
          lead={selectedLead}
          isOpen={showLeadDetails}
          onClose={() => setShowLeadDetails(false)}
          isLight={isLight}
        />
        </div>
    </div>
  )
}

// Lead Details Modal Component
function LeadDetailsModal({ lead, isOpen, onClose, isLight }) {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md mx-4 rounded-xl border shadow-2xl ${
        isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-gray-800 border-gray-700 text-gray-100'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">تفاصيل العميل</h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-md transition-colors ${
                isLight ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isLight ? 'bg-gray-200 text-gray-600' : 'bg-gray-700 text-gray-300'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">{lead.name}</h4>
                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  {lead.company || 'Individual Client'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-500">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-sm font-medium">الهاتف</span>
                </div>
                <p className="text-sm">{lead.phone}</p>
              </div>
              
              {lead.email && (
                <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-sm font-medium">البريد الإلكتروني</span>
                  </div>
                  <p className="text-sm">{lead.email}</p>
                </div>
              )}
              
              {lead.stage && (
                <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-purple-500">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">المرحلة</span>
                  </div>
                  <p className="text-sm">{lead.stage}</p>
                </div>
              )}
              
              {lead.source && (
                <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-orange-500">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">المصدر</span>
                  </div>
                  <p className="text-sm">{lead.source}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                اتصال
              </button>
              <button
                onClick={() => window.open(`https://wa.me/${lead.phone.replace('+', '')}`, '_blank')}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                واتساب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
