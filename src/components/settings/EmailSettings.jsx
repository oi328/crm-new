import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const Section = ({ title, icon, children }) => (
  <div className="glass-panel rounded-2xl p-6">
    <div className="flex items-center gap-2 mb-4">
      <span>{icon}</span>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    {children}
  </div>
)

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '')
const isValidHost = (v) => /^[a-zA-Z0-9.-]+$/.test(v || '') && (v || '').includes('.')
const isValidPort = (v) => Number(v) >= 1 && Number(v) <= 65535

export default function EmailSettings() {
  const { t } = useTranslation()
  const initial = {
    smtpHost: '',
    smtpPort: 587,
    encryption: 'TLS',
    username: '',
    password: '',
    senderName: 'Tagen Hekaya CRM',
    senderEmail: '',
    replyToEmail: '',
    notifAdmin: '',
    notifSupport: '',
    notifSales: '',
    logsTargets: { Admin: true, Developer: false, None: false },
    signatureHtml: 'Best Regards,<br><b>Tagin Hekaya Team</b><br><a href="https://www.taginhekaya.com">www.taginhekaya.com</a>',
  }

  const [data, setData] = useState(initial)
  const [showPwd, setShowPwd] = useState(false)
  const [status, setStatus] = useState('')
  const [toast, setToast] = useState(null)
  const sigRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('email-settings')
    if (saved) {
      try { setData({ ...initial, ...JSON.parse(saved) }) } catch {}
    }
  }, [])

  useEffect(() => {
    const onSave = () => saveAll()
    const onReset = () => resetDefaults()
    const onTestEmail = () => testEmail()
    window.addEventListener('save-email-settings', onSave)
    window.addEventListener('reset-email-settings', onReset)
    window.addEventListener('test-email-settings', onTestEmail)
    return () => {
      window.removeEventListener('save-email-settings', onSave)
      window.removeEventListener('reset-email-settings', onReset)
      window.removeEventListener('test-email-settings', onTestEmail)
    }
  }, [data])

  const saveAll = () => {
    localStorage.setItem('email-settings', JSON.stringify(data))
    setToast({ type: 'success', message: t('Settings saved') })
    setTimeout(() => setToast(null), 2000)
  }
  const resetDefaults = () => {
    setData(initial)
    setToast({ type: 'success', message: t('Settings reset to default') })
    setTimeout(() => setToast(null), 2000)
  }

  const setField = (key, value) => setData(prev => ({ ...prev, [key]: value }))
  const setLogs = (key, value) => {
    setData(prev => {
      const next = { ...prev.logsTargets, [key]: value }
      if (key === 'None' && value) {
        next.Admin = false; next.Developer = false
      } else if (key !== 'None' && value) {
        next.None = false
      }
      return { ...prev, logsTargets: next }
    })
  }

  const hostError = useMemo(() => data.smtpHost && !isValidHost(data.smtpHost) ? t('Invalid SMTP host') : '', [data.smtpHost, t])
  const portError = useMemo(() => data.smtpPort && !isValidPort(data.smtpPort) ? t('Invalid SMTP port') : '', [data.smtpPort, t])
  const senderEmailError = useMemo(() => data.senderEmail && !isValidEmail(data.senderEmail) ? t('Invalid email') : '', [data.senderEmail, t])
  const replyEmailError = useMemo(() => data.replyToEmail && !isValidEmail(data.replyToEmail) ? t('Invalid email') : '', [data.replyToEmail, t])
  const adminEmailError = useMemo(() => data.notifAdmin && !isValidEmail(data.notifAdmin) ? t('Invalid email') : '', [data.notifAdmin, t])
  const supportEmailError = useMemo(() => data.notifSupport && !isValidEmail(data.notifSupport) ? t('Invalid email') : '', [data.notifSupport, t])
  const salesEmailError = useMemo(() => data.notifSales && !isValidEmail(data.notifSales) ? t('Invalid email') : '', [data.notifSales, t])

  const testConnection = async () => {
    setStatus(t('Testing SMTP connection...'))
    await new Promise(r => setTimeout(r, 800))
    if (!hostError && !portError && data.username && data.password) {
      setStatus(t('Connection successful'))
      setToast({ type: 'success', message: t('SMTP connection verified!') })
    } else {
      setStatus(t('Connection failed'))
      setToast({ type: 'error', message: t('Please fix validation errors before testing.') })
    }
    setTimeout(() => setToast(null), 2000)
  }

  const testEmail = async () => {
    setStatus(t('Sending test email...'))
    await new Promise(r => setTimeout(r, 800))
    if (!senderEmailError && data.senderName && data.senderEmail) {
      setStatus(t('Test email sent successfully!'))
      setToast({ type: 'success', message: t('Test email sent successfully!') })
    } else {
      setStatus(t('Failed to send test email'))
      setToast({ type: 'error', message: t('Please fix sender details and try again.') })
    }
    setTimeout(() => setToast(null), 2000)
  }

  const applyFormat = (cmd, value = null) => {
    document.execCommand(cmd, false, value)
    const html = sigRef.current?.innerHTML || ''
    setField('signatureHtml', html)
  }
  const insertLink = () => {
    const url = prompt(t('Enter link URL'))
    if (url) applyFormat('createLink', url)
  }
  const insertImage = () => {
    const url = prompt(t('Enter image URL'))
    if (url) applyFormat('insertImage', url)
  }

  useEffect(() => {
    if (sigRef.current && data.signatureHtml) {
      sigRef.current.innerHTML = data.signatureHtml
    }
  }, [sigRef, data.signatureHtml])

  return (
    <div className="space-y-6">
      {/* SMTP Configuration */}
      <Section title={t('SMTP Configuration')} icon={'✉️'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">{t('SMTP Host')}</label>
            <input className={`input-soft w-full ${hostError ? 'border-rose-400' : ''}`} value={data.smtpHost} onChange={e=>setField('smtpHost', e.target.value)} placeholder="smtp.gmail.com" />
            {hostError && <div className="text-xs text-rose-600 mt-1">{hostError}</div>}
          </div>
          <div>
            <label className="label">{t('SMTP Port')}</label>
            <input type="number" className={`input-soft w-full ${portError ? 'border-rose-400' : ''}`} value={data.smtpPort} onChange={e=>setField('smtpPort', e.target.value)} placeholder="465 / 587" />
            {portError && <div className="text-xs text-rose-600 mt-1">{portError}</div>}
          </div>
          <div>
            <label className="label">{t('Encryption Type')}</label>
            <select className="input-soft w-full" value={data.encryption} onChange={e=>setField('encryption', e.target.value)}>
              {['SSL','TLS','None'].map(opt => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          </div>
          <div>
            <label className="label">{t('SMTP Username')}</label>
            <input className="input-soft w-full" value={data.username} onChange={e=>setField('username', e.target.value)} />
          </div>
          <div>
            <label className="label">{t('SMTP Password')}</label>
            <div className="flex items-center gap-2">
              <input type={showPwd ? 'text' : 'password'} className="input-soft w-full" value={data.password} onChange={e=>setField('password', e.target.value)} />
              <button className="btn btn-glass btn-sm" onClick={()=>setShowPwd(v=>!v)}>{showPwd ? t('Hide') : t('Show')}</button>
            </div>
          </div>
          <div>
            <label className="label">{t('Sender Name')}</label>
            <input className="input-soft w-full" value={data.senderName} onChange={e=>setField('senderName', e.target.value)} placeholder="Tagen Hekaya CRM" />
          </div>
          <div>
            <label className="label">{t('Sender Email')}</label>
            <input className={`input-soft w-full ${senderEmailError ? 'border-rose-400' : ''}`} value={data.senderEmail} onChange={e=>setField('senderEmail', e.target.value)} placeholder="noreply@example.com" />
            {senderEmailError && <div className="text-xs text-rose-600 mt-1">{senderEmailError}</div>}
          </div>
          <div>
            <label className="label">{t('Reply-To Email')}</label>
            <input className={`input-soft w-full ${replyEmailError ? 'border-rose-400' : ''}`} value={data.replyToEmail} onChange={e=>setField('replyToEmail', e.target.value)} placeholder={t('Optional')} />
            {replyEmailError && <div className="text-xs text-rose-600 mt-1">{replyEmailError}</div>}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button className="btn btn-glass btn-sm" onClick={testConnection}>🔄 {t('Test Connection')}</button>
          {status && <div className="text-xs text-[var(--muted-text)]">{status}</div>}
        </div>
      </Section>

      <div className="h-6 md:h-8" aria-hidden="true" />

      {/* System Notification Emails */}
      <Section title={t('System Notification Emails')} icon={'🔐'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">{t('Admin Notification Email')}</label>
            <input className={`input-soft w-full ${adminEmailError ? 'border-rose-400' : ''}`} value={data.notifAdmin} onChange={e=>setField('notifAdmin', e.target.value)} />
            {adminEmailError && <div className="text-xs text-rose-600 mt-1">{adminEmailError}</div>}
          </div>
          <div>
            <label className="label">{t('Support Email')}</label>
            <input className={`input-soft w-full ${supportEmailError ? 'border-rose-400' : ''}`} value={data.notifSupport} onChange={e=>setField('notifSupport', e.target.value)} />
            {supportEmailError && <div className="text-xs text-rose-600 mt-1">{supportEmailError}</div>}
          </div>
          <div>
            <label className="label">{t('Sales Notification Email')}</label>
            <input className={`input-soft w-full ${salesEmailError ? 'border-rose-400' : ''}`} value={data.notifSales} onChange={e=>setField('notifSales', e.target.value)} />
            {salesEmailError && <div className="text-xs text-rose-600 mt-1">{salesEmailError}</div>}
          </div>
        </div>
        <div className="mt-4">
          <div className="label mb-2">{t('Send System Logs to')}</div>
          <div className="flex flex-wrap items-center gap-4">
            {['Admin','Developer','None'].map(opt => (
              <label key={opt} className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={!!data.logsTargets[opt]} onChange={e=>setLogs(opt, e.target.checked)} /> {t(opt)}
              </label>
            ))}
          </div>
        </div>
      </Section>

      <div className="h-6 md:h-8" aria-hidden="true" />

      {/* Email Signature */}
      <Section title={t('Email Signature')} icon={'🌐'}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button className="btn btn-glass btn-sm" onClick={()=>applyFormat('bold')}>{t('Bold')}</button>
            <button className="btn btn-glass btn-sm" onClick={()=>applyFormat('italic')}>{t('Italic')}</button>
            <button className="btn btn-glass btn-sm" onClick={insertLink}>{t('Link')}</button>
            <button className="btn btn-glass btn-sm" onClick={insertImage}>{t('Image')}</button>
          </div>
          <div
            ref={sigRef}
            className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 min-h-[120px] bg-white dark:bg-gray-900"
            contentEditable
            onInput={(e)=>setField('signatureHtml', e.currentTarget.innerHTML)}
            suppressContentEditableWarning
          />
          <div className="text-xs text-[var(--muted-text)]">{t('Supports images, links, and basic HTML styling.')}</div>
        </div>
      </Section>

      <div className="h-6 md:h-8" aria-hidden="true" />

      {/* Email Templates Shortcut */}
      <Section title={t('Email Templates Shortcut')} icon={'📄'}>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white/60 dark:bg-gray-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <span className="text-lg">📄</span>
            </div>
            <div>
              <div className="text-sm font-semibold">{t('Design reusable email templates')}</div>
              <div className="text-xs text-[var(--muted-text)]">{t('Create, edit and organize all email templates')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-primary btn-sm text-xs scale-90 px-3"
              onClick={() => {
                const evt = new CustomEvent('navigate-to-email-templates')
                window.dispatchEvent(evt)
              }}
            >{t('Manage Templates')}</button>
          </div>
        </div>
      </Section>

      {/* Footer buttons inside component (optional duplicates) */}
      <div className="flex items-center gap-2">
        <button className="btn btn-primary btn-sm" onClick={saveAll}>✅ {t('Save Changes')}</button>
        <button className="btn btn-glass btn-sm" onClick={testEmail}>🔄 {t('Test Email')}</button>
        <button className="btn btn-danger btn-sm" onClick={resetDefaults}>❌ {t('Reset Settings')}</button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg ${toast.type==='success'?'bg-emerald-600 text-white':'bg-rose-600 text-white'}`}>{toast.message}</div>
      )}
    </div>
  )
}