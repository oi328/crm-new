import React from 'react'
import { useTranslation } from 'react-i18next'

export default function MarketingReports() {
  const { t } = useTranslation()
  return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">{t('Reports')}</h1>
        <div className="card p-4">
          <p className="text-sm text-[var(--muted-text)]">Marketing reports and analytics</p>
        </div>
      </div>
  )
}
