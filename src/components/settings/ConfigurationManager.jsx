import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'system.configuration'

const MODULES = [
  { key: 'eoi', label: 'EOI', route: '/settings/eoi' },
  { key: 'cil', label: 'CIL', route: '/settings/cil' },
  { key: 'scripting', label: 'Scripting', route: '/settings/scripting' },
  { key: 'reservations', label: 'Reservation', route: '/settings/reservations' },
  { key: 'contracts', label: 'Contracts', route: '/settings/contracts' },
  { key: 'buyerRequestReset', label: 'Buyer Request Reset', route: '/settings/buyer-request-reset' },
  { key: 'matching', label: 'Matching', route: '/settings/matching' },
  { key: 'rent', label: 'Rent', route: '/settings/rent' },
]

function defaultConfiguration() {
  const enabled = MODULES.reduce((acc, m) => { acc[m.key] = true; return acc }, {})
  const perModuleSettings = MODULES.reduce((acc, m) => { acc[m.key] = {}; return acc }, {})
  const perModuleWorkflow = MODULES.reduce((acc, m) => { acc[m.key] = { autoUpdateStatus: true, trackHistory: true }; return acc }, {})
  return {
    general: {
      maintenance: false,
      defaultCurrency: 'USD',
      timezone: 'UTC',
      language: 'en',
    },
    modules: {
      enabled,
      settings: perModuleSettings,
    },
    notifications: {
      system: {
        notifyAdminOnErrors: true,
        notifyOnModuleChange: true,
        methods: { email: true, sms: false, inApp: true },
      },
    },
    workflow: {
      rules: perModuleWorkflow,
    },
  }
}

async function fetchConfiguration() {
  try {
    const res = await fetch('/api/configuration')
    if (res.ok) return await res.json()
  } catch {}
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (raw) return JSON.parse(raw)
  } catch {}
  return defaultConfiguration()
}

async function persistConfiguration(settings) {
  try {
    const res = await fetch('/api/configuration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (res.ok) return true
  } catch {}
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    return true
  } catch {}
  return false
}

async function resetConfiguration() {
  try {
    const res = await fetch('/api/configuration/reset', { method: 'POST' })
    if (res.ok) return await res.json()
  } catch {}
  const def = defaultConfiguration()
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(def))
  } catch {}
  return def
}

async function fetchModuleSettings(module) {
  try {
    const res = await fetch(`/api/configuration/module/${module}`)
    if (res.ok) return await res.json()
  } catch {}
  // Fallback from system configuration storage
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed?.modules?.settings?.[module] ?? {}
    }
  } catch {}
  return {}
}

async function saveModuleSettings(module, payload) {
  try {
    const res = await fetch(`/api/configuration/module/${module}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) return true
  } catch {}
  // Fallback: write into system configuration store
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : defaultConfiguration()
      const next = { ...parsed, modules: { ...parsed.modules, settings: { ...parsed.modules.settings, [module]: payload } } }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return true
    }
  } catch {}
  return false
}

export default function ConfigurationManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [settings, setSettings] = useState(defaultConfiguration())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [tab, setTab] = useState('General')
  const [activeModule, setActiveModule] = useState(MODULES[0].key)
  const [moduleEditor, setModuleEditor] = useState('{}')

  useEffect(() => {
    let mounted = true
    fetchConfiguration().then(conf => {
      if (!mounted) return
      setSettings(conf)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const update = (path, value) => {
    setSettings(prev => {
      const next = { ...prev }
      const segs = path.split('.')
      let ref = next
      for (let i = 0; i < segs.length - 1; i++) {
        ref[segs[i]] = { ...ref[segs[i]] }
        ref = ref[segs[i]]
      }
      ref[segs[segs.length - 1]] = value
      return next
    })
  }

  const saveAll = async () => {
    setSaving(true)
    const ok = await persistConfiguration(settings)
    setSaving(false)
    setToast({ type: ok ? 'success' : 'error', message: ok ? t('Settings saved') : t('Failed to save settings') })
    setTimeout(() => setToast(null), 2000)
  }

  const resetAll = async () => {
    setSaving(true)
    const conf = await resetConfiguration()
    setSettings(conf)
    setSaving(false)
    setToast({ type: 'info', message: t('Settings reset to default') })
    setTimeout(() => setToast(null), 2000)
  }

  const loadActiveModule = async (module) => {
    const data = await fetchModuleSettings(module)
    try {
      setModuleEditor(JSON.stringify(data, null, 2))
    } catch {
      setModuleEditor('{}')
    }
    // Also reflect into system settings state for visibility
    update(`modules.settings.${module}`, data)
  }

  useEffect(() => {
    if (!loading && activeModule) {
      loadActiveModule(activeModule)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule, loading])

  const saveActiveModule = async () => {
    let payload = {}
    try {
      payload = JSON.parse(moduleEditor)
    } catch {
      setToast({ type: 'error', message: t('Invalid JSON for module settings') })
      setTimeout(() => setToast(null), 2000)
      return
    }
    const ok = await saveModuleSettings(activeModule, payload)
    setToast({ type: ok ? 'success' : 'error', message: ok ? t('Module settings saved') : t('Failed to save module settings') })
    setTimeout(() => setToast(null), 2000)
    if (ok) update(`modules.settings.${activeModule}`, payload)
  }

  const tabs = ['General', 'Modules', 'Notifications & Workflow']

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
        <div className="animate-pulse h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(name => (
          <button
            key={name}
            onClick={() => setTab(name)}
            className={`px-3 py-1 rounded border ${tab === name ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-[var(--content-text)] border-gray-300 dark:border-gray-700'}`}
          >
            {t(name)}
          </button>
        ))}
        <div className="flex-1"></div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={saveAll} disabled={saving} className="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-50">
            {saving ? t('Saving...') : t('Save All Changes')}
          </button>
          <button onClick={resetAll} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">
            {t('Reset All Modules to Default')}
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === 'General' && (
        <div className="space-y-6">
          <div className="rounded border border-gray-200 dark:border-gray-700 p-3">
            <div className="font-semibold mb-3">{t('General System Settings')}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.general.maintenance} onChange={e => update('general.maintenance', e.target.checked)} />
                <span className="font-medium">{t('System Maintenance Mode')}</span>
              </label>
              <div>
                <div className="font-medium mb-1">{t('Default Currency')}</div>
                <select className="w-full border rounded p-1" value={settings.general.defaultCurrency} onChange={e => update('general.defaultCurrency', e.target.value)}>
                  {['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div className="font-medium mb-1">{t('Timezone')}</div>
                <select className="w-full border rounded p-1" value={settings.general.timezone} onChange={e => update('general.timezone', e.target.value)}>
                  {['UTC', 'Asia/Riyadh', 'Africa/Cairo', 'Asia/Dubai', 'Europe/London'].map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <div className="font-medium mb-1">{t('Language')}</div>
                <select className="w-full border rounded p-1" value={settings.general.language} onChange={e => update('general.language', e.target.value)}>
                  {['en', 'ar'].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded border border-gray-200 dark:border-gray-700 p-3">
            <div className="font-semibold mb-3">{t('Enable / Disable Modules')}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {MODULES.map(m => (
                <label key={m.key} className="flex items-center gap-2">
                  <input type="checkbox" checked={settings.modules.enabled[m.key]} onChange={e => update(`modules.enabled.${m.key}`, e.target.checked)} />
                  <span className="font-medium">{t(m.label)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Modules' && (
        <div className="space-y-4">
          {/* Module tabs */}
          <div className="flex flex-wrap gap-2">
            {MODULES.map(m => (
              <button
                key={m.key}
                onClick={() => setActiveModule(m.key)}
                className={`px-3 py-1 rounded border ${activeModule === m.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-[var(--content-text)] border-gray-300 dark:border-gray-700'}`}
              >
                {t(m.label)}
              </button>
            ))}
          </div>

          <div className="rounded border border-gray-200 dark:border-gray-700 p-3 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{t('Module Settings')}</div>
              <a href={`#/` + MODULES.find(m => m.key === activeModule)?.route?.replace(/^\//, '')} className="text-blue-600 hover:underline">
                {t('Open module page')}
              </a>
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={settings.modules.enabled[activeModule]} onChange={e => update(`modules.enabled.${activeModule}`, e.target.checked)} />
              <span className="font-medium">{t('Enabled')}</span>
            </label>

            <div>
              <div className="font-medium mb-1">{t('Edit settings (JSON)')}</div>
              <textarea className="w-full border rounded p-2 h-48 font-mono text-sm" value={moduleEditor} onChange={e => setModuleEditor(e.target.value)} />
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => loadActiveModule(activeModule)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">{t('Load')}</button>
                <button onClick={saveActiveModule} className="px-3 py-1 rounded bg-blue-600 text-white">{t('Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Notifications & Workflow' && (
        <div className="space-y-6">
          <div className="rounded border border-gray-200 dark:border-gray-700 p-3">
            <div className="font-semibold mb-3">{t('Configure system-wide notifications')}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notifications.system.notifyAdminOnErrors} onChange={e => update('notifications.system.notifyAdminOnErrors', e.target.checked)} />
                <span className="font-medium">{t('Notify admin on errors')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notifications.system.notifyOnModuleChange} onChange={e => update('notifications.system.notifyOnModuleChange', e.target.checked)} />
                <span className="font-medium">{t('Notify on module settings changes')}</span>
              </label>
              <div className="col-span-1 md:col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={settings.notifications.system.methods.email} onChange={e => update('notifications.system.methods.email', e.target.checked)} />
                  <span>{t('Email')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={settings.notifications.system.methods.sms} onChange={e => update('notifications.system.methods.sms', e.target.checked)} />
                  <span>{t('SMS')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={settings.notifications.system.methods.inApp} onChange={e => update('notifications.system.methods.inApp', e.target.checked)} />
                  <span>{t('In-App')}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded border border-gray-200 dark:border-gray-700 p-3">
            <div className="font-semibold mb-3">{t('Set workflow rules per module')}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {MODULES.map(m => (
                <div key={m.key} className="border rounded p-2 border-gray-200 dark:border-gray-700">
                  <div className="font-medium mb-2">{t(m.label)}</div>
                  <label className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={settings.workflow.rules[m.key]?.autoUpdateStatus}
                      onChange={e => update(`workflow.rules.${m.key}.autoUpdateStatus`, e.target.checked)}
                    />
                    <span>{t('Auto-Update Status')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.workflow.rules[m.key]?.trackHistory}
                      onChange={e => update(`workflow.rules.${m.key}.trackHistory`, e.target.checked)}
                    />
                    <span>{t('Track History')}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed ${isRTL ? 'left-4' : 'right-4'} bottom-4 px-3 py-2 rounded shadow text-white ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'success' ? 'bg-green-600' : 'bg-gray-700'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}