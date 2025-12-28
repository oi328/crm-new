import React from 'react'
import Layout from '../../../components/Layout'
import { useTranslation } from 'react-i18next'
import ContactInfoSettings from '../../../components/settings/ContactInfoSettings'

export default function SettingsContactInfo() {
  const { t } = useTranslation()
  const handleSave = () => {
    window.dispatchEvent(new Event('save-contact-info'))
  }
  const handleReset = () => {
    window.dispatchEvent(new Event('reset-contact-info'))
  }
  const actions = (
    <div className="flex items-center gap-2">
      <button className="btn btn-primary btn-sm" onClick={handleSave}>{t('Save Changes')}</button>
      <button className="btn btn-glass btn-sm" onClick={handleReset}>{t('Reset to Default')}</button>
    </div>
  )
  return (
    <Layout title={t('Contact Info Settings')} actions={actions}>
      <div className="p-3 sm:p-4">
        <ContactInfoSettings />
      </div>
    </Layout>
  )
}