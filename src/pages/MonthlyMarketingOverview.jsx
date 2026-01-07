import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, Line, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js'
import * as XLSX from 'xlsx'
import { RiFilePdfLine, RiFileExcelLine } from 'react-icons/ri'
import AdvancedDateFilter from '../components/AdvancedDateFilter'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend)

export default function MonthlyMarketingOverview() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n?.dir?.() === 'rtl'

  const [startDate, setStartDate] = useState('2025-11-01')
  const [endDate, setEndDate] = useState('2025-11-30')
  const [query, setQuery] = useState('')

  // Selected month data (example: November 2025)
  const monthLabel = 'November 2025'
  const monthMetrics = useMemo(() => ({
    spend: 1450,
    impressions: 98000,
    clicks: 2700,
    leads: 240,
    qualifiedPct: 42,
    revenue: 3100
  }), [])

  // Derived metrics
  const ctr = useMemo(() => (monthMetrics.impressions ? (monthMetrics.clicks / monthMetrics.impressions) * 100 : 0), [monthMetrics])
  const cpc = useMemo(() => (monthMetrics.clicks ? monthMetrics.spend / monthMetrics.clicks : 0), [monthMetrics])
  const cpl = useMemo(() => (monthMetrics.leads ? monthMetrics.spend / monthMetrics.leads : 0), [monthMetrics])
  const roi = useMemo(() => (monthMetrics.spend ? monthMetrics.revenue / monthMetrics.spend : 0), [monthMetrics])

  // MoM baseline (October 2025) for indicators
  const prevMonth = useMemo(() => ({ spend: 1320, revenue: 2800, leads: 210, impressions: 90000, clicks: 2500 }), [])

  // Platforms breakdown
  const platforms = useMemo(() => ([
    { platform: 'Facebook', spend: 580, leads: 120, revenue: 1860 },
    { platform: 'Google Ads', spend: 450, leads: 80, revenue: 720 },
    { platform: 'Instagram', spend: 420, leads: 40, revenue: 520 },
  ]), [])

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const tickColor = isDark ? '#e5e7eb' : '#374151'

  // Charts data
  const lineSpendRevenueData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      { label: t('Spend'), data: [320, 360, 370, 400], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.25)', tension: 0.3, fill: true },
      { label: t('Revenue'), data: [700, 760, 780, 860], borderColor: '#14b8a6', backgroundColor: 'rgba(20,184,166,0.25)', tension: 0.3, fill: true }
    ]
  }
  const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: tickColor } } }, scales: { x: { ticks: { color: tickColor }, grid: { display: false } }, y: { ticks: { color: tickColor }, grid: { display: false } } } }

  const leadsByPlatformData = {
    labels: platforms.map(p => p.platform),
    datasets: [
      { label: t('Leads'), data: platforms.map(p => p.leads), backgroundColor: ['#2563eb', '#06b6d4', '#22c55e'], borderRadius: 6 }
    ]
  }
  const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: tickColor } } }, scales: { x: { ticks: { color: tickColor }, grid: { display: false } }, y: { ticks: { color: tickColor }, grid: { display: false } } } }

  const spendDistributionData = {
    labels: platforms.map(p => p.platform),
    datasets: [{
      label: t('Spend'),
      data: platforms.map(p => p.spend),
      backgroundColor: ['#2563eb', '#06b6d4', '#22c55e'],
      borderColor: isDark ? '#1f2937' : '#ffffff',
      borderWidth: 1
    }]
  }
  const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: tickColor } } } }

  const exportExcel = () => {
    const summary = [{
      Month: monthLabel,
      Spend: monthMetrics.spend,
      Impressions: monthMetrics.impressions,
      Clicks: monthMetrics.clicks,
      CTR: `${ctr.toFixed(1)}%`,
      AvgCPC: `${cpc.toFixed(2)} EGP`,
      Leads: monthMetrics.leads,
      AvgCPL: `${cpl.toFixed(2)} EGP`,
      QualifiedPct: `${monthMetrics.qualifiedPct}%`,
      Revenue: monthMetrics.revenue,
      ROI: `${roi.toFixed(1)}x`
    }]
    const ws = XLSX.utils.json_to_sheet(summary)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'MonthlyOverview')
    XLSX.writeFile(wb, 'monthly-marketing-overview.xlsx')
  }

  const exportPdf = () => {
    const html = document.getElementById('report-root')?.innerHTML || ''
    const win = window.open('', 'PRINT', 'height=800,width=1000')
    if (!win) return
    win.document.write(`<html><head><title>${t('Monthly Marketing Overview')}</title></head><body>${html}</body></html>`) 
    win.document.close(); win.focus();
    win.print();
  }

  return (
      <div id="report-root" className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t('Monthly Marketing Overview')}</h1>
          <div className={`flex items-center gap-2`}>
            <button
              onClick={exportPdf}
              aria-label={t('Export PDF')}
              className="group inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--panel-border)] bg-[var(--dropdown-bg)] hover:bg-[var(--dropdown-bg)]/80 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:focus-visible:ring-indigo-300"
            >
              <RiFilePdfLine className="text-red-500" />
              <span className="font-medium">{t('Export PDF')}</span>
            </button>
            <button
              onClick={exportExcel}
              aria-label={t('Export Excel')}
              className="group inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--panel-border)] bg-[var(--dropdown-bg)] hover:bg-[var(--dropdown-bg)]/80 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:focus-visible:ring-emerald-300"
            >
              <RiFileExcelLine className="text-emerald-500" />
              <span className="font-medium">{t('Export Excel')}</span>
            </button>
          </div>
        </div>

        {/* صف فاضي تحت العنوان */}
        <div className="h-6" aria-hidden="true" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="px-3 py-2 rounded-lg border bg-[var(--dropdown-bg)]">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('Search by Campaign or Source')} className="bg-transparent outline-none text-sm w-full" />
          </div>
        </div>

        {/* صف فاضي تحت صف الفلاتر */}
        <div className="h-6" aria-hidden="true" />

        {/* فلتر تاريخ متقدّم */}
        <AdvancedDateFilter
          startDate={startDate}
          endDate={endDate}
          onChange={({ startDate: s, endDate: e }) => { setStartDate(s); setEndDate(e) }}
        />

        {/* عرض نطاق التاريخ المختار */}
        <div className="mt-3 px-3 py-2 rounded-lg border bg-[var(--dropdown-bg)]">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="opacity-70">{t('Date Range')}:</span>
            <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">{startDate}</span>
            <span className="opacity-60">—</span>
            <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">{endDate}</span>
          </div>
        </div>

        {/* Summary table */}
        <section className="glass-panel p-4">
          <div className={`flex items-center gap-2 mb-3`}>
            <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
            <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold`}>{t('Monthly Summary')}</h3>
          </div>
          <div>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              <div className="card glass-card p-4 space-y-3 bg-white/5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h4 className="font-semibold text-sm">{monthLabel}</h4>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--muted-text)] text-xs">💰 {t('Total Spend')}</span>
                    <span className="text-xs font-medium">{monthMetrics.spend.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--muted-text)] text-xs">👀 {t('Impressions')}</span>
                    <span className="text-xs">{monthMetrics.impressions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--muted-text)] text-xs">{t('Clicks')} / {t('CTR')}</span>
                    <span className="text-xs">{monthMetrics.clicks.toLocaleString()} / {ctr.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--muted-text)] text-xs">{t('Avg. CPC')}</span>
                    <span className="text-xs">{cpc.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--muted-text)] text-xs">{t('Leads')}</span>
                    <span className="text-xs font-medium">{monthMetrics.leads.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--muted-text)] text-xs">{t('Avg. CPL')}</span>
                    <span className="text-xs">{cpl.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--muted-text)] text-xs">{t('Qualified Leads %')}</span>
                    <span className="text-xs">{monthMetrics.qualifiedPct}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--muted-text)] text-xs">💵 {t('Revenue')}</span>
                    <span className="text-xs font-medium">{monthMetrics.revenue.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between items-center col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">
                    <span className="text-[var(--muted-text)] text-xs font-medium">{t('ROI')}</span>
                    <span className="text-sm font-bold text-green-400">{roi.toFixed(1)}x</span>
                  </div>
                </div>
                <div className="text-xs text-[var(--muted-text)] mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {t('Month-over-Month')}: {t('Spend')} {monthMetrics.spend >= prevMonth.spend ? '↑' : '↓'} {Math.abs(monthMetrics.spend - prevMonth.spend)} EGP, {t('Revenue')} {monthMetrics.revenue >= prevMonth.revenue ? '↑' : '↓'} {Math.abs(monthMetrics.revenue - prevMonth.revenue)} EGP, {t('Leads')} {monthMetrics.leads >= prevMonth.leads ? '↑' : '↓'} {Math.abs(monthMetrics.leads - prevMonth.leads)}
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="text-left opacity-70">
                    <th className="px-4 py-2">{t('Month')}</th>
                    <th className="px-4 py-2">💰 {t('Total Spend')}</th>
                    <th className="px-4 py-2">👀 {t('Impressions')}</th>
                    <th className="px-4 py-2">{t('Clicks')} / {t('CTR')}</th>
                    <th className="px-4 py-2">{t('Avg. CPC')}</th>
                    <th className="px-4 py-2">{t('Leads')}</th>
                    <th className="px-4 py-2">{t('Avg. CPL')}</th>
                    <th className="px-4 py-2">{t('Qualified Leads %')}</th>
                    <th className="px-4 py-2">💵 {t('Revenue')}</th>
                    <th className="px-4 py-2">{t('ROI')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-medium">{monthLabel}</td>
                    <td className="px-4 py-2">{monthMetrics.spend.toLocaleString()} EGP</td>
                    <td className="px-4 py-2">{monthMetrics.impressions.toLocaleString()}</td>
                    <td className="px-4 py-2">{monthMetrics.clicks.toLocaleString()} / {ctr.toFixed(1)}%</td>
                    <td className="px-4 py-2">{cpc.toFixed(2)} EGP</td>
                    <td className="px-4 py-2">{monthMetrics.leads.toLocaleString()}</td>
                    <td className="px-4 py-2">{cpl.toFixed(2)} EGP</td>
                    <td className="px-4 py-2">{monthMetrics.qualifiedPct}%</td>
                    <td className="px-4 py-2">{monthMetrics.revenue.toLocaleString()} EGP</td>
                    <td className="px-4 py-2">{roi.toFixed(1)}x</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t text-xs text-[var(--muted-text)]">
                    <td className="px-4 py-2" colSpan={10}>
                      {t('Month-over-Month')}: {t('Spend')} {monthMetrics.spend >= prevMonth.spend ? '↑' : '↓'} {Math.abs(monthMetrics.spend - prevMonth.spend)} EGP, {t('Revenue')} {monthMetrics.revenue >= prevMonth.revenue ? '↑' : '↓'} {Math.abs(monthMetrics.revenue - prevMonth.revenue)} EGP, {t('Leads')} {monthMetrics.leads >= prevMonth.leads ? '↑' : '↓'} {Math.abs(monthMetrics.leads - prevMonth.leads)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        {/* صف فاضي تحت جدول الملخص */}
        <div className="h-6" aria-hidden="true" />

        {/* Charts grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <section className="glass-panel p-4 md:col-span-2">
            <div className={`flex items-center gap-2 mb-3`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold`}>{t('Spend vs Revenue Trend')}</h3>
            </div>
            <div style={{ height: '280px' }}>
              <Line data={lineSpendRevenueData} options={lineOptions} />
            </div>
            <div className="mt-3 text-xs text-[var(--muted-text)]">{t('November Weekly')}</div>
          </section>
          <section className="glass-panel p-4">
            <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold`}>{t('Leads by Platform')}</h3>
            </div>
            <div style={{ height: '280px' }}>
              <Bar data={leadsByPlatformData} options={barOptions} />
            </div>
            <div className="mt-3 text-xs text-[var(--muted-text)]">{t('Platform Contribution')}</div>
          </section>
        </div>

        {/* صف فاضي تحت شبكة الرسوم الأولى */}
        <div className="h-6" aria-hidden="true" />

        <section className="glass-panel p-4">
          <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
            <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold`}>{t('Spend Distribution by Platform')}</h3>
          </div>
          <div style={{ height: '280px' }}>
            <Pie data={spendDistributionData} options={pieOptions} />
          </div>
        </section>

        {/* صف فاضي تحت رسم توزيع الإنفاق */}
        <div className="h-6" aria-hidden="true" />

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <section className="glass-panel p-4">
            <div className={`flex items-center gap-2 mb-2`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold`}>📈 {t('Best Growth Area')}</h3>
            </div>
            <div className="text-sm">
              {t('Revenue growth vs last month')}: +{(monthMetrics.revenue - prevMonth.revenue).toLocaleString()} EGP
            </div>
          </section>
          <section className="glass-panel p-4">
            <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold`}>⚠️ {t('Needs Improvement')}</h3>
            </div>
            <div className="text-sm">
              {t('Optimize CPC and CTR on lower-performing platforms')} ({platforms[2].platform})
            </div>
          </section>
          <section className="glass-panel p-4">
            <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold`}>🎯 {t('Recommendation')}</h3>
            </div>
            <div className="text-sm">
              {t('Increase budget for high-ROI platform')}: {platforms[0].platform}
            </div>
          </section>
        </div>
      </div>
  )
}
