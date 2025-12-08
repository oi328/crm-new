import React, { useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import * as XLSX from 'xlsx'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { PieChart } from '@shared/components/PieChart'
import { RiUploadLine, RiRefreshLine } from 'react-icons/ri'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

const ImportsReport = () => {
  const { t } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'

  // Demo audit trail dataset
  const initialLogs = [
    { id: 1, fileName: 'clients_nov.csv', department: 'Customers', performedBy: 'Ahmed Ali', manager: 'Maram Admin', dateTime: '2025-11-09T08:45:00', status: 'Success', notes: '' },
    { id: 2, fileName: 'orders_oct.xlsx', department: 'Orders', performedBy: 'Sara Hassan', manager: 'Maram Admin', dateTime: '2025-11-08T15:10:00', status: 'Failed', notes: 'Missing column “Order ID”' },
    { id: 3, fileName: 'inventory_11_07.csv', department: 'Inventory', performedBy: 'Omar Ali', manager: 'Maram Admin', dateTime: '2025-11-07T10:05:00', status: 'Success', notes: '' },
    { id: 4, fileName: 'leads_batch_oct.xlsx', department: 'Leads', performedBy: 'Mona Adel', manager: 'Maram Admin', dateTime: '2025-11-06T13:30:00', status: 'Success', notes: '' },
    { id: 5, fileName: 'marketing_campaigns.csv', department: 'Marketing', performedBy: 'Ahmed Ali', manager: 'Maram Admin', dateTime: '2025-11-05T09:15:00', status: 'Failed', notes: 'Unsupported date format in column “Start Date”' },
  ]
  const [logs, setLogs] = useState(initialLogs)

  // Filters
  const [managerFilter, setManagerFilter] = useState('all')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [dateMode, setDateMode] = useState('day') // 'day' | 'week' | 'month' | 'range'
  const [dateDay, setDateDay] = useState('')
  const [dateWeek, setDateWeek] = useState('') // YYYY-Www
  const [dateMonth, setDateMonth] = useState('') // YYYY-MM
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Import modal state
  const [showImport, setShowImport] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importDepartment, setImportDepartment] = useState('Customers')
  const [importPerformedBy, setImportPerformedBy] = useState('Ahmed Ali')
  const [importManager, setImportManager] = useState('Maram Admin')
  const [importStatus, setImportStatus] = useState('Success') // Success | Failed
  const [importNotes, setImportNotes] = useState('')

  const departments = useMemo(() => Array.from(new Set(logs.map(l => l.department))), [logs])
  const managers = useMemo(() => Array.from(new Set(logs.map(l => l.manager))), [logs])
  const employees = useMemo(() => Array.from(new Set(logs.map(l => l.performedBy))), [logs])

  // Helpers
  const toDate = (s) => new Date(s)
  const getISOWeek = (d) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    const dayNum = date.getUTCDay() || 7
    date.setUTCDate(date.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
    const weekNum = Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
    return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`
  }
  const matchDateFilter = (d) => {
    if (!dateMode) return true
    if (dateMode === 'day') return !dateDay || new Date(d).toISOString().slice(0,10) === dateDay
    if (dateMode === 'week') return !dateWeek || getISOWeek(new Date(d)) === dateWeek
    if (dateMode === 'month') return !dateMonth || new Date(d).toISOString().slice(0,7) === dateMonth
    if (dateMode === 'range') {
      const dt = new Date(d)
      const fromOk = dateFrom ? dt >= new Date(dateFrom) : true
      const toOk = dateTo ? dt <= new Date(dateTo) : true
      return fromOk && toOk
    }
    return true
  }

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const mOk = managerFilter === 'all' || l.manager === managerFilter
      const eOk = employeeFilter === 'all' || l.performedBy === employeeFilter
      const dOk = departmentFilter === 'all' || l.department === departmentFilter
      const timeOk = matchDateFilter(l.dateTime)
      return mOk && eOk && dOk && timeOk
    })
  }, [logs, managerFilter, employeeFilter, departmentFilter, dateMode, dateDay, dateWeek, dateMonth, dateFrom, dateTo])

  // KPIs
  const totalImports = filtered.length
  const successful = filtered.filter(l => l.status === 'Success').length
  const failed = filtered.filter(l => l.status === 'Failed').length

  // Charts
  const byDepartmentCounts = useMemo(() => {
    const map = new Map()
    filtered.forEach(l => {
      map.set(l.department, (map.get(l.department) || 0) + 1)
    })
    return map
  }, [filtered])

  const statusDist = useMemo(() => ({
    Success: successful,
    Failed: failed
  }), [successful, failed])

  const timeline = useMemo(() => {
    // Count imports per day
    const map = new Map()
    filtered.forEach(l => {
      const k = new Date(l.dateTime).toISOString().slice(0,10)
      map.set(k, (map.get(k) || 0) + 1)
    })
    const entries = Array.from(map.entries()).sort((a,b) => a[0].localeCompare(b[0]))
    return {
      labels: entries.map(e => e[0]),
      counts: entries.map(e => e[1])
    }
  }, [filtered])

  // Actions
  const addImportLog = (payload) => {
    const newLog = {
      id: logs.length ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      ...payload,
      dateTime: payload.dateTime || new Date().toISOString()
    }
    setLogs(prev => [newLog, ...prev])
  }

  const onImportSubmit = (e) => {
    e.preventDefault()
    if (!importFile) return
    addImportLog({
      fileName: importFile.name,
      department: importDepartment,
      performedBy: importPerformedBy,
      manager: importManager,
      status: importStatus,
      notes: importNotes || ''
    })
    // reset
    setShowImport(false)
    setImportFile(null)
    setImportNotes('')
    setImportStatus('Success')
  }

  const rerunImport = (log) => {
    // Append a new audit entry reflecting the re-run (simulate success)
    addImportLog({
      fileName: log.fileName,
      department: log.department,
      performedBy: log.performedBy,
      manager: log.manager,
      status: 'Success',
      notes: 'Re-run completed successfully'
    })
  }

  // Export
  const exportExcel = () => {
    const rows = filtered.map(l => ({
      FileName: l.fileName,
      Department: l.department,
      PerformedBy: l.performedBy,
      Manager: l.manager,
      DateTime: new Date(l.dateTime).toLocaleString(),
      Status: l.status,
      Notes: l.notes || ''
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Imports')
    XLSX.writeFile(wb, 'imports_report.xlsx')
  }
  const exportPdf = () => window.print()

  const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status === 'Success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
      {status === 'Success' ? t('Success') : t('Failed')}
    </span>
  )

  return (
    <Layout>
      {/* عنوان الصفحة */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">
          {isRTL ? 'تقرير الواردات' : 'Imports Report'}
        </h1>
      </div>
      {/* Top actions under header (right aligned) */}
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={exportPdf} className="btn btn-primary">{t('Download PDF', 'Download PDF')}</button>
        <button onClick={exportExcel} className="btn btn-secondary">{t('Download Excel', 'Download Excel')}</button>
        <button onClick={() => setShowImport(true)} className="btn btn-accent inline-flex items-center gap-2">
          <RiUploadLine /> {t('Import', 'Import')}
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col">
              <label className="text-sm text-[var(--muted-text)]">{t('Manager', 'Manager')}</label>
              <select value={managerFilter} onChange={e => setManagerFilter(e.target.value)} className="input min-w-[160px]">
                <option value="all">{t('All', 'All')}</option>
                {managers.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-[var(--muted-text)]">{t('Employee', 'Employee')}</label>
              <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="input min-w-[160px]">
                <option value="all">{t('All', 'All')}</option>
                {employees.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-[var(--muted-text)]">{t('Department', 'Department')}</label>
              <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="input min-w-[140px]">
                <option value="all">{t('All', 'All')}</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-[var(--muted-text)]">{t('Date Filter')}</label>
              <select value={dateMode} onChange={e => setDateMode(e.target.value)} className="input min-w-[160px]">
                <option value="day">{t('Day')}</option>
                <option value="week">{t('Week')}</option>
                <option value="month">{t('Month')}</option>
                <option value="range">{t('Custom Range')}</option>
              </select>
            </div>
            {dateMode === 'day' && (
              <div className="flex flex-col">
                <label className="text-sm text-[var(--muted-text)]">{t('Date')}</label>
                <input type="date" value={dateDay} onChange={e => setDateDay(e.target.value)} className="input" />
              </div>
            )}
            {dateMode === 'week' && (
              <div className="flex flex-col">
                <label className="text-sm text-[var(--muted-text)]">{t('Week')}</label>
                <input type="week" value={dateWeek} onChange={e => setDateWeek(e.target.value)} className="input" />
              </div>
            )}
            {dateMode === 'month' && (
              <div className="flex flex-col">
                <label className="text-sm text-[var(--muted-text)]">{t('Month')}</label>
                <input type="month" value={dateMonth} onChange={e => setDateMonth(e.target.value)} className="input" />
              </div>
            )}
            {dateMode === 'range' && (
              <>
                <div className="flex flex-col">
                  <label className="text-sm text-[var(--muted-text)]">{t('From')}</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-[var(--muted-text)]">{t('To')}</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input" />
                </div>
              </>
            )}
          </div>

          
        </div>
      </div>

      <div className="h-6" aria-hidden="true"></div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('Total Imports'), value: totalImports, color: 'bg-blue-500' },
          { label: t('Successful'), value: successful, color: 'bg-emerald-500' },
          { label: t('Failed'), value: failed, color: 'bg-rose-500' },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-panel p-4">
            <div className="text-sm text-[var(--muted-text)]">{kpi.label}</div>
            <div className="mt-1 text-2xl font-semibold">{kpi.value}</div>
            <div className={`mt-2 h-1.5 rounded ${kpi.color}`}></div>
          </div>
        ))}
      </div>

      <div className="h-6" aria-hidden="true"></div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar: imports per department */}
        <div className="glass-panel p-4">
          <div className="text-sm font-medium mb-2">{t('Imports per Department')}</div>
          <Bar
            data={{
              labels: Array.from(byDepartmentCounts.keys()),
              datasets: [{
                label: t('Imports'),
                data: Array.from(byDepartmentCounts.values()),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
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

        {/* Pie: success vs failed */}
        <div className="glass-panel p-4">
          <div className="text-sm font-medium mb-2">{t('Success vs Failed')}</div>
          <PieChart
            segments={[
              { label: t('Success'), value: statusDist.Success, color: '#10b981' },
              { label: t('Failed'), value: statusDist.Failed, color: '#ef4444' },
            ]}
            totalLabel={t('Imports')}
          />
        </div>

        {/* Timeline: imports over time */}
        <div className="glass-panel p-4">
          <div className="text-sm font-medium mb-2">{t('Imports Over Time')}</div>
          <Line
            data={{
              labels: timeline.labels,
              datasets: [{
                label: t('Imports'),
                data: timeline.counts,
                borderColor: 'rgba(16, 185, 129, 0.9)',
                backgroundColor: 'transparent',
                tension: 0.3,
                pointRadius: 2
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { ticks: { callback: v => `${v}` } } }
            }}
          />
        </div>
      </div>

      <div className="h-6" aria-hidden="true"></div>

      {/* Table */}
      <div className="glass-panel p-4">
        <div className="text-sm font-medium mb-3">{t('Import Logs')}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm nova-table nova-table--glass">
            <thead>
              <tr className="text-left bg-[var(--table-header-bg)]">
                <th className="px-3 py-2">{t('File Name')}</th>
                <th className="px-3 py-2">{t('Department')}</th>
                <th className="px-3 py-2">{t('Performed By')}</th>
                <th className="px-3 py-2">{t('Date & Time')}</th>
                <th className="px-3 py-2">{t('Status')}</th>
                <th className="px-3 py-2">{t('Notes / Errors')}</th>
                <th className="px-3 py-2">{t('Action')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-[var(--muted-text)]">{t('No data')}</td>
                </tr>
              )}
              {filtered.map(l => (
                <tr key={l.id} className="border-t border-[var(--table-row-border)] odd:bg-[var(--table-row-bg)] hover:bg-[var(--table-row-hover)] transition-colors">
                  <td className="px-3 py-2">{l.fileName}</td>
                  <td className="px-3 py-2">{l.department}</td>
                  <td className="px-3 py-2">{l.performedBy} <span className="text-[var(--muted-text)]">({l.manager})</span></td>
                  <td className="px-3 py-2">{new Date(l.dateTime).toLocaleString()}</td>
                  <td className="px-3 py-2"><StatusBadge status={l.status} /></td>
                  <td className="px-3 py-2">{l.notes || '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {l.status === 'Failed' && (
                        <button onClick={() => rerunImport(l)} className="btn btn-glass inline-flex items-center gap-1">
                          <RiRefreshLine /> {t('Re-run')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-6" aria-hidden="true"></div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowImport(false)} />
          <form onSubmit={onImportSubmit} className="relative z-50 glass-panel rounded-xl p-4 w-[560px] max-w-[95vw]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{t('New Import')}</h2>
              <button type="button" className="btn btn-glass" onClick={() => setShowImport(false)}>{t('Close')}</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-[var(--muted-text)]">{t('File')}</label>
                <input type="file" onChange={e => setImportFile(e.target.files?.[0] || null)} className="input" required />
              </div>
              <div>
                <label className="text-sm text-[var(--muted-text)]">{t('Department')}</label>
                <select value={importDepartment} onChange={e => setImportDepartment(e.target.value)} className="input">
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-[var(--muted-text)]">{t('Performed By')}</label>
                <select value={importPerformedBy} onChange={e => setImportPerformedBy(e.target.value)} className="input">
                  {employees.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-[var(--muted-text)]">{t('Manager')}</label>
                <select value={importManager} onChange={e => setImportManager(e.target.value)} className="input">
                  {managers.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-[var(--muted-text)]">{t('Result')}</label>
                <select value={importStatus} onChange={e => setImportStatus(e.target.value)} className="input">
                  <option value="Success">{t('Success')}</option>
                  <option value="Failed">{t('Failed')}</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-[var(--muted-text)]">{t('Notes / Errors')}</label>
                <textarea value={importNotes} onChange={e => setImportNotes(e.target.value)} className="input" rows={3} placeholder={t('Optional', 'Optional')} />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button type="submit" className="btn btn-primary inline-flex items-center gap-2"><RiUploadLine /> {t('Import')}</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  )
}

export default ImportsReport
