import React, { useEffect } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import EmailSettings from '../components/settings/EmailSettings'

export default function SettingsEmail() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    const onTemplates = () => navigate('/settings/sms-templates')
    window.addEventListener('navigate-to-email-templates', onTemplates)
    return () => window.removeEventListener('navigate-to-email-templates', onTemplates)
  }, [navigate])

  const handleSave = () => window.dispatchEvent(new Event('save-email-settings'))
  const handleTestEmail = () => window.dispatchEvent(new Event('test-email-settings'))
  const handleReset = () => window.dispatchEvent(new Event('reset-email-settings'))

  const actions = (
    <div className="flex items-center gap-2">
      <button className="btn btn-primary btn-sm" onClick={handleSave}>{t('Save Changes')}</button>
      <button className="btn btn-glass btn-sm" onClick={handleTestEmail}>{t('Test Email')}</button>
      <button className="btn btn-danger btn-sm" onClick={handleReset}>{t('Reset Settings')}</button>
    </div>
  )

  return (
    <Layout title={t('Email Settings')} actions={actions}>
      <div className="p-4">
        <EmailSettings />
      </div>
    </Layout>
  )
}