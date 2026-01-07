import React, { useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { PieChart } from '@shared/components/PieChart'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

export default function CheckInReport() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n?.dir?.() === 'rtl'

  // Demo dataset
  const raw = useMemo(() => ([
    {
      id: 1,
      name: 'Ahmed Hassan',
      checkIn: '2025-11-09T08:00:00',
      checkOut: '2025-11-09T18:00:00',
      type: 'Table Reservation',
      status: 'Checked-in',
      handledBy: 'Sara Kamal',
    },
    {
      id: 2,
      name: 'Mona Said',
      checkIn: '2025-11-10T14:00:00',
      checkOut: '2025-11-10T16:00:00',
      type: 'Catering Appointment',
      status: 'No-show',
      handledBy: 'Omar Ali',
    },
    {
      id: 3,
      name: 'Delta Group',
      checkIn: '2025-11-09T10:00:00',
      checkOut: '2025-11-09T17:00:00',
      type: 'Office Visit',
      status: 'Completed',
      handledBy: 'Ahmed Tarek',
    },
    {
      id: 4,
      name: 'Ola Sami',
      checkIn: '2025-11-11T09:30:00',
      checkOut: '',
      type: 'Department Visit',
      status: 'Pending',
      handledBy: 'Sara Kamal',
    },
    {
      id: 5,
      name: 'Karim Mostafa',
      checkIn: '2025-11-08T11:15:00',
      checkOut: '',
      type: 'Appointment',
      status: 'Cancelled',
      handledBy: 'Omar Ali',
    },
    {
      id: 6,
      name: 'Yara Samir',
      checkIn: '2025-11-12T13:00:00',
      checkOut: '2025-11-12T15:00:00',
      type: 'Office Visit',
      status: 'Completed',
      handledBy: 'Ahmed Tarek',
    },
  ]), [])

  // Filters
  const [staff, setStaff] = useState('')
  const [timeframe, setTimeframe] = useState('day') // day | week | month
  const [refDate, setRefDate] = useState(() => new Date().toISOString().slice(0,10))
  const [statusFilter, setStatusFilter] = useState('all') // Checked-in | No-show | Cancelled | Completed | Pending | all

  const startOfWeek = (d) => {
    const date = new Date(d)
    const day = date.getDay() // 0 = Sun
    const diff = (day === 0 ? -6 : 1) - day // start Monday
    date.setDate(date.getDate() + diff)
    date.setHours(0,0,0,0)
    return date
  }
  const endOfWeek = (d) => {
    const s = startOfWeek(d)
    const e = new Date(s)
    e.setDate(s.getDate() + 6)
    e.setHours(23,59,59,999)
    return e
  }
  const startOfDay = (d) => { const dt = new Date(d); dt.setHours(0,0,0,0); return dt }
  const endOfDay = (d) => { const dt = new Date(d); dt.setHours(23,59,59,999); return dt }
  const startOfMonth = (d) => { const dt = new Date(d); dt.setDate(1); dt.setHours(0,0,0,0); return dt }
  const endOfMonth = (d) => { const dt = new Date(d); dt.setMonth(dt.getMonth()+1); dt.setDate(0); dt.setHours(23,59,59,999); return dt }

  const [from, to] = useMemo(() => {
    if (timeframe === 'day') return [startOfDay(refDate), endOfDay(refDate)]
    if (timeframe === 'week') return [startOfWeek(refDate), endOfWeek(refDate)]
    return [startOfMonth(refDate), endOfMonth(refDate)]
  }, [timeframe, refDate])

  const inRange = (iso) => {
    const d = new Date(iso)
    return d >= from && d <= to
  }

  const filteredRows = useMemo(() => {
    return raw.filter(r => {
      const staffOk = staff ? String(r.handledBy).toLowerCase().includes(staff.toLowerCase().trim()) : true
      const statusOk = statusFilter === 'all' ? true : r.status === statusFilter
      const dateOk = inRange(r.checkIn)
      return staffOk && statusOk && dateOk
    })
  }, [raw, staff, statusFilter, from, to])

  // KPIs
  const totalCheckins = useMemo(() => filteredRows.length, [filteredRows])
  const noShows = useMemo(() => filteredRows.filter(r => r.status === 'No-show').length, [filteredRows])
  const completed = useMemo(() => filteredRows.filter(r => r.status === 'Completed').length, [filteredRows])
  const pending = useMemo(() => filteredRows.filter(r => r.status === 'Pending').length, [filteredRows])

  // Charts data
  const pieSegments = useMemo(() => {
    const counts = { 'Completed': 0, 'Pending': 0, 'No-show': 0, 'Cancelled': 0, 'Checked-in': 0 }
    filteredRows.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1 })
    return [
      { label: 'Completed', value: counts['Completed'], color: '#10b981' },
      { label: 'Pending', value: counts['Pending'], color: '#f59e0b' },
      { label: 'No-show', value: counts['No-show'], color: '#ef4444' },
      { label: 'Cancelled', value: counts['Cancelled'], color: '#9ca3af' },
      { label: 'Checked-in', value: counts['Checked-in'], color: '#3b82f6' },
    ]
  }, [filteredRows])

  const formatDateKey = (iso) => {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
  const trend = useMemo(() => {
    const map = new Map()
    filteredRows.forEach(r => {
      const k = formatDateKey(r.checkIn)
      map.set(k, (map.get(k) || 0) + 1)
    })
    const entries = Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]))
    return { labels: entries.map(([k])=>k), values: entries.map(([,v])=>v) }
  }, [filteredRows])

  const byStaff = useMemo(() => {
    const map = new Map()
    filteredRows.forEach(r => {
      map.set(r.handledBy, (map.get(r.handledBy) || 0) + 1)
    })
    const entries = Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]))
    return { labels: entries.map(([k])=>k), values: entries.map(([,v])=>v) }
  }, [filteredRows])

  // Export
  const exportExcel = () => {
    const rows = filteredRows.map(r => ({
      Name: r.name,
      CheckIn: r.checkIn,
      CheckOut: r.checkOut || '',
      DepartmentOrReservation: r.type,
      Status: r.status,
      HandledBy: r.handledBy,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'CheckIns')
    XLSX.writeFile(wb, 'check_in_report.xlsx')
  }
  const exportPDF = () => { window.print() }

  const formatDateTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const hh = d.getHours()
    const mm = String(d.getMinutes()).padStart(2,'0')
    const ampm = hh >= 12 ? 'PM' : 'AM'
    const h12 = hh % 12 || 12
    return `${String(d.getDate()).padStart(2,'0')}-${months[d.getMonth()]}-${d.getFullYear()} – ${String(h12).padStart(2,'0')}:${mm} ${ampm}`
  }

  const StatusBadge = ({ status }) => {
    const base = 'px-2 py-1 text-xs rounded-md'
    const cls = status === 'Completed'
      ? 'bg-emerald-50 text-emerald-600'
      : status === 'Pending'
        ? 'bg-yellow-50 text-yellow-600'
        : status === 'No-show'
          ? 'bg-red-50 text-red-600'
          : status === 'Cancelled'
            ? 'bg-gray-100 text-gray-600'
            : 'bg-blue-50 text-blue-600'
    return <span className={`${base} ${cls}`}>{t(status)}</span>
  }

  return (
    <Layout titleKey="Check-in Report">
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
              <label className="text-sm text-[var(--muted-text)]">{t('Staff / Manager')}</label>
              <input value={staff} onChange={e=>setStaff(e.target.value)} className="input w-full" placeholder={t('e.g. Omar Ali')} />
            </div>
            <div>
              <label className="text-sm text-[var(--muted-text)]">{t('Timeframe')}</label>
              <select value={timeframe} onChange={e=>setTimeframe(e.target.value)} className="input w-full">
                <option value="day">{t('Day')}</option>
                <option value="week">{t('Week')}</option>
                <option value="month">{t('Month')}</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-[var(--muted-text)]">{t('Reference Date')}</label>
              <input type="date" lang={isRTL ? 'ar' : 'en'} dir={isRTL ? 'rtl' : 'ltr'} placeholder={isRTL ? 'اليوم/الشهر/السنة' : 'mm/dd/yyyy'} value={refDate} onChange={e=>setRefDate(e.target.value)} className="input w-full" />
            </div>
            <div>
              <label className="text-sm text-[var(--muted-text)]">{t('Status')}</label>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="input w-full">
                <option value="all">{t('All')}</option>
                <option value="Checked-in">{t('Checked-in')}</option>
                <option value="No-show">{t('No-show')}</option>
                <option value="Cancelled">{t('Cancelled')}</option>
                <option value="Completed">{t('Completed')}</option>
                <option value="Pending">{t('Pending')}</option>
              </select>
            </div>
          </div>
        </div>
        {/* Spacer under filters */}
        <div aria-hidden="true" className="h-6" />

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)]">{t('Total Check-ins')}</div>
            <div className="text-3xl font-bold">{totalCheckins}</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)]">{t('No-shows')}</div>
            <div className="text-3xl font-bold">{noShows}</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)]">{t('Completed')}</div>
            <div className="text-3xl font-bold">{completed}</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)]">{t('Pending / Upcoming')}</div>
            <div className="text-3xl font-bold">{pending}</div>
          </div>
        </div>
        {/* Spacer under cards */}
        <div aria-hidden="true" className="h-6" />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="glass-panel rounded-xl p-4">
            <div className={`flex items-center gap-2 mb-2`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold`}>{t('Status Distribution')}</h3>
            </div>
          <div className="flex items-center gap-6">
              <PieChart segments={pieSegments} size={180} cutout={70} centerValue={filteredRows.length} centerLabel={t('Check-ins')} />
              <div className="space-y-2 text-sm">
                {pieSegments.map(s => (
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
            <div className={`flex items-center gap-2 mb-2`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold`}>{t('Check-ins Trend')}</h3>
            </div>
            <Line
              data={{
                labels: trend.labels,
                datasets: [{
                  label: t('Check-ins'),
                  data: trend.values,
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59,130,246,0.2)',
                  tension: 0.3,
                  fill: true,
                  pointRadius: 3
                }]
              }}
              options={{ responsive: true, plugins: { legend: { display: true } } }}
            />
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className={`flex items-center gap-2 mb-2`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold`}>{t('Check-ins per Staff')}</h3>
            </div>
            <Bar
              data={{
                labels: byStaff.labels,
                datasets: [{
                  label: t('Check-ins'),
                  data: byStaff.values,
                  backgroundColor: '#10b981',
                  borderRadius: 6
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
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm nova-table nova-table--glass">
              <thead>
                <tr className="text-left bg-[var(--table-header-bg)]">
                  <th className="px-3 py-2">{t('Name')}</th>
                  <th className="px-3 py-2">{t('Check-in Date')}</th>
                  <th className="px-3 py-2">{t('Check-out Date')}</th>
                  <th className="px-3 py-2">{t('Department / Reservation')}</th>
                  <th className="px-3 py-2">{t('Status')}</th>
                  <th className="px-3 py-2">{t('Handled By')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-[var(--muted-text)]">{t('No data')}</td>
                  </tr>
                )}
                {filteredRows.map(r => (
                  <tr key={r.id} className="border-t border-[var(--table-row-border)] odd:bg-[var(--table-row-bg)] hover:bg-[var(--table-row-hover)] transition-colors">
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">{formatDateTime(r.checkIn)}</td>
                    <td className="px-3 py-2">{formatDateTime(r.checkOut)}</td>
                    <td className="px-3 py-2">{r.type}</td>
                    <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-2">{r.handledBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredRows.length === 0 && (
              <div className="text-center py-6 text-[var(--muted-text)]">{t('No data')}</div>
            )}
            {filteredRows.map(r => (
              <div key={r.id} className="card glass-card p-4 space-y-3 bg-white/5 border border-gray-800 rounded-lg">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h4 className="font-semibold text-sm">{r.name}</h4>
                  <StatusBadge status={r.status} />
                </div>
                <div className="grid grid-cols-1 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-text)] text-xs">{t('Check-in Date')}</span>
                    <span className="text-xs">{formatDateTime(r.checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-text)] text-xs">{t('Check-out Date')}</span>
                    <span className="text-xs">{formatDateTime(r.checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-text)] text-xs">{t('Department / Reservation')}</span>
                    <span className="text-xs">{r.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-text)] text-xs">{t('Handled By')}</span>
                    <span className="text-xs">{r.handledBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Spacer below table */}
        <div aria-hidden="true" className="h-6" />
      </div>
    </Layout>
  )
}
