import React from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import WhatsAppSettings from '../components/settings/WhatsAppSettings'

export default function SettingsWhatsApp() {
  const { t } = useTranslation()
  const handleSave = () => {
    const ev = new Event('save-wa-settings')
    window.dispatchEvent(ev)
  }
  return (
    <Layout title={t('WhatsApp Settings')}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('WhatsApp Settings')}</h2>
          <div className="flex items-center gap-2">
            <button className="btn btn-primary" onClick={handleSave}>{t('Save Changes')}</button>
            <a href="#test-wa" className="btn btn-glass">{t('Test Connection')}</a>
          </div>
        </div>
        <WhatsAppSettings />
      </div>
    </Layout>
  )
}