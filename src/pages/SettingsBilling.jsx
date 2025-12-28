import { useTranslation } from 'react-i18next'
import Layout from '@shared/layouts/Layout'
import BillingSettings from '../components/settings/BillingSettings'

export default function SettingsBilling() {
  const { t } = useTranslation()
  return (
    <Layout>
      <div className="p-6 bg-[var(--content-bg)] text-[var(--content-text)] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {t('Billing & Subscription')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700">
              Add New Subscription
            </button>
            <button className="p-2 rounded-lg border bg-white/60 dark:bg-gray-800/60 hover:bg-white">
              🔔
            </button>
            <button className="p-2 rounded-lg border bg-white/60 dark:bg-gray-800/60 hover:bg-white">
              💳
            </button>
          </div>
        </div>
        <BillingSettings />
      </div>
    </Layout>
  )
}