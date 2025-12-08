import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const DEFAULTS = {
  theme: 'auto', // light | dark | auto
  language: 'ar',
  direction: 'auto', // ltr | rtl | auto
  timezone: 'Africa/Cairo',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  currency: 'EGP',
  numberFormat: '1,234.56', // or 1.234,56
  units: 'sqm', // sqm | sqft
  density: 'comfortable', // compact | comfortable
  animations: true,
  sidebarExpanded: true,
  notificationsSound: true,
  chartsStyle: 'line', // line | bar
  chartsRounded: true,
  chartsStacked: false,
}

const SystemPreferences = () => {
  const { t, i18n } = useTranslation()
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('systemPrefs') : null
      if (saved) return { ...DEFAULTS, ...JSON.parse(saved) }
    } catch {}
    return DEFAULTS
  })

  const setPref = (k, v) => setPrefs(prev => ({ ...prev, [k]: v }))

  const applyTheme = (theme) => {
    const root = document.documentElement
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.classList.toggle('dark', !!isDark)
  }

  const applyDirection = (dir, lang) => {
    const root = document.documentElement
    const effective = dir === 'auto' ? (lang === 'ar' ? 'rtl' : 'ltr') : dir
    root.setAttribute('dir', effective)
  }

  useEffect(() => {
    // Apply language, theme, and direction immediately on change
    try {
      if (prefs.language && i18n?.changeLanguage) i18n.changeLanguage(prefs.language)
    } catch {}
    applyTheme(prefs.theme)
    applyDirection(prefs.direction, prefs.language)
    // Optional density class (for future CSS hooks)
    const root = document.documentElement
    root.classList.remove('density-compact', 'density-comfortable')
    root.classList.add(prefs.density === 'compact' ? 'density-compact' : 'density-comfortable')
  }, [prefs.theme, prefs.direction, prefs.language, prefs.density])

  const save = () => {
    try {
      window.localStorage.setItem('systemPrefs', JSON.stringify(prefs))
    } catch {}
  }

  const reset = () => {
    setPrefs(DEFAULTS)
    try { window.localStorage.removeItem('systemPrefs') } catch {}
  }

  const sectionTitle = (label) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
      <div className="text-sm font-semibold text-[var(--content-text)]">{label}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">{t('System Preferences')}</h3>

        {/* Appearance */}
        {sectionTitle(t('Appearance'))}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Theme')}</label>
            <select value={prefs.theme} onChange={e=>setPref('theme', e.target.value)} className="input-soft w-full">
              <option value="auto">{t('Auto')}</option>
              <option value="light">{t('Light')}</option>
              <option value="dark">{t('Dark')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Density')}</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={()=>setPref('density','compact')} className={`px-3 py-2 rounded-lg border ${prefs.density==='compact'?'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700':'bg-white/80 dark:bg-gray-800/70'}`}>{t('Compact')}</button>
              <button type="button" onClick={()=>setPref('density','comfortable')} className={`px-3 py-2 rounded-lg border ${prefs.density==='comfortable'?'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700':'bg-white/80 dark:bg-gray-800/70'}`}>{t('Comfortable')}</button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Animations')}</label>
            <label className="inline-flex items-center gap-3">
              <input type="checkbox" className="sr-only" checked={prefs.animations} onChange={e=>setPref('animations', e.target.checked)} />
              <span className={`w-10 h-5 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 ${prefs.animations ? 'justify-end' : 'justify-start'}`}>
                <span className={`w-4 h-4 rounded-full bg-white transition ${prefs.animations ? 'shadow-[0_0_0_2px_rgba(59,130,246,0.6)]' : ''}`} />
              </span>
              <span className="text-sm">{prefs.animations ? t('Enabled') : t('Disabled')}</span>
            </label>
          </div>
        </div>

        {/* Language & Region */}
        <div className="h-4" />
        {sectionTitle(t('Language & Region'))}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Language')}</label>
            <select value={prefs.language} onChange={e=>setPref('language', e.target.value)} className="input-soft w-full">
              <option value="ar">{t('Arabic')}</option>
              <option value="en">{t('English')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Layout Direction')}</label>
            <select value={prefs.direction} onChange={e=>setPref('direction', e.target.value)} className="input-soft w-full">
              <option value="auto">{t('Auto')}</option>
              <option value="ltr">LTR</option>
              <option value="rtl">RTL</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Time Zone')}</label>
            <select value={prefs.timezone} onChange={e=>setPref('timezone', e.target.value)} className="input-soft w-full">
              <option value="Africa/Cairo">Africa/Cairo</option>
              <option value="Asia/Riyadh">Asia/Riyadh</option>
              <option value="Europe/London">Europe/London</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        {/* Formatting */}
        <div className="h-4" />
        {sectionTitle(t('Formatting'))}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Date Format')}</label>
            <select value={prefs.dateFormat} onChange={e=>setPref('dateFormat', e.target.value)} className="input-soft w-full">
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Time Format')}</label>
            <select value={prefs.timeFormat} onChange={e=>setPref('timeFormat', e.target.value)} className="input-soft w-full">
              <option value="24h">24 {t('Hours')}</option>
              <option value="12h">12 {t('Hours')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Currency')}</label>
            <select value={prefs.currency} onChange={e=>setPref('currency', e.target.value)} className="input-soft w-full">
              <option value="EGP">EGP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="SAR">SAR</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Number Format')}</label>
            <select value={prefs.numberFormat} onChange={e=>setPref('numberFormat', e.target.value)} className="input-soft w-full">
              <option value="1,234.56">1,234.56</option>
              <option value="1.234,56">1.234,56</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Units')}</label>
            <select value={prefs.units} onChange={e=>setPref('units', e.target.value)} className="input-soft w-full">
              <option value="sqm">m²</option>
              <option value="sqft">ft²</option>
            </select>
          </div>
        </div>

        {/* Interface */}
        <div className="h-4" />
        {sectionTitle(t('Interface'))}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Sidebar Expanded on Start')}</label>
            <label className="inline-flex items-center gap-3">
              <input type="checkbox" className="sr-only" checked={prefs.sidebarExpanded} onChange={e=>setPref('sidebarExpanded', e.target.checked)} />
              <span className={`w-10 h-5 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 ${prefs.sidebarExpanded ? 'justify-end' : 'justify-start'}`}>
                <span className={`w-4 h-4 rounded-full bg-white transition ${prefs.sidebarExpanded ? 'shadow-[0_0_0_2px_rgba(59,130,246,0.6)]' : ''}`} />
              </span>
              <span className="text-sm">{prefs.sidebarExpanded ? t('Enabled') : t('Disabled')}</span>
            </label>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Notification Sound')}</label>
            <label className="inline-flex items-center gap-3">
              <input type="checkbox" className="sr-only" checked={prefs.notificationsSound} onChange={e=>setPref('notificationsSound', e.target.checked)} />
              <span className={`w-10 h-5 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 ${prefs.notificationsSound ? 'justify-end' : 'justify-start'}`}>
                <span className={`w-4 h-4 rounded-full bg-white transition ${prefs.notificationsSound ? 'shadow-[0_0_0_2px_rgba(59,130,246,0.6)]' : ''}`} />
              </span>
              <span className="text-sm">{prefs.notificationsSound ? t('Enabled') : t('Disabled')}</span>
            </label>
          </div>
        </div>

        {/* Charts */}
        <div className="h-4" />
        {sectionTitle(t('Charts'))}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Default Chart Type')}</label>
            <select value={prefs.chartsStyle} onChange={e=>setPref('chartsStyle', e.target.value)} className="input-soft w-full">
              <option value="line">{t('Line')}</option>
              <option value="bar">{t('Bar')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Rounded Corners')}</label>
            <label className="inline-flex items-center gap-3">
              <input type="checkbox" className="sr-only" checked={prefs.chartsRounded} onChange={e=>setPref('chartsRounded', e.target.checked)} />
              <span className={`w-10 h-5 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 ${prefs.chartsRounded ? 'justify-end' : 'justify-start'}`}>
                <span className={`w-4 h-4 rounded-full bg-white transition ${prefs.chartsRounded ? 'shadow-[0_0_0_2px_rgba(59,130,246,0.6)]' : ''}`} />
              </span>
              <span className="text-sm">{prefs.chartsRounded ? t('Enabled') : t('Disabled')}</span>
            </label>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--muted-text)]">{t('Stacked Bars')}</label>
            <label className="inline-flex items-center gap-3">
              <input type="checkbox" className="sr-only" checked={prefs.chartsStacked} onChange={e=>setPref('chartsStacked', e.target.checked)} />
              <span className={`w-10 h-5 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 ${prefs.chartsStacked ? 'justify-end' : 'justify-start'}`}>
                <span className={`w-4 h-4 rounded-full bg-white transition ${prefs.chartsStacked ? 'shadow-[0_0_0_2px_rgba(59,130,246,0.6)]' : ''}`} />
              </span>
              <span className="text-sm">{prefs.chartsStacked ? t('Enabled') : t('Disabled')}</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button className="btn btn-primary" onClick={save}>{t('Save Preferences')}</button>
          <button className="btn btn-soft" onClick={reset}>{t('Reset to Defaults')}</button>
        </div>
      </div>
    </div>
  )
}

export default SystemPreferences