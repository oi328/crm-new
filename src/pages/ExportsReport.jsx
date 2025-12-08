import React, { useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { RiSearchLine, RiDownloadLine, RiRefreshLine } from 'react-icons/ri'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const ExportsReport = () => {
  const { t } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'

  // Top-level UI state
  const [query, setQuery] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectAll, setSelectAll] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)

  // Filters
  const [selectedManager, setSelectedManager] = useState('All')
  const [selectedEmployee, setSelectedEmployee] = useState('All')
  const [selectedDept, setSelectedDept] = useState('All')
  const [dateMode, setDateMode] = useState('month') // day | week | month | range
  const [selectedDate, setSelectedDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Demo users
  const managers = ['All', 'Ahmed Ali', 'Sara Hassan']
  const employees = ['All', 'Maram Admin', 'Ibrahim Manager', 'Lina Ops']
  const departments = ['All', 'Customers', 'Orders', 'Sales', 'Inventory']

  // Demo dataset with audit fields
  const [exportsData, setExportsData] = useState(() => {
    const now = new Date()
    const mk = (fileName, dept, by, tsOffsetDays, status, notes) => ({
      fileName,
      department: dept,
      performedBy: by,
      timestamp: new Date(now.getTime() - tsOffsetDays * 24 * 60 * 60 * 1000),
      status, // 'Success' | 'Failed'
      notes,
    })
    return [
      mk('clients_nov.csv', 'Customers', 'Ahmed Ali', 0, 'Success', ''),
      mk('orders_oct.xlsx', 'Orders', 'Sara Hassan', 1, 'Failed', 'Connection timeout'),
      mk('sales_week_44.xlsx', 'Sales', 'Maram Admin', 3, 'Success', ''),
      mk('inventory_snapshot.csv', 'Inventory', 'Lina Ops', 6, 'Failed', 'Auth token expired'),
      mk('clients_oct.csv', 'Customers', 'Ahmed Ali', 8, 'Success', ''),
      mk('orders_sep.xlsx', 'Orders', 'Ibrahim Manager', 11, 'Success', ''),
      mk('sales_q3.xlsx', 'Sales', 'Maram Admin', 15, 'Failed', 'Network drop'),
    ]
  })

  // Audit trail
  const [auditLogs, setAuditLogs] = useState(() => [])
  const logAudit = (action, status, fileName, user, dept, notes = '') => {
    setAuditLogs(prev => [
      {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        action,
        status,
        fileName,
        user,
        department: dept,
        timestamp: new Date(),
        notes,
      },
      ...prev,
    ])
  }

  // KPI counts
  const kpis = useMemo(() => {
    const total = exportsData.length
    const success = exportsData.filter(x => x.status === 'Success').length
    const failed = exportsData.filter(x => x.status === 'Failed').length
    return { total, success, failed }
  }, [exportsData])

  // Date helpers
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  const inWeek = (date, ref) => {
    const d = new Date(ref)
    const diff = (date - d) / (1000 * 60 * 60 * 24)
    return Math.abs(diff) <= 3 // approx week window around ref date
  }
  const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

  // Filtering
  const filtered = useMemo(() => {
    let rows = exportsData
    // text query
    if (query) rows = rows.filter(r => r.fileName.toLowerCase().includes(query.toLowerCase()))
    // manager/employee
    if (selectedManager !== 'All') rows = rows.filter(r => r.performedBy === selectedManager)
    if (selectedEmployee !== 'All') rows = rows.filter(r => r.performedBy === selectedEmployee)
    // department
    if (selectedDept !== 'All') rows = rows.filter(r => r.department === selectedDept)
    // date mode
    if (dateMode === 'day' && selectedDate) {
      const ref = new Date(selectedDate)
      rows = rows.filter(r => sameDay(r.timestamp, ref))
    }
    if (dateMode === 'week' && selectedDate) {
      const ref = new Date(selectedDate)
      rows = rows.filter(r => inWeek(r.timestamp, ref))
    }
    if (dateMode === 'month' && selectedDate) {
      const ref = new Date(selectedDate)
      rows = rows.filter(r => sameMonth(r.timestamp, ref))
    }
    if (dateMode === 'range' && startDate && endDate) {
      const s = new Date(startDate)
      const e = new Date(endDate)
      rows = rows.filter(r => r.timestamp >= s && r.timestamp <= e)
    }
    return rows
  }, [exportsData, query, selectedManager, selectedEmployee, selectedDept, dateMode, selectedDate, startDate, endDate])

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / entriesPerPage))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage
    return filtered.slice(start, start + entriesPerPage)
  }, [filtered, currentPage, entriesPerPage])

  // Actions
  const handleDownloadRowCSV = (row) => {
    const csvContent = `File Name,Department,Performed By,Date & Time,Status,Notes\n${row.fileName},${row.department},${row.performedBy},${row.timestamp.toLocaleString()},${row.status},${row.notes || ''}`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const name = row.fileName?.replace(/\.(xlsx|csv)$/i, '.csv') || 'export.csv'
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    logAudit('Download Row', 'Success', row.fileName, row.performedBy, row.department, '')
  }

  const handleRerun = (rowIdx) => {
    setExportsData(prev => {
      const next = [...prev]
      const item = { ...next[rowIdx] }
      // simulate retry success 70% of time
      const ok = Math.random() < 0.7
      item.status = ok ? 'Success' : 'Failed'
      item.notes = ok ? '' : 'Retry failed'
      next[rowIdx] = item
      logAudit('Re-run Export', item.status, item.fileName, item.performedBy, item.department, item.notes)
      return next
    })
  }

  // Excel & PDF export of filtered dataset
  const exportExcel = () => {
    const rows = filtered.map(r => ({
      'File Name': r.fileName,
      'Department': r.department,
      'Performed By': r.performedBy,
      'Date & Time': r.timestamp.toLocaleString(),
      'Status': r.status,
      'Notes / Errors': r.notes || '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Exports')
    XLSX.writeFile(wb, 'exports_report.xlsx')
    logAudit('Export Excel', 'Success', 'exports_report.xlsx', 'System', selectedDept === 'All' ? 'Mixed' : selectedDept)
  }

  const exportPDF = () => {
    const doc = new jsPDF('l', 'pt', 'a4')
    doc.setFontSize(14)
    doc.text(isRTL ? 'تقرير التصدير' : 'Exports Report', 40, 40)
    const head = [[
      isRTL ? 'اسم الملف' : 'File Name',
      isRTL ? 'القسم' : 'Department',
      isRTL ? 'نفّذ بواسطة' : 'Performed By',
      isRTL ? 'التاريخ والوقت' : 'Date & Time',
      isRTL ? 'الحالة' : 'Status',
      isRTL ? 'ملاحظات' : 'Notes',
    ]]
    const body = filtered.map(r => [r.fileName, r.department, r.performedBy, r.timestamp.toLocaleString(), r.status, r.notes || ''])
    doc.autoTable({ head, body, startY: 60 })
    doc.save('exports_report.pdf')
    logAudit('Export PDF', 'Success', 'exports_report.pdf', 'System', selectedDept === 'All' ? 'Mixed' : selectedDept)
  }

  // Charts
  const deptCounts = useMemo(() => {
    const m = new Map()
    filtered.forEach(r => m.set(r.department, (m.get(r.department) || 0) + 1))
    const labels = Array.from(m.keys())
    const data = labels.map(l => m.get(l))
    return { labels, data }
  }, [filtered])

  const successVsFailed = useMemo(() => {
    const s = filtered.filter(r => r.status === 'Success').length
    const f = filtered.filter(r => r.status === 'Failed').length
    return { success: s, failed: f }
  }, [filtered])

  const timelineData = useMemo(() => {
    const fmt = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toLocaleDateString()
    const m = new Map()
    filtered.forEach(r => {
      const key = fmt(r.timestamp)
      m.set(key, (m.get(key) || 0) + 1)
    })
    const labels = Array.from(m.keys()).sort((a, b) => new Date(a) - new Date(b))
    const data = labels.map(l => m.get(l))
    return { labels, data }
  }, [filtered])

  // UI helpers
  const StatusBadge = ({ status }) => {
    const isSuccess = status === 'Success'
    const label = isRTL ? (isSuccess ? 'ناجحة' : 'فاشلة') : status
    const ring = isSuccess ? 'ring-emerald-200' : 'ring-rose-200'
    const bg = isSuccess ? 'bg-emerald-100' : 'bg-rose-100'
    const text = isSuccess ? 'text-emerald-700' : 'text-rose-700'
    const dot = isSuccess ? 'bg-emerald-600' : 'bg-rose-600'
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text} ring-1 ${ring}`} title={status}>
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
        {label}
      </span>
    )
  }

  // Export modal handler
  const [exportForm, setExportForm] = useState({ fileName: '', department: 'Customers' })
  const performExport = () => {
    const user = 'Maram Admin'
    const ok = Math.random() < 0.85
    const newRecord = {
      fileName: exportForm.fileName || `export_${Date.now()}.csv`,
      department: exportForm.department,
      performedBy: user,
      timestamp: new Date(),
      status: ok ? 'Success' : 'Failed',
      notes: ok ? '' : 'Service unavailable',
    }
    setExportsData(prev => [newRecord, ...prev])
    logAudit('Export', newRecord.status, newRecord.fileName, user, newRecord.department, newRecord.notes)
    setShowExportModal(false)
    setExportForm({ fileName: '', department: 'Customers' })
  }

  return (
    <Layout>
      <div className="p-4 space-y-4">
        {/* Header + Actions */}
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">{isRTL ? 'لوحة تقارير التصدير' : 'Exports Report'}</h1>
            <div className="flex items-center gap-2">
              <button className="btn btn-glass" onClick={exportPDF}>
                <RiDownloadLine className="mr-1" /> {isRTL ? 'تنزيل PDF' : 'Download PDF'}
              </button>
              <button className="btn btn-glass" onClick={exportExcel}>
                <RiDownloadLine className="mr-1" /> {isRTL ? 'تنزيل Excel' : 'Download Excel'}
              </button>
              <button className="btn btn-primary" onClick={()=>setShowExportModal(true)}>
                {isRTL ? 'تصدير' : 'Export'}
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-panel rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="label">{isRTL ? 'المدير' : 'Manager'}</label>
              <select className="input w-full" value={selectedManager} onChange={(e)=>{ setSelectedManager(e.target.value); setCurrentPage(1) }}>
                {managers.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{isRTL ? 'الموظف' : 'Employee'}</label>
              <select className="input w-full" value={selectedEmployee} onChange={(e)=>{ setSelectedEmployee(e.target.value); setCurrentPage(1) }}>
                {employees.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{isRTL ? 'القسم' : 'Department'}</label>
              <select className="input w-full" value={selectedDept} onChange={(e)=>{ setSelectedDept(e.target.value); setCurrentPage(1) }}>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{isRTL ? 'الوضع الزمني' : 'Date Mode'}</label>
              <select className="input w-full" value={dateMode} onChange={(e)=>{ setDateMode(e.target.value); setCurrentPage(1) }}>
                <option value="day">{isRTL ? 'اليوم' : 'Day'}</option>
                <option value="week">{isRTL ? 'الأسبوع' : 'Week'}</option>
                <option value="month">{isRTL ? 'الشهر' : 'Month'}</option>
                <option value="range">{isRTL ? 'نطاق' : 'Range'}</option>
              </select>
            </div>
            {dateMode !== 'range' && (
              <div>
                <label className="label">{isRTL ? 'التاريخ' : 'Date'}</label>
                <input type="date" className="input w-full" value={selectedDate} onChange={(e)=>{ setSelectedDate(e.target.value); setCurrentPage(1) }} />
              </div>
            )}
            {dateMode === 'range' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{isRTL ? 'من' : 'Start'}</label>
                  <input type="date" className="input w-full" value={startDate} onChange={(e)=>{ setStartDate(e.target.value); setCurrentPage(1) }} />
                </div>
                <div>
                  <label className="label">{isRTL ? 'إلى' : 'End'}</label>
                  <input type="date" className="input w-full" value={endDate} onChange={(e)=>{ setEndDate(e.target.value); setCurrentPage(1) }} />
                </div>
              </div>
            )}
            <div>
              <label className="label">{isRTL ? 'بحث' : 'Search'}</label>
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={query} onChange={(e)=>{ setQuery(e.target.value); setCurrentPage(1) }} placeholder={isRTL ? 'بحث بالاسم' : 'Search file name'} className="input w-full pl-9" />
              </div>
            </div>
          </div>
        </div>
        {/* Spacer under filters */}
        <div className="h-4" aria-hidden="true" />

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-gray-500">{isRTL ? 'إجمالي عمليات التصدير' : 'Total Exports'}</div>
            <div className="text-2xl font-semibold">{kpis.total}</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-gray-500">{isRTL ? 'الناجحة' : 'Successful'}</div>
            <div className="text-2xl font-semibold text-emerald-600">{kpis.success}</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-gray-500">{isRTL ? 'الفاشلة' : 'Failed'}</div>
            <div className="text-2xl font-semibold text-rose-600">{kpis.failed}</div>
          </div>
        </div>
        {/* Spacer under cards */}
        <div className="h-4" aria-hidden="true" />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="glass-panel rounded-xl p-4">
            <div className="font-semibold mb-2">{isRTL ? 'التصدير حسب القسم' : 'Exports per Department'}</div>
            <Bar
              data={{
                labels: deptCounts.labels,
                datasets: [{ label: isRTL ? 'عدد' : 'Count', data: deptCounts.data, backgroundColor: '#4f46e5' }],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="font-semibold mb-2">{isRTL ? 'الناجحة مقابل الفاشلة' : 'Successful vs Failed'}</div>
            <Doughnut
              data={{
                labels: [isRTL ? 'ناجحة' : 'Successful', isRTL ? 'فاشلة' : 'Failed'],
                datasets: [{
                  data: [successVsFailed.success, successVsFailed.failed],
                  backgroundColor: ['#10b981', '#ef4444'],
                  borderColor: ['#ffffff', '#ffffff'],
                  borderWidth: 2,
                  hoverOffset: 6,
                }],
              }}
              options={{
                responsive: true,
                cutout: '70%',
                plugins: {
                  legend: { position: 'bottom', labels: { usePointStyle: true } },
                  tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}` } },
                },
              }}
            />
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-emerald-700">{isRTL ? 'ناجحة' : 'Successful'}: {successVsFailed.success}</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-600" />
                <span className="text-rose-700">{isRTL ? 'فاشلة' : 'Failed'}: {successVsFailed.failed}</span>
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="font-semibold mb-2">{isRTL ? 'العمليات عبر الزمن' : 'Exports Over Time'}</div>
            <Line
              data={{
                labels: timelineData.labels,
                datasets: [{ label: isRTL ? 'التصدير' : 'Exports', data: timelineData.data, borderColor: '#4f46e5', backgroundColor: '#4f46e5' }],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

        {/* Spacer above table */}
        <div className="h-4" aria-hidden="true" />
        {/* Table */}
        <div className="glass-panel rounded-xl p-0 overflow-hidden">
          <table className="nova-table nova-table--glass w-full">
            <thead>
              <tr>
                <th className="nova-th"></th>
                <th className="nova-th">{isRTL ? 'اسم الملف' : 'File Name'}</th>
                <th className="nova-th">{isRTL ? 'القسم' : 'Department'}</th>
                <th className="nova-th">{isRTL ? 'نفّذ بواسطة' : 'Performed By'}</th>
                <th className="nova-th">{isRTL ? 'التاريخ والوقت' : 'Date & Time'}</th>
                <th className="nova-th">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="nova-th">{isRTL ? 'ملاحظات' : 'Notes'}</th>
                <th className="nova-th">{isRTL ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, idx) => (
                <tr key={idx} className="nova-tr">
                  <td className="nova-td"><input type="checkbox" checked={selectAll} onChange={(e)=>setSelectAll(e.target.checked)} aria-label="select" /></td>
                  <td className="nova-td text-sm">{row.fileName}</td>
                  <td className="nova-td text-sm">{row.department}</td>
                  <td className="nova-td text-sm">{row.performedBy}</td>
                  <td className="nova-td text-sm">{row.timestamp.toLocaleString()}</td>
                  <td className="nova-td"><StatusBadge status={row.status} /></td>
                  <td className="nova-td text-sm">{row.notes || '-'}</td>
                  <td className="nova-td">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>setPreviewItem(row)} className="text-primary text-sm hover:underline">{isRTL ? 'معاينة' : 'Preview'}</button>
                      <button onClick={()=>handleDownloadRowCSV(row)} className="btn btn-glass px-2 py-1" title={isRTL ? 'تنزيل' : 'Download'}>
                        <RiDownloadLine />
                      </button>
                      {row.status === 'Failed' && (
                        <button onClick={()=>handleRerun((currentPage - 1) * entriesPerPage + idx)} className="btn btn-glass px-2 py-1" title={isRTL ? 'إعادة المحاولة' : 'Re-run'}>
                          <RiRefreshLine />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedRows.length === 0 && (
                <tr>
                  <td className="nova-td text-center text-sm text-gray-500" colSpan={8}>{isRTL ? 'لا توجد نتائج' : 'No results'}</td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Table footer */}
          <div className="p-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {isRTL ? 'العناصر لكل صفحة' : 'Entries per page'}
              <select value={entriesPerPage} onChange={(e)=>{ setEntriesPerPage(Number(e.target.value)); setCurrentPage(1) }} className="ml-2 input w-20">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-glass" disabled={currentPage === 1} onClick={()=>setCurrentPage(p=>Math.max(1, p-1))}>{isRTL ? 'السابق' : 'Prev'}</button>
              <span className="text-sm">{currentPage} / {pageCount}</span>
              <button className="btn btn-glass" disabled={currentPage === pageCount} onClick={()=>setCurrentPage(p=>Math.min(pageCount, p+1))}>{isRTL ? 'التالي' : 'Next'}</button>
            </div>
          </div>
        </div>
        {/* Spacer below table */}
        <div className="h-4" aria-hidden="true" />

        {/* Audit Trail */}
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">{isRTL ? 'سجل التدقيق' : 'Audit Trail'}</div>
            <div className="text-xs text-gray-500">{isRTL ? 'يسجّل جميع عمليات التصدير والتنزيل وإعادة المحاولة' : 'Logs all export, download, and re-run actions'}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="nova-table nova-table--glass w-full">
              <thead>
                <tr>
                  <th className="nova-th">{isRTL ? 'الوقت' : 'Time'}</th>
                  <th className="nova-th">{isRTL ? 'الإجراء' : 'Action'}</th>
                  <th className="nova-th">{isRTL ? 'اسم الملف' : 'File Name'}</th>
                  <th className="nova-th">{isRTL ? 'القسم' : 'Department'}</th>
                  <th className="nova-th">{isRTL ? 'المستخدم' : 'User'}</th>
                  <th className="nova-th">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="nova-th">{isRTL ? 'ملاحظات' : 'Notes'}</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 && (
                  <tr>
                    <td className="nova-td text-center text-sm text-gray-500" colSpan={7}>{isRTL ? 'لا توجد سجلات بعد' : 'No logs yet'}</td>
                  </tr>
                )}
                {auditLogs.map((log) => (
                  <tr key={log.id} className="nova-tr">
                    <td className="nova-td text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="nova-td text-sm">{log.action}</td>
                    <td className="nova-td text-sm">{log.fileName}</td>
                    <td className="nova-td text-sm">{log.department}</td>
                    <td className="nova-td text-sm">{log.user}</td>
                    <td className="nova-td"><StatusBadge status={log.status} /></td>
                    <td className="nova-td text-sm">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview Modal */}
        {previewItem && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={()=>setPreviewItem(null)} />
            <div className="relative z-50 glass-panel rounded-xl p-4 w-[560px] max-w-[95vw]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{isRTL ? 'معاينة الملف' : 'File Preview'}</h2>
                <button className="btn btn-glass" onClick={()=>setPreviewItem(null)}>{isRTL ? 'إغلاق' : 'Close'}</button>
              </div>
              <div className="text-sm space-y-2">
                <div><span className="font-medium">{isRTL ? 'الاسم' : 'Name'}:</span> {previewItem.fileName}</div>
                <div><span className="font-medium">{isRTL ? 'القسم' : 'Department'}:</span> {previewItem.department}</div>
                <div><span className="font-medium">{isRTL ? 'الحالة' : 'Status'}:</span> {previewItem.status}</div>
                <div><span className="font-medium">{isRTL ? 'نفّذ بواسطة' : 'Performed By'}:</span> {previewItem.performedBy}</div>
                <div><span className="font-medium">{isRTL ? 'التاريخ' : 'Date'}:</span> {previewItem.timestamp.toLocaleString()}</div>
              </div>
              <div className="mt-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-600 dark:text-gray-300">
                {isRTL ? 'هذه معاينة وصفية.' : 'This is a descriptive preview.'}
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={()=>setShowExportModal(false)} />
            <div className="relative z-50 glass-panel rounded-xl p-4 w-[560px] max-w-[95vw]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{isRTL ? 'تصدير جديد' : 'New Export'}</h2>
                <button className="btn btn-glass" onClick={()=>setShowExportModal(false)}>{isRTL ? 'إغلاق' : 'Close'}</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label">{isRTL ? 'اسم الملف' : 'File Name'}</label>
                  <input className="input w-full" value={exportForm.fileName} onChange={(e)=>setExportForm(f=>({ ...f, fileName: e.target.value }))} placeholder={isRTL ? 'clients_export.csv' : 'clients_export.csv'} />
                </div>
                <div>
                  <label className="label">{isRTL ? 'القسم' : 'Department'}</label>
                  <select className="input w-full" value={exportForm.department} onChange={(e)=>setExportForm(f=>({ ...f, department: e.target.value }))}>
                    {departments.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button className="btn btn-glass" onClick={()=>setShowExportModal(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
                <button className="btn btn-primary" onClick={performExport}>{isRTL ? 'تنفيذ التصدير' : 'Perform Export'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ExportsReport