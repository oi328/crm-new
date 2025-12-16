import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { PieChart } from '@shared/components/PieChart'
import { FunnelChart } from '../components/FunnelChart'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { useStages } from '../hooks/useStages'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

// Stages will be loaded dynamically from Settings via useStages

export default function LeadsPipelineReport() {
  const { t, i18n } = useTranslation()
  const { stages } = useStages()

  // Sample leads dataset matching requested layout
  const leads = [
    { name: 'ABC Pharma', stage: 'Qualified', expectedValue: 25000, salesperson: 'Ahmed Ali', dateCreated: '2025-11-02', expectedClose: '2025-12-10', status: 'Active' },
    { name: 'Delta Med', stage: 'Proposal', expectedValue: 42000, salesperson: 'Sara Hassan', dateCreated: '2025-11-04', expectedClose: '2025-12-15', status: 'Pending' },
    { name: 'Green Labs', stage: 'Negotiation', expectedValue: 33000, salesperson: 'Omar Tarek', dateCreated: '2025-11-06', expectedClose: '2025-12-22', status: 'Active' },
    { name: 'Sun Health', stage: 'Contacted', expectedValue: 18000, salesperson: 'Ahmed Ali', dateCreated: '2025-11-07', expectedClose: '2025-12-05', status: 'Active' },
    { name: 'Medix Co.', stage: 'New', expectedValue: 15000, salesperson: 'Mona Adel', dateCreated: '2025-11-05', expectedClose: '2025-12-01', status: 'Active' },
    { name: 'BioCure', stage: 'Closed Won', expectedValue: 70000, salesperson: 'Sara Hassan', dateCreated: '2025-10-28', expectedClose: '2025-11-08', status: 'Closed' },
    { name: 'LifeChem', stage: 'Closed Lost', expectedValue: 12000, salesperson: 'Omar Tarek', dateCreated: '2025-10-26', expectedClose: '2025-11-03', status: 'Lost' },
    { name: 'CarePlus', stage: 'Proposal', expectedValue: 38000, salesperson: 'Mona Adel', dateCreated: '2025-11-03', expectedClose: '2025-12-18', status: 'Pending' },
    { name: 'HealRight', stage: 'Qualified', expectedValue: 26000, salesperson: 'Ahmed Ali', dateCreated: '2025-11-01', expectedClose: '2025-12-12', status: 'Active' },
    { name: 'NovaMed', stage: 'Negotiation', expectedValue: 45000, salesperson: 'Sara Hassan', dateCreated: '2025-11-02', expectedClose: '2025-12-20', status: 'Active' }
  ]

  const salespeople = useMemo(() => Array.from(new Set(leads.map(l => l.salesperson))), [])
  const [salesperson, setSalesperson] = useState('all')
  const [dateType, setDateType] = useState('created') // 'created' | 'expectedClose'
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchSales = salesperson === 'all' || l.salesperson === salesperson
      const field = dateType === 'created' ? l.dateCreated : l.expectedClose
      const d = new Date(field)
      const afterFrom = from ? d >= new Date(from) : true
      const beforeTo = to ? d <= new Date(to) : true
      return matchSales && afterFrom && beforeTo
    })
  }, [salesperson, dateType, from, to])

  const totals = useMemo(() => {
    const totalLeads = filtered.length
    const totalExpected = filtered.reduce((s, l) => s + l.expectedValue, 0)
    return { totalLeads, totalExpected }
  }, [filtered])

  const normalize = (s) => String(s || '').trim().toLowerCase()
  const stageCounts = useMemo(() => {
    const map = Object.fromEntries((stages || []).map(s => [normalize(s.name), 0]))
    filtered.forEach(l => {
      const key = normalize(l.stage)
      if (key in map) map[key] = (map[key] || 0) + 1
    })
    return map
  }, [filtered, stages])

  const stageValues = useMemo(() => {
    const map = Object.fromEntries((stages || []).map(s => [normalize(s.name), 0]))
    filtered.forEach(l => {
      const key = normalize(l.stage)
      if (key in map) map[key] = (map[key] || 0) + l.expectedValue
    })
    return map
  }, [filtered, stages])

  const pieBySalesperson = useMemo(() => {
    const agg = {}
    filtered.forEach(l => { agg[l.salesperson] = (agg[l.salesperson] || 0) + 1 })
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    const palette = ['#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ef4444','#10b981','#6366f1']
    return Object.entries(agg).map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }))
  }, [filtered])

  const tickColor = typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'

  const barLabels = (stages || []).map(s => s.name)
  const barByStageValueData = {
    labels: barLabels,
    datasets: [{ label: t('Total Expected Value'), data: (stages || []).map(s => stageValues[normalize(s.name)]), backgroundColor: '#2563eb', borderRadius: 6, barThickness: 24 }]
  }
  const barOptions = { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false }, ticks: { color: tickColor } }, y: { grid: { display: false }, ticks: { color: tickColor } } }, plugins: { legend: { display: true } } }

  const stageColor = (stage) => {
    const def = (stages || []).find(s => normalize(s.name) === normalize(stage))
    return def?.color || '#3b82f6'
  }

  const exportExcel = () => {
    const rows = filtered.map(l => ({
      LeadName: l.name,
      SalesStage: l.stage,
      ExpectedValueEGP: l.expectedValue,
      Salesperson: l.salesperson,
      DateCreated: l.dateCreated,
      ExpectedClosing: l.expectedClose,
      Status: l.status
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'LeadsPipeline')
    XLSX.writeFile(wb, 'leads-pipeline-dashboard.xlsx')
  }

  const exportPdf = () => window.print()
  const getStageDef = (stage) => (stages || []).find(s => normalize(s.name) === normalize(stage))

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t('Leads pipeline')}</h1>
        </div>
        <div className="h-2" aria-hidden="true"></div>
        {/* Export */}
        <div className="flex justify-end">
          <div className="flex gap-2">
            <button onClick={exportPdf} className="btn btn-primary">{t('Download PDF')}</button>
            <button onClick={exportExcel} className="btn btn-secondary">{t('Download Excel')}</button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('Salesperson')}</label>
              <select value={salesperson} onChange={(e) => setSalesperson(e.target.value)} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                <option value="all">{t('All')}</option>
                {salespeople.map(sp => <option key={sp} value={sp}>{sp}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('Date Type')}</label>
              <select value={dateType} onChange={(e) => setDateType(e.target.value)} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                <option value="created">{t('Created Date')}</option>
                <option value="expectedClose">{t('Expected Close Date')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('From')}</label>
              <input type="date" lang={(i18n?.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en'} dir={(i18n?.language || '').toLowerCase().startsWith('ar') ? 'rtl' : 'ltr'} placeholder={(i18n?.language || '').toLowerCase().startsWith('ar') ? 'اليوم/الشهر/السنة' : 'mm/dd/yyyy'} value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('To')}</label>
              <input type="date" lang={(i18n?.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en'} dir={(i18n?.language || '').toLowerCase().startsWith('ar') ? 'rtl' : 'ltr'} placeholder={(i18n?.language || '').toLowerCase().startsWith('ar') ? 'اليوم/الشهر/السنة' : 'mm/dd/yyyy'} value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
            </div>
          </div>
        </div>
        <div className="h-4" aria-hidden="true"></div>

        {/* Removed: Salesperson × Stage Heatmap */}

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ label: t('Total Leads'), value: totals.totalLeads, accent: 'bg-blue-500' }, { label: t('Total Expected Value'), value: `${totals.totalExpected.toLocaleString()} EGP`, accent: 'bg-emerald-500' }].map((k) => (
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

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel (stage counts) */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className={`flex items-center gap-2 mb-3 ${i18n?.dir?.() === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className={`${i18n?.dir?.() === 'rtl' ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <h3 className={`${i18n?.dir?.() === 'rtl' ? 'text-right' : ''} text-lg font-semibold text-gray-900 dark:text-gray-100`}>{t('Funnel by Stage')}</h3>
            </div>
            {(() => {
              const darken = (hex, amt = 40) => {
                try {
                  const h = hex.replace('#','')
                  const num = parseInt(h, 16)
                  let r = (num >> 16) & 0xff
                  let g = (num >> 8) & 0xff
                  let b = num & 0xff
                  r = Math.max(0, r - amt)
                  g = Math.max(0, g - amt)
                  b = Math.max(0, b - amt)
                  return `#${(r<<16 | g<<8 | b).toString(16).padStart(6,'0')}`
                } catch {
                  return hex
                }
              }
              const segments = (stages || []).map(s => ({
                label: t(s.nameAr || s.name),
                value: stageCounts[normalize(s.name)] || 0,
                colorStart: s.color || '#3b82f6',
                colorEnd: darken(s.color || '#3b82f6', 40),
                icon: s.icon,
              }))
              return (
                <FunnelChart
                  segments={segments}
                  width={460}
                  sliceHeight={34}
                  gap={12}
                  showConversions
                  formatValue={(v) => v.toLocaleString()}
                />
              )
            })()}
          </div>

          {/* Bar: total expected value by stage */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('Expected Value by Stage')}</h3>
            <div style={{ height: '260px' }}>
              <Bar data={barByStageValueData} options={barOptions} />
            </div>
          </div>

          {/* Pie: leads by salesperson */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('Leads by Salesperson')}</h3>
            <PieChart segments={pieBySalesperson} size={200} centerLabel={t('Leads')} />
          </div>
        </div>
        <div className="h-4" aria-hidden="true"></div>

        {/* Table */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="w-full overflow-x-auto">
            <table className="min-w-max table-fixed text-sm whitespace-nowrap">
              <thead className="bg-gray-100 dark:bg-gray-900/95" style={{ backgroundColor: 'var(--table-header-bg)' }}>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  {[t('Lead Name'), t('Sales Stage'), t('Expected Value'), t('Salesperson'), t('Date Created'), t('Status')].map((h, idx) => (
                    <th key={idx} className="px-3 py-2 text-gray-700 dark:text-gray-200 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, idx) => (
                  <React.Fragment key={`${l.name}-${idx}`}>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100 whitespace-nowrap">{l.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {(() => {
                          const def = getStageDef(l.stage)
                          const label = i18n.language === 'ar' ? (def?.nameAr || def?.name || l.stage) : (def?.name || l.stage)
                          const color = def?.color || stageColor(l.stage)
                          return (
                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: color }}>
                              {def?.icon && <span className="text-sm">{def.icon}</span>}
                              <span>{label}</span>
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100 whitespace-nowrap">{`${l.expectedValue.toLocaleString()} EGP`}</td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100 whitespace-nowrap">{l.salesperson}</td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100 whitespace-nowrap">{new Date(l.dateCreated).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100 whitespace-nowrap">{t(l.status)}</td>
                    </tr>
                    {idx !== filtered.length - 1 && (
                      <tr>
                        <td colSpan={6} className="py-2"></td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  )
}
