import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="glass-panel rounded-2xl">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <button className="btn btn-glass btn-sm" onClick={() => setOpen(o => !o)}>{open ? 'Collapse' : 'Expand'}</button>
      </div>
      {open && (
        <div className="p-4 pt-0">
          {children}
        </div>
      )}
    </div>
  )
}

const toDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '')
const isValidUrl = (v) => /^https?:\/\//i.test(v || '')
const isValidPhone = (v) => /^[+]?([0-9\-\s()]){6,}$/.test(v || '')

export default function ContactInfoSettings() {
  const { t } = useTranslation()
  const initial = {
    companyName: '',
    tagline: '',
    businessType: 'Real Estate',
    country: 'Egypt',
    city: '',
    street: '',
    zip: '',
    lat: '',
    lng: '',
    phones: [''],
    whatsapp: '',
    fax: '',
    email: '',
    website: '',
    social: { facebook: '', instagram: '', linkedin: '', twitter: '', youtube: '' },
    logo: '',
    favicon: '',
    publicVisible: true,
  }

  const [data, setData] = useState(initial)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('contact-info-settings')
    if (saved) {
      try { setData({ ...initial, ...JSON.parse(saved) }) } catch {}
    }
  }, [])

  useEffect(() => {
    const onSave = () => saveAll()
    const onReset = () => resetDefaults()
    window.addEventListener('save-contact-info', onSave)
    window.addEventListener('reset-contact-info', onReset)
    return () => {
      window.removeEventListener('save-contact-info', onSave)
      window.removeEventListener('reset-contact-info', onReset)
    }
  }, [data])

  const saveAll = () => {
    localStorage.setItem('contact-info-settings', JSON.stringify(data))
    setToast({ type: 'success', message: t('Settings saved') })
    setTimeout(() => setToast(null), 2000)
  }
  const resetDefaults = () => {
    setData(initial)
    setToast({ type: 'success', message: t('Settings reset to default') })
    setTimeout(() => setToast(null), 2000)
  }

  const setField = (key, value) => setData(prev => ({ ...prev, [key]: value }))
  const setSocial = (key, value) => setData(prev => ({ ...prev, social: { ...prev.social, [key]: value } }))

  const addPhone = () => setData(prev => ({ ...prev, phones: [...prev.phones, ''] }))
  const setPhone = (i, v) => setData(prev => ({ ...prev, phones: prev.phones.map((p, idx) => idx === i ? v : p) }))
  const removePhone = (i) => setData(prev => ({ ...prev, phones: prev.phones.filter((_, idx) => idx !== i) }))

  const uploadLogo = async (file) => {
    const url = await toDataUrl(file)
    setField('logo', url)
  }
  const uploadFavicon = async (file) => {
    const url = await toDataUrl(file)
    setField('favicon', url)
  }

  const emailError = useMemo(() => data.email && !isValidEmail(data.email) ? t('Invalid email') : '', [data.email, t])
  const websiteError = useMemo(() => data.website && !isValidUrl(data.website) ? t('Invalid URL (use http/https)') : '', [data.website, t])
  const phoneErrors = useMemo(() => data.phones.map(p => p && !isValidPhone(p) ? t('Invalid phone') : ''), [data.phones, t])

  const mapSrc = useMemo(() => {
    if (data.lat && data.lng) {
      return `https://www.google.com/maps?q=${data.lat},${data.lng}&z=14&output=embed`
    }
    const query = [data.street, data.city, data.country].filter(Boolean).join(', ')
    return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed` : ''
  }, [data.lat, data.lng, data.street, data.city, data.country])

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Section title={t('Company Information')} icon={'🏢'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">{t('Company Name')}</label>
            <input className="input-soft w-full" value={data.companyName} onChange={e=>setField('companyName', e.target.value)} />
          </div>
          <div>
            <label className="label">{t('Tagline / Slogan')}</label>
            <input className="input-soft w-full" value={data.tagline} onChange={e=>setField('tagline', e.target.value)} placeholder={t('Optional')} />
          </div>
          <div>
            <label className="label">{t('Business Type')}</label>
            <select className="input-soft w-full" value={data.businessType} onChange={e=>setField('businessType', e.target.value)}>
              {['Medical','Real Estate','Marketing','Retail','Education','Other'].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={data.publicVisible} onChange={e=>setField('publicVisible', e.target.checked)} /> {t('Show contact info publicly')}
            </label>
          </div>
        </div>
      </Section>

      {/* Address */}
      <Section title={t('Address')} icon={'📍'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">{t('Country')}</label>
            <select className="input-soft w-full" value={data.country} onChange={e=>setField('country', e.target.value)}>
              {['Egypt','Saudi Arabia','UAE','Jordan','Kuwait','Qatar','Other'].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('City')}</label>
            <input className="input-soft w-full" value={data.city} onChange={e=>setField('city', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label">{t('Street Address')}</label>
            <textarea className="input-soft w-full h-20" value={data.street} onChange={e=>setField('street', e.target.value)} />
          </div>
          <div>
            <label className="label">{t('Zip Code')}</label>
            <input className="input-soft w-full" value={data.zip} onChange={e=>setField('zip', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('Latitude')}</label>
              <input className="input-soft w-full" value={data.lat} onChange={e=>setField('lat', e.target.value)} placeholder="30.0444" />
            </div>
            <div>
              <label className="label">{t('Longitude')}</label>
              <input className="input-soft w-full" value={data.lng} onChange={e=>setField('lng', e.target.value)} placeholder="31.2357" />
            </div>
          </div>
        </div>
        {mapSrc && (
          <div className="mt-4">
            <iframe title="map" src={mapSrc} className="w-full h-56 rounded-xl border border-gray-200 dark:border-gray-800" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
        )}
      </Section>

      {/* Communication */}
      <Section title={t('Communication')} icon={'☎️'}>
        <div className="space-y-4">
          <div>
            <label className="label">{t('Phone Numbers')}</label>
            <div className="space-y-2">
              {data.phones.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input className={`input-soft flex-1 ${phoneErrors[idx] ? 'border-rose-400' : ''}`} value={p} onChange={e=>setPhone(idx, e.target.value)} placeholder={t('e.g., +2010XXXXXXX')} />
                  <button className="btn btn-glass btn-sm" onClick={() => removePhone(idx)} disabled={data.phones.length===1}>{t('Remove')}</button>
                </div>
              ))}
              {phoneErrors.some(Boolean) && <div className="text-xs text-rose-600">{t('Please check phone formats')}</div>}
              <button className="btn btn-primary btn-sm" onClick={addPhone}>{t('Add Phone')}</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('WhatsApp Number')}</label>
              <input className="input-soft w-full" value={data.whatsapp} onChange={e=>setField('whatsapp', e.target.value)} placeholder={t('e.g., +2010XXXXXXX')} />
            </div>
            <div>
              <label className="label">{t('Fax')}</label>
              <input className="input-soft w-full" value={data.fax} onChange={e=>setField('fax', e.target.value)} placeholder={t('Optional')} />
            </div>
            <div>
              <label className="label">{t('Email')}</label>
              <input className={`input-soft w-full ${emailError ? 'border-rose-400' : ''}`} value={data.email} onChange={e=>setField('email', e.target.value)} placeholder={t('e.g., support@example.com')} />
              {emailError && <div className="text-xs text-rose-600 mt-1">{emailError}</div>}
            </div>
            <div>
              <label className="label">{t('Website URL')}</label>
              <input className={`input-soft w-full ${websiteError ? 'border-rose-400' : ''}`} value={data.website} onChange={e=>setField('website', e.target.value)} placeholder={t('e.g., https://example.com')} />
              {websiteError && <div className="text-xs text-rose-600 mt-1">{websiteError}</div>}
            </div>
          </div>
        </div>
      </Section>

      {/* Social Links */}
      <Section title={t('Social Links')} icon={'🔗'} defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'facebook', label: 'Facebook', icon: '📘' },
            { key: 'instagram', label: 'Instagram', icon: '📸' },
            { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
            { key: 'twitter', label: 'X (Twitter)', icon: '🐦' },
            { key: 'youtube', label: 'YouTube', icon: '▶️' },
          ].map(s => (
            <div key={s.key}>
              <label className="label flex items-center gap-2"><span>{s.icon}</span> {t(s.label)}</label>
              <input className="input-soft w-full" value={data.social[s.key]} onChange={e=>setSocial(s.key, e.target.value)} placeholder={t('Profile URL')} />
            </div>
          ))}
        </div>
      </Section>

      {/* Uploads */}
      <Section title={t('Upload Assets')} icon={'🖼️'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div>
            <label className="label">{t('Company Logo')}</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
              {data.logo && <button className="btn btn-glass btn-sm" onClick={() => setField('logo','')}>{t('Remove')}</button>}
            </div>
            {data.logo && (
              <div className="mt-2 w-40 h-40 rounded-xl overflow-hidden border">
                <img src={data.logo} alt="logo" className="w-full h-full object-contain bg-white" />
              </div>
            )}
          </div>
          <div>
            <label className="label">{t('Favicon')}</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadFavicon(e.target.files[0])} />
              {data.favicon && <button className="btn btn-glass btn-sm" onClick={() => setField('favicon','')}>{t('Remove')}</button>}
            </div>
            {data.favicon && (
              <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border">
                <img src={data.favicon} alt="favicon" className="w-full h-full object-contain bg-white" />
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-[var(--muted-text)] mt-2">{t('Logo and favicon will auto-preview and be used across the system.')}</div>
      </Section>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg ${toast.type==='success'?'bg-emerald-600 text-white':'bg-rose-600 text-white'}`}>{toast.message}</div>
      )}
    </div>
  )
}