import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function CILSettingsModal({ isOpen, onClose, inline = false }) {
  const { t, i18n } = useTranslation()
  const isRTL = (i18n.language || '').startsWith('ar')

  const [active, setActive] = useState('general')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  // General Settings state
  const [cilName, setCilName] = useState('CIL Core')
  const [systemEmail, setSystemEmail] = useState('system@company.com')
  const [defaultSource, setDefaultSource] = useState('Website')
  const [currency, setCurrency] = useState('USD')
  const [workStart, setWorkStart] = useState('09:00')
  const [workEnd, setWorkEnd] = useState('18:00')
  const [autoSaveInterval, setAutoSaveInterval] = useState('10')
  const [apiEnabled, setApiEnabled] = useState(true)

  // Lead Assignment Rules
  const [assignMode, setAssignMode] = useState('Round Robin')
  const [leadLimit, setLeadLimit] = useState(15)
  const [reassignDelay, setReassignDelay] = useState(24)
  const [skipInactive, setSkipInactive] = useState(true)
  const [notifyReassign, setNotifyReassign] = useState(true)

  // Integrations
  const [apiKey, setApiKey] = useState('sk_live_1234567890')
  const [webhookUrl, setWebhookUrl] = useState('https://api.example.com/webhook')
  const [syncFreq, setSyncFreq] = useState('15 min')
  const [platforms, setPlatforms] = useState(() => ({
    facebook: { enabled: true, name: 'Facebook Leads' },
    google: { enabled: false, name: 'Google Ads' },
    zapier: { enabled: true, name: 'Zapier' },
  }))

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true)
  const [teamsNotif, setTeamsNotif] = useState(false)
  const [dailySummary, setDailySummary] = useState(true)
  const [errorAlerts, setErrorAlerts] = useState(true)
  const [errorThreshold, setErrorThreshold] = useState(5)
  const [notifyAdminFailedSync, setNotifyAdminFailedSync] = useState(true)
  const [showSampleEmail, setShowSampleEmail] = useState(false)

  // Security & Logs
  const [logFilters, setLogFilters] = useState({ start: '', end: '', action: 'All', user: 'All' })
  const [logs, setLogs] = useState([
    { date: '2025-11-12', user: 'Ibrahim Mohamed', action: 'API Regenerated', result: 'Success' },
    { date: '2025-11-11', user: 'Admin', action: 'Webhook Updated', result: 'Success' },
    { date: '2025-11-10', user: 'Admin', action: 'Assign Mode Changed', result: 'Success' },
  ])

  useEffect(() => {
    if (!dirty) return
    setSaving(true)
    const id = setTimeout(() => { setSaving(false); setDirty(false) }, 1200)
    return () => clearTimeout(id)
  }, [dirty])

  const markDirty = () => setDirty(true)

  const avgLeadsPerRep = useMemo(() => Math.round(Number(leadLimit) * 0.8), [leadLimit])

  const regenerateKey = () => {
    setApiKey(`sk_live_${Math.random().toString(36).slice(2, 10)}${Date.now().toString().slice(-4)}`)
    markDirty()
  }

  const testConnection = (key) => {
    const ok = Math.random() > 0.2
    alert(`${platforms[key].name}: ${ok ? 'Connection OK' : 'Failed to connect'}`)
  }

  const exportLogs = (type) => {
    alert(`Exporting logs as ${type}...`)
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 1200)
  }

  if (!inline && !isOpen) return null

  const panelTone = 'glass-panel rounded-2xl w-full h-full flex flex-col overflow-hidden shadow-2xl'
  const headerBorder = 'border-b border-white/20 dark:border-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.08)]'

  const Tab = ({ id, label }) => (
    <button
      className={`relative px-3 md:px-4 py-2 text-sm md:text-[15px] whitespace-nowrap transition-all ${
        active===id ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300'
      }`}
      onClick={() => setActive(id)}
    >
      <span className={`${active===id ? 'font-semibold' : ''}`}>{label}</span>
      {active===id && (
        <span className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400" />
      )}
    </button>
  )

  const PanelInner = () => (
    <div className={panelTone}>
      {/* Header */}
      <div className={`px-6 py-4 ${headerBorder}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              {t('CIL Settings')}
            </h2>
            <span className="text-sm text-[var(--muted-text)]">
              {t('Manage and customize system integration and lead assignment settings.')}
            </span>
            {saving && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-xs animate-pulse">
                {t('Saving...')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.6)] hover:bg-blue-700">
              {t('Save Changes')}
            </button>
            {!inline && (
              <button onClick={onClose} className="px-3 py-2 rounded-lg border bg-white/60 dark:bg-gray-800/60">
                {t('Close')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 md:px-6 pt-3 pb-2 shadow-[0_10px_10px_-10px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <Tab id="general" label={t('General Settings')} />
          <Tab id="rules" label={t('Lead Assignment Rules')} />
          <Tab id="integrations" label={t('Integration Setup')} />
          <Tab id="notifications" label={t('Notifications')} />
          <Tab id="security" label={t('Security & Logs')} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-5 overflow-y-auto space-y-5 transition-all">
            {active==='general' && (
              <div className="space-y-5 animate-[fadeIn_200ms_ease]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)] flex items-center gap-1">{t('CIL Name')} <span title={t('Name of your CIL system')}>ℹ️</span></label>
                    <input className="input-soft w-full" value={cilName} onChange={e=>{setCilName(e.target.value);markDirty()}} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)] flex items-center gap-1">{t('System Email')} <span title={t('Email used for system notifications')}>ℹ️</span></label>
                    <input className="input-soft w-full" type="email" value={systemEmail} onChange={e=>{setSystemEmail(e.target.value);markDirty()}} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)] flex items-center gap-1">{t('Default Lead Source')} <span title={t('Default source for incoming leads')}>ℹ️</span></label>
                    <select className="input-soft w-full" value={defaultSource} onChange={e=>{setDefaultSource(e.target.value);markDirty()}}>
                      {['Website','Facebook','Google Ads','Manual'].map(s=> <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)] flex items-center gap-1">{t('Default Currency')} <span title={t('Currency used in reports and contracts')}>ℹ️</span></label>
                    <select className="input-soft w-full" value={currency} onChange={e=>{setCurrency(e.target.value);markDirty()}}>
                      {['USD','EUR','GBP','EGP','SAR','AED'].map(c=> <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)] flex items-center gap-1">{t('Working Hours (Start)')} <span title={t('Start time of workday')}>ℹ️</span></label>
                    <input type="time" className="input-soft w-full" value={workStart} onChange={e=>{setWorkStart(e.target.value);markDirty()}} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)] flex items-center gap-1">{t('Working Hours (End)')} <span title={t('End time of workday')}>ℹ️</span></label>
                    <input type="time" className="input-soft w-full" value={workEnd} onChange={e=>{setWorkEnd(e.target.value);markDirty()}} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)] flex items-center gap-1">{t('Auto-Save Interval')} <span title={t('Frequency to auto-save settings')}>ℹ️</span></label>
                    <select className="input-soft w-full" value={autoSaveInterval} onChange={e=>{setAutoSaveInterval(e.target.value);markDirty()}}>
                      {[5,10,30].map(m=> <option key={m} value={String(m)}>{m} min</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)] flex items-center gap-1">{t('Enable CIL API')} <span title={t('Enable/disable external API access')}>ℹ️</span></label>
                    <div className="flex items-center gap-3">
                      <button onClick={()=>{setApiEnabled(v=>!v);markDirty()}} className={`px-3 py-2 rounded-lg border ${apiEnabled?'bg-green-500/20 text-green-700 border-green-400':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}>{apiEnabled? t('Enabled') : t('Disabled')}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active==='rules' && (
              <div className="space-y-5 animate-[fadeIn_200ms_ease]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Assignment Mode')}</label>
                    <select className="input-soft w-full" value={assignMode} onChange={e=>{setAssignMode(e.target.value);markDirty()}}>
                      {['Round Robin','Priority Based','Manual'].map(m=> <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Lead Limit per Sales Rep')}</label>
                    <input type="number" className="input-soft w-full" value={leadLimit} onChange={e=>{setLeadLimit(e.target.value);markDirty()}} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Reassignment Delay (hours)')}</label>
                    <input type="number" className="input-soft w-full" value={reassignDelay} onChange={e=>{setReassignDelay(e.target.value);markDirty()}} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Skip inactive users')}</label>
                    <div>
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={skipInactive} onChange={e=>{setSkipInactive(e.target.checked);markDirty()}} />
                        <span className="text-sm">{t('Enable')}</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Notification when reassigned')}</label>
                    <button onClick={()=>{setNotifyReassign(v=>!v);markDirty()}} className={`px-3 py-2 rounded-lg border ${notifyReassign?'bg-blue-500/20 text-blue-700 border-blue-400':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}>{notifyReassign? t('Enabled') : t('Disabled')}</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border bg-white/60 dark:bg-gray-800/60 p-4">
                    <div className="text-sm text-[var(--muted-text)] mb-1">{t('Assignment Preview')}</div>
                    <div className="text-2xl font-semibold">{t('Avg. leads per rep')}: {avgLeadsPerRep}</div>
                  </div>
                </div>
              </div>
            )}

            {active==='integrations' && (
              <div className="space-y-5 animate-[fadeIn_200ms_ease]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('API Key')}</label>
                    <div className="flex items-center gap-2">
                      <input className="input-soft w-full" value={apiKey} onChange={e=>{setApiKey(e.target.value);markDirty()}} />
                      <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white" onClick={regenerateKey}>{t('Regenerate')}</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Webhook URL')}</label>
                    <input className="input-soft w-full" value={webhookUrl} onChange={e=>{setWebhookUrl(e.target.value);markDirty()}} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Sync Frequency')}</label>
                    <select className="input-soft w-full" value={syncFreq} onChange={e=>{setSyncFreq(e.target.value);markDirty()}}>
                      {['5 min','15 min','30 min','60 min'].map(s=> <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm text-[var(--muted-text)]">{t('Connected Platforms')}</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(platforms).map(([key, p]) => (
                      <div key={key} className="rounded-xl border bg-white/60 dark:bg-gray-800/60 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{p.name.includes('Facebook') ? '🟦' : p.name.includes('Google') ? '🟥' : '⚙️'}</span>
                            <span className="font-medium">{p.name}</span>
                          </div>
                          <button onClick={()=>{setPlatforms(prev=>({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));markDirty()}} className={`px-3 py-1 rounded-lg border ${p.enabled?'bg-green-500/20 text-green-700 border-green-400':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}>{p.enabled? t('Enabled') : t('Disabled')}</button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-2 rounded-lg bg-blue-600 text-white" onClick={()=>testConnection(key)}>{t('Test Connection')}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {active==='notifications' && (
              <div className="space-y-5 animate-[fadeIn_200ms_ease]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Email Notifications')}</label>
                    <button onClick={()=>{setEmailNotif(v=>!v);markDirty()}} className={`px-3 py-2 rounded-lg border ${emailNotif?'bg-blue-500/20 text-blue-700 border-blue-400':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}>{emailNotif? t('Enabled') : t('Disabled')}</button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Slack / Teams Integration')}</label>
                    <button onClick={()=>{setTeamsNotif(v=>!v);markDirty()}} className={`px-3 py-2 rounded-lg border ${teamsNotif?'bg-blue-500/20 text-blue-700 border-blue-400':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}>{teamsNotif? t('Enabled') : t('Disabled')}</button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Daily Summary Report')}</label>
                    <button onClick={()=>{setDailySummary(v=>!v);markDirty()}} className={`px-3 py-2 rounded-lg border ${dailySummary?'bg-blue-500/20 text-blue-700 border-blue-400':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}>{dailySummary? t('Enabled') : t('Disabled')}</button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Error Alerts threshold')}</label>
                    <input type="number" className="input-soft w-full" value={errorThreshold} onChange={e=>{setErrorThreshold(e.target.value);markDirty()}} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Notify Admin on failed sync')}</label>
                    <button onClick={()=>{setNotifyAdminFailedSync(v=>!v);markDirty()}} className={`px-3 py-2 rounded-lg border ${notifyAdminFailedSync?'bg-blue-500/20 text-blue-700 border-blue-400':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}>{notifyAdminFailedSync? t('Enabled') : t('Disabled')}</button>
                  </div>
                </div>

                <div className="rounded-xl border bg-white/60 dark:bg-gray-800/60 p-4 space-y-2">
                  <button className="text-sm font-medium" onClick={()=>setShowSampleEmail(v=>!v)}>
                    {t('Preview sample notification email')}
                  </button>
                  {showSampleEmail && (
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                      <div className="font-semibold mb-1">{t('Subject')}: {t('Daily CIL Summary')}</div>
                      <p>{t('Hello Admin, here is your daily summary including sync stats and errors.')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {active==='security' && (
              <div className="space-y-5 animate-[fadeIn_200ms_ease]">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Start Date')}</label>
                    <input type="date" className="input-soft w-full" value={logFilters.start} onChange={e=>{setLogFilters(prev=>({ ...prev, start: e.target.value }));markDirty()}} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('End Date')}</label>
                    <input type="date" className="input-soft w-full" value={logFilters.end} onChange={e=>{setLogFilters(prev=>({ ...prev, end: e.target.value }));markDirty()}} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('Action type')}</label>
                    <select className="input-soft w-full" value={logFilters.action} onChange={e=>{setLogFilters(prev=>({ ...prev, action: e.target.value }));markDirty()}}>
                      {['All','API Regenerated','Webhook Updated','Assign Mode Changed'].map(a=> <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted-text)]">{t('User')}</label>
                    <select className="input-soft w-full" value={logFilters.user} onChange={e=>{setLogFilters(prev=>({ ...prev, user: e.target.value }));markDirty()}}>
                      {['All','Admin','Ibrahim Mohamed'].map(u=> <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                {/* spacing under filters */}
                <div className="h-3" />

                {/* Export buttons */}
                <div className="flex items-center justify-end gap-2">
                  <button className="px-3 py-2 rounded-lg border bg-white/60 dark:bg-gray-800/60" onClick={()=>exportLogs('Excel')}>{t('Export to Excel')}</button>
                  <button className="px-3 py-2 rounded-lg border bg-white/60 dark:bg-gray-800/60" onClick={()=>exportLogs('PDF')}>{t('Export to PDF')}</button>
                </div>

                {/* Empty row above table */}
                <div className="h-2" />

                {/* Logs table */}
                <div className="rounded-xl border bg-white/60 dark:bg-gray-800/60 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="px-4 py-3">{t('Date')}</th>
                        <th className="px-4 py-3">{t('User')}</th>
                        <th className="px-4 py-3">{t('Action')}</th>
                        <th className="px-4 py-3">{t('Result')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* empty top row */}
                      <tr><td className="px-4 py-2" colSpan={4}></td></tr>
                      {logs.map((l, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2">{l.date}</td>
                          <td className="px-4 py-2">{l.user}</td>
                          <td className="px-4 py-2">{l.action}</td>
                          <td className="px-4 py-2">{l.result === 'Success' ? '✅ Success' : l.result}</td>
                        </tr>
                      ))}
                      {/* empty bottom row */}
                      <tr><td className="px-4 py-2" colSpan={4}></td></tr>
                    </tbody>
                  </table>
                </div>

                {/* spacing below table */}
                <div className="h-2" />
              </div>
            )}
      </div>
    </div>
  )

  return inline ? (
    <div className="w-full">
      <PanelInner />
    </div>
  ) : (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-lg" onClick={onClose} />
      <div className="relative z-[1001] w-[94vw] max-w-[1200px] h-[88vh]">
        <PanelInner />
      </div>
    </div>
  )
}