import React, { useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { PieChart } from '@shared/components/PieChart'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import SearchableSelect from '@shared/components/SearchableSelect'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

export default function ReservationsReport() {
  const { t } = useTranslation()

  // Demo dataset covering requested fields
  const raw = [
    {
      id: 1,
      customer: 'Ahmed Hassan',
      contact: '+20 100 123 4567',
      reservationDateTime: '2025-11-09T20:00:00',
      type: 'Table for 4',
      status: 'confirmed',
      value: 850,
      handledBy: 'Omar Ali',
      createdOn: '2025-11-07'
    },
    {
      id: 2,
      customer: 'Mona Said',
      contact: '+20 101 555 0000',
      reservationDateTime: '2025-11-10T14:00:00',
      type: 'Catering Order',
      status: 'pending',
      value: 1200,
      handledBy: 'Sara Kamal',
      createdOn: '2025-11-08'
    },
    {
      id: 3,
      customer: 'Ola Sami',
      contact: '+20 120 222 3333',
      reservationDateTime: '2025-11-11T18:30:00',
      type: 'Room',
      status: 'confirmed',
      value: 1800,
      handledBy: 'Omar Ali',
      createdOn: '2025-11-08'
    },
    {
      id: 4,
      customer: 'Karim Mostafa',
      contact: '+20 111 777 8888',
      reservationDateTime: '2025-11-09T12:00:00',
      type: 'Appointment',
      status: 'cancelled',
      value: 0,
      handledBy: 'Nour El-Din',
      createdOn: '2025-11-07'
    },
    {
      id: 5,
      customer: 'Sara Hassan',
      contact: '+20 102 987 6543',
      reservationDateTime: '2025-11-12T16:00:00',
      type: 'Table for 2',
      status: 'completed',
      value: 400,
      handledBy: 'Sara Kamal',
      createdOn: '2025-11-09'
    },
    {
      id: 6,
      customer: 'Omar Mostafa',
      contact: '+20 103 321 0000',
      reservationDateTime: '2025-11-10T19:30:00',
      type: 'Room',
      status: 'confirmed',
      value: 2200,
      handledBy: 'Mona Adel',
      createdOn: '2025-11-08'
    },
    {
      id: 7,
      customer: 'Layla Ahmed',
      contact: '+20 104 888 1234',
      reservationDateTime: '2025-11-11T10:00:00',
      type: 'Appointment',
      status: 'pending',
      value: 300,
      handledBy: 'Nour El-Din',
      createdOn: '2025-11-09'
    },
    {
      id: 8,
      customer: 'Hussein Ali',
      contact: '+20 105 444 2222',
      reservationDateTime: '2025-11-12T21:00:00',
      type: 'Table for 6',
      status: 'cancelled',
      value: 0,
      handledBy: 'Mona Adel',
      createdOn: '2025-11-10'
    }
  ]

  const staffList = useMemo(() => {
    const set = new Set(raw.map(r => r.handledBy))
    return ['all', ...Array.from(set)]
  }, [])

  // Filters
  const [staff, setStaff] = useState('all')
  const [dateType, setDateType] = useState('reservation') // 'reservation' | 'created'
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('all') // 'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed'

  const within = (dateStr) => {
    if (!from && !to) return true
    const d = new Date(dateStr)
    const fromOk = from ? d >= new Date(from) : true
    const toOk = to ? d <= new Date(to) : true
    return fromOk && toOk
  }

  const filtered = useMemo(() => {
    return raw.filter(r => {
      const date = dateType === 'created' ? r.createdOn : r.reservationDateTime.slice(0, 10)
      const byStaff = staff === 'all' ? true : r.handledBy === staff
      const byStatus = status === 'all' ? true : r.status === status
      const byDate = within(date)
      return byStaff && byStatus && byDate
    })
  }, [raw, staff, status, dateType, from, to])

  // KPIs
  const totalReservations = filtered.length
  const confirmedCount = filtered.filter(r => r.status === 'confirmed').length
  const cancelledCount = filtered.filter(r => r.status === 'cancelled').length
  const totalRevenue = filtered.reduce((sum, r) => sum + (r.value || 0), 0)
  const averageValue = totalReservations ? Math.round(totalRevenue / totalReservations) : 0
  const roomReservations = filtered.filter(r => r.type.toLowerCase().includes('room'))
  const occupancyRate = roomReservations.length
    ? Math.round((roomReservations.filter(r => r.status === 'confirmed').length / roomReservations.length) * 100)
    : null

  // Charts data
  const dayKey = (dt) => dt.slice(0, 10)
  const labels = Array.from(new Set(filtered.map(r => dayKey(r.reservationDateTime)))).sort()
  const lineData = {
    labels,
    datasets: [{
      label: t('Reservations per day'),
      data: labels.map(d => filtered.filter(r => dayKey(r.reservationDateTime) === d).length),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.2)'
    }]
  }
  const lineOptions = { responsive: true, plugins: { legend: { display: false } } }

  const statusSegments = [
    { label: t('Confirmed'), value: filtered.filter(r => r.status === 'confirmed').length, color: '#10b981' },
    { label: t('Pending'), value: filtered.filter(r => r.status === 'pending').length, color: '#f59e0b' },
    { label: t('Cancelled'), value: filtered.filter(r => r.status === 'cancelled').length, color: '#ef4444' },
    { label: t('Completed'), value: filtered.filter(r => r.status === 'completed').length, color: '#64748b' }
  ]

  const revenueByStaffLabels = Array.from(new Set(filtered.map(r => r.handledBy)))
  const revenueByStaffData = {
    labels: revenueByStaffLabels,
    datasets: [{
      label: t('Revenue by staff'),
      data: revenueByStaffLabels.map(s => filtered.filter(r => r.handledBy === s).reduce((sum, r) => sum + (r.value || 0), 0)),
      backgroundColor: '#10b981'
    }]
  }
  const barOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }

  // Export
  const exportExcel = () => {
    const rows = filtered.map(r => ({
      Customer: r.customer,
      Contact: r.contact,
      ReservationDateTime: r.reservationDateTime,
      Type: r.type,
      Status: r.status,
      ValueEGP: r.value,
      HandledBy: r.handledBy,
      CreatedOn: r.createdOn
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reservations')
    XLSX.writeFile(wb, 'reservations-dashboard.xlsx')
  }
  const exportPdf = () => window.print()

  const statusClass = (s) => {
    switch (s) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
      case 'cancelled': return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      case 'completed': return 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <Layout titleKey="Reservations">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t('Reservations')}</h1>
          <div className="flex gap-2">
            <button onClick={exportPdf} className="btn btn-primary">{t('Download PDF')}</button>
            <button onClick={exportExcel} className="btn btn-secondary">{t('Download Excel')}</button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('Staff')}</label>
              <SearchableSelect value={staff} onChange={(v) => setStaff(v)} className="px-3 py-2">
                {staffList.map(s => <option key={s} value={s}>{s === 'all' ? t('All') : s}</option>)}
              </SearchableSelect>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('Date Type')}</label>
              <SearchableSelect value={dateType} onChange={(v) => setDateType(v)} className="px-3 py-2">
                <option value="reservation">{t('Reservation Date')}</option>
                <option value="created">{t('Created Date')}</option>
              </SearchableSelect>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('From')}</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('To')}</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('Status')}</label>
              <SearchableSelect value={status} onChange={(v) => setStatus(v)} className="px-3 py-2">
                <option value="all">{t('All')}</option>
                <option value="confirmed">{t('Confirmed')}</option>
                <option value="pending">{t('Pending')}</option>
                <option value="cancelled">{t('Cancelled')}</option>
                <option value="completed">{t('Completed')}</option>
              </SearchableSelect>
            </div>
          </div>
        </div>
        <div className="h-3" aria-hidden="true"></div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t('Total Reservations'), value: totalReservations, accent: 'bg-blue-500' },
            { label: t('Confirmed vs Cancelled'), value: `${confirmedCount} / ${cancelledCount}`, accent: 'bg-emerald-500' },
            { label: t('Total Revenue'), value: `${totalRevenue.toLocaleString()} EGP`, accent: 'bg-indigo-500' },
            { label: t('Average Value'), value: `${averageValue.toLocaleString()} EGP`, accent: 'bg-amber-500' }
          ].map((k) => (
            <div key={k.label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{k.label}</div>
                <div className="text-lg font-semibold">{k.value}</div>
              </div>
              <div className={`w-8 h-8 rounded-lg ${k.accent}`}></div>
            </div>
          ))}
        </div>
        <div className="h-3" aria-hidden="true"></div>

        {/* Table */}
        <div className="h-3" aria-hidden="true"></div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="text-sm font-semibold mb-3">{t('Reservations')}</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 px-3">{t('Customer')}</th>
                  <th className="py-2 px-3">{t('Reservation Date')}</th>
                  <th className="py-2 px-3">{t('Type')}</th>
                  <th className="py-2 px-3">{t('Status')}</th>
                  <th className="py-2 px-3">{t('Value')}</th>
                  <th className="py-2 px-3">{t('Handled By')}</th>
                  <th className="py-2 px-3">{t('Created On')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <>
                    <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-3">
                        <div className="font-medium">{r.customer}</div>
                        <div className="text-xs text-gray-500">{r.contact}</div>
                      </td>
                      <td className="py-2 px-3">{new Date(r.reservationDateTime).toLocaleString()}</td>
                      <td className="py-2 px-3">{r.type}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-md text-xs ${statusClass(r.status)}`}>{t(r.status.charAt(0).toUpperCase() + r.status.slice(1))}</span>
                      </td>
                      <td className="py-2 px-3">{r.value ? `${r.value.toLocaleString()} EGP` : '-'}</td>
                      <td className="py-2 px-3">{r.handledBy}</td>
                      <td className="py-2 px-3">{r.createdOn}</td>
                    </tr>
                    <tr aria-hidden="true">
                      <td colSpan={7}>
                        <div className="h-3"></div>
                      </td>
                    </tr>
                  </>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">{t('No reservations found for selected filters')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="h-3" aria-hidden="true"></div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-sm font-semibold mb-2">{t('Reservations per day')}</div>
            <div className="h-48"><Line data={lineData} options={lineOptions} /></div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-sm font-semibold mb-2">{t('Distribution by status')}</div>
            <div className="h-48 flex items-center justify-center"><PieChart segments={statusSegments} size={170} /></div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-sm font-semibold mb-2">{t('Revenue by staff')}</div>
            <div className="h-48"><Bar data={revenueByStaffData} options={barOptions} /></div>
          </div>
        </div>
      </div>
    </Layout>
  )
}