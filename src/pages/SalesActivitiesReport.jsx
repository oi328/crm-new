import React, { useMemo, useState } from 'react'
// Layout removed per app-level layout usage
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { PieChart } from '@shared/components/PieChart'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function SalesActivitiesReport() {
  const { t, i18n } = useTranslation()
  const isRTL = (i18n?.language || '').toLowerCase().startsWith('ar')

  // Sample dashboard dataset per salesperson
  const raw = [
    {
      name: 'Ahmed Ali',
      calls: 45,
      actions: 30,
      delayed: 3,
      stages: { lead: 10, qualified: 12, proposal: 0, closed: 8 },
      revenue: 82000,
      target: 100000
    },
    {
      name: 'Sara Hassan',
      calls: 58,
      actions: 40,
      delayed: 1,
      stages: { lead: 14, qualified: 18, proposal: 0, closed: 8 },
      revenue: 105000,
      target: 100000
    },
    {
      name: 'Omar Mostafa',
      calls: 32,
      actions: 22,
      delayed: 5,
      stages: { lead: 8, qualified: 9, proposal: 3, closed: 2 },
      revenue: 54000,
      target: 90000
    },
    {
      name: 'Mona Adel',
      calls: 40,
      actions: 27,
      delayed: 2,
      stages: { lead: 12, qualified: 10, proposal: 4, closed: 6 },
      revenue: 76000,
      target: 110000
    }
  ]

  const [salesperson, setSalesperson] = useState('all')
  const [period, setPeriod] = useState('month') // 'day' | 'week' | 'month'

  const filtered = useMemo(() => {
    return salesperson === 'all' ? raw : raw.filter(r => r.name === salesperson)
  }, [salesperson])

  const totals = useMemo(() => {
    const calls = filtered.reduce((s, r) => s + r.calls, 0)
    const actions = filtered.reduce((s, r) => s + r.actions, 0)
    const delayed = filtered.reduce((s, r) => s + r.delayed, 0)
    const revenue = filtered.reduce((s, r) => s + r.revenue, 0)
    const target = filtered.reduce((s, r) => s + r.target, 0)
    const avgPct = filtered.length
      ? Math.round((filtered.reduce((s, r) => s + (r.revenue / r.target) * 100, 0) / filtered.length))
      : 0
    return { calls, actions, delayed, revenue, target, avgPct }
  }, [filtered])

  const stageSegments = useMemo(() => {
    const agg = filtered.reduce(
      (acc, r) => {
        acc.lead += r.stages.lead
        acc.qualified += r.stages.qualified
        acc.proposal += r.stages.proposal
        acc.closed += r.stages.closed
        return acc
      },
      { lead: 0, qualified: 0, proposal: 0, closed: 0 }
    )
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    return [
      { label: t('Lead'), value: agg.lead, color: '#3b82f6' },
      { label: t('Qualified'), value: agg.qualified, color: '#22c55e' },
      { label: t('Proposal'), value: agg.proposal, color: isDark ? '#f59e0b' : '#f59e0b' },
      { label: t('Closed'), value: agg.closed, color: '#8b5cf6' }
    ]
  }, [filtered, t])

  const tickColor = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    ? '#e5e7eb'
    : '#374151'

  const callsActionsBarData = {
    labels: filtered.map(r => r.name),
    datasets: [
      {
        label: t('Calls'),
        data: filtered.map(r => r.calls),
        backgroundColor: '#2563eb',
        borderRadius: 6,
        barThickness: 24
      },
      {
        label: t('Actions'),
        data: filtered.map(r => r.actions),
        backgroundColor: '#22c55e',
        borderRadius: 6,
        barThickness: 24
      }
    ]
  }

  const callsActionsBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12 }, color: tickColor } },
      y: { grid: { display: false }, ticks: { font: { size: 12 }, color: tickColor } }
    },
    plugins: { legend: { display: true } }
  }

  const achievementColor = (pct) => {
    if (pct >= 90) return 'bg-emerald-500'
    if (pct >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const exportExcel = () => {
    const rows = filtered.map(r => ({
      Salesperson: r.name,
      Calls: r.calls,
      Actions: r.actions,
      Delayed: r.delayed,
      Lead: r.stages.lead,
      Qualified: r.stages.qualified,
      Proposal: r.stages.proposal,
      Closed: r.stages.closed,
      RevenueAchieved: r.revenue,
      TargetPercent: Math.round((r.revenue / r.target) * 100)
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'SalesActivities')
    XLSX.writeFile(wb, 'sales-activities-dashboard.xlsx')
  }

  const exportPdf = () => {
    // Uses browser print dialog; users can select "Save as PDF"
    window.print()
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t('Sales Activities')}</h1>
        </div>
        <div className="h-2" aria-hidden="true"></div>
        {/* Export Actions */}
        <div className="flex justify-end">
          <div className="flex gap-2">
            <button
              onClick={exportPdf}
              className="btn btn-primary"
            >
              {t('Download PDF')}
            </button>
            <button
              onClick={exportExcel}
              className="btn btn-secondary"
            >
              {t('Download Excel')}
            </button>
          </div>
        </div>
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('Salesperson')}</label>
              <select
                value={salesperson}
                onChange={(e) => setSalesperson(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              >
                <option value="all">{t('All')}</option>
                {raw.map(r => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('Date Range')}</label>
              <div className="flex gap-2">
                {['day','week','month'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-2 rounded-md border text-sm ${period === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700'}`}
                  >
                    {t(p.charAt(0).toUpperCase() + p.slice(1))}
                  </button>
                ))}
              </div>
            </div>
            
          </div>
        </div>
        <div className="h-4" aria-hidden="true"></div>

        {/* Total Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t('Total Calls'), value: totals.calls, accent: 'bg-blue-500' },
            { label: t('Total Actions'), value: totals.actions, accent: 'bg-emerald-500' },
            { label: t('Total Revenue'), value: `${totals.revenue.toLocaleString()} EGP`, accent: 'bg-purple-500' },
            { label: t('Average Achievement %'), value: `${totals.avgPct}%`, accent: 'bg-indigo-500' }
          ].map((k) => (
            <div key={k.label} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <span className={`inline-block w-2 h-6 rounded ${k.accent}`} />
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">{k.label}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{k.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-4" aria-hidden="true"></div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}> 
                <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
                <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold text-gray-900 dark:text-gray-100`}>{t('Calls & Actions')}</h3>
              </div>
              <span className="text-xs text-[var(--muted-text)]">{t('Per Salesperson')}</span>
            </div>
            <div style={{ height: '260px' }}>
              <Bar data={callsActionsBarData} options={callsActionsBarOptions} />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}> 
                <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
                <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold text-gray-900 dark:text-gray-100`}>{t('Actions by Stage')}</h3>
              </div>
            </div>
            <PieChart segments={stageSegments} size={180} centerLabel={t('Stages')} />
          </div>
        </div>
        <div className="h-4" aria-hidden="true"></div>

        {/* Table */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  {[
                    t('Salesperson'), t('Calls'), t('Actions'), t('Delayed'), t('Actions by Stage'), t('Revenue Achieved'), t('Target %')
                  ].map((h, idx) => (
                    <th key={idx} className="px-3 py-2 text-gray-700 dark:text-gray-200 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const pct = Math.round((r.revenue / r.target) * 100)
                  return (
                    <React.Fragment key={r.name}>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{r.name}</td>
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{r.calls}</td>
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{r.actions}</td>
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{r.delayed}</td>
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                          {`${r.stages.lead} ${t('Lead')} / ${r.stages.qualified} ${t('Qualified')} / ${r.stages.closed} ${t('Closed')}`}
                        </td>
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{`${r.revenue.toLocaleString()} EGP`}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div className={`h-2 ${achievementColor(pct)}`} style={{ width: `${Math.min(100, pct)}%` }} />
                            </div>
                            <span className="text-xs text-gray-700 dark:text-gray-200 w-10 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                      {idx !== filtered.length - 1 && (
                        <tr>
                          <td colSpan={7} className="py-2"></td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
