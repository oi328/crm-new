import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { metaService } from '../../services/metaService'

export default function MetaSettings({ onClose }) {
  const { t } = useTranslation()

  // State
  const [activeTab, setActiveTab] = useState('meta-account')
  const [settings, setSettings] = useState(() => metaService.loadSettings())
  // Loading states for async actions (sendCapiTest, verifyWebhook)
  const [loadingStates, setLoadingStates] = useState({ sendCapiTest: false, verifyWebhook: false })
  // User-friendly error messages per action
  const [errorMessages, setErrorMessages] = useState({ sendCapiTest: '', verifyWebhook: '' })
  // Real-time validation errors for numeric-only IDs
  const [validationErrors, setValidationErrors] = useState({ businessManagerId: '', adAccountId: '', pageId: '', pixelId: '' })
  
  const [events, setEvents] = useState(() => (
    settings.events || { Lead: true, Contact: true, CompleteRegistration: false, Purchase: false }
  ))
  const [enableCapi, setEnableCapi] = useState(!!settings.enableCapi)
  const [autoSync, setAutoSync] = useState(!!settings.autoSync)
  const [fieldMap, setFieldMap] = useState(() => (
    settings.fieldMap || { name: 'name', email: 'email', phone: 'phone', utm_source: 'utm_source', utm_campaign: 'utm_campaign' }
  ))
  
  // Test/Preview State
  const [testPayload, setTestPayload] = useState(null)
  const [leadPreview, setLeadPreview] = useState(null)
  const [verifyResult, setVerifyResult] = useState(null)
  const [serverAck, setServerAck] = useState(null)
  const [copiedCallback, setCopiedCallback] = useState(false)
  const [mappingPreset, setMappingPreset] = useState('default')

  // Effects
  useEffect(() => {
    const merged = { ...settings, events, enableCapi, autoSync, fieldMap }
    metaService.saveSettings(merged)
  }, [settings, events, enableCapi, autoSync, fieldMap])

  // Computed Status
  const status = useMemo(() => ({
    account: !!settings.businessManagerId && !!settings.adAccountId && !!settings.pageId,
    pixel: !!settings.pixelId,
    leadAds: !!settings.pageId && autoSync,
  }), [settings, autoSync])

  // Handlers
  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))
  // Validate that a given value contains only numbers. Empty string passes (user still typing).
  const validateNumeric = (v) => (!v || /^[0-9]+$/.test(String(v))) ? '' : 'Must be a valid ID containing only numbers.'
  // Update an ID field with numeric validation feedback
  const handleIdChange = (key, value) => {
    handleChange(key, value)
    if (key === 'businessManagerId' || key === 'adAccountId' || key === 'pageId' || key === 'pixelId') {
      const msg = validateNumeric(value)
      setValidationErrors(prev => ({ ...prev, [key]: msg }))
    }
  }
  const hasValidationErrors = useMemo(() => Object.values(validationErrors).some(Boolean), [validationErrors])

  const resetAll = () => {
    metaService.resetSettings()
    setSettings({})
    setEvents({ Lead: true, Contact: true, CompleteRegistration: false, Purchase: false })
    setEnableCapi(false)
    setAutoSync(false)
    setFieldMap({ name: 'name', email: 'email', phone: 'phone', utm_source: 'utm_source', utm_campaign: 'utm_campaign' })
    setTestPayload(null)
    setLeadPreview(null)
    setErrorMessages({ sendCapiTest: '', verifyWebhook: '' })
    setValidationErrors({ businessManagerId: '', adAccountId: '', pageId: '', pixelId: '' })
  }

  const simulatePixelEvent = () => {
    const payload = metaService.simulatePixelEvent(settings, events, enableCapi)
    setTestPayload(payload)
  }

  const sendCapiTest = async () => {
    // Clear previous error and set loading
    setErrorMessages(prev => ({ ...prev, sendCapiTest: '' }))
    setLoadingStates(prev => ({ ...prev, sendCapiTest: true }))
    try {
      const payload = testPayload || { pixel_id: settings.pixelId || 'PIXEL_ID', event_name: 'Lead' }
      const j = await metaService.sendCapiTest(payload)
      setServerAck(j)
    } catch (e) {
      // Set friendly error message for UX
      setErrorMessages(prev => ({ ...prev, sendCapiTest: 'Connection failed. Please check your settings and try again.' }))
      setServerAck({ ok: false, error: e?.message || 'failed' })
    } finally {
      setLoadingStates(prev => ({ ...prev, sendCapiTest: false }))
    }
  }

  const verifyWebhook = async () => {
    // Clear previous error and set loading
    setErrorMessages(prev => ({ ...prev, verifyWebhook: '' }))
    setLoadingStates(prev => ({ ...prev, verifyWebhook: true }))
    try {
      const result = await metaService.verifyWebhook(settings.verifyToken)
      setVerifyResult(result)
    } catch (e) {
      // Set friendly error message for UX
      setErrorMessages(prev => ({ ...prev, verifyWebhook: 'Connection failed. Please check your settings and try again.' }))
      setVerifyResult({ ok: false, error: e?.message || 'failed' })
    } finally {
      setLoadingStates(prev => ({ ...prev, verifyWebhook: false }))
    }
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

  const setLocalCallback = () => handleChange('callbackUrl', metaService.defaultCallback)

  const copyCallback = async () => {
    try {
      await navigator.clipboard.writeText(settings.callbackUrl || metaService.defaultCallback)
      setCopiedCallback(true)
      setTimeout(() => setCopiedCallback(false), 1500)
    } catch (e) {
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
    <div className="space-y-6 pt-4 px-4 sm:px-6">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold">{t('Meta (Facebook & Instagram) Settings')}</h2>
          <div className="flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar">
            <Badge ok={status.account} label={t('Account')} />
            <Badge ok={status.pixel} label={t('Pixel')} />
            <Badge ok={status.leadAds} label={t('Lead Sync')} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
           <button onClick={onClose} className="btn btn-outline btn-sm rtl:flex-row-reverse">{t('Back to Integrations')}</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setActiveTab('meta-account')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'meta-account' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent  hover:text-gray-700 dark:text-white dark:hover:text-gray-300'
            }`}
          >
            {t('Meta Account')}
          </button>
          <button 
            onClick={() => setActiveTab('pixel-settings')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pixel-settings' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent  hover:text-gray-700 dark:text-white dark:hover:text-gray-300'
            }`}
          >
            {t('Facebook Pixel & CAPI')}
          </button>
          <button 
            onClick={() => setActiveTab('lead-ads-sync')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'lead-ads-sync' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent  hover:text-gray-700 dark:text-white dark:hover:text-gray-300'
            }`}
          >
            {t('Lead Ads Sync')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'meta-account' && (
          <div className="card glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('Account Configuration')}</h3>
              <button className="px-3 py-1.5 text-sm  dark:text-white hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" onClick={resetAll}>{t('Reset')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-70">{t('Business Manager ID')}</label>
                <input className="input" value={settings.businessManagerId || ''} onChange={(e)=>handleIdChange('businessManagerId', e.target.value)} placeholder="e.g., 1234567890" />
                {validationErrors.businessManagerId && <div className="text-xs text-red-600 mt-1">{validationErrors.businessManagerId}</div>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-70">{t('Ad Account ID')}</label>
                <input className="input" value={settings.adAccountId || ''} onChange={(e)=>handleIdChange('adAccountId', e.target.value)} placeholder="e.g., 1234567890" />
                {validationErrors.adAccountId && <div className="text-xs text-red-600 mt-1">{validationErrors.adAccountId}</div>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-70">{t('Page ID / Instagram Account')}</label>
                <input className="input" value={settings.pageId || ''} onChange={(e)=>handleIdChange('pageId', e.target.value)} placeholder="e.g., 1234567890" />
                {validationErrors.pageId && <div className="text-xs text-red-600 mt-1">{validationErrors.pageId}</div>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-70">{t('App ID')}</label>
                <input className="input" value={settings.appId || ''} onChange={(e)=>handleChange('appId', e.target.value)} placeholder="e.g., 123456789012345" />
              </div>
            </div>

          </div>
        )}

        {activeTab === 'pixel-settings' && (
          <div className="space-y-4">
            <div className="card glass-card p-4">
              <h3 className="text-lg font-semibold mb-4">{t('Pixel & CAPI Configuration')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium opacity-70">{t('Pixel ID')}</label>
                    <input className="input" value={settings.pixelId || ''} onChange={(e)=>handleIdChange('pixelId', e.target.value)} placeholder="e.g., 123456789012345" />
                    {validationErrors.pixelId && <div className="text-xs text-red-600 mt-1">{validationErrors.pixelId}</div>}
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                    <input id="enableCapi" type="checkbox" checked={enableCapi} onChange={(e)=>setEnableCapi(e.target.checked)} className="checkbox checkbox-sm checkbox-primary" />
                    <label htmlFor="enableCapi" className="text-sm font-medium cursor-pointer select-none">{t('Enable Conversions API (CAPI)')}</label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium opacity-70">{t('Active Events')}</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(events).map((ev)=> (
                        <label key={ev} className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${events[ev] ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' : 'bg-transparent border-gray-200  dark:border-gray-700 dark:text-white'}`}>
                          <input type="checkbox" className="hidden" checked={!!events[ev]} onChange={(e)=>setEvents(prev=>({ ...prev, [ev]: e.target.checked }))} />
                          {events[ev] && <span>✓</span>}
                          <span>{t(ev)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-4 rounded-xl">
                  <h4 className="text-sm font-bold mb-2">{t('Testing Tools')}</h4>
                  <button className="btn btn-primary btn-sm w-full justify-center" onClick={simulatePixelEvent} disabled={hasValidationErrors}>{t('Test Pixel Event Generation')}</button>
                  <button className="btn btn-outline btn-sm w-full justify-center" onClick={sendCapiTest} disabled={hasValidationErrors || loadingStates.sendCapiTest}>
                    {loadingStates.sendCapiTest ? t('Loading...') : t('Send to Server (CAPI echo)')}
                  </button>
                  {errorMessages.sendCapiTest && (
                    <div className="mt-2 p-2 text-xs rounded bg-red-100 text-red-800 border border-red-200">
                      {errorMessages.sendCapiTest}
                    </div>
                  )}
                  
                  {testPayload && (
                    <div className="mt-2 p-2 bg-gray-900 text-green-400 text-[10px] font-mono rounded overflow-hidden">
                      <div className="mb-1 opacity-50 uppercase">Payload Preview</div>
                      <pre className="overflow-auto max-h-32">{JSON.stringify(testPayload, null, 2)}</pre>
                    </div>
                  )}
                  
                  {serverAck && (
                    <div className="mt-2 p-2 bg-gray-900 text-blue-400 text-[10px] font-mono rounded overflow-hidden">
                      <div className="mb-1 opacity-50 uppercase">Server Response</div>
                      <pre className="overflow-auto max-h-32">{JSON.stringify(serverAck, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lead-ads-sync' && (
          <div className="space-y-4">
             <div className="card glass-card p-4">
              <h3 className="text-lg font-semibold mb-4">{t('Lead Ads Webhook')}</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                    <input id="autoSync" type="checkbox" checked={autoSync} onChange={(e)=>setAutoSync(e.target.checked)} className="checkbox checkbox-sm checkbox-primary" />
                    <label htmlFor="autoSync" className="text-sm font-medium cursor-pointer">{t('Enable Auto-sync for Incoming Leads')}</label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium opacity-70">{t('Verify Token')}</label>
                      <input className="input" dir="ltr" value={settings.verifyToken || ''} onChange={(e)=>handleChange('verifyToken', e.target.value)} placeholder="my_secure_token" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium opacity-70">{t('Callback URL')}</label>
                      <div className="flex gap-1">
                        <input className="input flex-1 min-w-0" dir="ltr" value={settings.callbackUrl || ''} onChange={(e)=>handleChange('callbackUrl', e.target.value)} placeholder="https://..." />
                        <button className="btn btn-square btn-sm" onClick={copyCallback} title={t('Copy')}>
                          {copiedCallback ? '✓' : '📋'}
                        </button>
                      </div>
                      <button className="text-[10px] text-blue-500 hover:underline self-start" onClick={setLocalCallback}>{t('Use default local URL')}</button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-4 rounded-xl">
                   <h4 className="text-sm font-bold mb-2">{t('Verification')}</h4>
                   <button className="btn btn-primary btn-sm w-full" onClick={verifyWebhook} disabled={hasValidationErrors || loadingStates.verifyWebhook}>
                     {loadingStates.verifyWebhook ? t('Loading...') : t('Test Verify Webhook')}
                   </button>
                   {errorMessages.verifyWebhook && (
                     <div className="mt-2 p-2 text-xs rounded bg-red-100 text-red-800 border border-red-200">
                       {errorMessages.verifyWebhook}
                     </div>
                   )}
                   {verifyResult && (
                      <div className={`mt-2 p-2 text-[10px] font-mono rounded ${verifyResult.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {JSON.stringify(verifyResult)}
                      </div>
                    )}
                </div>
              </div>
            </div>

            <div className="card glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-semibold">{t('Field Mapping')}</h3>
                 <select className="select select-bordered select-xs" value={mappingPreset} onChange={(e)=>applyMappingPreset(e.target.value)}>
                    <option value="default">{t('Default Preset')}</option>
                    <option value="facebook">{t('Facebook Fields Preset')}</option>
                 </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                   {['name', 'email', 'phone', 'utm_source', 'utm_campaign'].map(field => (
                     <div key={field} className="flex items-center gap-2">
                       <div className="w-32 text-xs font-medium opacity-70">{t(field.replace('_', ' ').toUpperCase())}</div>
                       <div className="opacity-50 text-xs">→</div>
                       <input className="input input-sm flex-1" value={fieldMap[field]} onChange={(e)=>setFieldMap(prev=>({ ...prev, [field]: e.target.value }))} />
                     </div>
                   ))}
                </div>
                <div className=" p-4 rounded-xl">
                   <h4 className="text-sm font-bold mb-2">{t('Preview')}</h4>
                   <button className="btn btn-outline btn-sm w-full mb-2" onClick={simulateLeadAdsMapping}>{t('Simulate Mapping')}</button>
                   {leadPreview && (
                    <div className="text-[10px] font-mono space-y-2">
                      <div className="p-2  dark:bg-black/20 rounded border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="font-bold opacity-50 mb-1">SOURCE</div>
                        <pre className="overflow-hidden text-ellipsis">{JSON.stringify(leadPreview.sampleLead, null, 2)}</pre>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-900/10 rounded border border-green-200 dark:border-green-800/30">
                         <div className="font-bold text-green-600 dark:text-green-400 mb-1">MAPPED</div>
                         <pre className="overflow-hidden text-ellipsis">{JSON.stringify(leadPreview.mapped, null, 2)}</pre>
                      </div>
                    </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
