import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes, FaGlobe } from 'react-icons/fa'
import { useTheme } from '../shared/context/ThemeProvider'

export default function AddLandingPage({ isOpen, onClose, onAdd }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  // Dummy campaigns data for search
  const dummyCampaigns = [
    'Summer Sale 2024',
    'Black Friday Special',
    'New Year Promo',
    'Product Launch v2',
    'Email Newsletter Q1',
    'Social Media Blast',
    'Organic Traffic Boost',
    'Referral Program',
    'Affiliate Network',
    'Retargeting Campaign'
  ]

  const [form, setForm] = useState({
    title: '',
    source: '',
    email: '',
    phone: '',
    url: '',
    description: '',
    media: [],
    logo: null,
    cover: null,
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    linkedCampaign: '',
    headerScript: '',
    bodyScript: '',
    enableTracking: true,
    theme: 'theme1',
  })

  // Auto-generate URL from Title
  useEffect(() => {
    if (!form.title) {
      setForm(prev => ({ ...prev, url: '' }))
      return
    }
    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
      .replace(/^-+|-+$/g, '') // Trim dashes
    
    // Assume system domain is current origin + pathname + /#/
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.href.split('#')[0].replace(/\/$/, '') 
      : 'https://app.besouhoula.com'
    setForm(prev => ({ ...prev, url: `${baseUrl}/#/${slug}` }))
  }, [form.title])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        title: '',
        source: '',
        email: '',
        phone: '',
        url: '',
        description: '',
        media: [],
        logo: null,
        cover: null,
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        linkedCampaign: '',
        headerScript: '',
        bodyScript: '',
        enableTracking: true,
        theme: 'theme1',
      })
      setActiveTab('general')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    setForm(prev => ({ ...prev, media: files }))
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (file) setForm(prev => ({ ...prev, logo: file }))
  }

  const handleCover = (e) => {
    const file = e.target.files[0]
    if (file) setForm(prev => ({ ...prev, cover: file }))
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  const prepareData = async () => {
    const data = { ...form }
    
    if (data.logo instanceof File) {
      data.logo = await fileToBase64(data.logo)
    }
    
    if (data.cover instanceof File) {
      data.cover = await fileToBase64(data.cover)
    }
    
    if (data.media && data.media.length > 0) {
      const mediaPromises = data.media.map(async (m) => {
        if (m instanceof File) {
          return await fileToBase64(m)
        }
        return m
      })
      data.media = await Promise.all(mediaPromises)
    }
    
    return data
  }

  const onSave = async () => {
    if (saving) return
    setSaving(true)
    
    try {
      const dataToSave = await prepareData()
      
      // Pass data to parent
      if (onAdd) {
        onAdd(dataToSave)
      }

      // Simulate API call
      await new Promise(res => setTimeout(res, 1000))
      setSaving(false)
      onClose()
    } catch (error) {
      console.error('Error saving landing page:', error)
      setSaving(false)
      alert('Failed to save landing page. Please try again.')
    }
  }

  return (
    <div className={`fixed inset-0 z-[2000] ${isRTL ? 'rtl' : 'ltr'} flex items-start justify-center pt-20`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div 
        className="relative max-w-2xl w-full mx-4 rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] transition-all duration-300 animate-in fade-in zoom-in-95"
        style={{
          backgroundColor: isDark ? '#172554' : 'white', // Matches project modal theme (e.g. BrokersImportModal)
          borderColor: isDark ? '#1e3a8a' : '#e5e7eb',
          color: isDark ? 'white' : '#111827'
        }}
      >
        {/* Header */}
        <div 
          className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b transition-colors duration-200"
          style={{ borderColor: isDark ? '#1e3a8a' : '#e5e7eb' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <FaGlobe className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold">
              {isRTL ? 'إنشاء صفحة هبوط' : 'Create Landing Page'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
            {['general', 'social', 'description', 'media', 'script'].map(tab => (
              <button
                key={tab}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'general' && (isRTL ? 'عام' : 'General')}
                {tab === 'social' && (isRTL ? 'التواصل الاجتماعي' : 'Social Media')}
                {tab === 'description' && (isRTL ? 'الوصف' : 'Description')}
                {tab === 'media' && (isRTL ? 'الوسائط' : 'Media')}
                {tab === 'script' && (isRTL ? 'الأكواد' : 'Script')}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'general' && (
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isRTL ? 'text-right' : ''}`}>
              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'العنوان' : 'Title'}</label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  className="input w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder={isRTL ? 'أدخل العنوان' : 'Enter title'} 
                />
              </div>

              {/* Source */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'المصدر' : 'Source'}</label>
                <select 
                  name="source" 
                  value={form.source} 
                  onChange={handleChange} 
                  className="select w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">{isRTL ? 'اختر المصدر' : 'Select Source'}</option>
                  <option value="Meta">Meta (Facebook/Instagram)</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="TikTok Ads">TikTok Ads</option>
                  <option value="Twitter/X">Twitter / X</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              {/* Linked Campaign */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'الحملة المرتبطة' : 'Linked Campaign'}</label>
                <input 
                  list="campaigns-list"
                  name="linkedCampaign" 
                  value={form.linkedCampaign} 
                  onChange={handleChange} 
                  className="input w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder={isRTL ? 'ابحث عن حملة أو أدخل اسماً جديداً' : 'Search campaign or enter new'} 
                />
                <datalist id="campaigns-list">
                  {dummyCampaigns.map((camp, idx) => (
                    <option key={idx} value={camp} />
                  ))}
                </datalist>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                <input 
                  type="email"
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  className="input w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="example@domain.com" 
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'رقم الهاتف' : 'Phone Number'}</label>
                <input 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  className="input w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="+1 234 567 890" 
                />
              </div>

              {/* Theme Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'القالب' : 'Theme'}</label>
                <select 
                  name="theme" 
                  value={form.theme} 
                  onChange={handleChange} 
                  className="select w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="theme1">{isRTL ? 'فاتح' : 'Light'}</option>
                  <option value="theme2">{isRTL ? 'داكن' : 'Dark'}</option>
                </select>
              </div>

              {/* URL */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'الرابط (تلقائي)' : 'URL (Auto-generated)'}</label>
                <input 
                  name="url" 
                  value={form.url} 
                  readOnly
                  disabled
                  className="input w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed select-all" 
                  placeholder={isRTL ? 'سيتم إنشاء الرابط تلقائياً...' : 'URL will be generated automatically...'} 
                />
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isRTL ? 'text-right' : ''}`}>
              {/* Facebook */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">Facebook</label>
                <input 
                  name="facebook" 
                  value={form.facebook} 
                  onChange={handleChange} 
                  className="input w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="https://facebook.com/..." 
                />
              </div>

              {/* Instagram */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">Instagram</label>
                <input 
                  name="instagram" 
                  value={form.instagram} 
                  onChange={handleChange} 
                  className="input w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="https://instagram.com/..." 
                />
              </div>

              {/* Twitter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">Twitter / X</label>
                <input 
                  name="twitter" 
                  value={form.twitter} 
                  onChange={handleChange} 
                  className="input w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="https://twitter.com/..." 
                />
              </div>

              {/* LinkedIn */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">LinkedIn</label>
                <input 
                  name="linkedin" 
                  value={form.linkedin} 
                  onChange={handleChange} 
                  className="input w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="https://linkedin.com/..." 
                />
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'وصف قصير' : 'Short Description'}</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  className="input w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[140px]" 
                  placeholder={isRTL ? 'وصف قصير' : 'Short Description'}
                ></textarea>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-1 gap-4">
              {/* Logo Upload */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'الشعار (Logo)' : 'Logo'}</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden group">
                    {form.logo ? (
                      <img src={URL.createObjectURL(form.logo)} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs text-center px-2">{isRTL ? 'رفع الشعار' : 'Upload Logo'}</span>
                    )}
                    <input 
                      type="file" 
                      onChange={handleLogo} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*" 
                    />
                  </div>
                  <div className="text-xs text-[var(--muted-text)]">
                    {isRTL ? 'يوصى بحجم 512x512 بكسل' : 'Recommended 512x512px'}
                    <br />
                    {form.logo && <span className="text-blue-500 font-medium">{form.logo.name}</span>}
                  </div>
                </div>
              </div>

              {/* Cover Photo Upload */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'صورة الغلاف' : 'Cover Photo'}</label>
                <div className="relative w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden">
                  {form.cover ? (
                    <img src={URL.createObjectURL(form.cover)} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-sm">{isRTL ? 'اضغط لرفع صورة الغلاف' : 'Click to upload Cover Photo'}</span>
                  )}
                  <input 
                    type="file" 
                    onChange={handleCover} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*" 
                  />
                </div>
                {form.cover && <div className="text-xs text-blue-500 mt-1">{form.cover.name}</div>}
              </div>

              {/* Other Media */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'وسائط أخرى' : 'Other Media'}</label>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFiles} 
                  className="input w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  accept="image/*,video/*" 
                />
              </div>
              {form.media.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {form.media.map((f, idx) => (
                    <div key={idx} className="card p-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="font-medium truncate">{f.name}</div>
                      <div className="text-[var(--muted-text)]">{(f.size/1024).toFixed(1)} KB</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'script' && (
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <input 
                  id="enableTracking" 
                  type="checkbox" 
                  name="enableTracking" 
                  checked={form.enableTracking} 
                  onChange={handleChange} 
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <label htmlFor="enableTracking" className="text-sm cursor-pointer select-none">{isRTL ? 'تتبع (Meta Pixel / GTM)' : 'Meta Pixel / GTM'}</label>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'كود الرأس (Header)' : 'Header Script'}</label>
                <textarea 
                  name="headerScript" 
                  value={form.headerScript} 
                  onChange={handleChange} 
                  className="input w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px]" 
                  placeholder="<!-- scripts in <head> -->"
                ></textarea>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)] font-medium">{isRTL ? 'كود الجسم (Body)' : 'Body Script'}</label>
                <textarea 
                  name="bodyScript" 
                  value={form.bodyScript} 
                  onChange={handleChange} 
                  className="input w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px]" 
                  placeholder="<!-- scripts before </body> -->"
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Actions */}
        <div 
          className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t transition-colors duration-200"
          style={{ borderColor: isDark ? '#1e3a8a' : '#e5e7eb' }}
        >
          <button 
            type="button" 
            className="btn btn-ghost hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
            onClick={onClose}
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
          <button 
            type="button" 
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md inline-flex items-center gap-2 px-6" 
            onClick={onSave} 
            disabled={saving}
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
            <span>{saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'إنشاء' : 'Create')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
