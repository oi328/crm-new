import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-t-lg transition-all duration-300 whitespace-nowrap border-b-2 ${
      active
        ? 'border-blue-500 text-blue-600 font-medium bg-white/60 dark:bg-gray-800/60 shadow-sm'
        : 'border-transparent text-gray-700 dark:text-gray-200 hover:text-blue-600 hover:bg-white/40 dark:hover:bg-gray-800/40'
    }`}
  >
    {children}
  </button>
)

export default function ProfileSettingsPanel() {
  const { t, i18n } = useTranslation()
  const [active, setActive] = useState('personal')
  const [saving, setSaving] = useState(false)

  // Initial values
  const initial = {
    fullName: 'Ibrahim Mohamed',
    jobTitle: 'Sales Manager',
    department: 'Sales',
    email: 'ibrahim@example.com',
    phone: '+2010XXXXXXX',
    lang: i18n.language.startsWith('ar') ? 'Arabic' : 'English',
    tz: 'Africa/Cairo',
    theme: 'Dark',
    notifEmail: true,
    notifApp: true,
    notifMonthly: false,
    notifNewDevice: true,
  }

  const [fullName, setFullName] = useState(initial.fullName)
  const [jobTitle, setJobTitle] = useState(initial.jobTitle)
  const [department, setDepartment] = useState(initial.department)
  const [email, setEmail] = useState(initial.email)
  const [phone, setPhone] = useState(initial.phone)
  const [avatar, setAvatar] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')

  const [curPwd, setCurPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurPwd, setShowCurPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  const [notifEmail, setNotifEmail] = useState(initial.notifEmail)
  const [notifApp, setNotifApp] = useState(initial.notifApp)
  const [notifMonthly, setNotifMonthly] = useState(initial.notifMonthly)
  const [notifNewDevice, setNotifNewDevice] = useState(initial.notifNewDevice)

  const [lang, setLang] = useState(initial.lang)
  const [tz, setTz] = useState(initial.tz)
  const [theme, setTheme] = useState(initial.theme)

  const [logFilterStart, setLogFilterStart] = useState('')
  const [logFilterEnd, setLogFilterEnd] = useState('')
  const [logDevice, setLogDevice] = useState('All')

  const pwdStrength = useMemo(() => {
    let score = 0
    if (newPwd.length >= 8) score++
    if (/[A-Z]/.test(newPwd)) score++
    if (/[a-z]/.test(newPwd)) score++
    if (/\d/.test(newPwd)) score++
    if (/[^A-Za-z0-9]/.test(newPwd)) score++
    return score
  }, [newPwd])

  const logs = useMemo(() => ([
    { date: '2025-11-12', action: 'Login', device: 'Chrome (Windows)', location: 'Cairo, Egypt' },
    { date: '2025-11-11', action: 'Password Change', device: 'Edge (Windows)', location: 'Giza, Egypt' },
    { date: '2025-11-09', action: 'Login', device: 'Safari (iOS)', location: 'Alexandria, Egypt' },
  ]), [])

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const okDevice = logDevice === 'All' || (l.device || '').toLowerCase().includes(logDevice.toLowerCase())
      const okStart = !logFilterStart || l.date >= logFilterStart
      const okEnd = !logFilterEnd || l.date <= logFilterEnd
      return okDevice && okStart && okEnd
    })
  }, [logs, logDevice, logFilterStart, logFilterEnd])

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredLogs)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'SecurityLog')
    XLSX.writeFile(wb, 'security_log.xlsx')
  }
  const exportPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4')
    doc.setFontSize(14)
    doc.text('Security Log', 40, 40)
    const head = [['Date','Action','Device','Location']]
    const body = filteredLogs.map(l => [l.date, l.action, l.device, l.location])
    doc.autoTable({ head, body, startY: 60 })
    doc.save('security_log.pdf')
  }

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatar(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result || '')
    reader.readAsDataURL(file)
  }

  const saveChanges = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
    }, 900)
  }

  const resetChanges = () => {
    setFullName(initial.fullName)
    setJobTitle(initial.jobTitle)
    setDepartment(initial.department)
    setEmail(initial.email)
    setPhone(initial.phone)
    setAvatar('')
    setAvatarPreview('')
    setCurPwd('')
    setNewPwd('')
    setConfirmPwd('')
    setShowCurPwd(false)
    setShowNewPwd(false)
    setShowConfirmPwd(false)
    setNotifEmail(initial.notifEmail)
    setNotifApp(initial.notifApp)
    setNotifMonthly(initial.notifMonthly)
    setNotifNewDevice(initial.notifNewDevice)
    setLang(initial.lang)
    setTz(initial.tz)
    setTheme(initial.theme)
    setLogFilterStart('')
    setLogFilterEnd('')
    setLogDevice('All')
    setActive('personal')
  }

  return (
    <div className="rounded-2xl glass-panel w-full overflow-hidden shadow-2xl">

      {/* Tabs */}
      <div className="px-3 sm:px-4 pt-2 sm:pt-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <TabButton active={active==='personal'} onClick={() => setActive('personal')}>{t('Personal Info')}</TabButton>
          <TabButton active={active==='account'} onClick={() => setActive('account')}>{t('Account & Password')}</TabButton>
          <TabButton active={active==='notifications'} onClick={() => setActive('notifications')}>{t('Notifications')}</TabButton>
          <TabButton active={active==='preferences'} onClick={() => setActive('preferences')}>{t('Preferences')}</TabButton>
          <TabButton active={active==='log'} onClick={() => setActive('log')}>{t('Security Log')}</TabButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {active === 'personal' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-text)]">{t('Full Name')}</label>
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-white/90 dark:bg-gray-800/80">
                  <span className="text-gray-400">👤</span>
                  <input disabled className="flex-1 bg-transparent outline-none opacity-70 cursor-not-allowed" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder={t('Enter full name')} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-text)]">{t('Job Title')}</label>
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-white/90 dark:bg-gray-800/80">
                  <span className="text-gray-400">💼</span>
                  <input disabled className="flex-1 bg-transparent outline-none opacity-70 cursor-not-allowed" value={jobTitle} onChange={e=>setJobTitle(e.target.value)} placeholder={t('Enter job title')} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-text)]">{t('Department')}</label>
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-white/90 dark:bg-gray-800/80">
                  <span className="text-gray-400">🏢</span>
                  <input disabled className="flex-1 bg-transparent outline-none opacity-70 cursor-not-allowed" value={department} onChange={e=>setDepartment(e.target.value)} placeholder={t('Enter department')} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-text)]">{t('Email')}</label>
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-white/90 dark:bg-gray-800/80">
                  <span className="text-gray-400">✉️</span>
                  <input className="flex-1 bg-transparent outline-none" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('Enter email')} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-text)]">{t('Phone')}</label>
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-white/90 dark:bg-gray-800/80">
                  <span className="text-gray-400">📞</span>
                  <input className="flex-1 bg-transparent outline-none" value={phone} onChange={e=>setPhone(e.target.value)} placeholder={t('Enter phone')} />
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/30 dark:via-gray-700 to-transparent" />

            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-2 ring-white/30">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl sm:text-2xl">👤</div>
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center text-xs text-white cursor-pointer">
                  {t('Update Photo')}
                  <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
                </label>
              </div>
            </div>
            <div className="h-4" />
          </div>
        )}

        {active === 'account' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-text)]">{t('Current Password')}</label>
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-white/90 dark:bg-gray-800/80">
                  <input type={showCurPwd?'text':'password'} className="flex-1 bg-transparent outline-none" value={curPwd} onChange={e=>setCurPwd(e.target.value)} placeholder={t('Enter current password')} />
                  <button type="button" className="text-xs text-blue-600 hover:underline" onClick={()=>setShowCurPwd(v=>!v)}>{showCurPwd ? t('Hide') : t('Show')}</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-text)]">{t('New Password')}</label>
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-white/90 dark:bg-gray-800/80">
                  <input type={showNewPwd?'text':'password'} className="flex-1 bg-transparent outline-none" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder={t('Enter new password')} />
                  <button type="button" className="text-xs text-blue-600 hover:underline" onClick={()=>setShowNewPwd(v=>!v)}>{showNewPwd ? t('Hide') : t('Show')}</button>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                  <div className={`h-2 transition-all ${pwdStrength<=2?'bg-red-500':pwdStrength===3?'bg-yellow-500':'bg-emerald-500'}`} style={{ width: `${(pwdStrength/5)*100}%` }} />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-[var(--muted-text)]">{t('Confirm Password')}</label>
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-white/90 dark:bg-gray-800/80">
                  <input type={showConfirmPwd?'text':'password'} className="flex-1 bg-transparent outline-none" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)} placeholder={t('Confirm new password')} />
                  <button type="button" className="text-xs text-blue-600 hover:underline" onClick={()=>setShowConfirmPwd(v=>!v)}>{showConfirmPwd ? t('Hide') : t('Show')}</button>
                </div>
                {confirmPwd && confirmPwd !== newPwd && (
                  <div className="text-xs text-rose-600">{t("Passwords don't match")}</div>
                )}
              </div>
            </div>
            <div className="h-4" />
          </div>
        )}

        {active === 'notifications' && (
          <div className="space-y-3">
            {[{key:'email', label:'Email Alerts', state:notifEmail, set:setNotifEmail, icon:'✉️'}, {key:'app', label:'App Notifications', state:notifApp, set:setNotifApp, icon:'🔔'}, {key:'reports', label:'Monthly Reports', state:notifMonthly, set:setNotifMonthly, icon:'📈'}, {key:'newdev', label:'Login from new devices', state:notifNewDevice, set:setNotifNewDevice, icon:'🖥️'}].map((row)=> (
              <div key={row.key} className="flex items-center justify-between p-3 rounded-lg border bg-white/80 dark:bg-gray-800/80 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{row.icon}</span>
                  <span className="text-sm font-medium">{t(row.label)}</span>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only" checked={row.state} onChange={e=>row.set(e.target.checked)} />
                  <span className={`w-10 h-5 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 ${row.state ? 'justify-end' : 'justify-start'}`}>
                    <span className={`w-4 h-4 rounded-full bg-white transition ${row.state ? 'shadow-[0_0_0_2px_rgba(59,130,246,0.6)]' : ''}`} />
                  </span>
                </label>
              </div>
            ))}
            <div className="h-4" />
          </div>
        )}

        {active === 'preferences' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-text)]">{t('Language')}</label>
                <select className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-gray-800/80" value={lang} onChange={e=>setLang(e.target.value)}>
                  <option>English</option>
                  <option>Arabic</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-text)]">{t('Time Zone')}</label>
                <select className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-gray-800/80" value={tz} onChange={e=>setTz(e.target.value)}>
                  <option>Africa/Cairo</option>
                  <option>Asia/Riyadh</option>
                  <option>Europe/London</option>
                  <option>UTC</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-text)]">{t('Theme')}</label>
                <select className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-gray-800/80" value={theme} onChange={e=>setTheme(e.target.value)}>
                  <option>Dark</option>
                  <option>Light</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl p-4 border bg-white/60 dark:bg-gray-800/60">
                <div className="text-sm font-medium mb-2">{t('Live Preview')}</div>
                <div className={`rounded-lg h-24 flex items-center justify-center ${theme==='Dark'?'bg-gradient-to-r from-gray-800 to-gray-900 text-white':'bg-gradient-to-r from-gray-100 to-white text-gray-800'}`}>
                  {theme} Theme
                </div>
              </div>
            </div>
            <div className="h-4" />
          </div>
        )}

        {active === 'log' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted-text)]">{t('Start Date')}</label>
                <input type="date" className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-gray-800/80" value={logFilterStart} onChange={e=>setLogFilterStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted-text)]">{t('End Date')}</label>
                <input type="date" className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-gray-800/80" value={logFilterEnd} onChange={e=>setLogFilterEnd(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted-text)]">{t('Device')}</label>
                <select className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-gray-800/80" value={logDevice} onChange={e=>setLogDevice(e.target.value)}>
                  <option>All</option>
                  <option>Chrome</option>
                  <option>Edge</option>
                  <option>Safari</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button className="px-4 py-2 rounded-lg border bg-white/70 dark:bg-gray-800/70" onClick={exportExcel}>{t('Download Excel')}</button>
                <button className="px-4 py-2 rounded-lg border bg-white/70 dark:bg-gray-800/70" onClick={exportPDF}>{t('Download PDF')}</button>
              </div>
            </div>
            <div className="h-2" />
            <div className="overflow-auto -mx-2 sm:-mx-4">
              <table className="nova-table w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300">
                    <th className="py-2 px-4">{t('Date')}</th>
                    <th className="py-2 px-4">{t('Action')}</th>
                    <th className="py-2 px-4">{t('Device')}</th>
                    <th className="py-2 px-4">{t('Location')}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-100">
                  <tr><td className="py-1" colSpan="4"></td></tr>
                  {filteredLogs.map((l, i) => (
                    <tr key={i} className="border-t border-gray-200 dark:border-gray-800 hover:bg-white/40 dark:hover:bg-gray-800/40">
                      <td className="py-2 px-4">{l.date}</td>
                      <td className="py-2 px-4">{l.action}</td>
                      <td className="py-2 px-4">{l.device}</td>
                      <td className="py-2 px-4">{l.location}</td>
                    </tr>
                  ))}
                  <tr><td className="py-1" colSpan="4"></td></tr>
                </tbody>
              </table>
            </div>
            <div className="h-4" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 sm:px-4 md:px-6 py-4 border-t border-white/20 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs text-[var(--muted-text)]">{t('Last updated: 2 days ago')}</div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700" onClick={saveChanges}>{t('Save')}</button>
          <button className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600" onClick={resetChanges}>{t('Reset')}</button>
        </div>
      </div>
    </div>
  )
}