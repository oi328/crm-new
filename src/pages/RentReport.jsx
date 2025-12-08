import React, { useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { PieChart } from '@shared/components/PieChart'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

export default function RentReport() {
  const { t } = useTranslation()

  // Demo dataset covering requested fields
  const raw = useMemo(() => ([
    {
      id: 1,
      property: 'Villa A1',
      tenant: 'Ahmed Hassan',
      start: '2025-11-01',
      end: '2026-10-31',
      monthlyRent: 12000,
      totalContractValue: 144000,
      amountPaid: 12000,
      balance: 0,
      paymentStatus: 'Paid',
      handledBy: 'Sara Kamal',
      renewed: true
    },
    {
      id: 2,
      property: 'Shop 4',
      tenant: 'Mona Said',
      start: '2025-11-10',
      end: '2026-11-09',
      monthlyRent: 8000,
      totalContractValue: 96000,
      amountPaid: 4000,
      balance: 4000,
      paymentStatus: 'Partial',
      handledBy: 'Omar Ali',
      renewed: false
    },
    {
      id: 3,
      property: 'Office 302',
      tenant: 'Delta Group',
      start: '2025-09-15',
      end: '2026-09-14',
      monthlyRent: 15000,
      totalContractValue: 180000,
      amountPaid: 0,
      balance: 15000,
      paymentStatus: 'Pending',
      handledBy: 'Ahmed Tarek',
      renewed: false
    },
    {
      id: 4,
      property: 'Warehouse B2',
      tenant: 'LogiX Co.',
      start: '2025-08-01',
      end: '2026-07-31',
      monthlyRent: 22000,
      totalContractValue: 264000,
      amountPaid: 11000,
      balance: 11000,
      paymentStatus: 'Overdue',
      handledBy: 'Nour El-Din',
      renewed: false
    },
    {
      id: 5,
      property: 'Apartment 5C',
      tenant: 'Yara Samir',
      start: '2025-12-01',
      end: '2026-11-30',
      monthlyRent: 9000,
      totalContractValue: 108000,
      amountPaid: 9000,
      balance: 0,
      paymentStatus: 'Paid',
      handledBy: 'Omar Ali',
      renewed: true
    },
    {
      id: 6,
      property: 'Kiosk K7',
      tenant: 'Snack Hub',
      start: '2025-10-01',
      end: '2026-09-30',
      monthlyRent: 4000,
      totalContractValue: 48000,
      amountPaid: 2000,
      balance: 2000,
      paymentStatus: 'Partial',
      handledBy: 'Sara Kamal',
      renewed: false
    },
    {
      id: 7,
      property: 'Studio S12',
      tenant: 'Design House',
      start: '2025-07-01',
      end: '2026-06-30',
      monthlyRent: 7000,
      totalContractValue: 84000,
      amountPaid: 0,
      balance: 7000,
      paymentStatus: 'Pending',
      handledBy: 'Omar Ali',
      renewed: false
    },
    {
      id: 8,
      property: 'Office 101',
      tenant: 'TechMinds',
      start: '2025-06-01',
      end: '2026-05-31',
      monthlyRent: 13000,
      totalContractValue: 156000,
      amountPaid: 13000,
      balance: 0,
      paymentStatus: 'Paid',
      handledBy: 'Ahmed Tarek',
      renewed: true
    },
    {
      id: 9,
      property: 'Shop 12',
      tenant: 'Fashion Hub',
      start: '2025-05-15',
      end: '2026-05-14',
      monthlyRent: 10000,
      totalContractValue: 120000,
      amountPaid: 5000,
      balance: 5000,
      paymentStatus: 'Overdue',
      handledBy: 'Nour El-Din',
      renewed: false
    },
    {
      id: 10,
      property: 'Villa B2',
      tenant: 'Karim Mostafa',
      start: '2025-04-01',
      end: '2026-03-31',
      monthlyRent: 11000,
      totalContractValue: 132000,
      amountPaid: 11000,
      balance: 0,
      paymentStatus: 'Paid',
      handledBy: 'Sara Kamal',
      renewed: true
    },
    {
      id: 11,
      property: 'Office 405',
      tenant: 'Alpha Corp',
      start: '2025-03-10',
      end: '2026-03-09',
      monthlyRent: 20000,
      totalContractValue: 240000,
      amountPaid: 10000,
      balance: 10000,
      paymentStatus: 'Partial',
      handledBy: 'Ahmed Tarek',
      renewed: false
    },
    {
      id: 12,
      property: 'Warehouse C1',
      tenant: 'AgriFoods',
      start: '2025-02-01',
      end: '2026-01-31',
      monthlyRent: 18000,
      totalContractValue: 216000,
      amountPaid: 0,
      balance: 18000,
      paymentStatus: 'Pending',
      handledBy: 'Omar Ali',
      renewed: false
    }
  ]), [])

  // Filters
  const [manager, setManager] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // active | expired | upcoming | all

  const today = useMemo(() => new Date().toISOString().slice(0,10), [])
  const isActive = (row) => row.start <= today && row.end >= today
  const isExpired = (row) => row.end < today
  const isUpcoming = (row) => row.start > today

  const filteredRows = useMemo(() => {
    return raw.filter(r => {
      const mgrOk = manager ? String(r.handledBy).toLowerCase().includes(manager.toLowerCase().trim()) : true
      const fromOk = dateFrom ? r.end >= dateFrom : true
      const toOk = dateTo ? r.start <= dateTo : true
      const dateOk = fromOk && toOk
      const statusOk = statusFilter === 'all'
        ? true
        : statusFilter === 'active' ? isActive(r)
        : statusFilter === 'expired' ? isExpired(r)
        : statusFilter === 'upcoming' ? isUpcoming(r)
        : true
      return mgrOk && dateOk && statusOk
    })
  }, [raw, manager, dateFrom, dateTo, statusFilter])

  // Summary KPIs
  const totalCollected = useMemo(() => filteredRows.reduce((sum, r) => sum + (r.amountPaid || 0), 0), [filteredRows])
  const totalOutstanding = useMemo(() => filteredRows.reduce((sum, r) => sum + (r.balance || 0), 0), [filteredRows])
  const activeContracts = useMemo(() => filteredRows.filter(isActive).length, [filteredRows])
  const expiredContracts = useMemo(() => filteredRows.filter(isExpired).length, [filteredRows])
  const renewalRate = useMemo(() => {
    const renewed = filteredRows.filter(r => r.renewed).length
    const total = filteredRows.length || 1
    return Math.round((renewed / total) * 100)
  }, [filteredRows])

  // Payment status distribution (donut)
  const paymentSegments = useMemo(() => {
    const counts = { Paid: 0, Partial: 0, Pending: 0, Overdue: 0 }
    filteredRows.forEach(r => { counts[r.paymentStatus] = (counts[r.paymentStatus] || 0) + 1 })
    return [
      { label: 'Paid', value: counts.Paid, color: '#10b981' },
      { label: 'Partial', value: counts.Partial, color: '#f59e0b' },
      { label: 'Pending', value: counts.Pending, color: '#9ca3af' },
      { label: 'Overdue', value: counts.Overdue, color: '#ef4444' },
    ]
  }, [filteredRows])

  // Rent collected by month (bar) — group by contract start month for demo
  const formatMonth = (d) => {
    const dt = new Date(d)
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`
  }
  const rentByMonth = useMemo(() => {
    const map = new Map()
    filteredRows.forEach(r => {
      const m = formatMonth(r.start)
      map.set(m, (map.get(m) || 0) + (r.amountPaid || 0))
    })
    const entries = Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]))
    return {
      labels: entries.map(([m]) => m),
      values: entries.map(([,v]) => v)
    }
  }, [filteredRows])

  // Total rent trend (line) — group by contract start month total contract value
  const rentTrend = useMemo(() => {
    const map = new Map()
    filteredRows.forEach(r => {
      const m = formatMonth(r.start)
      map.set(m, (map.get(m) || 0) + (r.totalContractValue || 0))
    })
    const entries = Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]))
    return {
      labels: entries.map(([m]) => m),
      values: entries.map(([,v]) => v)
    }
  }, [filteredRows])

  // Export
  const exportExcel = () => {
    const rows = filteredRows.map(r => ({
      Property: r.property,
      Tenant: r.tenant,
      StartDate: r.start,
      EndDate: r.end,
      MonthlyRent: r.monthlyRent,
      TotalContractValue: r.totalContractValue,
      AmountPaid: r.amountPaid,
      Balance: r.balance,
      PaymentStatus: r.paymentStatus,
      HandledBy: r.handledBy
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'RentReport')
    XLSX.writeFile(wb, 'rent_report.xlsx')
  }
  const exportPDF = () => {
    window.print()
  }

  const Badge = ({ status }) => {
    const base = 'px-2 py-1 text-xs rounded-md'
    const cls = status === 'Paid'
      ? 'bg-emerald-50 text-emerald-600'
      : status === 'Partial'
        ? 'bg-yellow-50 text-yellow-600'
        : status === 'Overdue'
          ? 'bg-red-50 text-red-600'
          : 'bg-gray-100 text-gray-600'
    return <span className={`${base} ${cls}`}>{status}</span>
  }

  return (
    <Layout titleKey="Rent">
      <div className="p-4 space-y-4">
        {/* Top actions under header (right aligned) */}
        <div className="flex justify-end gap-2">
          <button onClick={exportPDF} className="btn btn-primary">{t('Download PDF')}</button>
          <button onClick={exportExcel} className="btn btn-secondary">{t('Download Excel')}</button>
        </div>

        {/* Filters */}
        <div className="glass-panel rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-[var(--muted-text)]">{t('Salesperson / Manager')}</label>
              <input value={manager} onChange={e=>setManager(e.target.value)} className="input w-full" placeholder={t('e.g. Omar Ali')} />
            </div>
            <div>
              <label className="text-sm text-[var(--muted-text)]">{t('Date From')}</label>
              <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="input w-full" />
            </div>
            <div>
              <label className="text-sm text-[var(--muted-text)]">{t('Date To')}</label>
              <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="input w-full" />
            </div>
            <div>
              <label className="text-sm text-[var(--muted-text)]">{t('Status')}</label>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="input w-full">
                <option value="all">{t('All')}</option>
                <option value="active">{t('Active')}</option>
                <option value="expired">{t('Expired')}</option>
                <option value="upcoming">{t('Upcoming')}</option>
              </select>
            </div>
          </div>
        </div>
        {/* Spacer under filters */}
        <div aria-hidden="true" className="h-6" />

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)]">{t('Total Rent Collected')}</div>
            <div className="text-3xl font-bold">{totalCollected.toLocaleString()} EGP</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)]">{t('Total Outstanding Balance')}</div>
            <div className="text-3xl font-bold">{totalOutstanding.toLocaleString()} EGP</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)]">{t('Active Contracts')}</div>
            <div className="text-3xl font-bold">{activeContracts}</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)]">{t('Expired Contracts')}</div>
            <div className="text-3xl font-bold">{expiredContracts}</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)]">{t('Renewal Rate %')}</div>
            <div className="text-3xl font-bold">{renewalRate}%</div>
          </div>
        </div>
        {/* Spacer under cards */}
        <div aria-hidden="true" className="h-6" />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">{t('Payment Status')}</h3>
            <div className="flex items-center gap-6">
              <PieChart segments={paymentSegments} size={180} cutout={70} centerValue={filteredRows.length} centerLabel={t('Contracts')} />
              <div className="space-y-2 text-sm">
                {paymentSegments.map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: s.color }}></span>
                    <span>{t(s.label)}</span>
                    <span className="ml-auto text-[var(--muted-text)]">{s.value} ({filteredRows.length ? Math.round((s.value/filteredRows.length)*100) : 0}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">{t('Rent Collected by Month')}</h3>
            <Bar
              data={{
                labels: rentByMonth.labels,
                datasets: [{
                  label: t('Collected (EGP)'),
                  data: rentByMonth.values,
                  backgroundColor: '#3b82f6',
                  borderRadius: 6
                }]
              }}
              options={{ responsive: true, plugins: { legend: { display: true } }, scales: { y: { ticks: { callback: v => `${v}` } } } }}
            />
          </div>
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">{t('Total Rent Trend')}</h3>
            <Line
              data={{
                labels: rentTrend.labels,
                datasets: [{
                  label: t('Total Contract Value (EGP)'),
                  data: rentTrend.values,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16,185,129,0.2)',
                  tension: 0.3,
                  fill: true,
                  pointRadius: 3
                }]
              }}
              options={{ responsive: true, plugins: { legend: { display: true } } }}
            />
          </div>
        </div>

        {/* Spacer above table */}
        <div aria-hidden="true" className="h-6" />
        {/* Table */}
        <div className="glass-panel rounded-xl p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm nova-table nova-table--glass">
              <thead>
                <tr className="text-left bg-[var(--table-header-bg)]">
                  <th className="px-3 py-2">{t('Property')}</th>
                  <th className="px-3 py-2">{t('Tenant')}</th>
                  <th className="px-3 py-2">{t('Start Date')}</th>
                  <th className="px-3 py-2">{t('End Date')}</th>
                  <th className="px-3 py-2">{t('Monthly Rent')}</th>
                  <th className="px-3 py-2">{t('Amount Paid')}</th>
                  <th className="px-3 py-2">{t('Balance')}</th>
                  <th className="px-3 py-2">{t('Payment Status')}</th>
                  <th className="px-3 py-2">{t('Handled By')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-[var(--muted-text)]">{t('No data')}</td>
                  </tr>
                )}
                {filteredRows.map(r => (
                  <tr key={r.id} className="border-t border-[var(--table-row-border)] odd:bg-[var(--table-row-bg)] hover:bg-[var(--table-row-hover)] transition-colors">
                    <td className="px-3 py-2">{r.property}</td>
                    <td className="px-3 py-2">{r.tenant}</td>
                    <td className="px-3 py-2">{r.start}</td>
                    <td className="px-3 py-2">{r.end}</td>
                    <td className="px-3 py-2">{r.monthlyRent.toLocaleString()} EGP</td>
                    <td className="px-3 py-2">{r.amountPaid.toLocaleString()} EGP</td>
                    <td className="px-3 py-2">{r.balance.toLocaleString()} EGP</td>
                    <td className="px-3 py-2"><Badge status={r.paymentStatus} /></td>
                    <td className="px-3 py-2">{r.handledBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Spacer below table */}
        <div aria-hidden="true" className="h-6" />
      </div>
    </Layout>
  )
}