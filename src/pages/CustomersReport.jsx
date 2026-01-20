import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import BackButton from '../components/BackButton'
import * as XLSX from 'xlsx'
import { PieChart } from '@shared/components/PieChart'
import SearchableSelect from '@shared/components/SearchableSelect'
import { FaFileExcel, FaFilePdf, FaFileExport, FaChevronDown } from 'react-icons/fa'
import { Users, Target, FileText, DollarSign, Filter, ChevronDown as LucideChevronDown, ChevronUp, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

export default function CustomersReport() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  // Demo dataset aligned with requested layout and visuals
  const customers = [
    {
      id: 1,
      name: 'Ahmed Hassan',
      type: 'VIP',
      clientType: 'Individual',
      manager: 'Khaled Omar',
      source: 'Website',
      project: 'Project A',
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
      clientType: 'Company',
      manager: 'Mona Zaki',
      source: 'Referral',
      project: 'Project B',
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
      clientType: 'Individual',
      manager: 'Khaled Omar',
      source: 'Facebook',
      project: 'Project C',
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
      clientType: 'Company',
      manager: 'Mona Zaki',
      source: 'LinkedIn',
      project: 'Project A',
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
      clientType: 'Company',
      manager: 'Khaled Omar',
      source: 'Website',
      project: 'Project B',
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
      clientType: 'Company',
      manager: 'Mona Zaki',
      source: 'Referral',
      project: 'Project C',
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
      clientType: 'Company',
      manager: 'Khaled Omar',
      source: 'Facebook',
      project: 'Project A',
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
      clientType: 'Company',
      manager: 'Mona Zaki',
      source: 'LinkedIn',
      project: 'Project B',
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
      clientType: 'Company',
      manager: 'Khaled Omar',
      source: 'Website',
      project: 'Project C',
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
      clientType: 'Company',
      manager: 'Mona Zaki',
      source: 'Referral',
      project: 'Project A',
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

  const [salesperson, setSalesperson] = useState('all')
  const [manager, setManager] = useState('all')
  const [source, setSource] = useState('all')
  const [project, setProject] = useState('all')
  const [convertDate, setConvertDate] = useState('')
  const [clientType, setClientType] = useState('all')
  const [actionDate, setActionDate] = useState('')
  const [showAllFilters, setShowAllFilters] = useState(true)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [expandedRows, setExpandedRows] = useState({})
  const exportMenuRef = useRef(null)

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const spOk = salesperson === 'all' || c.salesperson === salesperson
      const mgrOk = manager === 'all' || c.manager === manager
      const srcOk = source === 'all' || c.source === source
      const prjOk = project === 'all' || c.project === project
      const typeOk = clientType === 'all' || c.clientType === clientType
      
      const convOk = !convertDate || c.joinedDate === convertDate
      const actOk = !actionDate || c.lastActivity === actionDate

      return spOk && mgrOk && srcOk && prjOk && typeOk && convOk && actOk
    })
  }, [customers, salesperson, manager, source, project, clientType, convertDate, actionDate])

  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const pageCount = Math.max(1, Math.ceil(filtered.length / entriesPerPage))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage
    return filtered.slice(start, start + entriesPerPage)
  }, [filtered, currentPage, entriesPerPage])

  const isActive = (c) => {
    const last = new Date(c.lastActivity)
    const now = new Date('2025-11-09') // fixed for demo; replace with new Date() in production
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24))
    return diffDays <= 60
  }

  const totalCustomers = filtered.length
  const totalRevenue = filtered.reduce((s, c) => s + (c.totalRevenue || 0), 0)
  const activeCount = filtered.reduce((s, c) => s + (isActive(c) ? 1 : 0), 0)
  const inactiveCount = Math.max(0, totalCustomers - activeCount)
  const totalSalesOrders = filtered.reduce((s, c) => s + (c.orders || 0), 0)
  const totalInvoices = totalSalesOrders
  const totalOpportunities = totalCustomers * 2
  const totalQuotations = totalCustomers
  const top5 = [...filtered].sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0)).slice(0, 5)

  const quotationsSegments = useMemo(() => {
    const base = [
      { label: isRTL ? 'محول' : 'Converted', pct: 58, color: '#22c55e' },
      { label: isRTL ? 'قيد الانتظار' : 'Pending', pct: 23, color: '#facc15' },
      { label: isRTL ? 'مفقود / ملغى' : 'Lost / Cancelled', pct: 19, color: '#ef4444' }
    ]
    const total = totalQuotations || 0
    if (!total) {
      return base.map(item => ({
        label: item.label,
        value: item.pct,
        color: item.color,
        pct: item.pct
      }))
    }
    return base.map(item => ({
      label: item.label,
      value: Math.round((item.pct / 100) * total),
      color: item.color,
      pct: item.pct
    }))
  }, [totalQuotations, isRTL])

  const invoicesSegments = useMemo(() => {
    const base = [
      { label: isRTL ? 'مدفوع' : 'Paid', pct: 65, color: '#22c55e' },
      { label: isRTL ? 'مدفوع جزئياً' : 'Partially Paid', pct: 20, color: '#0ea5e9' },
      { label: isRTL ? 'غير مدفوع' : 'Unpaid', pct: 15, color: '#ef4444' }
    ]
    const total = totalInvoices || 0
    if (!total) {
      return base.map(item => ({
        label: item.label,
        value: item.pct,
        color: item.color,
        pct: item.pct
      }))
    }
    return base.map(item => ({
      label: item.label,
      value: Math.round((item.pct / 100) * total),
      color: item.color,
      pct: item.pct
    }))
  }, [totalInvoices, isRTL])

  const revenueSegments = useMemo(() => {
    const base = [
      { label: isRTL ? 'المنتج أ' : 'Product A', pct: 40, color: '#22c55e' },
      { label: isRTL ? 'المنتج ب' : 'Product B', pct: 35, color: '#3b82f6' },
      { label: isRTL ? 'أخرى' : 'Other', pct: 25, color: '#a855f7' }
    ]
    const total = totalRevenue || 0
    if (!total) {
      return base.map(item => ({
        label: item.label,
        value: item.pct,
        color: item.color,
        pct: item.pct
      }))
    }
    return base.map(item => ({
      label: item.label,
      value: Math.round((item.pct / 100) * total),
      color: item.color,
      pct: item.pct
    }))
  }, [totalRevenue, isRTL])

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
    setSalesperson('all')
    setManager('all')
    setSource('all')
    setProject('all')
    setConvertDate('')
    setClientType('all')
    setActionDate('')
    setCurrentPage(1)
  }

  const exportExcel = () => {
    const rows = filtered.map(c => ({
      [isRTL ? 'الاسم' : 'Name']: c.name,
      [isRTL ? 'النوع' : 'Type']: c.type,
      [isRTL ? 'الهاتف' : 'Phone']: c.phone,
      [isRTL ? 'البريد الإلكتروني' : 'Email']: c.email,
      [isRTL ? 'تاريخ الانضمام' : 'Joined']: c.joinedDate,
      [isRTL ? 'إجمالي الإيرادات (ج.م)' : 'TotalRevenueEGP']: c.totalRevenue,
      [isRTL ? 'الطلبات' : 'Orders']: c.orders,
      [isRTL ? 'آخر نشاط' : 'LastActivity']: c.lastActivity,
      [isRTL ? 'مسؤول المبيعات' : 'Salesperson']: c.salesperson,
      [isRTL ? 'الحالة' : 'Status']: isActive(c) ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Customers')
    XLSX.writeFile(wb, 'customers_report.xlsx')
    setShowExportMenu(false)
  }

  const exportPdf = async () => {
    try {
      const jsPDF = (await import('jspdf')).default
      const autoTable = await import('jspdf-autotable')
      const doc = new jsPDF()

      const tableColumn = [
        isRTL ? 'اسم العميل' : 'Customer Name',
        isRTL ? 'النوع' : 'Type',
        isRTL ? 'جهة الاتصال' : 'Contact',
        isRTL ? 'إجمالي الإيرادات' : 'Total Revenue',
        isRTL ? 'الطلبات' : 'Orders',
        isRTL ? 'آخر نشاط' : 'Last Activity',
        isRTL ? 'الحالة' : 'Status',
        isRTL ? 'مسؤول المبيعات' : 'Salesperson'
      ]
      const tableRows = []

      filtered.forEach(c => {
        const rowData = [
          c.name,
          c.type,
          `${c.phone} / ${c.email}`,
          c.totalRevenue.toLocaleString(),
          c.orders,
          new Date(c.lastActivity).toLocaleDateString(),
          isActive(c) ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive'),
          c.salesperson
        ]
        tableRows.push(rowData)
      })

      doc.text(isRTL ? 'تقرير العملاء' : 'Customers Report', 14, 15)
      autoTable.default(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { font: 'helvetica', fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      })
      doc.save('customers_report.pdf')
      setShowExportMenu(false)
    } catch (error) {
      console.error('Export PDF Error:', error)
    }
  }

  const statusBadge = (active) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'}`}>
      {active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
    </span>
  )

  const kpiCards = [
    {
      label: isRTL ? 'إجمالي العملاء' : 'Total Customers',
      value: totalCustomers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: isRTL ? 'إجمالي الفرص' : 'Total Opportunities',
      value: totalOpportunities.toLocaleString(),
      icon: Target,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: isRTL ? 'إجمالي عروض الأسعار' : 'Total Quotations',
      value: totalQuotations.toLocaleString(),
      icon: FileText,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
    },
    {
      label: isRTL ? 'إجمالي أوامر البيع' : 'Total Sales Orders',
      value: totalSalesOrders.toLocaleString(),
      icon: FileText,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      label: isRTL ? 'إجمالي الفواتير' : 'Total Invoices',
      value: totalInvoices.toLocaleString(),
      icon: FileText,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      label: isRTL ? 'إجمالي الإيرادات (ج.م)' : 'Total Revenue (EGP)',
      value: totalRevenue.toLocaleString(),
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  ]

  return (
    <div className="p-4 md:p-6 bg-[var(--content-bg)] text-[var(--content-text)] overflow-hidden min-w-0">
      <div className="mb-6">
        <BackButton to="/reports" />
        <h1 className="text-2xl font-bold dark:text-white mb-2">
          {isRTL ? 'تقرير العملاء' : 'Customers Report'}
        </h1>
        <p className="dark:text-white text-sm">
          {isRTL ? 'تحليل العملاء والإيرادات والأنشطة' : 'Analyze your customers, revenue and activities'}
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
              onClick={() => setShowAllFilters(prev => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              {showAllFilters ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'عرض الكل' : 'Show All')}
              <LucideChevronDown size={12} className={`transform transition-transform duration-300 ${showAllFilters ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm dark:text-white hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              {isRTL ? 'إعادة تعيين' : 'Reset'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">
                {isRTL ? 'مسؤول المبيعات' : 'Salesperson'}
              </label>
              <SearchableSelect
                value={salesperson}
                onChange={(v) => {
                  setSalesperson(v)
                  setCurrentPage(1)
                }}
                className="min-w-[160px]"
              >
                <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                {[...new Set(customers.map(c => c.salesperson))].map(sp => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </SearchableSelect>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">
                {isRTL ? 'المدير' : 'Manager'}
              </label>
              <SearchableSelect
                value={manager}
                onChange={(v) => {
                  setManager(v)
                  setCurrentPage(1)
                }}
                className="min-w-[160px]"
              >
                <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                {[...new Set(customers.map(c => c.manager))].filter(Boolean).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </SearchableSelect>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">
                {isRTL ? 'المصدر' : 'Source'}
              </label>
              <SearchableSelect
                value={source}
                onChange={(v) => {
                  setSource(v)
                  setCurrentPage(1)
                }}
                className="min-w-[160px]"
              >
                <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                {[...new Set(customers.map(c => c.source))].filter(Boolean).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </SearchableSelect>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">
                {isRTL ? 'المشروع' : 'Project'}
              </label>
              <SearchableSelect
                value={project}
                onChange={(v) => {
                  setProject(v)
                  setCurrentPage(1)
                }}
                className="min-w-[160px]"
              >
                <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                {[...new Set(customers.map(c => c.project))].filter(Boolean).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </SearchableSelect>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 ease-in-out overflow-hidden ${showAllFilters ? 'max-h-[200px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">
                {isRTL ? 'تاريخ التحويل' : 'Convert Date'}
              </label>
              <input
                type="date"
                value={convertDate}
                onChange={e => {
                  setConvertDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">
                {isRTL ? 'نوع العميل' : 'Customer Type'}
              </label>
              <SearchableSelect
                value={clientType}
                onChange={(v) => {
                  setClientType(v)
                  setCurrentPage(1)
                }}
                className="min-w-[160px]"
              >
                <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                <option value="Individual">{isRTL ? 'فرد' : 'Individual'}</option>
                <option value="Company">{isRTL ? 'شركة' : 'Company'}</option>
              </SearchableSelect>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">
                {isRTL ? 'تاريخ الإجراء' : 'Action Date'}
              </label>
              <input
                type="date"
                value={actionDate}
                onChange={e => {
                  setActionDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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
                    {card.label}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[
          {
            title: isRTL ? 'عروض الأسعار' : 'Quotations',
            totalLabel: isRTL ? 'إجمالي عروض الأسعار' : 'Total Quotations',
            total: totalQuotations,
            segments: quotationsSegments
          },
          {
            title: isRTL ? 'الفواتير' : 'Invoices',
            totalLabel: isRTL ? 'إجمالي الفواتير' : 'Total Invoices',
            total: totalInvoices,
            segments: invoicesSegments
          },
          {
            title: isRTL ? 'الإيرادات' : 'Revenue',
            totalLabel: isRTL ? 'إجمالي الإيرادات' : 'Total Revenue',
            total: totalRevenue,
            segments: revenueSegments
          }
        ].map(card => (
          <div
            key={card.title}
            className="group relative bg-white/10 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-white/50 dark:border-gray-700/50 p-4 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="text-sm font-semibold mb-2 dark:text-white text-center md:text-left">
              {card.title}
            </div>
            <div className="h-48 flex items-center justify-center">
              <PieChart
                segments={card.segments}
                size={170}
                centerValue={card.total}
                centerLabel={card.totalLabel}
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {card.segments.map(segment => (
                <div key={segment.label} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="dark:text-white">
                    {segment.label}: {segment.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border border-white/50 dark:border-gray-700/50 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/20 dark:border-gray-700/50 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white">
            {isRTL ? 'العملاء' : 'Customers'}
          </h2>
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <FaFileExport /> {isRTL ? 'تصدير' : 'Export'}
              <FaChevronDown className={`transform transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} size={12} />
            </button>

            {showExportMenu && (
              <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 w-48`}>
                <button
                  onClick={exportExcel}
                  className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                >
                  <FaFileExcel className="text-green-600" /> {isRTL ? 'تصدير كـ Excel' : 'Export to Excel'}
                </button>
                <button
                  onClick={exportPdf}
                  className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                >
                  <FaFilePdf className="text-red-600" /> {isRTL ? 'تصدير كـ PDF' : 'Export to PDF'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
          <table className="w-full text-sm nova-table nova-table--glass">
            <thead className="bg-white/5 dark:bg-white/5 dark:text-white">
              <tr className="text-left bg-[var(--table-header-bg)]">
                <th className="px-3 py-2">{isRTL ? 'اسم العميل' : 'Customer Name'}</th>
                <th className="px-3 py-2">{isRTL ? 'النوع' : 'Type'}</th>
                <th className="px-3 py-2">{isRTL ? 'جهة الاتصال' : 'Contact'}</th>
                <th className="px-3 py-2">{isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</th>
                <th className="px-3 py-2">{isRTL ? 'الطلبات' : 'Orders'}</th>
                <th className="px-3 py-2">{isRTL ? 'آخر نشاط' : 'Last Activity'}</th>
                <th className="px-3 py-2">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="px-3 py-2">{isRTL ? 'مسؤول المبيعات' : 'Salesperson'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:divide-gray-700/50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-[var(--muted-text)]">{isRTL ? 'لا توجد بيانات' : 'No data'}</td>
                </tr>
              )}
              {filtered.length > 0 && paginatedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-[var(--muted-text)]"
                  >
                    {isRTL ? 'لا توجد نتائج' : 'No results'}
                  </td>
                </tr>
              )}
              {paginatedRows.map(c => (
                <React.Fragment key={c.id}>
                <tr className="border-t border-[var(--table-row-border)] odd:bg-[var(--table-row-bg)] hover:bg-[var(--table-row-hover)] transition-colors">
                  <td className="px-3 py-2 font-medium dark:text-white">
                    <div className="flex items-center gap-2">
                      <button 
                        className="md:hidden p-1 hover:bg-white/10 rounded"
                        onClick={() => toggleRow(c.id)}
                      >
                        {expandedRows[c.id] ? <ChevronUp size={16} /> : <LucideChevronDown size={16} />}
                      </button>
                      {c.name}
                    </div>
                    <div className="md:hidden text-xs text-[var(--muted-text)] mt-1">
                        {statusBadge(isActive(c))}
                    </div>
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">{c.type}</td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    <div className="flex flex-col">
                      <span>{c.phone}</span>
                      <span className="text-[var(--muted-text)]">{c.email}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">{c.totalRevenue.toLocaleString()} EGP</td>
                  <td className="px-3 py-2 hidden md:table-cell">{c.orders}</td>
                  <td className="px-3 py-2 hidden md:table-cell">{new Date(c.lastActivity).toLocaleDateString()}</td>
                  <td className="px-3 py-2 hidden md:table-cell">{statusBadge(isActive(c))}</td>
                  <td className="px-3 py-2 hidden md:table-cell">{c.salesperson}</td>
                </tr>
                {expandedRows[c.id] && (
                    <tr className="md:hidden bg-white/5 dark:bg-white/5">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)]">{isRTL ? 'النوع' : 'Type'}</span>
                            <span className="dark:text-white font-medium">{c.type}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)]">{isRTL ? 'جهة الاتصال' : 'Contact'}</span>
                            <span className="dark:text-white font-medium">{c.phone}</span>
                            <span className="text-[var(--muted-text)]">{c.email}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)]">{isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</span>
                            <span className="dark:text-white font-medium">{c.totalRevenue.toLocaleString()} EGP</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)]">{isRTL ? 'الطلبات' : 'Orders'}</span>
                            <span className="dark:text-white font-medium">{c.orders}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)]">{isRTL ? 'آخر نشاط' : 'Last Activity'}</span>
                            <span className="dark:text-white font-medium">{new Date(c.lastActivity).toLocaleDateString()}</span>
                          </div>
                           <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)]">{isRTL ? 'مسؤول المبيعات' : 'Salesperson'}</span>
                            <span className="dark:text-white font-medium">{c.salesperson}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        <div className="px-4 py-3 bg-[var(--content-bg)]/80 border-t border-white/10 dark:border-gray-700/60 flex sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] sm:text-xs text-[var(--muted-text)]">
            {isRTL
              ? `إظهار ${Math.min((currentPage - 1) * entriesPerPage + 1, filtered.length)}-${Math.min(currentPage * entriesPerPage, filtered.length)} من ${filtered.length}`
              : `Showing ${Math.min((currentPage - 1) * entriesPerPage + 1, filtered.length)}-${Math.min(currentPage * entriesPerPage, filtered.length)} of ${filtered.length}`}
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
