import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { RiSearchLine, RiRefreshLine } from 'react-icons/ri'
import { FaFileExport, FaFileExcel, FaFilePdf } from 'react-icons/fa'
import { Filter, Calendar, FileText, CheckCircle2, XCircle, ChevronDown, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Bar } from 'react-chartjs-2'
import { PieChart } from '@shared/components/PieChart'
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
  const navigate = useNavigate()

  // Top-level UI state
  const [query, setQuery] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [previewItem, setPreviewItem] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef(null)
  
  // Filters
  const [selectedManager, setSelectedManager] = useState('All')
  const [selectedEmployee, setSelectedEmployee] = useState('All')
  const [selectedDept, setSelectedDept] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [datePreset, setDatePreset] = useState('year')

  // Demo users
  const managers = ['All', 'Ahmed Ali', 'Sara Hassan']
  const employees = ['All', 'Maram Admin', 'Ibrahim Manager', 'Lina Ops']
  const departments = ['All', 'Customers', 'Orders', 'Sales', 'Inventory']

  const dateOptions = [
    { value: 'today', label: isRTL ? 'اليوم' : 'Today' },
    { value: 'week', label: isRTL ? 'أسبوعيًا' : 'Weekly' },
    { value: 'month', label: isRTL ? 'شهريًا' : 'Monthly' },
    { value: 'year', label: isRTL ? 'سنويًا' : 'Yearly' },
  ]

  // Demo dataset
  const [exportsData, setExportsData] = useState(() => {
    const now = new Date()
    const mk = (fileName, dept, by, tsOffsetDays, status, error) => ({
      fileName,
      department: dept,
      performedBy: by,
      timestamp: new Date(now.getTime() - tsOffsetDays * 24 * 60 * 60 * 1000),
      status, // 'Success' | 'Failed'
      error,
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

  // Date helpers
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

  // Filtering
  const latestDate = useMemo(() => {
    if (!exportsData.length) return new Date()
    const timestamps = exportsData.map(r => r.timestamp.getTime())
    return new Date(Math.max(...timestamps))
  }, [exportsData])

  const filtered = useMemo(() => {
    let rows = exportsData
    // text query
    if (query) rows = rows.filter(r => r.fileName.toLowerCase().includes(query.toLowerCase()))
    // manager/employee
    if (selectedManager !== 'All') rows = rows.filter(r => r.performedBy === selectedManager)
    if (selectedEmployee !== 'All') rows = rows.filter(r => r.performedBy === selectedEmployee)
    // department
    if (selectedDept !== 'All') rows = rows.filter(r => r.department === selectedDept)

    // status
    if (statusFilter !== 'All') rows = rows.filter(r => r.status === statusFilter)
    
    // date preset
    rows = rows.filter(r => {
      const dt = r.timestamp
      if (datePreset === 'today') return sameDay(dt, latestDate)
      if (datePreset === 'week') {
        const diffMs = latestDate.getTime() - dt.getTime()
        const diffDays = diffMs / (1000 * 60 * 60 * 24)
        return diffDays <= 7 && diffDays >= 0
      }
      if (datePreset === 'month') return sameMonth(dt, latestDate)
      if (datePreset === 'year') return dt.getFullYear() === latestDate.getFullYear()
      return true
    })
    
    return rows
  }, [exportsData, query, selectedManager, selectedEmployee, selectedDept, statusFilter, datePreset, latestDate])

  const clearFilters = () => {
    setSelectedManager('All')
    setSelectedEmployee('All')
    setSelectedDept('All')
    setStatusFilter('All')
    setDatePreset('year')
    setQuery('')
    setCurrentPage(1)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / entriesPerPage))
  const totalExports = filtered.length
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage
    return filtered.slice(start, start + entriesPerPage)
  }, [filtered, currentPage, entriesPerPage])

  // Actions
  const handleDownloadRowCSV = (row) => {
    const csvContent = `File Name,Department,Performed By,Date & Time,Status,error\n${row.fileName},${row.department},${row.performedBy},${row.timestamp.toLocaleString()},${row.status},${row.error || ''}`
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
  }

  const handleRerun = (rowIdx) => {
    setExportsData(prev => {
      const next = [...prev]
      const item = { ...next[rowIdx] }
      // simulate retry success 70% of time
      const ok = Math.random() < 0.7
      item.status = ok ? 'Success' : 'Failed'
      item.error = ok ? '' : 'Retry failed'
      next[rowIdx] = item
      return next
    })
  }

  // Excel & PDF export of filtered dataset
  const exportExcel = () => {
    const rows = filtered.map(r => ({
      [isRTL ? 'اسم الملف' : 'File Name']: r.fileName,
      [isRTL ? 'القسم' : 'Department']: r.department,
      [isRTL ? 'نفّذ بواسطة' : 'Performed By']: r.performedBy,
      [isRTL ? 'التاريخ والوقت' : 'Date & Time']: r.timestamp.toLocaleString(),
      [isRTL ? 'الحالة' : 'Status']: r.status,
      [isRTL ? 'اخطاء' : 'error']: r.error || '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Exports')
    XLSX.writeFile(wb, 'exports_report.xlsx')
    setShowExportMenu(false)
  }

  const exportPDF = () => {
    const doc = new jsPDF('l', 'pt', 'a4')
    
    const tableColumn = [
      isRTL ? 'اسم الملف' : 'File Name',
      isRTL ? 'القسم' : 'Department',
      isRTL ? 'نفّذ بواسطة' : 'Performed By',
      isRTL ? 'التاريخ والوقت' : 'Date & Time',
      isRTL ? 'الحالة' : 'Status',
      isRTL ? 'اخطاء' : 'error'
    ]
    
    const tableRows = filtered.map(r => [
      r.fileName,
      r.department,
      r.performedBy,
      r.timestamp.toLocaleString(),
      r.status,
      r.error || ''
    ])

    doc.text(isRTL ? 'تقرير التصدير' : 'Exports Report', 40, 40)
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      styles: { font: 'Amiri-Regular', fontSize: 10, halign: isRTL ? 'right' : 'left' },
      headStyles: { fillColor: [66, 139, 202], halign: isRTL ? 'right' : 'left' }
    })
    doc.save('exports_report.pdf')
    setShowExportMenu(false)
  }

  // Charts
  // Removed Exports Over Time line chart per latest design

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
      error: ok ? '' : 'Service unavailable',
    }
    setExportsData(prev => [newRecord, ...prev])
    setShowExportModal(false)
    setExportForm({ fileName: '', department: 'Customers' })
  }
  const successful = filtered.filter(x => x.status === 'Success').length
  const failed = filtered.filter(x => x.status === 'Failed').length
  const successVsFailed = { success: successful, failed }

  const exportsPerManager = useMemo(() => {
    const map = new Map()
    filtered.forEach(r => {
      map.set(r.performedBy, (map.get(r.performedBy) || 0) + 1)
    })
    return map
  }, [filtered])

  const kpiCards = [
    {
      title: isRTL ? 'إجمالي الصادرات' : 'Total Exports',
      value: totalExports,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: isRTL ? 'الصادرات الناجحة' : 'Successful Exports',
      value: successful,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      title: isRTL ? 'الصادرات الفاشلة' : 'Failed Exports',
      value: failed,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  ]
  return (
    <div className="p-4 md:px-6 md:py-6 bg-[var(--content-bg)] text-[var(--content-text)] overflow-hidden min-w-0">
      <div className="mb-6">
        <BackButton to="/reports" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold dark:text-white mb-2">
              {isRTL ? 'تقرير التصدير' : 'Exports Report'}
            </h1>
            <p className="dark:text-white text-sm">
              {isRTL ? 'راقب كل عمليات تصدير البيانات ومشاكلها' : 'Monitor all data export operations and issues'}
            </p>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-md rounded-2xl shadow-sm border border-theme-border dark:border-gray-700/50 p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 dark:text-white font-semibold">
            <Filter size={20} className="text-blue-500 dark:text-blue-400" />
            <h3>{isRTL ? 'تصفية' : 'Filter'}</h3>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm dark:text-white hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              {isRTL ? 'إعادة تعيين' : 'Reset'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                {isRTL ? 'المدير' : 'Manager'}
              </label>
              <select
                value={selectedManager}
                onChange={(e) => {
                  setSelectedManager(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-transparent"
              >
                <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                {managers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                {isRTL ? 'الحالة' : 'Status'}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-transparent"
              >
                <option value="All">{isRTL ? 'الكل' : 'All'}</option>
                <option value="Success">{isRTL ? 'ناجح' : 'Success'}</option>
                <option value="Failed">{isRTL ? 'فشل' : 'Failed'}</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'تاريخ الإجراء' : 'Action Date'}
              </label>
              <select
                value={datePreset}
                onChange={(e) => {
                  setDatePreset(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-transparent"
              >
                {dateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
                key={idx}
                className="group relative bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-theme-border dark:border-gray-700/50 p-4 transition-all duration-300 hover:-translate-y-1 overflow-hidden h-32"
              >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                <Icon size={80} className={card.color} />
              </div>
              <div className="flex flex-col justify-between h-full relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="dark:text-white text-sm font-semibold opacity-80">
                    {card.title}
                  </h3>
                </div>
                <div className="flex items-baseline space-x-2 rtl:space-x-reverse pl-1">
                  <span className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <div className="bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md border border-theme-border dark:border-gray-700/50 shadow-sm p-4 rounded-2xl">
          <div className="font-semibold mb-2">{isRTL ? 'كمية التصدير لكل مدير' : 'Exports Quantity per Manager'}</div>
          <div className="h-[260px]">
            <Bar
              data={{
                labels: Array.from(exportsPerManager.keys()),
                datasets: [
                  {
                    label: isRTL ? 'التصدير' : 'Exports',
                    data: Array.from(exportsPerManager.values()),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderRadius: 6,
                    maxBarThickness: 40,
                    categoryPercentage: 0.6,
                    barPercentage: 0.7,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    ticks: {
                      autoSkip: false,
                      maxRotation: 0,
                      minRotation: 0,
                    },
                    title: {
                      display: true,
                      text: isRTL ? 'المدير' : 'Manager',
                    },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      precision: 0,
                      callback: v => `${v}`,
                    },
                    title: {
                      display: true,
                      text: isRTL ? 'التصدير' : 'Exports',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md border border-theme-border dark:border-gray-700/50 shadow-sm p-4 rounded-2xl">
          <div className="text-sm font-medium mb-2 dark:text-white">{isRTL ? 'الناجحة / الفاشلة' : 'Success & Fail'}</div>
          <div className="h-[260px] flex flex-col items-center justify-center">
            <div className="flex-1 flex items-center justify-center">
              <PieChart
                segments={[
                  { label: isRTL ? 'ناجحة' : 'Success', value: successVsFailed.success, color: '#10b981' },
                  { label: isRTL ? 'فاشلة' : 'Failed', value: successVsFailed.failed, color: '#ef4444' },
                ]}
                size={170}
                centerValue={totalExports}
                centerLabel={isRTL ? 'إجمالي التصدير' : 'Total Exports'}
              />
            </div>
            <div className="mt-4 w-full flex items-center justify-between gap-4 text-xs md:text-sm">
              <div className="inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[var(--content-text)] dark:text-white">
                  {isRTL ? 'ناجحة' : 'Success'}: {successVsFailed.success}
                  {totalExports > 0 && (
                    <> ({Math.round((successVsFailed.success / totalExports) * 100)}%)</>
                  )}
                </span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[var(--content-text)] dark:text-white">
                  {isRTL ? 'فاشلة' : 'Failed'}: {successVsFailed.failed}
                  {totalExports > 0 && (
                    <> ({Math.round((successVsFailed.failed / totalExports) * 100)}%)</>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md border border-theme-border dark:border-gray-700/50 shadow-sm rounded-2xl overflow-hidden mb-4">
        <div className="p-4 border-b border-theme-border dark:border-gray-700/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-theme-text dark:text-white">
            {isRTL ? 'قائمة التصدير' : 'Exports List'}
          </h2>
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <FaFileExport /> {isRTL ? 'تصدير' : 'Export'}
              <ChevronDown
                className={`transform transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`}
                size={12}
              />
            </button>
            {showExportMenu && (
              <div
                className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 w-48`}
              >
                <button
                  onClick={exportExcel}
                  className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                >
                  <FaFileExcel className="text-green-600" /> {isRTL ? 'تصدير كـ Excel' : 'Export to Excel'}
                </button>
                <button
                  onClick={exportPDF}
                  className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                >
                  <FaFilePdf className="text-red-600" /> {isRTL ? 'تصدير كـ PDF' : 'Export to PDF'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4 p-4">
          {paginatedRows.map((row) => {
            const rowId = row.fileName + row.timestamp.getTime()
            return (
              <div key={rowId} className=" rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-theme-text dark:text-white text-lg">{row.fileName}</h3>
                    <p className="text-xs text-theme-text dark:text-white mt-1">{row.department}</p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-theme-text dark:text-white">{isRTL ? 'نفّذ بواسطة' : 'Performed By'}</span>
                    <span className="font-medium text-theme-text dark:text-white">{row.performedBy}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-theme-text dark:text-white">{isRTL ? 'التاريخ' : 'Date'}</span>
                    <span className="font-medium text-theme-text dark:text-white" dir="ltr">{row.timestamp.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <span className="text-xs text-theme-text dark:text-white">{isRTL ? 'اخطاء' : 'error'}</span>
                    <span className="font-medium text-theme-text dark:text-white truncate">{row.error || '—'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => setPreviewItem(row)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    <Eye size={16} />
                    {isRTL ? 'معاينة' : 'Preview'}
                  </button>
                  <button
                    onClick={() => handleDownloadRowCSV(row)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                  >
                    <Download size={16} />
                    {isRTL ? 'تحميل' : 'Download'}
                  </button>
                </div>
              </div>
            )
          })}
          {paginatedRows.length === 0 && (
            <div className="text-center py-8 text-theme-text dark:text-white">
              {isRTL ? 'لا توجد بيانات' : 'No data available'}
            </div>
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left dark:text-white">
            <thead className="text-xs text-theme-text dark:text-white uppercase  dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-start">{isRTL ? 'اسم الملف' : 'File Name'}</th>
                <th className="px-4 py-3 text-start">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 text-start">{isRTL ? 'القسم' : 'Department'}</th>
                <th className="px-4 py-3 text-start">{isRTL ? 'نفّذ بواسطة' : 'Performed By'}</th>
                <th className="px-4 py-3 text-start">{isRTL ? 'التاريخ والوقت' : 'Date & Time'}</th>
                <th className="px-4 py-3 text-start">{isRTL ? 'اخطاء' : 'error'}</th>
                <th className="px-4 py-3 text-start">{isRTL ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row) => {
                  const rowId = row.fileName + row.timestamp.getTime()
                  return (
                    <tr key={rowId} className="border-b dark:text-white dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-theme-text dark:text-white whitespace-nowrap">
                        {row.fileName}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-theme-text dark:text-white">{row.department}</td>
                      <td className="px-4 py-3 text-theme-text dark:text-white">{row.performedBy}</td>
                      <td className="px-4 py-3 text-theme-text dark:text-white" dir="ltr">
                        {row.timestamp.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-theme-text dark:text-white max-w-xs truncate" title={row.error}>
                        {row.error || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewItem(row)}
                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400 transition-colors"
                            title={isRTL ? 'معاينة' : 'Preview'}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownloadRowCSV(row)}
                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400 transition-colors"
                            title={isRTL ? 'تحميل' : 'Download'}
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-theme-text dark:text-white">
                    {isRTL ? 'لا توجد بيانات' : 'No data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-[var(--content-bg)]/80 border-t border-white/10 dark:border-gray-700/60 flex items-center justify-between gap-3">
          <div className="text-[11px] sm:text-xs text-[var(--muted-text)]">
            {isRTL
              ? `إظهار ${Math.min((currentPage - 1) * entriesPerPage + 1, totalExports)}-${Math.min(currentPage * entriesPerPage, totalExports)} من ${totalExports}`
              : `Showing ${Math.min((currentPage - 1) * entriesPerPage + 1, totalExports)}-${Math.min(currentPage * entriesPerPage, totalExports)} of ${totalExports}`}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                title={isRTL ? 'السابق' : 'Prev'}
              >
                {isRTL ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
              <span className="text-sm whitespace-nowrap">
                {isRTL
                  ? `الصفحة ${currentPage} من ${pageCount}`
                  : `Page ${currentPage} of ${pageCount}`}
              </span>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setCurrentPage(p => Math.min(p + 1, pageCount))}
                disabled={currentPage === pageCount}
                title={isRTL ? 'التالي' : 'Next'}
              >
                {isRTL ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] sm:text-xs text-theme-text dark:text-gray-400 whitespace-nowrap">
                {isRTL ? 'لكل صفحة:' : 'Per page:'}
              </span>
              <select
                className="input w-24 text-sm py-0 px-2 h-8"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {previewItem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPreviewItem(null)}
          />
          <div className="relative z-50 glass-panel rounded-xl p-4 w-[560px] max-w-[95vw] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold dark:text-white">
                {isRTL ? 'معاينة الملف' : 'File Preview'}
              </h2>
              <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                onClick={() => setPreviewItem(null)}
              >
                <XCircle size={20} className=" dark:text-white" />
              </button>
            </div>
            <div className="text-sm space-y-2 dark:text-white">
              <div>
                <span className="font-medium dark:text-white">
                  {isRTL ? 'الاسم' : 'Name'}:
                </span>{' '}
                {previewItem.fileName}
              </div>
              <div>
                <span className="font-medium dark:text-white">
                  {isRTL ? 'القسم' : 'Department'}:
                </span>{' '}
                {previewItem.department}
              </div>
              <div>
                <span className="font-medium dark:text-white">
                  {isRTL ? 'الحالة' : 'Status'}:
                </span>{' '}
                {previewItem.status}
              </div>
              <div>
                <span className="font-medium dark:text-white">
                  {isRTL ? 'نفّذ بواسطة' : 'Performed By'}:
                </span>{' '}
                {previewItem.performedBy}
              </div>
              <div>
                <span className="font-medium dark:text-white">
                  {isRTL ? 'التاريخ' : 'Date'}:
                </span>{' '}
                {previewItem.timestamp.toLocaleString()}
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs dark:text-white">
              {isRTL ? 'هذه معاينة وصفية.' : 'This is a descriptive preview.'}
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowExportModal(false)}
          />
          <div className="relative z-50 glass-panel rounded-xl p-4 w-[560px] max-w-[95vw] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold dark:text-white">
                {isRTL ? 'تصدير جديد' : 'New Export'}
              </h2>
              <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                onClick={() => setShowExportModal(false)}
              >
                 <XCircle size={20} className=" dark:text-white" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label dark:text-white">
                  {isRTL ? 'اسم الملف' : 'File Name'}
                </label>
                <input
                  className="input w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={exportForm.fileName}
                  onChange={(e) =>
                    setExportForm(f => ({ ...f, fileName: e.target.value }))
                  }
                  placeholder={isRTL ? 'clients_export.csv' : 'clients_export.csv'}
                />
              </div>
              <div>
                <label className="label dark:text-white">
                  {isRTL ? 'القسم' : 'Department'}
                </label>
                <select
                  className="input w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={exportForm.department}
                  onChange={(e) =>
                    setExportForm(f => ({ ...f, department: e.target.value }))
                  }
                >
                  {departments
                    .filter(d => d !== 'All')
                    .map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700  dark:text-white transition-colors"
                onClick={() => setShowExportModal(false)}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors" onClick={performExport}>
                {isRTL ? 'تنفيذ التصدير' : 'Perform Export'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportsReport
