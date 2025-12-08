import React, { useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { PieChart } from '@shared/components/PieChart'
import SearchableSelect from '@shared/components/SearchableSelect'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

export default function CustomersReport() {
  const { t } = useTranslation()

  // Demo dataset aligned with requested layout and visuals
  const customers = [
    {
      id: 1,
      name: 'Ahmed Hassan',
      type: 'VIP',
      phone: '01012345678',
      email: 'ahmed.hassan@example.com',
      joinedDate: '2025-01-12',
      totalRevenue: 120000,
      orders: 15,
      lastActivity: '2025-11-08',
      salesperson: 'Sara Kamal',
      history: [
        { date: '2025-07', amount: 15000 },
        { date: '2025-08', amount: 18000 },
        { date: '2025-09', amount: 25000 },
        { date: '2025-10', amount: 32000 },
        { date: '2025-11', amount: 30000 },
      ],
    },
    {
      id: 2,
      name: 'Delta Group',
      type: 'Regular',
      phone: '01234567890',
      email: 'finance@deltagroup.com',
      joinedDate: '2024-11-20',
      totalRevenue: 85000,
      orders: 10,
      lastActivity: '2025-11-05',
      salesperson: 'Omar Ali',
      history: [
        { date: '2025-07', amount: 12000 },
        { date: '2025-08', amount: 16000 },
        { date: '2025-09', amount: 18000 },
        { date: '2025-10', amount: 19000 },
        { date: '2025-11', amount: 20000 },
      ],
    },
    {
      id: 3,
      name: 'Mona Said',
      type: 'New',
      phone: '01122334455',
      email: 'mona.said@example.com',
      joinedDate: '2025-09-02',
      totalRevenue: 25000,
      orders: 3,
      lastActivity: '2025-11-09',
      salesperson: 'Ahmed Tarek',
      history: [
        { date: '2025-09', amount: 8000 },
        { date: '2025-10', amount: 9000 },
        { date: '2025-11', amount: 8000 },
      ],
    },
    {
      id: 4,
      name: 'Green Labs',
      type: 'VIP',
      phone: '01098765432',
      email: 'info@greenlabs.com',
      joinedDate: '2023-07-15',
      totalRevenue: 160000,
      orders: 22,
      lastActivity: '2025-10-28',
      salesperson: 'Sara Kamal',
      history: [
        { date: '2025-07', amount: 28000 },
        { date: '2025-08', amount: 30000 },
        { date: '2025-09', amount: 32000 },
        { date: '2025-10', amount: 35000 },
        { date: '2025-11', amount: 35000 },
      ],
    },
    {
      id: 5,
      name: 'ABC Pharma',
      type: 'Regular',
      phone: '01000099887',
      email: 'contact@abcpharma.co',
      joinedDate: '2024-03-21',
      totalRevenue: 72000,
      orders: 9,
      lastActivity: '2025-09-30',
      salesperson: 'Mona Adel',
      history: [
        { date: '2025-07', amount: 12000 },
        { date: '2025-08', amount: 14000 },
        { date: '2025-09', amount: 16000 },
        { date: '2025-10', amount: 15000 },
        { date: '2025-11', amount: 15000 },
      ],
    },
    {
      id: 6,
      name: 'Nova Tech',
      type: 'New',
      phone: '01500055544',
      email: 'hello@novatech.io',
      joinedDate: '2025-08-05',
      totalRevenue: 18000,
      orders: 2,
      lastActivity: '2025-10-12',
      salesperson: 'Omar Ali',
      history: [
        { date: '2025-08', amount: 8000 },
        { date: '2025-10', amount: 10000 },
      ],
    },
    {
      id: 7,
      name: 'Medix Co.',
      type: 'Regular',
      phone: '01200033322',
      email: 'sales@medix.co',
      joinedDate: '2024-06-11',
      totalRevenue: 54000,
      orders: 7,
      lastActivity: '2025-11-03',
      salesperson: 'Ahmed Tarek',
      history: [
        { date: '2025-07', amount: 9000 },
        { date: '2025-08', amount: 10000 },
        { date: '2025-10', amount: 17000 },
        { date: '2025-11', amount: 18000 },
      ],
    },
    {
      id: 8,
      name: 'Sun Health',
      type: 'VIP',
      phone: '01100998877',
      email: 'support@sunhealth.com',
      joinedDate: '2023-12-01',
      totalRevenue: 98000,
      orders: 12,
      lastActivity: '2025-08-24',
      salesperson: 'Mona Adel',
      history: [
        { date: '2025-07', amount: 18000 },
        { date: '2025-08', amount: 20000 },
        { date: '2025-09', amount: 22000 },
        { date: '2025-10', amount: 19000 },
        { date: '2025-11', amount: 19000 },
      ],
    },
    {
      id: 9,
      name: 'LifeChem',
      type: 'Regular',
      phone: '01011122233',
      email: 'info@lifechem.org',
      joinedDate: '2024-10-01',
      totalRevenue: 31000,
      orders: 4,
      lastActivity: '2025-10-28',
      salesperson: 'Ahmed Tarek',
      history: [
        { date: '2025-09', amount: 9000 },
        { date: '2025-10', amount: 11000 },
        { date: '2025-11', amount: 11000 },
      ],
    },
    {
      id: 10,
      name: 'CarePlus',
      type: 'New',
      phone: '01233445566',
      email: 'care@careplus.org',
      joinedDate: '2025-10-12',
      totalRevenue: 22000,
      orders: 3,
      lastActivity: '2025-11-07',
      salesperson: 'Sara Kamal',
      history: [
        { date: '2025-10', amount: 10000 },
        { date: '2025-11', amount: 12000 },
      ],
    },
  ]

  // Filters: salesperson/manager, date (mode), customer type
  const [salesperson, setSalesperson] = useState('all')
  const [dateMode, setDateMode] = useState('activity') // 'joined' | 'last' | 'activity'
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [customerType, setCustomerType] = useState('all')

  const withinRange = (dateStr) => {
    if (!dateFrom && !dateTo) return true
    const d = new Date(dateStr)
    const fromOk = dateFrom ? d >= new Date(dateFrom) : true
    const toOk = dateTo ? d <= new Date(dateTo) : true
    return fromOk && toOk
  }

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const spOk = salesperson === 'all' || c.salesperson === salesperson
      const typeOk = customerType === 'all' || c.type === customerType
      let dateField = c.lastActivity
      if (dateMode === 'joined') dateField = c.joinedDate
      if (dateMode === 'last') {
        // approximate last purchase as latest history date
        const lastHist = c.history?.[c.history.length - 1]?.date
        dateField = lastHist ? `${lastHist}-01` : c.lastActivity
      }
      const dateOk = withinRange(dateField)
      return spOk && typeOk && dateOk
    })
  }, [customers, salesperson, customerType, dateMode, dateFrom, dateTo])

  const isActive = (c) => {
    const last = new Date(c.lastActivity)
    const now = new Date('2025-11-09') // fixed for demo; replace with new Date() in production
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24))
    return diffDays <= 60
  }

  // KPIs
  const totalCustomers = filtered.length
  const totalRevenue = filtered.reduce((s, c) => s + (c.totalRevenue || 0), 0)
  const activeCount = filtered.reduce((s, c) => s + (isActive(c) ? 1 : 0), 0)
  const inactiveCount = Math.max(0, totalCustomers - activeCount)
  const top5 = [...filtered].sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0)).slice(0, 5)

  // Aggregations for charts
  const revenueByType = useMemo(() => {
    const map = new Map()
    filtered.forEach(c => {
      map.set(c.type, (map.get(c.type) || 0) + (c.totalRevenue || 0))
    })
    return map
  }, [filtered])

  const activeDistribution = useMemo(() => ({
    Active: filtered.filter(isActive).length,
    Inactive: filtered.filter(c => !isActive(c)).length
  }), [filtered])

  const topLine = useMemo(() => {
    // Collect union of months from top5 histories
    const labelSet = new Set()
    top5.forEach(c => c.history?.forEach(h => labelSet.add(h.date)))
    const labels = Array.from(labelSet).sort((a, b) => a.localeCompare(b))
    const datasets = top5.map(c => {
      const byMonth = new Map(c.history.map(h => [h.date, h.amount]))
      return {
        label: c.name,
        data: labels.map(m => byMonth.get(m) || 0),
        borderColor: `hsl(${(c.id * 57) % 360} 70% 45%)`,
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 2
      }
    })
    return { labels, datasets }
  }, [top5])

  // Export helpers
  const exportExcel = () => {
    const rows = filtered.map(c => ({
      Name: c.name,
      Type: c.type,
      Phone: c.phone,
      Email: c.email,
      Joined: c.joinedDate,
      TotalRevenueEGP: c.totalRevenue,
      Orders: c.orders,
      LastActivity: c.lastActivity,
      Salesperson: c.salesperson,
      Status: isActive(c) ? 'Active' : 'Inactive'
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Customers')
    XLSX.writeFile(wb, 'customers_report.xlsx')
  }

  const exportPdf = () => {
    window.print()
  }

  const statusBadge = (active) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'}`}>
      {active ? t('Active') : t('Inactive')}
    </span>
  )

  return (
    <Layout titleKey="Customers Report">
      {/* Top actions under header (right aligned) */}
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={exportPdf} className="btn btn-primary">{t('Download PDF')}</button>
        <button onClick={exportExcel} className="btn btn-secondary">{t('Download Excel')}</button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col">
              <label className="text-sm text-[var(--muted-text)]">{t('Salesperson')}</label>
              <SearchableSelect value={salesperson} onChange={(v) => setSalesperson(v)} className="min-w-[160px]">
                <option value="all">{t('All')}</option>
                {[...new Set(customers.map(c => c.salesperson))].map(sp => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </SearchableSelect>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-[var(--muted-text)]">{t('Customer Type')}</label>
              <SearchableSelect value={customerType} onChange={(v) => setCustomerType(v)} className="min-w-[140px]">
                <option value="all">{t('All')}</option>
                {[...new Set(customers.map(c => c.type))].map(tp => (
                  <option key={tp} value={tp}>{tp}</option>
                ))}
              </SearchableSelect>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-[var(--muted-text)]">{t('Date Mode')}</label>
              <SearchableSelect value={dateMode} onChange={(v) => setDateMode(v)} className="min-w-[180px]">
                <option value="activity">{t('Activity Date')}</option>
                <option value="joined">{t('Join Date')}</option>
                <option value="last">{t('Last Purchase Date')}</option>
              </SearchableSelect>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-[var(--muted-text)]">{t('From')}</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-[var(--muted-text)]">{t('To')}</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input" />
            </div>
          </div>
        </div>
      </div>

      <div className="h-6" aria-hidden="true"></div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: t('Total Customers'), value: totalCustomers, color: 'bg-blue-500' },
          { label: t('Total Revenue (EGP)'), value: totalRevenue.toLocaleString(), color: 'bg-emerald-500' },
          { label: t('Active Customers'), value: activeCount, color: 'bg-indigo-500' },
          { label: t('Inactive Customers'), value: inactiveCount, color: 'bg-rose-500' },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-panel p-4">
            <div className="text-sm text-[var(--muted-text)]">{kpi.label}</div>
            <div className="mt-1 text-2xl font-semibold">{kpi.value}</div>
            <div className={`mt-2 h-1.5 rounded ${kpi.color}`}></div>
          </div>
        ))}
        {/* Top 5 Customers by Revenue */}
        <div className="glass-panel p-4">
          <div className="text-sm text-[var(--muted-text)]">{t('Top 5 Customers by Revenue')}</div>
          <ul className="mt-2 space-y-1 text-sm">
            {top5.map(c => (
              <li key={c.id} className="flex items-center justify-between">
                <span className="truncate max-w-[60%]">{c.name}</span>
                <span className="font-medium">{c.totalRevenue.toLocaleString()} EGP</span>
              </li>
            ))}
            {top5.length === 0 && (
              <li className="text-[var(--muted-text)]">{t('No data')}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="h-6" aria-hidden="true"></div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar: revenue by customer type */}
        <div className="glass-panel p-4">
          <div className="text-sm font-medium mb-2">{t('Revenue by Customer Type')}</div>
          <Bar
            data={{
              labels: Array.from(revenueByType.keys()),
              datasets: [{
                label: t('Revenue (EGP)'),
                data: Array.from(revenueByType.values()),
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderRadius: 6
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { ticks: { callback: v => `${v}` } } }
            }}
          />
        </div>

        {/* Pie: active vs inactive customers */}
        <div className="glass-panel p-4">
          <div className="text-sm font-medium mb-2">{t('Active vs Inactive')}</div>
          <PieChart
            segments={[
              { label: t('Active'), value: activeDistribution.Active, color: '#10b981' },
              { label: t('Inactive'), value: activeDistribution.Inactive, color: '#ef4444' },
            ]}
            totalLabel={t('Customers')}
          />
        </div>

        {/* Line: revenue trend of top customers */}
        <div className="glass-panel p-4">
          <div className="text-sm font-medium mb-2">{t('Revenue Trend — Top Customers')}</div>
          <Line
            data={{ labels: topLine.labels, datasets: topLine.datasets }}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { ticks: { callback: v => `${v}` } } }
            }}
          />
        </div>
      </div>

      <div className="h-6" aria-hidden="true"></div>
      <div className="h-6" aria-hidden="true"></div>

      {/* Table */}
      <div className="glass-panel p-4">
        <div className="text-sm font-medium mb-3">{t('Customers')}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm nova-table nova-table--glass">
            <thead>
              <tr className="text-left bg-[var(--table-header-bg)]">
                <th className="px-3 py-2">{t('Customer Name')}</th>
                <th className="px-3 py-2">{t('Type')}</th>
                <th className="px-3 py-2">{t('Contact')}</th>
                <th className="px-3 py-2">{t('Total Revenue')}</th>
                <th className="px-3 py-2">{t('Orders')}</th>
                <th className="px-3 py-2">{t('Last Activity')}</th>
                <th className="px-3 py-2">{t('Status')}</th>
                <th className="px-3 py-2">{t('Salesperson')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-[var(--muted-text)]">{t('No data')}</td>
                </tr>
              )}
              {filtered.map(c => (
                <tr key={c.id} className="border-t border-[var(--table-row-border)] odd:bg-[var(--table-row-bg)] hover:bg-[var(--table-row-hover)] transition-colors">
                  <td className="px-3 py-2">{c.name}</td>
                  <td className="px-3 py-2">{c.type}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span>{c.phone}</span>
                      <span className="text-[var(--muted-text)]">{c.email}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">{c.totalRevenue.toLocaleString()} EGP</td>
                  <td className="px-3 py-2">{c.orders}</td>
                  <td className="px-3 py-2">{new Date(c.lastActivity).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{statusBadge(isActive(c))}</td>
                  <td className="px-3 py-2">{c.salesperson}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-6" aria-hidden="true"></div>
    </Layout>
  )
}