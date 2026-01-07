import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { googleAdsService } from '../../services/googleAdsService'

export default function GoogleAdsSettings({ onClose }) {
  const { t } = useTranslation()

  // State
  const [activeTab, setActiveTab] = useState('ads-account')
  const [settings, setSettings] = useState(() => googleAdsService.loadSettings())
  const [loadingStates, setLoadingStates] = useState({ sendConversionTest: false })
  const [errorMessages, setErrorMessages] = useState({ sendConversionTest: '' })
  const [validationErrors, setValidationErrors] = useState({ customerId: '' })
  
  // Simulation State
  const [testPayload, setTestPayload] = useState(null)
  const [serverAck, setServerAck] = useState(null)

  // Effects
  useEffect(() => {
    googleAdsService.saveSettings(settings)
  }, [settings])

  // Computed Status
  const status = useMemo(() => ({
    account: !!settings.customerId,
    conversions: !!settings.conversionActionId,
  }), [settings])

  // Handlers
  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))
  // Validate Google Ads Customer ID format: 123-456-7890
  const validateCustomerIdFormat = (v) => {
    if (!v) return ''
    return /^\d{3}-\d{3}-\d{4}$/.test(String(v)) ? '' : 'يجب أن يكون الشكل 123-456-7890'
  }
  const handleCustomerIdChange = (value) => {
    handleChange('customerId', value)
    const msg = validateCustomerIdFormat(value)
    setValidationErrors(prev => ({ ...prev, customerId: msg }))
  }
  const hasValidationErrors = useMemo(() => Object.values(validationErrors).some(Boolean), [validationErrors])
  
  const resetAll = () => {
    googleAdsService.resetSettings()
    setSettings({})
    setTestPayload(null)
    setServerAck(null)
  }

  const simulateConversion = () => {
    const payload = googleAdsService.simulateConversion(settings)
    setTestPayload(payload)
  }

  const sendConversionTest = async () => {
    setErrorMessages(prev => ({ ...prev, sendConversionTest: '' }))
    setLoadingStates(prev => ({ ...prev, sendConversionTest: true }))
    try {
      const payload = testPayload || googleAdsService.simulateConversion(settings)
      const j = await googleAdsService.sendConversionTest(payload)
      setServerAck(j)
    } catch (e) {
      setErrorMessages(prev => ({ ...prev, sendConversionTest: 'فشل الاتصال بالخادم. يرجى التحقق من الإعدادات والمحاولة مرة أخرى.' }))
      setServerAck({ ok: false, error: e?.message || 'failed' })
    } finally {
      setLoadingStates(prev => ({ ...prev, sendConversionTest: false }))
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
          <h2 className="text-xl font-bold">{t('Google Ads Settings')}</h2>
          <div className="flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar">
            <Badge ok={status.account} label={t('Account')} />
            <Badge ok={status.conversions} label={t('Conversions')} />
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
            onClick={() => setActiveTab('ads-account')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'ads-account' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('Account & Access')}
          </button>
          <button 
            onClick={() => setActiveTab('conversions')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'conversions' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('Offline Conversions')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'ads-account' && (
          <div className="card glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('Google Ads Configuration')}</h3>
              <button className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" onClick={resetAll}>{t('Reset')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-70">{t('Customer ID')}</label>
                <input className="input" value={settings.customerId || ''} onChange={(e)=>handleCustomerIdChange(e.target.value)} placeholder="e.g., 123-456-7890" />
                {validationErrors.customerId && <div className="text-xs text-red-600 mt-1">{validationErrors.customerId}</div>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-70">{t('Manager Account ID (Optional)')}</label>
                <input className="input" value={settings.managerId || ''} onChange={(e)=>handleChange('managerId', e.target.value)} placeholder="e.g., 987-654-3210" />
              </div>
            </div>

          </div>
        )}

        {activeTab === 'conversions' && (
          <div className="space-y-4">
            <div className="card glass-card p-4">
              <h3 className="text-lg font-semibold mb-4">{t('Conversion Tracking')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium opacity-70">{t('Conversion Action ID / Name')}</label>
                    <input className="input" value={settings.conversionActionId || ''} onChange={(e)=>handleChange('conversionActionId', e.target.value)} placeholder="e.g., API_Lead_Import" />
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                    <input id="autoUpload" type="checkbox" checked={!!settings.autoUpload} onChange={(e)=>handleChange('autoUpload', e.target.checked)} className="checkbox checkbox-sm checkbox-primary" />
                    <label htmlFor="autoUpload" className="text-sm font-medium cursor-pointer select-none">{t('Enable Auto-upload for New Sales')}</label>
                  </div>
                </div>

                <div className="flex flex-col gap-2  p-4 rounded-xl">
                  <h4 className="text-sm font-bold mb-2">{t('Testing Tools')}</h4>
                  <button className="btn btn-primary btn-sm w-full justify-center" onClick={simulateConversion}>{t('Simulate Conversion Event')}</button>
                  <button className="btn btn-outline btn-sm w-full justify-center" onClick={sendConversionTest} disabled={hasValidationErrors || loadingStates.sendConversionTest}>
                    {loadingStates.sendConversionTest ? t('Loading...') : t('Send to Google Ads (Simulated)')}
                  </button>
                  {errorMessages.sendConversionTest && (
                    <div className="mt-2 p-2 text-xs rounded bg-red-100 text-red-800 border border-red-200">
                      {errorMessages.sendConversionTest}
                    </div>
                  )}
                  
                  {testPayload && (
                    <div className="mt-2 p-2  text-green-400 text-[10px] font-mono rounded overflow-hidden">
                      <div className="mb-1 opacity-50 uppercase">Payload Preview</div>
                      <pre className="overflow-auto max-h-32">{JSON.stringify(testPayload, null, 2)}</pre>
                    </div>
                  )}
                  
                  {serverAck && (
                    <div className="mt-2 p-2  text-blue-400 text-[10px] font-mono rounded overflow-hidden">
                      <div className="mb-1 opacity-50 uppercase">Server Response</div>
                      <pre className="overflow-auto max-h-32">{JSON.stringify(serverAck, null, 2)}</pre>
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
