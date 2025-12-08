import React, { useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { PieChart } from '@shared/components/PieChart'
import SearchableSelect from '@shared/components/SearchableSelect'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

export default function ClosedDealsReport() {
  const { t, i18n } = useTranslation()
  const isRTL = (i18n?.language || '').toLowerCase().startsWith('ar')

  // Demo dataset matching requested layout
  const deals = [
    { id: 1, client: 'ABC Pharma', value: 48000, product: 'Digital Marketing Package', closedDate: '2025-11-02', salesperson: 'Ahmed Ali', durationDays: 7, paymentStatus: 'Paid' },
    { id: 2, client: 'Delta Med', value: 35000, product: 'Web Development', closedDate: '2025-11-04', salesperson: 'Sara Hassan', durationDays: 5, paymentStatus: 'Pending' },
    { id: 3, client: 'Green Labs', value: 60000, product: 'CRM System', closedDate: '2025-11-05', salesperson: 'Omar Tarek', durationDays: 9, paymentStatus: 'Paid' },
    { id: 4, client: 'Sun Health', value: 42000, product: 'SEO & Content', closedDate: '2025-11-06', salesperson: 'Ahmed Ali', durationDays: 8, paymentStatus: 'Partial' },
    { id: 5, client: 'Medix Co.', value: 28000, product: 'Landing Page + Ads', closedDate: '2025-11-07', salesperson: 'Sara Hassan', durationDays: 6, paymentStatus: 'Paid' },
    { id: 6, client: 'BioCure', value: 52000, product: 'Marketing Automation', closedDate: '2025-10-30', salesperson: 'Omar Tarek', durationDays: 10, paymentStatus: 'Pending' },
    { id: 7, client: 'LifeChem', value: 31000, product: 'Social Media Management', closedDate: '2025-10-28', salesperson: 'Ahmed Ali', durationDays: 4, paymentStatus: 'Paid' },
    { id: 8, client: 'Nova Labs', value: 65000, product: 'CRM + Training', closedDate: '2025-10-25', salesperson: 'Mona Adel', durationDays: 11, paymentStatus: 'Partial' },
    { id: 9, client: 'HealthPro', value: 47000, product: 'Web Revamp', closedDate: '2025-11-08', salesperson: 'Ahmed Ali', durationDays: 7, paymentStatus: 'Paid' },
    { id: 10, client: 'CarePlus', value: 33000, product: 'Content & Design', closedDate: '2025-11-03', salesperson: 'Mona Adel', durationDays: 6, paymentStatus: 'Pending' },
  ]

  // Sales targets (EGP) for progress and company-wide achievement
  const salesTargets = {
    'Ahmed Ali': 100000,
    'Sara Hassan': 90000,
    'Omar Tarek': 120000,
    'Mona Adel': 80000,
  }
  const companyTarget = Object.values(salesTargets).reduce((a, b) => a + b, 0)

  // Filters
  const [salesperson, setSalesperson] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [dateType, setDateType] = useState('range') // 'range' | 'month'
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [month, setMonth] = useState('') // YYYY-MM

  const filtered = useMemo(() => {
    let arr = [...deals]
    if (salesperson !== 'all') arr = arr.filter(d => d.salesperson === salesperson)
    if (paymentStatus !== 'all') arr = arr.filter(d => d.paymentStatus === paymentStatus)
    if (dateType === 'range') {
      if (dateFrom) arr = arr.filter(d => d.closedDate >= dateFrom)
      if (dateTo) arr = arr.filter(d => d.closedDate <= dateTo)
    } else if (dateType === 'month') {
      if (month) arr = arr.filter(d => (d.closedDate || '').startsWith(month))
    }
    return arr
  }, [deals, salesperson, paymentStatus, dateType, dateFrom, dateTo, month])

  // Summary KPIs
  const totalDeals = filtered.length
  const totalRevenue = filtered.reduce((sum, d) => sum + (d.value || 0), 0)
  const averageDealValue = totalDeals ? Math.round(totalRevenue / totalDeals) : 0
  const averageClosingTime = totalDeals ? Math.round(filtered.reduce((sum, d) => sum + (d.durationDays || 0), 0) / totalDeals) : 0
  const companyTargetAchieved = companyTarget ? Math.round((totalRevenue / companyTarget) * 100) : 0

  // Grouping helpers
  const bySalespersonValue = useMemo(() => {
    const map = new Map()
    filtered.forEach(d => {
      map.set(d.salesperson, (map.get(d.salesperson) || 0) + d.value)
    })
    return map
  }, [filtered])

  const paymentDist = useMemo(() => {
    const map = { Paid: 0, Pending: 0, Partial: 0 }
    filtered.forEach(d => { map[d.paymentStatus] = (map[d.paymentStatus] || 0) + 1 })
    return map
  }, [filtered])

  const dealsTrend = useMemo(() => {
    // Count deals per day
    const map = new Map()
    filtered.forEach(d => {
      map.set(d.closedDate, (map.get(d.closedDate) || 0) + 1)
    })
    const entries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    return {
      labels: entries.map(e => e[0]),
      counts: entries.map(e => e[1])
    }
  }, [filtered])

  // Export helpers
  const exportExcel = () => {
    const rows = filtered.map(d => ({
      Client: d.client,
      Salesperson: d.salesperson,
      ProductService: d.product,
      ClosedDate: d.closedDate,
      DealValueEGP: d.value,
      DurationDays: d.durationDays,
      PaymentStatus: d.paymentStatus,
    }))
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ClosedDeals')
    XLSX.writeFile(workbook, 'closed-deals-report.xlsx')
  }
  const exportPdf = () => {
    // Use browser print to PDF for simplicity
    window.print()
  }

  const statusBadge = (status) => {
    const classes =
      status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
      status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
      'bg-red-50 text-red-700 border-red-200'
    return <span className={`inline-block px-2 py-1 text-xs rounded-md border ${classes}`}>{t(status)}</span>
  }

  // Charts data
  const barData = {
    labels: Array.from(bySalespersonValue.keys()),
    datasets: [
      {
        label: t('Deal Value (EGP)'),
        data: Array.from(bySalespersonValue.values()),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  const lineData = {
    labels: dealsTrend.labels,
    datasets: [
      {
        label: t('Closed Deals'),
        data: dealsTrend.counts,
        fill: false,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
        tension: 0.3,
      },
    ],
  }

  const pieData = [
    { label: t('Paid'), value: paymentDist.Paid, color: '#10b981' },
    { label: t('Partial'), value: paymentDist.Partial, color: '#f59e0b' },
    { label: t('Pending'), value: paymentDist.Pending, color: '#ef4444' },
  ]

  const allSalespeople = Array.from(new Set(deals.map(d => d.salesperson)))

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('Closed Deals Report')}</h1>
        <div className="flex items-center gap-2">
          <button onClick={exportPdf} className="btn btn-primary">{t('Download PDF')}</button>
          <button onClick={exportExcel} className="btn btn-secondary">{t('Download Excel')}</button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Salesperson */}
          <div className="flex flex-col">
            <label className="text-sm text-[var(--muted-text)]">{t('Salesperson')}</label>
            <SearchableSelect value={salesperson} onChange={(v) => setSalesperson(v)} className="min-w-[180px]">
              <option value="all">{t('All')}</option>
              {allSalespeople.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </SearchableSelect>
          </div>

          {/* Date type */}
          <div className="flex flex-col">
            <label className="text-sm text-[var(--muted-text)]">{t('Date Filter Type')}</label>
            <SearchableSelect value={dateType} onChange={(v) => setDateType(v)} className="min-w-[160px]">
              <option value="range">{t('By Date Range')}</option>
              <option value="month">{t('By Month')}</option>
            </SearchableSelect>
          </div>

          {dateType === 'range' ? (
            <>
              <div className="flex flex-col">
                <label className="text-sm text-[var(--muted-text)]">{t('From')}</label>
                <input type="date" lang={(i18n?.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en'} dir={(i18n?.language || '').toLowerCase().startsWith('ar') ? 'rtl' : 'ltr'} placeholder={(i18n?.language || '').toLowerCase().startsWith('ar') ? 'اليوم/الشهر/السنة' : 'mm/dd/yyyy'} value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-[var(--muted-text)]">{t('To')}</label>
                <input type="date" lang={(i18n?.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en'} dir={(i18n?.language || '').toLowerCase().startsWith('ar') ? 'rtl' : 'ltr'} placeholder={(i18n?.language || '').toLowerCase().startsWith('ar') ? 'اليوم/الشهر/السنة' : 'mm/dd/yyyy'} value={dateTo} onChange={e => setDateTo(e.target.value)} className="input" />
              </div>
            </>
          ) : (
            <div className="flex flex-col">
              <label className="text-sm text-[var(--muted-text)]">{t('Month')}</label>
              <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="input" />
            </div>
          )}

          {/* Payment status */}
          <div className="flex flex-col">
            <label className="text-sm text-[var(--muted-text)]">{t('Payment Status')}</label>
            <SearchableSelect value={paymentStatus} onChange={(v) => setPaymentStatus(v)} className="min-w-[160px]">
              <option value="all">{t('All')}</option>
              <option value="Paid">{t('Paid')}</option>
              <option value="Partial">{t('Partial')}</option>
              <option value="Pending">{t('Pending')}</option>
            </SearchableSelect>
          </div>
        </div>
      </div>

      <div className="h-4" aria-hidden="true"></div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: t('Total Closed Deals'), value: totalDeals, color: 'bg-blue-500' },
          { label: t('Total Revenue (EGP)'), value: totalRevenue.toLocaleString(), color: 'bg-emerald-500' },
          { label: t('Average Deal Value'), value: averageDealValue.toLocaleString(), color: 'bg-indigo-500' },
          { label: t('Average Closing Time'), value: `${averageClosingTime} ${t('days')}`, color: 'bg-amber-500' },
          { label: t('% of Target Achieved'), value: `${companyTargetAchieved}%`, color: 'bg-teal-500' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{kpi.value}</div>
              </div>
              <div className={`w-10 h-10 rounded-lg ${kpi.color} opacity-80`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-4" aria-hidden="true"></div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar: value per salesperson */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold text-gray-800 dark:text-gray-100`}>{t('Deal Value per Salesperson')}</h3>
            </div>
          </div>
          <Bar
            data={barData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>

        {/* Pie (Donut): payment status distribution */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center justify-center">
              <PieChart
                segments={pieData}
                centerValue={totalDeals}
                centerLabel={t('Deals')}
                size={200}
                cutout={'70%'}
                borderRadius={6}
              />
            </div>
            <div className="flex-1 md:ml-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[{ key: 'Paid', color: '#10b981', value: paymentDist.Paid }, { key: 'Partial', color: '#f59e0b', value: paymentDist.Partial }, { key: 'Pending', color: '#ef4444', value: paymentDist.Pending }].map((item) => {
                const pct = totalDeals ? Math.round((item.value / totalDeals) * 100) : 0
                return (
                  <div key={item.key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-700 dark:text-gray-200">{t(item.key)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.value} / {totalDeals} ({pct}%)</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Line: closed deals trend */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold text-gray-800 dark:text-gray-100`}>{t('Closed Deals Trend')}</h3>
            </div>
          </div>
          <Line
            data={lineData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, precision: 0 } },
            }}
          />
        </div>
      </div>

      <div className="h-4" aria-hidden="true"></div>

      {/* Table */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                {[t('Client'), t('Deal Value'), t('Product / Service'), t('Closed Date'), t('Salesperson'), t('Duration (Days)'), t('Payment Status')].map((h, idx) => (
                  <th key={idx} className="px-3 py-2 text-gray-700 dark:text-gray-200 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, idx) => (
                <tr key={`${d.id}-${idx}`} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{d.client}</td>
                  <td className="px-3 py-2">{d.value.toLocaleString()} EGP</td>
                  <td className="px-3 py-2">{d.product}</td>
                  <td className="px-3 py-2">{d.closedDate}</td>
                  <td className="px-3 py-2">{d.salesperson}</td>
                  <td className="px-3 py-2">{d.durationDays}</td>
                  <td className="px-3 py-2">{statusBadge(d.paymentStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
