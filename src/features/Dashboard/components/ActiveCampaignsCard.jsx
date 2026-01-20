import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PieChart } from '@shared/components/PieChart'
import { useTheme } from '@shared/context/ThemeProvider'

export default function ActiveCampaignsCard({ segments, employee, dateFrom, dateTo }) {
  const { t, i18n } = useTranslation()
  const [showPaused, setShowPaused] = useState(true)
  const lang = i18n.language || 'en'
  const isRTL = lang === 'ar'
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const campaigns = [
    { name: lang === 'ar' ? 'حملة الصيف' : 'Summer Promo', status: 'onTrack', owner: 'Osama Sales', lastActivity: '2025-01-10', openRate: 32, clickRate: 4.1, conversionRate: 5.2 },
    { name: lang === 'ar' ? 'استرجاع العملاء' : 'Winback Series', status: 'atRisk', owner: 'Youssef Hemeda', lastActivity: '2025-01-08', openRate: 18, clickRate: 2.3, conversionRate: 2.1 },
    { name: lang === 'ar' ? 'إطلاق المنتج' : 'Product Launch', status: 'paused', owner: 'Ahmed Ibrahim', lastActivity: '2025-01-06', openRate: 0, clickRate: 0, conversionRate: 0 },
    { name: lang === 'ar' ? 'توسيع السوق' : 'Market Expansion', status: 'onTrack', owner: 'Ahmed Ibrahim', lastActivity: '2025-01-05', openRate: 25, clickRate: 3.2, conversionRate: 4.0 },
    { name: lang === 'ar' ? 'حملة ترقية' : 'Upgrade Drive', status: 'atRisk', owner: 'Osama Sales', lastActivity: '2025-01-03', openRate: 14, clickRate: 1.8, conversionRate: 1.5 }
  ]

  const inDateRange = (iso) => {
    if (!dateFrom && !dateTo) return true
    const d = new Date(iso)
    if (isNaN(d)) return true
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (dateFrom) {
      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      if (day < from) return false
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(0, 0, 0, 0)
      if (day > to) return false
    }
    return true
  }

  const filteredCampaigns = campaigns.filter(c => (!employee || c.owner === employee) && inDateRange(c.lastActivity))

  const segCounts = {
    onTrack: filteredCampaigns.filter(c => c.status === 'onTrack').length,
    atRisk: filteredCampaigns.filter(c => c.status === 'atRisk').length,
    paused: filteredCampaigns.filter(c => c.status === 'paused').length
  }

  const totalActive = segCounts.onTrack + segCounts.atRisk
  const total = filteredCampaigns.length
  
  // Percentages for the Chart (Mutually Exclusive)
  const onTrackPct = total ? Math.round((segCounts.onTrack / total) * 100) : 0
  const atRiskPct = total ? Math.round((segCounts.atRisk / total) * 100) : 0
  const pausedPct = total ? Math.round((segCounts.paused / total) * 100) : 0
  
  // Total Active Percentage for the Top Card (Includes both On Track & At Risk)
  const totalActivePct = total ? Math.round((totalActive / total) * 100) : 0

  const allSegments = [
    { label: `${t('Active')} (${t('On Track')})`, value: segCounts.onTrack, color: '#22c55e' },
    { label: `${t('Active')} (${t('At Risk')})`, value: segCounts.atRisk, color: '#f59e0b' },
    { label: t('Paused'), value: segCounts.paused, color: '#ef4444' }
  ]

  const displaySegments = showPaused ? allSegments : allSegments.filter((s) => s.label !== t('Paused'))

  const activeTop = filteredCampaigns.filter(c => c.status !== 'paused')
  const avgOpenRate = activeTop.length ? Math.round(activeTop.reduce((a, c) => a + c.openRate, 0) / activeTop.length) : 0
  const avgClickRate = activeTop.length ? Number((activeTop.reduce((a, c) => a + c.clickRate, 0) / activeTop.length).toFixed(1)) : 0
  const avgConversionRate = activeTop.length ? Number((activeTop.reduce((a, c) => a + c.conversionRate, 0) / activeTop.length).toFixed(1)) : 0

  const statusColor = (s) => {
    if (s === 'onTrack') return 'bg-emerald-500'
    if (s === 'atRisk') return 'bg-amber-500'
    return 'bg-red-500'
  }

  const statusLabel = (s) => {
    if (s === 'onTrack') return t('On Track')
    if (s === 'atRisk') return t('At Risk')
    return t('Paused')
  }

  const statusBadgeClass = (s) => {
    if (isLight) {
      if (s === 'onTrack') return 'bg-emerald-200 text-emerald-800 border border-emerald-300'
      if (s === 'atRisk') return 'bg-amber-200 text-amber-800 border border-amber-300'
      return 'bg-red-200 text-red-800 border border-red-300'
    }
    if (s === 'onTrack') return 'bg-emerald-900/30 text-emerald-300'
    if (s === 'atRisk') return 'bg-amber-900/30 text-amber-300'
    return 'bg-red-900/30 text-red-300'
  }

  const fmtDate = (s) => {
    try {
      return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(s))
    } catch {
      return s
    }
  }
  const periodLabel = (!dateFrom && !dateTo)
    ? t('Last 30 Days')
    : (dateFrom && dateTo)
      ? (lang === 'ar' ? `من ${fmtDate(dateFrom)} إلى ${fmtDate(dateTo)}` : `From ${fmtDate(dateFrom)} To ${fmtDate(dateTo)}`)
      : (dateFrom)
        ? (lang === 'ar' ? `من ${fmtDate(dateFrom)}` : `From ${fmtDate(dateFrom)}`)
        : (lang === 'ar' ? `إلى ${fmtDate(dateTo)}` : `To ${fmtDate(dateTo)}`)

  const SCROLLBAR_CSS = `
    .scrollbar-thin-blue { scrollbar-width: thin; scrollbar-color: #2563eb transparent; }
    .scrollbar-thin-blue::-webkit-scrollbar { height: 6px; }
    .scrollbar-thin-blue::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin-blue::-webkit-scrollbar-thumb { background-color: #2563eb; border-radius: 9999px; }
    .scrollbar-thin-blue:hover::-webkit-scrollbar-thumb { background-color: #1d4ed8; }
  `

  return (
    <div className="h-full flex flex-col">
      <div dir={i18n.dir() === 'rtl' ? 'rtl' : 'ltr'} className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className={`flex items-center w-full ${i18n.dir() === 'rtl' ? 'flex-row-reverse' : ''} gap-2`}>
          <h3 className={`flex-1 ${isLight ? 'text-black' : 'dark:text-gray-100'} text-lg md:text-xl font-bold ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}>{t('Active Campaigns')}</h3>
        </div>
        <span className={`${isLight ? 'text-blue-700 font-bold' : 'dark:text-blue-200'} text-sm`}>{periodLabel}</span>
      </div>

      {/* Performance metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 shrink-0">
        <div className={`${isLight ? 'p-4 rounded-xl bg-[var(--lm-muted-surface)] border border-[var(--lm-border)] shadow-md' : 'p-3 rounded-lg dark:bg-blue-900'}`}>
          <div className={isLight ? 'text-sm font-medium text-black' : 'text-xs text-gray-600 dark:text-gray-300'}>{`${t('Active')} (${t('On Track')})`}</div>
          <div className={isLight ? 'text-2xl font-bold text-black' : 'text-lg font-semibold dark:text-gray-100'}>{onTrackPct}%</div>
        </div>
        <div className={`${isLight ? 'p-4 rounded-xl bg-[var(--lm-muted-surface)] border border-[var(--lm-border)] shadow-md' : 'p-3 rounded-lg dark:bg-blue-900'}`}>
          <div className={isLight ? 'text-sm font-medium text-black' : 'text-xs text-gray-600 dark:text-gray-300'}>{`${t('Active')} (${t('At Risk')})`}</div>
          <div className={isLight ? 'text-2xl font-bold text-black' : 'text-lg font-semibold dark:text-gray-100'}>{atRiskPct}%</div>
        </div>
        <div className={`${isLight ? 'p-4 rounded-xl bg-[var(--lm-muted-surface)] border border-[var(--lm-border)] shadow-md' : 'p-3 rounded-lg dark:bg-blue-900'}`}>
          <div className={isLight ? 'text-sm font-medium text-black' : 'text-xs text-gray-600 dark:text-gray-300'}>{t('Paused')}</div>
          <div className={isLight ? 'text-2xl font-bold text-black' : 'text-lg font-semibold dark:text-gray-100'}>{pausedPct}%</div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 md:gap-4 shrink-0">
        <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-start gap-3 md:gap-4 w-full`}>
          <div className="shrink-0 self-start">
            <PieChart
              segments={displaySegments}
              centerValue={totalActive}
              centerLabel={t('Total Active')}
              size={125}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className={`${isLight ? 'text-black' : 'dark:text-gray-100'} text-sm font-semibold`}>{t('Active Campaigns Overview')}</h4>
              <button
                type="button"
                onClick={() => setShowPaused(v => !v)}
                className={`${isLight ? 'btn-reset text-xs px-2 py-1' : 'text-xs px-2 py-1 rounded border border-blue-700 text-gray-200 hover:bg-blue-800'}`}
              >
                {showPaused ? t('Hide Paused') : t('Show Paused')}
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {displaySegments.map((seg, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className={`${isLight ? 'text-sm text-black' : 'text-sm dark:text-gray-300'}`}>{seg.label}</span>
                  <span className={`${isLight ? 'text-sm font-medium text-black' : 'text-sm font-medium dark:text-gray-100'}`}>{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full flex-1 min-h-0">
          <h4 className={`${isLight ? 'text-black' : 'dark:text-gray-100'} text-sm font-semibold mt-3`}>{t('Top Campaigns')}</h4>
          <style>{SCROLLBAR_CSS}</style>
          <div className="flex flex-row flex-nowrap gap-3 w-full h-full items-stretch overflow-x-auto overflow-y-hidden pr-1 snap-x snap-mandatory scrollbar-thin-blue">
            {filteredCampaigns.map((c, idx) => (
              <div key={idx} className={`${isLight ? 'flex flex-col p-3 rounded-xl bg-white border border-[var(--lm-border)] shadow-sm hover:shadow-md' : 'flex flex-col p-3 rounded-xl border dark:border-blue-700 bg-transparent dark:bg-transparent shadow-sm hover:shadow-md'} transition-shadow duration-200 h-full min-h-[120px] flex-shrink-0 w-fit max-w-[200px] md:max-w-[220px] snap-start`}>
                <div className="flex flex-col items-start gap-1 min-w-0">
                  <div className="inline-flex items-center gap-2 min-w-0">
                    <span className={`inline-block w-3 h-3 rounded-full ${statusColor(c.status)}`} />
                  <span className={`${isLight ? 'text-sm font-medium text-gray-900' : 'text-sm font-medium dark:text-gray-200'} whitespace-normal break-words`}>{c.name}</span>
                </div>
                <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeClass(c.status)}`}>{statusLabel(c.status)}</span>
                <span className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{t('Created By')}: {c.owner}</span>
              </div>
                <div className={`${isLight ? 'mt-2 flex flex-col gap-1 text-xs md:text-sm text-gray-800' : 'mt-2 flex flex-col gap-1 text-xs md:text-sm text-[var(--muted-text)]'}`}>
                  <div className={isLight ? 'text-black' : ''}>{t('Open Rate')}: {c.openRate}%</div>
                  <div className={isLight ? 'text-black' : ''}>{t('Click Rate')}: {c.clickRate}%</div>
                  <div className={isLight ? 'text-black' : ''}>{t('Conversion Rate')}: {c.conversionRate}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
