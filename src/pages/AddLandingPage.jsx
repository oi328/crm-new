import React, { useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export default function AddLandingPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  const [form, setForm] = useState({
    title: '',
    channel: '',
    project: '',
    description: '',
    targetUrl: '',
    media: [],
    headerScript: '',
    bodyScript: '',
    enableTracking: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    setForm(prev => ({ ...prev, media: files }))
  }

  const onCancel = () => navigate('/marketing/landing-pages')

  const onSave = async () => {
    if (saving) return
    setSaving(true)
    setStatus('')
    await new Promise(res => setTimeout(res, 1000))
    setSaving(false)
    setStatus(t('Saved successfully'))
    setTimeout(() => navigate('/marketing/landing-pages'), 900)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">{t('Add Landing Page')}</h1>

        {status && (
          <div className={`card glass-card p-3 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{status}</div>
        )}

        <section className={`card glass-card p-0 ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Tabs header */}
          <div className="flex items-center gap-2 px-4 pt-4">
            {['general','description','media','script'].map(tab => (
              <button
                key={tab}
                className={`btn !px-3 !py-1 text-sm ${activeTab === tab ? 'btn-primary' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'general' && t('General')}
                {tab === 'description' && t('Description')}
                {tab === 'media' && t('Media')}
                {tab === 'script' && t('Script')}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4">
            {activeTab === 'general' && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isRTL ? 'text-right' : ''}`}>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[var(--muted-text)]">{t('Title')}</label>
                  <input name="title" value={form.title} onChange={handleChange} className="input" placeholder={t('Enter title')} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[var(--muted-text)]">{t('Channel')}</label>
                  <select name="channel" value={form.channel} onChange={handleChange} className="select">
                    <option value="">{t('Select Channel')}</option>
                    <option value="Meta">Meta (Facebook/Instagram)</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="Twitter/X">Twitter / X</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[var(--muted-text)]">{t('Project')}</label>
                  <select name="project" value={form.project} onChange={handleChange} className="select">
                    <option value="">{t('Select Project')}</option>
                    <option value="Cairo Downtown">Cairo Downtown</option>
                    <option value="New Capital">New Capital</option>
                    <option value="Project A">Project A</option>
                    <option value="Project B">Project B</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[var(--muted-text)]">{t('Target URL')}</label>
                  <input name="targetUrl" value={form.targetUrl} onChange={handleChange} className="input" placeholder="https://example.com/landing" />
                </div>
              </div>
            )}

            {activeTab === 'description' && (
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[var(--muted-text)]">{t('Short Description')}</label>
                  <textarea name="description" value={form.description} onChange={handleChange} className="input min-h-[140px]" placeholder={t('Short Description')}></textarea>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[var(--muted-text)]">{t('Upload Media')}</label>
                  <input type="file" multiple onChange={handleFiles} className="input" accept="image/*,video/*" />
                </div>
                {form.media.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {form.media.map((f, idx) => (
                      <div key={idx} className="card glass-card p-3 text-sm">
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
                  <input id="enableTracking" type="checkbox" name="enableTracking" checked={form.enableTracking} onChange={handleChange} />
                  <label htmlFor="enableTracking" className="text-sm">Meta Pixel / GTM</label>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[var(--muted-text)]">{t('Header Script')}</label>
                  <textarea name="headerScript" value={form.headerScript} onChange={handleChange} className="input min-h-[120px]" placeholder="<!-- scripts in <head> -->"></textarea>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[var(--muted-text)]">{t('Body Script')}</label>
                  <textarea name="bodyScript" value={form.bodyScript} onChange={handleChange} className="input min-h-[120px]" placeholder="<!-- scripts before </body> -->"></textarea>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className={`mt-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button type="button" className="btn" onClick={onCancel}>{t('Cancel')}</button>
              <button type="button" className="btn btn-primary inline-flex items-center gap-2" onClick={onSave} disabled={saving}>
                {saving ? (
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                )}
                <span>{saving ? t('Saving...') : t('Create')}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}