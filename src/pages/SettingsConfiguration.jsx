import React from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import ConfigurationManager from '../components/settings/ConfigurationManager'

export default function SettingsConfiguration() {
  const { t } = useTranslation()
  return (
    <Layout title={t('Configuration')}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('Configuration')}</h2>
          <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">{t('Admin Only')}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {t('Central hub to manage all system and module settings.')}
        </p>

        <ConfigurationManager />
      </div>
    </Layout>
  )
}