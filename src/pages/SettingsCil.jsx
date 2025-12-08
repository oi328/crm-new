import React from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import CILSettingsModal from '../components/settings/CILSettingsModal'

export default function SettingsCil() {
  const { t } = useTranslation()
  return (
    <Layout title={t('CIL Settings')}>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{t('CIL Settings')}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{t('Configure CIL-specific options and integrations.')}</p>
        <CILSettingsModal inline />
      </div>
    </Layout>
  )
}