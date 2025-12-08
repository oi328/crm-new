import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function CampaignList() {
  const { i18n } = useTranslation()
  const isArabic = (i18n?.language || '').toLowerCase().startsWith('ar')
  const [campaigns, setCampaigns] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('marketingCampaigns')
      setCampaigns(raw ? JSON.parse(raw) : [])
    } catch {
      setCampaigns([])
    }
  }, [])

  if (!campaigns.length) {
    return <p className="text-sm opacity-70">{isArabic ? 'لا توجد حملات بعد' : 'No campaigns yet'}</p>
  }

  return (
    <ul className="space-y-3">
      {campaigns.slice().reverse().map(c => (
        <li key={c.id} className="border border-white/20 rounded-lg p-3 backdrop-blur-sm bg-white/5">
          <div className="flex items-center justify-between">
            <div className="font-medium">{c.name}</div>
            <span className="text-xs opacity-70">{c.platform}</span>
          </div>
          <div className="mt-1 text-xs opacity-75">
            {(isArabic ? 'الميزانية: ' : 'Budget: ')}{c.totalBudget || 0} — {(isArabic ? 'النوع: ' : 'Type: ')}{c.budgetType}
          </div>
          {(c.startDate || c.endDate) ? (
            <div className="mt-1 text-xs opacity-75">
              {(isArabic ? 'الفترة: ' : 'Period: ')}{c.startDate || '—'} → {c.endDate || '—'}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export default function Campaigns() {
  const { i18n } = useTranslation()
  const isArabic = (i18n?.language || '').toLowerCase().startsWith('ar')

  const [form, setForm] = useState({
    name: '',
    platform: '',
    budgetType: 'daily',
    totalBudget: '',
    startDate: '',
    endDate: '',
    landingPage: '',
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [landingPages, setLandingPages] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('marketingLandingPages')
      if (raw) {
        const arr = JSON.parse(raw)
        setLandingPages(Array.isArray(arr) ? arr : [])
      } else {
        setLandingPages([
          { id: 'lp1', name: 'LP - Registration' },
          { id: 'lp2', name: 'LP - Pricing' },
          { id: 'lp3', name: 'LP - Webinar' }
        ])
      }
    } catch {
      setLandingPages([
        { id: 'lp1', name: 'LP - Registration' },
        { id: 'lp2', name: 'LP - Pricing' },
        { id: 'lp3', name: 'LP - Webinar' }
      ])
    }
  }, [])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.platform) {
      setMessage({ type: 'error', text: isArabic ? 'من فضلك أدخل الاسم والمنصة' : 'Please enter name and platform' })
      return
    }

    setSaving(true)
    try {
      const campaign = { id: Date.now(), ...form }
      const raw = localStorage.getItem('marketingCampaigns')
      const arr = raw ? JSON.parse(raw) : []
      arr.push(campaign)
      localStorage.setItem('marketingCampaigns', JSON.stringify(arr))
      setMessage({ type: 'success', text: isArabic ? 'تم حفظ الحملة بنجاح' : 'Campaign saved successfully' })
      setForm({
        name: '', platform: '', budgetType: 'daily', totalBudget: '', startDate: '', endDate: '', landingPage: '', notes: ''
      })
    } catch (err) {
      setMessage({ type: 'error', text: isArabic ? 'حدث خطأ أثناء الحفظ' : 'Error while saving' })
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-semibold">{isArabic ? 'الحملات' : 'Campaigns'}</h1>

        {/* Add Campaign form - glass/transparent card */}
        <div className="card glass-card p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{isArabic ? 'إضافة حملة' : 'Add Campaign'}</h2>

          <form onSubmit={onSubmit} className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}>
            {/* Campaign Name */}
            <div>
              <label className="block text-sm mb-1">{isArabic ? 'اسم الحملة' : 'Campaign Name'}</label>
              <input name="name" value={form.name} onChange={onChange} placeholder={isArabic ? 'اكتب اسم الحملة' : 'Enter campaign name'} className="input" />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm mb-1">{isArabic ? 'المنصة' : 'Platform'}</label>
              <select name="platform" value={form.platform} onChange={onChange} className="input">
                <option value="">{isArabic ? 'اختر المنصة' : 'Select Platform'}</option>
                <option value="Meta">Meta</option>
                <option value="Google">Google</option>
                <option value="Manual">{isArabic ? 'يدوي' : 'Manual'}</option>
              </select>
            </div>

            {/* Budget Type */}
            <div>
              <label className="block text-sm mb-1">{isArabic ? 'نوع الميزانية' : 'Budget Type'}</label>
              <div className={`flex items-center gap-6 ${isArabic ? 'justify-end' : ''}`}>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="budgetType" value="daily" checked={form.budgetType === 'daily'} onChange={onChange} />
                  <span>{isArabic ? 'يومي' : 'Daily'}</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="budgetType" value="lifetime" checked={form.budgetType === 'lifetime'} onChange={onChange} />
                  <span>{isArabic ? 'مدى الحياة' : 'Lifetime'}</span>
                </label>
              </div>
            </div>

            {/* Total Budget */}
            <div>
              <label className="block text-sm mb-1">{isArabic ? 'الميزانية الإجمالية' : 'Total Budget'}</label>
              <input type="number" name="totalBudget" value={form.totalBudget} onChange={onChange} className="input" placeholder="0" />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">{isArabic ? 'تاريخ البداية' : 'Start Date'}</label>
                <input type="date" name="startDate" value={form.startDate} onChange={onChange} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{isArabic ? 'تاريخ الانتهاء' : 'End Date'}</label>
                <input type="date" name="endDate" value={form.endDate} onChange={onChange} className="input" />
              </div>
            </div>

            {/* Linked Landing Page */}
            <div>
              <label className="block text-sm mb-1">{isArabic ? 'ربط بصفحة هبوط' : 'Linked Landing Page'}</label>
              <select name="landingPage" value={form.landingPage} onChange={onChange} className="input">
                <option value="">{isArabic ? 'اختر صفحة هبوط' : 'Select Landing Page'}</option>
                {landingPages.map(lp => (
                  <option key={lp.id} value={lp.id}>{lp.name || lp.title || `LP ${lp.id}`}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm mb-1">{isArabic ? 'ملاحظات' : 'Notes'}</label>
              <textarea name="notes" value={form.notes} onChange={onChange} className="input" rows={3} placeholder={isArabic ? 'ملاحظات إضافية' : 'Additional notes'} />
            </div>

            {/* Save */}
            <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...') : (isArabic ? 'حفظ' : 'Save')}
              </button>
            </div>

            {message && (
              <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </div>
            )}
          </form>
        </div>

        {/* Active Campaigns list - glass/transparent card */}
        <div className="card glass-card p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-lg font-semibold mb-4">{isArabic ? 'الحملات النشطة' : 'Active Campaigns'}</h2>
          <CampaignList />
        </div>
      </div>
  )
}
