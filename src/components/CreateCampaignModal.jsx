import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function CreateCampaignModal({ isOpen, onClose, onCreate }) {
  const { t, i18n } = useTranslation()
  const isRTL = (i18n.language || '').toLowerCase() === 'ar'

  const [form, setForm] = useState({
    name: '',
    channel: 'Email',
    audience: '',
    startAt: '',
    endAt: '',
    budget: '',
    description: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.channel || !form.startAt) return
    onCreate?.(form)
    onClose?.()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-white dark:bg-blue-900 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-blue-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('Create Campaign')}</h2>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-300" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm mb-1">{t('Campaign Name')}</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-blue-900 dark:text-white"
              placeholder={t('e.g., Summer Promo')}
              required
            />
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4`}>
            <div>
              <label className="block text-sm mb-1">{t('Channel')}</label>
              <select
                name="channel"
                value={form.channel}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-blue-900 dark:text-white"
                required
              >
                <option>Email</option>
                <option>SMS</option>
                <option>Social</option>
                <option>Ads</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">{t('Audience Segment')}</label>
              <input
                type="text"
                name="audience"
                value={form.audience}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-blue-900 dark:text-white"
                placeholder={t('e.g., New Leads in 30 days')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">{t('Start At')}</label>
              <input
                type="datetime-local"
                name="startAt"
                value={form.startAt}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-blue-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">{t('End At')}</label>
              <input
                type="datetime-local"
                name="endAt"
                value={form.endAt}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-blue-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">{t('Budget')}</label>
            <input
              type="number"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-blue-900 dark:text-white"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">{t('Description')}</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-blue-900 dark:text-white"
              rows={3}
              placeholder={t('Short description')}
            />
          </div>

          <div className={`flex items-center justify-end gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button type="button" className="btn" onClick={onClose}>{t('Cancel')}</button>
            <button type="submit" className="btn btn-primary">{t('Create')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}