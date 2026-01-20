import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { PieChart } from '@shared/components/PieChart'
import { FaFileExport, FaFileExcel, FaFilePdf } from 'react-icons/fa'
import { Filter, FileText, CheckCircle2, XCircle, Calendar, ChevronDown, ChevronUp, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import * as XLSX from 'xlsx'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const ImportsReport = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.dir() === 'rtl'
  const [expandedRows, setExpandedRows] = useState(new Set())

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const initialLogs = [
    { id: 1, fileName: 'clients_nov.csv', department: 'Customers', performedBy: 'Ahmed Ali', manager: 'Ahmed Ali', dateTime: '2025-11-09T08:45:00', status: 'Success', error: '' },
    { id: 2, fileName: 'orders_oct.xlsx', department: 'Orders', performedBy: 'Sara Hassan', manager: 'Sara Hassan', dateTime: '2025-11-08T15:10:00', status: 'Failed', error: 'Missing column “Order ID”' },
    { id: 3, fileName: 'inventory_11_07.csv', department: 'Inventory', performedBy: 'Omar Ali', manager: 'Omar Ali', dateTime: '2025-11-07T10:05:00', status: 'Success', error: '' },
    { id: 4, fileName: 'leads_batch_oct.xlsx', department: 'Leads', performedBy: 'Mona Adel', manager: 'Mona Adel', dateTime: '2025-11-06T13:30:00', status: 'Success', error: '' },
    { id: 5, fileName: 'marketing_campaigns.csv', department: 'Marketing', performedBy: 'Ahmed Ali', manager: 'Ahmed Ali', dateTime: '2025-11-05T09:15:00', status: 'Failed', error: 'Unsupported date format in column “Start Date”' }
  ]

  const [logs] = useState(initialLogs)

  const [managerFilter, setManagerFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [datePreset, setDatePreset] = useState('year')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef(null)

  const managers = useMemo(() => Array.from(new Set(logs.map(l => l.manager))), [logs])

  const latestDate = useMemo(() => {
    if (!logs.length) return new Date()
    const timestamps = logs.map(l => new Date(l.dateTime).getTime())
    return new Date(Math.max(...timestamps))
  }, [logs])

  const isSameDay = (a, b) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10)
  const isSameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  const isSameYear = (a, b) => a.getFullYear() === b.getFullYear()

  const matchDatePreset = (dateString) => {
    const dt = new Date(dateString)
    if (datePreset === 'today') return isSameDay(dt, latestDate)
    if (datePreset === 'week') {
      const diffMs = latestDate.getTime() - dt.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      return diffDays <= 7 && diffDays >= 0
    }
    if (datePreset === 'month') return isSameMonth(dt, latestDate)
    if (datePreset === 'year') return isSameYear(dt, latestDate)
    return true
  }

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const mOk = managerFilter === 'all' || l.manager === managerFilter
      const timeOk = matchDatePreset(l.dateTime)
      return mOk && timeOk
    })
  }, [logs, managerFilter, datePreset, latestDate])

  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const pageCount = Math.max(1, Math.ceil(filtered.length / entriesPerPage))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage
    return filtered.slice(start, start + entriesPerPage)
  }, [filtered, currentPage, entriesPerPage])

  const totalImports = filtered.length
  const successful = filtered.filter(l => l.status === 'Success').length
  const failed = filtered.filter(l => l.status === 'Failed').length

  const importsPerManager = useMemo(() => {
    const map = new Map()
    filtered.forEach(l => {
      map.set(l.manager, (map.get(l.manager) || 0) + 1)
    })
    return map
  }, [filtered])

  const statusDist = useMemo(
    () => ({
      Success: successful,
      Failed: failed
    }),
    [successful, failed]
  )

  const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status === 'Success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
      {status === 'Success' ? (isRTL ? 'ناجح' : 'Success') : (isRTL ? 'فشل' : 'Failed')}
    </span>
  )

  const dateOptions = [
    { value: 'today', label: isRTL ? 'اليوم' : 'Today' },
    { value: 'week', label: isRTL ? 'أسبوعيًا' : 'Weekly' },
    { value: 'month', label: isRTL ? 'شهريًا' : 'Monthly' },
    { value: 'year', label: isRTL ? 'سنويًا' : 'Yearly' }
  ]

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

  const clearFilters = () => {
    setManagerFilter('all')
    setDatePreset('year')
    setCurrentPage(1)
  }

  const exportToPdf = async () => {
    try {
      const jsPDF = (await import('jspdf')).default
      const autoTable = await import('jspdf-autotable')
      const doc = new jsPDF()

      const tableColumn = [
        isRTL ? 'اسم الملف' : 'File Name',
        isRTL ? 'الحالة' : 'Status',
        isRTL ? 'تمت بواسطة' : 'Action By',
        isRTL ? 'تاريخ الإجراء' : 'Action Date',
        isRTL ? 'وصف الخطأ' : 'Error Description'
      ]
      const tableRows = []

      filtered.forEach(l => {
        const rowData = [
          l.fileName,
          l.status,
          `${l.performedBy} (${l.manager})`,
          new Date(l.dateTime).toLocaleString(),
          l.error || '—'
        ]
        tableRows.push(rowData)
      })

      doc.text(isRTL ? 'تقرير الواردات' : 'Imports Report', 14, 15)
      autoTable.default(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { font: 'Amiri-Regular', fontSize: 8, halign: isRTL ? 'right' : 'left' },
        headStyles: { fillColor: [66, 139, 202], halign: isRTL ? 'right' : 'left' }
      })
      doc.save('imports_report.pdf')
      setShowExportMenu(false)
    } catch (error) {
      console.error('Export PDF Error:', error)
    }
  }

  const handleExport = () => {
    const wb = XLSX.utils.book_new()
    const wsData = filtered.map(l => ({
      [isRTL ? 'اسم الملف' : 'File Name']: l.fileName,
      [isRTL ? 'الحالة' : 'Status']: l.status,
      [isRTL ? 'تمت بواسطة' : 'Action By']: `${l.performedBy} (${l.manager})`,
      [isRTL ? 'تاريخ الإجراء' : 'Action Date']: new Date(l.dateTime).toLocaleString(),
      [isRTL ? 'وصف الخطأ' : 'Error Description']: l.error || '—'
    }))
    const ws = XLSX.utils.json_to_sheet(wsData)
    XLSX.utils.book_append_sheet(wb, ws, 'Imports')
    XLSX.writeFile(wb, 'Imports_Report.xlsx')
    setShowExportMenu(false)
  }

  const kpiCards = [
    {
      title: isRTL ? 'إجمالي الواردات' : 'Total Imports',
      value: totalImports,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: isRTL ? 'الواردات الناجحة' : 'Successful Imports',
      value: successful,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      title: isRTL ? 'الواردات الفاشلة' : 'Failed Imports',
      value: failed,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  ]

  return (
    <div className="p-4 md:p-6 bg-[var(--content-bg)] text-[var(--content-text)] overflow-hidden min-w-0">
      <div className="mb-6">
        <BackButton to="/reports" />
        <h1 className="text-2xl font-bold dark:text-white mb-2">
          {isRTL ? 'تقرير الواردات' : 'Imports Report'}
        </h1>
        <p className="dark:text-white text-sm">
          {isRTL ? 'راقب كل عمليات استيراد البيانات ومشاكلها' : 'Monitor all data import operations and issues'}
        </p>
      </div>

      <div className="backdrop-blur-md rounded-2xl shadow-sm border border-white/50 dark:border-gray-700/50 p-6 mb-8">
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
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                {isRTL ? 'المدير' : 'Manager'}
              </label>
              <select
                value={managerFilter}
                onChange={(e) => {
                  setManagerFilter(e.target.value)
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
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
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
                <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                <option value="Success">{isRTL ? 'ناجح' : 'Success'}</option>
                <option value="Failed">{isRTL ? 'فشل' : 'Failed'}</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
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
              className="group relative bg-white/10 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-white/50 dark:border-gray-700/50 p-4 transition-all duration-300 hover:-translate-y-1 overflow-hidden h-32"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border border-white/50 dark:border-gray-700/50 shadow-sm p-4 rounded-2xl">
          <div className="text-sm font-medium mb-2 dark:text-white">
            {isRTL ? 'كمية الواردات لكل مدير' : 'Imports Quantity per Manager'}
          </div>
          <div className="h-[260px]">
            <Bar
              data={{
                labels: Array.from(importsPerManager.keys()),
                datasets: [
                  {
                    label: isRTL ? 'الواردات' : 'Imports',
                    data: Array.from(importsPerManager.values()),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderRadius: 6,
                    maxBarThickness: 40,
                    categoryPercentage: 0.6,
                    barPercentage: 0.7
                  }
                ]
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
                      font: { family: isRTL ? 'Amiri-Regular' : undefined }
                    },
                    title: {
                      display: true,
                      text: isRTL ? 'المدير' : 'Manager',
                      font: { family: isRTL ? 'Amiri-Regular' : undefined }
                    },
                    position: isRTL ? 'right' : 'left',
                    reverse: isRTL
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      precision: 0,
                      callback: (v) => `${v}`
                    },
                    title: {
                      display: true,
                      text: isRTL ? 'الواردات' : 'Imports',
                      font: { family: isRTL ? 'Amiri-Regular' : undefined }
                    },
                    position: isRTL ? 'right' : 'left'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border border-white/50 dark:border-gray-700/50 shadow-sm p-4 rounded-2xl">
          <div className="text-sm font-medium mb-2 dark:text-white">
            {isRTL ? 'الناجحة / الفاشلة' : 'Success & Fail'}
          </div>
          <div className="h-[260px] flex flex-col items-center justify-center">
            <div className="flex-1 flex items-center justify-center">
              <PieChart
                segments={[
                  { label: isRTL ? 'ناجح' : 'Success', value: statusDist.Success, color: '#10b981' },
                  { label: isRTL ? 'فشل' : 'Failed', value: statusDist.Failed, color: '#ef4444' }
                ]}
                size={170}
                centerValue={totalImports}
                centerLabel={isRTL ? 'إجمالي الواردات' : 'Total Imports'}
              />
            </div>
            <div className="mt-4 w-full flex items-center justify-between gap-4 text-xs md:text-sm">
              <div className="inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[var(--content-text)] dark:text-white">
                  {isRTL ? 'ناجح' : 'Success'}: {statusDist.Success}
                  {totalImports > 0 && (
                    <> ({Math.round((statusDist.Success / totalImports) * 100)}%)</>
                  )}
                </span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[var(--content-text)] dark:text-white">
                  {isRTL ? 'فشل' : 'Failed'}: {statusDist.Failed}
                  {totalImports > 0 && (
                    <> ({Math.round((statusDist.Failed / totalImports) * 100)}%)</>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border border-white/50 dark:border-gray-700/50 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/20 dark:border-gray-700/50 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white">
            {isRTL ? 'قائمة الواردات' : 'Imports List'}
          </h2>
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <FaFileExport /> {isRTL ? 'تصدير' : 'Export'}
              <ChevronDown className={`transform transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} size={12} />
            </button>

            {showExportMenu && (
              <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 w-48`}>
                <button
                  onClick={handleExport}
                  className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                >
                  <FaFileExcel className="text-green-600" /> {isRTL ? 'تصدير كـ Excel' : 'Export to Excel'}
                </button>
                <button
                  onClick={exportToPdf}
                  className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                >
                  <FaFilePdf className="text-red-600" /> {isRTL ? 'تصدير كـ PDF' : 'Export to PDF'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left dark:text-white">
            <thead className="text-xs dark:text-white uppercase bg-gray-50/50 dark:bg-gray-700/50 dark:text-white">
              <tr>
                <th className="px-4 py-3 md:hidden"></th>
                <th className="px-4 py-3 text-start">{isRTL ? 'اسم الملف' : 'File Name'}</th>
                <th className="px-4 py-3 text-start">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 text-start hidden md:table-cell">{isRTL ? 'القسم' : 'Department'}</th>
                <th className="px-4 py-3 text-start hidden md:table-cell">{isRTL ? 'تمت بواسطة' : 'Action By'}</th>
                <th className="px-4 py-3 text-start hidden md:table-cell">{isRTL ? 'تاريخ الإجراء' : 'Action Date'}</th>
                <th className="px-4 py-3 text-start hidden md:table-cell">{isRTL ? 'اخطاء' : 'error'}</th>
                <th className="px-4 py-3 text-start hidden md:table-cell">{isRTL ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row) => {
                  const isExpanded = expandedRows.has(row.id)
                  return (
                    <React.Fragment key={row.id}>
                      <tr className="border-b dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 md:hidden">
                          <button
                            onClick={() => toggleRow(row.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium  dark:text-white whitespace-nowrap">
                          {row.fileName}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">{row.department}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div>
                            <div className="font-medium">{row.performedBy}</div>
                            <div className="text-xs dark:text-white">{row.manager}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell" dir="ltr">
                          {new Date(row.dateTime).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell max-w-xs truncate" title={row.error}>
                          {row.error || '—'}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <button className=" hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400 transition-colors" title={isRTL ? 'معاينة' : 'Preview'}>
                              <Eye size={16} />
                            </button>
                            <button className=" hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400 transition-colors" title={isRTL ? 'تحميل' : 'Download'}>
                              <Download size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="md:hidden ">
                          <td colSpan={8} className="px-4 py-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="dark:text-white">{isRTL ? 'القسم' : 'Department'}:</div>
                              <div>{row.department}</div>
                              <div className="dark:text-white">{isRTL ? 'تمت بواسطة' : 'Action By'}:</div>
                              <div>{row.performedBy} ({row.manager})</div>
                              <div className="dark:text-white">{isRTL ? 'تاريخ الإجراء' : 'Action Date'}:</div>
                              <div dir="ltr">{new Date(row.dateTime).toLocaleString()}</div>
                              <div className="dark:text-white">{isRTL ? 'اخطاء' : 'error'}:</div>
                              <div>{row.error || '—'}</div>
                              <div className="col-span-2 flex justify-end gap-2 mt-2">
                                <button className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs">
                                  <Eye size={14} /> {isRTL ? 'معاينة' : 'Preview'}
                                </button>
                                <button className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs">
                                  <Download size={14} /> {isRTL ? 'تحميل' : 'Download'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center dark:text-white">
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
              ? `إظهار ${Math.min((currentPage - 1) * entriesPerPage + 1, totalImports)}-${Math.min(currentPage * entriesPerPage, totalImports)} من ${totalImports}`
              : `Showing ${Math.min((currentPage - 1) * entriesPerPage + 1, totalImports)}-${Math.min(currentPage * entriesPerPage, totalImports)} of ${totalImports}`}
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
              <span className="text-[10px] sm:text-xs text-[var(--muted-text)] whitespace-nowrap">
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
    </div>
  )
}

export default ImportsReport

