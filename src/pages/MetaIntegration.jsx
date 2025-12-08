import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function MetaIntegration() {
  const { t } = useTranslation()

  // إعدادات محفوظة محليًا (Dev)
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('meta.integration') || '{}')
    } catch (_) {
      return {}
    }
  })

  const [events, setEvents] = useState(() => (
    settings.events || { Lead: true, Contact: true, CompleteRegistration: false, Purchase: false }
  ))
  const [enableCapi, setEnableCapi] = useState(!!settings.enableCapi)
  const [autoSync, setAutoSync] = useState(!!settings.autoSync)
  const [fieldMap, setFieldMap] = useState(() => (
    settings.fieldMap || { name: 'name', email: 'email', phone: 'phone', utm_source: 'utm_source', utm_campaign: 'utm_campaign' }
  ))
  const [testPayload, setTestPayload] = useState(null)
  const [leadPreview, setLeadPreview] = useState(null)
  // Server helpers (Dev)
  const serverURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787'
  const defaultCallback = `${serverURL}/api/meta/webhook`
  const [verifyResult, setVerifyResult] = useState(null)
  const [serverAck, setServerAck] = useState(null)
  const [copiedCallback, setCopiedCallback] = useState(false)
  const [mappingPreset, setMappingPreset] = useState('default')

  useEffect(() => {
    const merged = { ...settings, events, enableCapi, autoSync, fieldMap }
    localStorage.setItem('meta.integration', JSON.stringify(merged))
  }, [settings, events, enableCapi, autoSync, fieldMap])

  const status = useMemo(() => ({
    account: !!settings.businessManagerId && !!settings.adAccountId && !!settings.pageId,
    pixel: !!settings.pixelId,
    leadAds: !!settings.pageId && autoSync,
  }), [settings, autoSync])

  const resetAll = () => {
    localStorage.removeItem('meta.integration')
    setSettings({})
    setEvents({ Lead: true, Contact: true, CompleteRegistration: false, Purchase: false })
    setEnableCapi(false)
    setAutoSync(false)
    setFieldMap({ name: 'name', email: 'email', phone: 'phone', utm_source: 'utm_source', utm_campaign: 'utm_campaign' })
    setTestPayload(null)
    setLeadPreview(null)
  }

  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))

  const simulatePixelEvent = () => {
    const payload = {
      pixel_id: settings.pixelId || 'PIXEL_ID',
      event_name: Object.keys(events).find(k => events[k]) || 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: window.location.href,
      action_source: enableCapi ? 'website+capi' : 'website',
      user_data: { email: 'lead@example.com', phone: '+201234567890' },
      custom_data: { value: 0, currency: 'USD' }
    }
    setTestPayload(payload)
  }

  const simulateLeadAdsMapping = () => {
    const sampleLead = { full_name: 'Ahmed Ali', email: 'ahmed@example.com', phone_number: '+201000000000', utm_source: 'facebook', utm_campaign: 'spring_campaign' }
    const mapped = {
      [fieldMap.name]: sampleLead.full_name,
      [fieldMap.email]: sampleLead.email,
      [fieldMap.phone]: sampleLead.phone_number,
      [fieldMap.utm_source]: sampleLead.utm_source,
      [fieldMap.utm_campaign]: sampleLead.utm_campaign,
    }
    setLeadPreview({ sampleLead, mapped })
  }

  const sendCapiTest = async () => {
    try {
      const payload = testPayload || { pixel_id: settings.pixelId || 'PIXEL_ID', event_name: 'Lead' }
      const r = await fetch(`${serverURL}/api/meta/capi/test`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const j = await r.json()
      setServerAck(j)
    } catch (e) {
      setServerAck({ ok: false, error: e.message })
    }
  }

  const verifyWebhook = async () => {
    try {
      const url = `${serverURL}/api/meta/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(settings.verifyToken || '')}&hub.challenge=TEST`
      const r = await fetch(url)
      const text = await r.text()
      setVerifyResult({ ok: r.ok, text })
    } catch (e) {
      setVerifyResult({ ok: false, error: e.message })
    }
  }

  const setLocalCallback = () => {
    handleChange('callbackUrl', defaultCallback)
  }

  const copyCallback = async () => {
    try {
      await navigator.clipboard.writeText(settings.callbackUrl || defaultCallback)
      setCopiedCallback(true)
      setTimeout(() => setCopiedCallback(false), 1500)
    } catch (_) {
      setCopiedCallback(false)
    }
  }

  const applyMappingPreset = (preset) => {
    setMappingPreset(preset)
    if (preset === 'facebook') {
      setFieldMap({ name: 'full_name', email: 'email', phone: 'phone_number', utm_source: 'utm_source', utm_campaign: 'utm_campaign' })
    } else {
      setFieldMap({ name: 'name', email: 'email', phone: 'phone', utm_source: 'utm_source', utm_campaign: 'utm_campaign' })
    }
  }

  const Badge = ({ ok, label }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${ok ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
      {label}
    </span>
  )

  return (
    <div className="space-y-6 bg-transparent text-[var(--content-text)]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t('Meta Integration')}</h1>
          <div className="flex items-center gap-2">
            <Badge ok={status.account} label={t('Account Connected')} />
            <Badge ok={status.pixel} label={t('Pixel Configured')} />
            <Badge ok={status.leadAds} label={t('Lead Ads Auto-sync')} />
          </div>
        </div>

        {/* حساب Meta */}
        <div className="card glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{t('Meta Account')}</h2>
            <button className="btn btn-outline" onClick={resetAll}>{t('Reset Settings')}</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="label">{t('Business Manager ID')}</label>
              <input className="input" value={settings.businessManagerId || ''} onChange={(e)=>handleChange('businessManagerId', e.target.value)} placeholder={t('e.g., 1234567890')} />
            </div>
            <div className="flex flex-col">
              <label className="label">{t('Ad Account ID')}</label>
              <input className="input" value={settings.adAccountId || ''} onChange={(e)=>handleChange('adAccountId', e.target.value)} placeholder={t('e.g., act_1234567890')} />
            </div>
            <div className="flex flex-col">
              <label className="label">{t('Page ID')}</label>
              <input className="input" value={settings.pageId || ''} onChange={(e)=>handleChange('pageId', e.target.value)} placeholder={t('e.g., 1234567890')} />
            </div>
            <div className="flex flex-col">
              <label className="label">{t('App ID')}</label>
              <input className="input" value={settings.appId || ''} onChange={(e)=>handleChange('appId', e.target.value)} placeholder={t('e.g., 123456789012345')} />
            </div>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-text)]">{t('For production, store secrets on the server, not in the browser.')}</p>
        </div>

        {/* إعداد Pixel */}
        <div className="card glass-card p-4">
          <h2 className="text-lg font-semibold mb-3">{t('Facebook Pixel')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="label">{t('Pixel ID')}</label>
                <input className="input" value={settings.pixelId || ''} onChange={(e)=>handleChange('pixelId', e.target.value)} placeholder={t('e.g., 123456789012345')} />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input id="enableCapi" type="checkbox" checked={enableCapi} onChange={(e)=>setEnableCapi(e.target.checked)} />
                <label htmlFor="enableCapi" className="text-sm">{t('Enable CAPI')}</label>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <label className="text-sm">{t('Events')}</label>
                <div className="flex flex-wrap gap-3">
                  {Object.keys(events).map((ev)=> (
                    <label key={ev} className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!events[ev]} onChange={(e)=>setEvents(prev=>({ ...prev, [ev]: e.target.checked }))} />
                      <span>{t(ev)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex md:justify-end items-start gap-2">
              <button className="btn btn-primary" onClick={simulatePixelEvent}>{t('Test Pixel Event')}</button>
              <button className="btn btn-outline" onClick={sendCapiTest}>{t('Send to Server (CAPI echo)')}</button>
            </div>
          </div>
          {testPayload && (
            <div className="mt-4 rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">{t('Payload Preview')}</div>
              <pre className="text-xs overflow-auto">{JSON.stringify(testPayload, null, 2)}</pre>
            </div>
          )}
          {serverAck && (
            <div className="mt-3 rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">{t('Server Response')}</div>
              <pre className="text-xs overflow-auto">{JSON.stringify(serverAck, null, 2)}</pre>
            </div>
          )}
          <p className="mt-2 text-xs text-[var(--muted-text)]">{t('Use Events Manager to verify pixel firing and CAPI events.')}</p>
        </div>

        {/* Lead Ads مزامنة */}
        <div className="card glass-card p-4">
          <h2 className="text-lg font-semibold mb-3">{t('Lead Ads Synchronization')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">{t('Webhook Settings')}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input id="autoSync" type="checkbox" checked={autoSync} onChange={(e)=>setAutoSync(e.target.checked)} />
                  <label htmlFor="autoSync" className="text-sm">{t('Enable Auto-sync')}</label>
                </div>
                <div className="flex flex-col">
                  <label className="label">{t('Verify Token')}</label>
                  <input className="input" dir="ltr" value={settings.verifyToken || ''} onChange={(e)=>handleChange('verifyToken', e.target.value)} placeholder={t('Webhook verify token')} />
                </div>
                <div className="flex flex-col lg:col-span-2">
                    <label className="label">{t('Callback URL')}</label>
                    <div className="flex items-center gap-2">
                      <input className="input flex-1 w-full" dir="ltr" value={settings.callbackUrl || ''} onChange={(e)=>handleChange('callbackUrl', e.target.value)} placeholder={t('https://your-domain.com/api/meta/webhook')} />
                      <button type="button" className="btn btn-xs" onClick={setLocalCallback}>{t('Set local server URL')}</button>
                      <button type="button" className="btn btn-outline btn-xs" onClick={copyCallback}>{t('Copy')}</button>
                    </div>
                    {copiedCallback && (<div className="text-xs text-emerald-600 mt-1">{t('Copied')}</div>)}
                    <div className="h-2" aria-hidden="true" />
                  </div>
              </div>
            </div>
            <div className="flex md:justify-end items-start gap-2">
              <button className="btn btn-outline" onClick={simulateLeadAdsMapping}>{t('Simulate Lead Mapping')}</button>
              <button className="btn btn-primary" onClick={verifyWebhook}>{t('Test Verify Webhook')}</button>
            </div>
          </div>

          {/* خرائط الحقول */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                <span>{t('Field Mapping')}</span>
                <select className="input input-xs w-auto" value={mappingPreset} onChange={(e)=>applyMappingPreset(e.target.value)}>
                  <option value="default">{t('Default')}</option>
                  <option value="facebook">{t('Facebook Fields')}</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="label">{t('Full Name')}</label>
                  <input className="input" value={fieldMap.name} onChange={(e)=>setFieldMap(prev=>({ ...prev, name: e.target.value }))} />
                </div>
                <div className="flex flex-col">
                  <label className="label">{t('Email')}</label>
                  <input className="input" value={fieldMap.email} onChange={(e)=>setFieldMap(prev=>({ ...prev, email: e.target.value }))} />
                </div>
                <div className="flex flex-col">
                  <label className="label">{t('Phone')}</label>
                  <input className="input" value={fieldMap.phone} onChange={(e)=>setFieldMap(prev=>({ ...prev, phone: e.target.value }))} />
                </div>
                <div className="flex flex-col">
                  <label className="label">{t('UTM Source')}</label>
                  <input className="input" value={fieldMap.utm_source} onChange={(e)=>setFieldMap(prev=>({ ...prev, utm_source: e.target.value }))} />
                </div>
                <div className="flex flex-col">
                  <label className="label">{t('UTM Campaign')}</label>
                  <input className="input" value={fieldMap.utm_campaign} onChange={(e)=>setFieldMap(prev=>({ ...prev, utm_campaign: e.target.value }))} />
                </div>
              </div>
            </div>
            {leadPreview && (
              <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">{t('Mapping Preview')}</div>
                <pre className="text-xs overflow-auto">{JSON.stringify(leadPreview, null, 2)}</pre>
              </div>
            )}
          </div>
          {verifyResult && (
            <div className="mt-3 rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">{t('Webhook Verify Result')}</div>
              <pre className="text-xs overflow-auto">{JSON.stringify(verifyResult, null, 2)}</pre>
            </div>
          )}
          <p className="mt-2 text-xs text-[var(--muted-text)]">{t('Subscribe Page to webhook via Meta settings; use the verify token above.')}</p>
        </div>

        {/* تشخيص ونصائح */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card glass-card p-4">
            <h3 className="text-base font-semibold mb-2">{t('Diagnostics')}</h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2"><Badge ok={status.account} label={t('Account Connected')} /><span className="text-[var(--muted-text)]">{t('Business Manager, Ad Account, and Page configured')}</span></li>
              <li className="flex items-center gap-2"><Badge ok={status.pixel} label={t('Pixel Configured')} /><span className="text-[var(--muted-text)]">{t('Pixel ID present; test event recommended')}</span></li>
              <li className="flex items-center gap-2"><Badge ok={status.leadAds} label={t('Lead Ads Auto-sync')} /><span className="text-[var(--muted-text)]">{t('Webhook enabled and auto-sync active')}</span></li>
            </ul>
          </div>
          <div className="card glass-card p-4 md:col-span-2">
            <h3 className="text-base font-semibold mb-2">{t('Marketing Tips')}</h3>
            <ul className="text-sm space-y-2 list-disc pl-5">
              <li>{t('Use CAPI + Pixel to reduce tracking loss and improve optimization.')}</li>
              <li>{t('Map UTM parameters and campaigns to CRM for end-to-end attribution.')}</li>
              <li>{t('Test events in Events Manager after any change to your funnel.')}</li>
              <li>{t('Auto-sync Lead Ads and dedupe by phone/email to avoid duplicates.')}</li>
              <li>{t('Retarget unconverted leads with Custom Audiences for higher ROAS.')}</li>
            </ul>
          </div>
        </div>
      </div>
  )
}
