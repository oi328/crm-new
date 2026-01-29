import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { api } from '../utils/api'
import { mockStorage } from '../utils/mockStorage'
import SearchableSelect from '../components/SearchableSelect'
import SalesInvoicesFormModal from '../components/SalesInvoicesFormModal'
import SalesInvoicePreviewModal from '../components/SalesInvoicePreviewModal'
import SalesInvoicesPaymentModal from '../components/SalesInvoicesPaymentModal'
import SalesInvoicesImportModal from '../components/SalesInvoicesImportModal'
import { useTheme } from '../shared/context/ThemeProvider'
import { 
  FaPlus, FaDownload, FaEye, FaEdit, FaTrash, 
  FaFileImport, FaFileExport, FaTimes,
  FaCheck, FaBan, FaEllipsisV, FaMoneyBillWave, FaPaperPlane, FaPrint, FaCheckCircle
} from 'react-icons/fa'
import { Filter, ChevronDown, Search, Calendar, X } from 'lucide-react'
import * as XLSX from 'xlsx'

// Mock invoices for preview when API is empty/unavailable
const MOCK_INVOICES = [
  {
    id: 'INV-9001',
    status: 'Draft',
    date: new Date(Date.now()).toISOString(),
    dueDate: new Date(Date.now() + 15*24*3600*1000).toISOString(),
    orderId: 'SO-5001',
    customerCode: 'C-001',
    customerName: 'Tech Solutions Ltd',
    total: 5000,
    paidAmount: 0,
    paymentStatus: 'Unpaid',
    currency: 'USD',
    items: [{ id: 1, name: 'Service A', qty: 2, price: 2500, total: 5000 }],
    createdBy: 'Admin User',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'INV-9002',
    status: 'Posted',
    date: new Date(Date.now() - 5*24*3600*1000).toISOString(),
    dueDate: new Date(Date.now() + 10*24*3600*1000).toISOString(),
    orderId: 'SO-5002',
    customerCode: 'C-002',
    customerName: 'Global Trading Co',
    total: 12500,
    paidAmount: 5000,
    paymentStatus: 'Partial',
    currency: 'USD',
    items: [
      { id: 1, name: 'Product X', qty: 10, price: 1000, total: 10000 },
      { id: 2, name: 'Product Y', qty: 5, price: 500, total: 2500 }
    ],
    createdBy: 'Sarah Smith',
    createdAt: new Date(Date.now() - 5*24*3600*1000).toISOString(),
  },
  {
    id: 'INV-9003',
    status: 'Paid',
    date: new Date(Date.now() - 20*24*3600*1000).toISOString(),
    dueDate: new Date(Date.now() - 5*24*3600*1000).toISOString(),
    orderId: 'SO-5003',
    customerCode: 'C-003',
    customerName: 'Local Shop Inc',
    total: 3000,
    paidAmount: 3000,
    paymentStatus: 'Paid',
    currency: 'USD',
    items: [{ id: 1, name: 'Consulting', qty: 1, price: 3000, total: 3000 }],
    createdBy: 'Admin User',
    createdAt: new Date(Date.now() - 20*24*3600*1000).toISOString(),
  },
  {
    id: 'INV-9004',
    status: 'Overdue',
    date: new Date(Date.now() - 35*24*3600*1000).toISOString(),
    dueDate: new Date(Date.now() - 5*24*3600*1000).toISOString(),
    orderId: 'SO-5000',
    customerCode: 'C-004',
    customerName: 'Old Customer LLC',
    total: 1500,
    paidAmount: 0,
    paymentStatus: 'Unpaid',
    currency: 'USD',
    items: [{ id: 1, name: 'Old Service', qty: 1, price: 1500, total: 1500 }],
    createdBy: 'Admin User',
    createdAt: new Date(Date.now() - 35*24*3600*1000).toISOString(),
  }
]

export default function SalesInvoices() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const isRTL = String(i18n.language || '').startsWith('ar')

  // State
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [activeRowId, setActiveRowId] = useState(null)
  
  // Modals
  const [showForm, setShowForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [previewItem, setPreviewItem] = useState(null)
  const [paymentItem, setPaymentItem] = useState(null)

  // Status Management
  const [activeActionDropdown, setActiveActionDropdown] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState(null)
  const [statusReason, setStatusReason] = useState('')

  // Filters
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    customerName: '',
    orderId: '',
    dateFrom: '',
    dateTo: '',
    dueDateFrom: '',
    dueDateTo: '',
    totalMin: '',
    totalMax: '',
    invoiceType: '',
    createdAtFrom: '',
    createdAtTo: '',
    datePeriod: ''
  })
  const [showAllFilters, setShowAllFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [exportFrom, setExportFrom] = useState('')
  const [exportTo, setExportTo] = useState('')
  const [pageSearch, setPageSearch] = useState('')

  // Sorting
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  // Selection
  const [selectedItems, setSelectedItems] = useState([])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveActionDropdown(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Helper for success messages
  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Load Data
  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    // Load from mockStorage
    setTimeout(() => {
      if (!mounted) return
      const stored = mockStorage.getInvoices()
      setItems(stored)
      setLoading(false)
    }, 500)
    
    return () => { mounted = false }
  }, [])

  // Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(paginatedItems.map(i => i.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectRow = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSaveInvoice = (data) => {
    const saved = mockStorage.saveInvoice({
      ...data,
      id: data.id || `INV-${Math.floor(Math.random() * 10000)}`,
      status: data.status || 'Draft',
      createdAt: data.createdAt || new Date().toISOString(),
      paidAmount: data.paidAmount || 0,
      paymentStatus: data.paymentStatus || 'Unpaid'
    })

    setItems(mockStorage.getInvoices())
    setShowForm(false)
    setEditingItem(null)
    showSuccess(isRTL ? 'تم حفظ الفاتورة بنجاح' : 'Invoice saved successfully')
  }

  const handleSavePayment = (paymentData) => {
    const invoice = items.find(i => i.id === paymentData.invoiceId)
    if (invoice) {
        const newPaidAmount = (Number(invoice.paidAmount) || 0) + Number(paymentData.amount)
        const total = Number(invoice.total) || 0
        let newStatus = invoice.status
        let newPaymentStatus = 'Partial'
        
        if (newPaidAmount >= total) {
          newStatus = 'Paid'
          newPaymentStatus = 'Paid'
        } else if (newPaidAmount > 0) {
          newPaymentStatus = 'Partial'
        }
        
        const updatedInvoice = {
          ...invoice,
          paidAmount: newPaidAmount,
          status: newStatus,
          paymentStatus: newPaymentStatus
        }

        mockStorage.saveInvoice(updatedInvoice)
        setItems(mockStorage.getInvoices())
    }

    setShowPaymentModal(false)
    setPaymentItem(null)
    showSuccess(isRTL ? 'تم تسجيل الدفعة بنجاح' : 'Payment registered successfully')
  }

  // KPI Calculations
  const kpiData = useMemo(() => {
    const totalInvoiced = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
    const totalPaid = items.reduce((sum, item) => sum + (Number(item.paidAmount) || 0), 0)
    const totalOverdue = items.reduce((sum, item) => {
      const balance = (Number(item.total) || 0) - (Number(item.paidAmount) || 0)
      if (balance > 0 && new Date(item.dueDate) < new Date() && item.status !== 'Cancelled') {
        return sum + balance
      }
      return sum
    }, 0)
    const openInvoicesCount = items.filter(item => 
      item.status !== 'Paid' && item.status !== 'Cancelled'
    ).length

    return { totalInvoiced, totalPaid, totalOverdue, openInvoicesCount }
  }, [items])

  // State Machine Logic
  const getAvailableActions = (status, balanceDue) => {
    switch (status) {
      case 'Draft':
        return [
          { type: 'confirm', label: isRTL ? 'تأكيد وترحيل' : 'Confirm & Post', icon: FaCheck, color: 'text-green-600' },
          { type: 'edit', label: isRTL ? 'تعديل' : 'Edit Invoice', icon: FaEdit, color: 'text-blue-600' },
          { type: 'cancel', label: isRTL ? 'إلغاء' : 'Cancel Invoice', icon: FaBan, color: 'text-red-600' }
        ]
      case 'Posted':
      case 'Overdue':
      case 'Partial':
        const actions = [
          { type: 'payment', label: isRTL ? 'تسجيل دفعة' : 'Register Payment', icon: FaMoneyBillWave, color: 'text-blue-600' },
          { type: 'email', label: isRTL ? 'إرسال بالبريد' : 'Send by Email', icon: FaPaperPlane, color: 'text-purple-600' },
          { type: 'print', label: isRTL ? 'طباعة' : 'Print / PDF', icon: FaPrint, color: 'text-gray-600' }
        ]
        if (balanceDue === Number(items.find(i => i.status === status)?.total)) { // If no payment made yet
           actions.push({ type: 'cancel', label: isRTL ? 'إلغاء' : 'Cancel Invoice', icon: FaBan, color: 'text-red-600' })
        }
        return actions
      case 'Paid':
        return [
          { type: 'email', label: isRTL ? 'إرسال بالبريد' : 'Send by Email', icon: FaPaperPlane, color: 'text-purple-600' },
          { type: 'print', label: isRTL ? 'طباعة' : 'Print / PDF', icon: FaPrint, color: 'text-gray-600' }
        ]
      case 'Cancelled':
      default:
        return []
    }
  }

  const handleStatusAction = (invoice, actionType) => {
    if (actionType === 'edit') {
      setEditingItem(invoice)
      setShowForm(true)
      return
    }
    if (actionType === 'payment') {
      setPaymentItem(invoice)
      setShowPaymentModal(true)
      return
    }
    if (actionType === 'print') {
      setPreviewItem(invoice)
      setShowPreview(true)
      return
    }

    const actionMap = {
      'confirm': { status: 'Posted', requireReason: false },
      'cancel': { status: 'Cancelled', requireReason: true },
    }

    const actionConfig = actionMap[actionType]
    if (!actionConfig) return

    const actionData = {
      type: actionType,
      invoiceId: invoice.id,
      nextStatus: actionConfig.status,
      currentStatus: invoice.status
    }

    if (actionConfig.requireReason) {
      setStatusAction(actionData)
      setStatusReason('')
      setShowStatusModal(true)
    } else {
      if (window.confirm(isRTL ? 'هل أنت متأكد من هذا الإجراء؟' : 'Are you sure you want to proceed?')) {
        executeStatusChange(actionData)
      }
    }
  }

  const executeStatusChange = async (actionData) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Mock API call
      setItems(prev => prev.map(item => {
        if (item.id === actionData.invoiceId) {
          let updates = { status: actionData.nextStatus }
          if (actionData.type === 'cancel') updates.cancelReason = statusReason
          return { ...item, ...updates }
        }
        return item
      }))
      showSuccess(isRTL ? 'تم تحديث الحالة بنجاح' : 'Status updated successfully')
      setShowStatusModal(false)
      setStatusAction(null)
    } catch (e) {
      alert(isRTL ? 'فشل التحديث' : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search
      if (q) {
        const query = q.toLowerCase()
        const match = 
          item.id?.toLowerCase().includes(query) ||
          item.customerName?.toLowerCase().includes(query) ||
          item.orderId?.toLowerCase().includes(query)
        if (!match) return false
      }

      // Filters
      if (filters.status && item.status !== filters.status) return false
      if (filters.paymentStatus && item.paymentStatus !== filters.paymentStatus) return false
      if (filters.customerName && item.customerName !== filters.customerName) return false
      if (filters.orderId && (item.orderId || '').toLowerCase().indexOf(filters.orderId.toLowerCase()) === -1) return false
      
      // Total range
      const totalVal = Number(item.total) || 0
      if (filters.totalMin && totalVal < Number(filters.totalMin)) return false
      if (filters.totalMax && totalVal > Number(filters.totalMax)) return false
      
      // Invoice type
      if (filters.invoiceType && item.invoiceType !== filters.invoiceType) return false
      
      if (filters.dateFrom) {
        if (new Date(item.date) < new Date(filters.dateFrom)) return false
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo)
        endDate.setDate(endDate.getDate() + 1)
        if (new Date(item.date) >= endDate) return false
      }
      
      // Due date range
      if (filters.dueDateFrom) {
        if (new Date(item.dueDate) < new Date(filters.dueDateFrom)) return false
      }
      if (filters.dueDateTo) {
        const endDue = new Date(filters.dueDateTo)
        endDue.setDate(endDue.getDate() + 1)
        if (new Date(item.dueDate) >= endDue) return false
      }
      
      // CreatedAt range
      if (filters.createdAtFrom) {
        if (new Date(item.createdAt) < new Date(filters.createdAtFrom)) return false
      }
      if (filters.createdAtTo) {
        const endCreated = new Date(filters.createdAtTo)
        endCreated.setDate(endCreated.getDate() + 1)
        if (new Date(item.createdAt) >= endCreated) return false
      }

      return true
    })
  }, [items, q, filters])

  // Pagination Logic
  const paginatedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      if (aVal === bVal) return 0
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })
    return sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [filteredItems, sortBy, sortOrder, currentPage, itemsPerPage])

  const pageCount = Math.ceil(filteredItems.length / itemsPerPage)

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Exports
  // Calculate export count for button label
  const exportCount = useMemo(() => {
    if (selectedItems.length > 0) return selectedItems.length

    if (!exportFrom && !exportTo) return filteredItems.length
    
    const start = parseInt(exportFrom)
    const end = parseInt(exportTo)
    
    if (!start || !end || start > end || start < 1) return 0
    
    return filteredItems.slice((start - 1) * itemsPerPage, end * itemsPerPage).length
  }, [filteredItems, exportFrom, exportTo, itemsPerPage, selectedItems])

  const handleExportRange = () => {
    let itemsToExport = []
    let filename = ''

    // Priority 1: Checkbox Selection
    if (selectedItems.length > 0) {
      itemsToExport = items.filter(item => selectedItems.includes(item.id))
      filename = 'selected_invoices_export.xlsx'
    } 
    // Priority 2: Page Range (if no selection)
    else if (exportFrom && exportTo) {
      const start = parseInt(exportFrom)
      const end = parseInt(exportTo)
      
      if (!start || !end || start > end || start < 1) {
        alert(isRTL ? 'الرجاء إدخال نطاق صفحات صحيح أو ترك الحقول فارغة لتصدير الكل' : 'Please enter a valid page range or leave empty to export all')
        return
      }

      itemsToExport = filteredItems.slice((start - 1) * itemsPerPage, end * itemsPerPage)
      filename = `invoices_pages_${start}_to_${end}.xlsx`
    }
    // Priority 3: All Filtered (Default)
    else {
      itemsToExport = filteredItems
      filename = 'filtered_invoices_export.xlsx'
    }
    
    if (itemsToExport.length === 0) {
      alert(isRTL ? 'لا توجد بيانات لتصديرها' : 'No data to export')
      return
    }

    const data = itemsToExport.map(item => ({
      'Invoice #': item.id,
      'Status': item.status,
      'Date': new Date(item.date).toLocaleDateString(),
      'Due Date': new Date(item.dueDate).toLocaleDateString(),
      'Customer': item.customerName,
      'Order #': item.orderId,
      'Total': item.total,
      'Paid': item.paidAmount,
      'Balance': item.total - item.paidAmount,
      'Payment Status': item.paymentStatus
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Invoices")
    XLSX.writeFile(wb, filename)
    showSuccess(isRTL ? `تم تصدير ${itemsToExport.length} فاتورة` : `Exported ${itemsToExport.length} invoices`)
  }

  const handleExportAll = () => {
    const data = items.map(item => ({
      'Invoice #': item.id,
      'Status': item.status,
      'Date': new Date(item.date).toLocaleDateString(),
      'Due Date': new Date(item.dueDate).toLocaleDateString(),
      'Customer': item.customerName,
      'Order #': item.orderId,
      'Total': item.total,
      'Paid': item.paidAmount,
      'Balance': item.total - item.paidAmount,
      'Payment Status': item.paymentStatus
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Invoices")
    XLSX.writeFile(wb, "invoices_export.xlsx")
  }

  const handleImport = (importedItems) => {
    const newItems = importedItems.map((item, index) => ({
      ...item,
      id: `INV-IMP-${Date.now()}-${index}`,
      items: item.items || [], 
      createdAt: item.createdAt || new Date().toISOString(),
      createdBy: 'Import'
    }))
    
    setItems(prev => [...newItems, ...prev])
    setShowImportModal(false)
    showSuccess(isRTL ? 'تم استيراد البيانات بنجاح' : 'Data imported successfully')
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="rounded-xl p-4 md:p-6 relative mb-6">
        <div className="flex flex-wrap lg:flex-row lg:items-center justify-between gap-4">
          <div className="w-full lg:w-auto flex items-center justify-between lg:justify-start gap-3">
            <div className="relative flex flex-col items-start gap-1">
              <h1 className="text-xl md:text-2xl font-bold text-start text-theme-text dark:text-white flex items-center gap-2">
                {isRTL ? 'فواتير المبيعات' : 'Sales Invoices'}
                <span className="text-sm font-normal text-[var(--muted-text)] bg-[var(--card-bg)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                  {filteredItems.length}
                </span>
              </h1>
              <p className="text-sm text-[var(--muted-text)]">
                {isRTL ? 'إدارة ومتابعة فواتير المبيعات والمدفوعات' : 'Manage sales invoices and track payments'}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-wrap lg:flex-row items-stretch lg:items-center gap-2 lg:gap-3">
            <button 
              onClick={() => setShowImportModal(true)}
              className="btn btn-sm w-full lg:w-auto bg-blue-600 hover:bg-blue-700 !text-white border-none flex items-center justify-center gap-2"
            >
              <FaFileImport /> {isRTL ? 'استيراد' : 'Import'}
            </button>
            <button 
              onClick={() => {
                setEditingItem(null)
                setShowForm(true)
              }}
              className="btn btn-sm bg-green-700  hover:bg-blue-700 !text-white border-none gap-2"
            >
              <FaPlus /> {isRTL ? 'فاتورة جديدة' : 'New Invoice'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="glass-panel p-4 rounded-xl mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-theme-text ">
            <Filter className="text-blue-500" size={16} /> {isRTL ? 'تصفية' : 'Filter'}
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAllFilters(prev => !prev)} 
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              {showAllFilters ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'عرض المزيد' : 'Show More')} 
              <ChevronDown size={14} className={`transform transition-transform ${showAllFilters ? 'rotate-180' : ''}`} />
            </button>
            <button 
              onClick={() => {
                setQ('')
                setFilters({ 
                  status: '', 
                  paymentStatus: '', 
                  customerName: '', 
                  orderId: '',
                  dateFrom: '', 
                  dateTo: '',
                  dueDateFrom: '',
                  dueDateTo: '',
                  totalMin: '',
                  totalMax: '',
                  invoiceType: '',
                  createdAtFrom: '',
                  createdAtTo: '',
                  datePeriod: '' 
                })
              }} 
              className="px-3 py-1.5 text-sm text-theme-text hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              {isRTL ? 'إعادة تعيين' : 'Reset'}
            </button>
          </div>
        </div>

        {/* Primary Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Search */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1">
              <Search className="text-blue-500" size={10} /> {isRTL ? 'بحث عام' : 'Search All Data'}
            </label>
            <input
              className="input w-full"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={isRTL ? 'بحث في كل البيانات...' : 'Search in all data...'}
            />
          </div>

          {/* 2. Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">
              {isRTL ? 'الحالة' : 'Status'}
            </label>
            <SearchableSelect
              value={filters.status}
              onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
              options={[
                { value: 'Draft', label: 'Draft' },
                { value: 'Posted', label: 'Posted' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Overdue', label: 'Overdue' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}
              placeholder={isRTL ? 'كل الحالات' : 'All Statuses'}
              isRTL={isRTL}
            />
          </div>

          {/* 3. Customer Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">
              {isRTL ? 'العميل' : 'Customer'}
            </label>
             <SearchableSelect
              value={filters.customerName}
              onChange={(val) => setFilters(prev => ({ ...prev, customerName: val }))}
              options={[
                { value: "", label: isRTL ? 'الكل' : 'All' },
                ...Array.from(new Set(items.map(i => i.customerName).filter(Boolean))).map(name => ({
                  value: name,
                  label: name
                }))
              ]}
              placeholder={isRTL ? 'اختر العميل' : 'Select Customer'}
              isRTL={isRTL}
            />
          </div>

          {/* 4. Total Min/Max */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">
              {isRTL ? 'الإجمالي (حد أدنى/أقصى)' : 'Total (Min/Max)'}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={isRTL ? 'حد أدنى' : 'Min'}
                value={filters.totalMin}
                onChange={(e) => setFilters(prev => ({ ...prev, totalMin: e.target.value }))}
                className="input w-full"
              />
              <input
                type="number"
                placeholder={isRTL ? 'حد أقصى' : 'Max'}
                value={filters.totalMax}
                onChange={(e) => setFilters(prev => ({ ...prev, totalMax: e.target.value }))}
                className="input w-full"
              />
            </div>
          </div>
          
        </div>

        {/* Secondary/Hidden Filters Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300 overflow-hidden ${showAllFilters ? 'max-h-[800px] opacity-100 pt-3' : 'max-h-0 opacity-0'}`}>

           {/* Payment Status */}
           <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">
              {isRTL ? 'حالة الدفع' : 'Payment Status'}
            </label>
            <SearchableSelect
              value={filters.paymentStatus}
              onChange={(val) => setFilters(prev => ({ ...prev, paymentStatus: val }))}
              options={[
                { value: 'Unpaid', label: 'Unpaid' },
                { value: 'Partial', label: 'Partial' },
                { value: 'Paid', label: 'Paid' }
              ]}
              placeholder={isRTL ? 'حالة الدفع' : 'Payment Status'}
              isRTL={isRTL}
            />
          </div>
          
          {/* Invoice Type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">
              {isRTL ? 'نوع الفاتورة' : 'Invoice Type'}
            </label>
            <SearchableSelect
              value={filters.invoiceType}
              onChange={(val) => setFilters(prev => ({ ...prev, invoiceType: val }))}
              options={[
                { value: 'Full', label: isRTL ? 'فاتورة كاملة' : 'Full' },
                { value: 'Partial', label: isRTL ? 'فاتورة جزئية' : 'Partial' },
                { value: 'Advance', label: isRTL ? 'دفعة مقدمة' : 'Advance' }
              ]}
              placeholder={isRTL ? 'كل الأنواع' : 'All Types'}
              isRTL={isRTL}
            />
          </div>


          {/* Due Date Range */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1">
              <Calendar className="text-blue-500" size={10} /> {isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}
            </label>
            <div className="w-full">
              <DatePicker
                popperContainer={({ children }) => createPortal(children, document.body)}
                selectsRange={true}
                startDate={filters.dueDateFrom ? new Date(filters.dueDateFrom) : null}
                endDate={filters.dueDateTo ? new Date(filters.dueDateTo) : null}
                onChange={(update) => {
                  const [start, end] = update;
                  setFilters(prev => ({
                    ...prev,
                    dueDateFrom: start ? start.toISOString().split('T')[0] : '',
                    dueDateTo: end ? end.toISOString().split('T')[0] : ''
                  }));
                }}
                isClearable={true}
                placeholderText={isRTL ? 'اختر الفترة الزمنية' : 'Select Due Date Range'}
                className="input w-full text-sm"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>
          
          {/* Creation Date Range */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1">
              <Calendar className="text-blue-500" size={10} /> {isRTL ? 'تاريخ الإنشاء' : 'Creation Date'}
            </label>
            <div className="w-full">
              <DatePicker
                popperContainer={({ children }) => createPortal(children, document.body)}
                selectsRange={true}
                startDate={filters.createdAtFrom ? new Date(filters.createdAtFrom) : null}
                endDate={filters.createdAtTo ? new Date(filters.createdAtTo) : null}
                onChange={(update) => {
                  const [start, end] = update;
                  setFilters(prev => ({
                    ...prev,
                    createdAtFrom: start ? start.toISOString().split('T')[0] : '',
                    createdAtTo: end ? end.toISOString().split('T')[0] : ''
                  }));
                }}
                isClearable={true}
                placeholderText={isRTL ? 'اختر الفترة الزمنية' : 'Select Creation Date Range'}
                className="input w-full text-sm"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted-text)]">
            <span className="loading loading-spinner loading-md"></span>
            <p className="mt-2">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto min-h-[400px] hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-xs uppercase text-theme-text font-semibold backdrop-blur-sm">
                <tr>
                  <th className="p-4 w-10 sticky left-0 z-10 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-xs"
                      checked={paginatedItems.length > 0 && selectedItems.length === paginatedItems.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th onClick={() => handleSort('id')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors min-w-[120px]">
                    {isRTL ? 'رقم الفاتورة' : 'Invoice #'}
                  </th>
                  <th onClick={() => handleSort('status')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors min-w-[120px]">
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>

                  <th onClick={() => handleSort('dueDate')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors min-w-[140px]">
                    {isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}
                  </th>
                  <th onClick={() => handleSort('createdAt')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors min-w-[140px]">
                    {isRTL ? 'تاريخ الإنشاء' : 'Creation Date'}
                  </th>
                  <th onClick={() => handleSort('customerName')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors min-w-[180px]">
                    {isRTL ? 'العميل' : 'Customer'}
                  </th>
                  <th onClick={() => handleSort('orderId')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors min-w-[140px]">
                    {isRTL ? 'رقم الطلب' : 'Order #'}
                  </th>
                  <th onClick={() => handleSort('total')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors min-w-[120px]">
                    {isRTL ? 'الإجمالي' : 'Total'}
                  </th>
                  <th onClick={() => handleSort('invoiceType')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors min-w-[140px]">
                    {isRTL ? 'نوع الفاتورة' : 'Invoice Type'}
                  </th>
                  <th onClick={() => handleSort('paidAmount')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors min-w-[120px]">
                    {isRTL ? 'المدفوع' : 'Paid'}
                  </th>
                  <th className="p-4 whitespace-nowrap min-w-[120px]">
                    {isRTL ? 'المتبقي' : 'Balance'}
                  </th>
                  <th className="p-4 text-end min-w-[140px]">
                    {isRTL ? 'إجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-sm">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-[var(--muted-text)]">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-3xl">🔍</div>
                        <p>{isRTL ? 'لا توجد بيانات' : 'No data found'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const balanceDue = (Number(item.total) || 0) - (Number(item.paidAmount) || 0)
                    return (
                      <tr 
                        key={item.id} 
                        className={`
                          group transition-colors cursor-pointer
                          ${activeRowId === item.id 
                            ? 'bg-blue-700/50' 
                            : 'hover:bg-gray-700/50 dark:hover:bg-gray-800/50'}
                          ${selectedItems.includes(item.id) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}
                        `}
                        onClick={() => setActiveRowId(activeRowId === item.id ? null : item.id)}
                      >
                        <td className="p-4 sticky left-0 z-10  backdrop-blur-sm " onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="checkbox checkbox-xs"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectRow(item.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="p-4 font-medium text-theme-text">{item.id}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            item.status === 'Draft' ? ' text-theme-text border-gray-200  dark:text-gray-300 dark:border-gray-700' :
                            item.status === 'Posted' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' :
                            item.status === 'Paid' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' :
                            item.status === 'Overdue' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' :
                            'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>

                        <td className="p-4 text-theme-text">{new Date(item.dueDate).toLocaleDateString()}</td>
                        <td className="p-4 text-theme-text">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                        <td className="p-4 text-theme-text">{item.customerName}</td>
                        <td className="p-4 text-theme-text">{item.orderId || '-'}</td>
                        <td className="p-4 font-bold text-theme-text">{Number(item.total).toLocaleString()}</td>
                        <td className="p-4 text-theme-text">
                          {isRTL
                            ? (item.invoiceType === 'Full'
                                ? 'فاتورة كاملة'
                                : item.invoiceType === 'Partial'
                                  ? 'فاتورة جزئية'
                                  : item.invoiceType === 'Advance'
                                    ? 'دفعة مقدمة'
                                    : (item.invoiceType || '-'))
                            : (item.invoiceType || '-')
                          }
                        </td>
                        <td className="p-4 text-green-600">{Number(item.paidAmount).toLocaleString()}</td>
                        <td className="p-4 text-red-500">{balanceDue.toLocaleString()}</td>
                        <td className="p-4 text-end sticky right-0 z-10">
                          <div className={`inline-flex items-center justify-end gap-1 transition-all duration-200 ${activeRowId === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}  shadow-lg rounded-full px-2 py-1 border border-gray-100 dark:border-gray-700`}>
                            {getAvailableActions(item.status, balanceDue).map((action, idx) => (
                              <button
                                key={`action-${idx}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusAction(item, action.type)
                                }}
                                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${action.color}`}
                                title={action.label}
                              >
                                <action.icon size={16} />
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {paginatedItems.length === 0 ? (
               <div className="p-8 text-center text-[var(--muted-text)]">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-3xl">🔍</div>
                    <p>{isRTL ? 'لا توجد بيانات' : 'No data found'}</p>
                  </div>
               </div>
            ) : (
              paginatedItems.map((item) => {
                const balanceDue = (Number(item.total) || 0) - (Number(item.paidAmount) || 0)
                return (
                  <div key={item.id} className=" p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                           {item.id}
                           {selectedItems.includes(item.id) && <FaCheckCircle className="text-blue-600" size={14} />}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.customerName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        item.status === 'Draft' ? ' text-theme-text border-gray-200  dark:text-gray-300 dark:border-gray-700' :
                        item.status === 'Posted' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' :
                        item.status === 'Paid' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' :
                        item.status === 'Overdue' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' :
                        'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs">{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</span>
                        <span className="font-medium text-theme-text">{new Date(item.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs">{isRTL ? 'الإجمالي' : 'Total'}</span>
                        <span className="font-bold text-theme-text">{Number(item.total).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs">{isRTL ? 'المدفوع' : 'Paid'}</span>
                        <span className="font-medium text-green-600">{Number(item.paidAmount).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs">{isRTL ? 'المتبقي' : 'Balance'}</span>
                        <span className="font-medium text-red-500">{balanceDue.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            className="checkbox checkbox-sm"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectRow(item.id)}
                          />
                      </div>
                      <div className="flex items-center gap-2">
                        {getAvailableActions(item.status, balanceDue).map((action, idx) => (
                          <button
                            key={`action-mobile-${idx}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusAction(item, action.type)
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm ${action.color.replace('text-', 'bg-').replace('600', '100')} ${action.color} dark:bg-opacity-20`}
                          >
                            <action.icon size={12} />
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          </>
        )}

        {/* Pagination */}
        <nav className="flex flex-col gap-4 p-3 lg:p-4 border-t border-theme-border dark:border-gray-700 dark:bg-transparent rounded-b-lg backdrop-blur-sm">
          <div className="flex  lg:flex-row justify-between items-center gap-3">
            {/* Show Entries */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto text-sm font-medium text-theme-text dark:text-white">
              <span style={{ color: theme === 'dark' ? '#ffffff' : undefined }}>{t('Show')}</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => { 
                  setItemsPerPage(Number(e.target.value)); 
                  setCurrentPage(1); 
                }} 
                className="px-2 py-1 border border-theme-border dark:border-gray-600 rounded-md dark:bg-transparent backdrop-blur-sm text-theme-text dark:text-white text-xs"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs font-semibold text-theme-text dark:text-white" style={{ color: theme === 'dark' ? '#ffffff' : undefined }}>{t('entries')}</span>
              <label htmlFor="page-search" className="sr-only">{t('Search Page')}</label>
              <input
                id="page-search"
                type="text"
                placeholder={t('Go to page...')}
                value={pageSearch}
                onChange={(e) => setPageSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const page = Number(pageSearch)
                    if (page > 0 && page <= Math.ceil(filteredItems.length / itemsPerPage)) {
                      setCurrentPage(page)
                      setPageSearch('')
                    }
                  }
                }}
                className="ml-2 px-3 py-1.5 border border-theme-border dark:border-gray-600 rounded-lg  dark:bg-transparent backdrop-blur-sm text-theme-text dark:text-white text-xs w-full sm:w-64 lg:w-28  dark:placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400"
                style={{ color: theme === 'dark' ? '#ffffff' : undefined }}
              />
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="block px-3 py-2 leading-tight text-theme-text border border-theme-border rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-transparent dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 backdrop-blur-sm"
              >
                <span className="sr-only text-theme-text dark:text-white focus:text-white">{t('Previous')}</span>
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
              </button>
              <span className="text-sm font-medium text-theme-text dark:text-white" style={{ color: theme === 'dark' ? '#ffffff' : undefined }}>
                {t('Page')} <span className="font-semibold text-theme-text dark:text-white" style={{ color: theme === 'dark' ? '#ffffff' : undefined }}>{currentPage}</span> {t('of')} <span className="font-semibold text-theme-text dark:text-white" style={{ color: theme === 'dark' ? '#ffffff' : undefined }}>{Math.ceil(filteredItems.length / itemsPerPage)}</span>
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredItems.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage)}
                className="block px-3 py-2 leading-tight text-theme-text border border-theme-border rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-transparent dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 backdrop-blur-sm"
              >
                <span className="sr-only text-theme-text dark:text-white focus:text-white" style={{ color: theme === 'dark' ? '#ffffff' : undefined }}>{t('Next')}</span>
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
              </button>
            </div>
          </div>



                  <div className="flex justify-center items-center">
          <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto border p-2 rounded-lg border-theme-border dark:border-gray-600  dark:bg-gray-700 justify-center">
            <span className="text-xs font-semibold text-theme-text dark:text-white" style={{ color: theme === 'dark' ? '#ffffff' : undefined }}>{t('Export Pages')}</span>
            <input
              type="number"
              min="1"
              max={Math.ceil(filteredItems.length / itemsPerPage)}
              placeholder="From"
              value={exportFrom}
              onChange={(e) => setExportFrom(e.target.value)}
              className="w-16 px-2 py-1 border border-theme-border dark:border-gray-600 rounded-md dark:bg-transparent backdrop-blur-sm text-theme-text dark:text-white text-xs focus:border-blue-500"
              style={{ color: theme === 'dark' ? '#ffffff' : undefined }}
            />
            <span className="text-xs font-semibold text-theme-text dark:text-white" style={{ color: theme === 'dark' ? '#ffffff' : undefined }}>{t('to')}</span>
            <input
              type="number"
              min="1"
              max={Math.ceil(filteredItems.length / itemsPerPage)}
              placeholder="To"
              value={exportTo}
              onChange={(e) => setExportTo(e.target.value)}
              className="w-16 px-2 py-1 border border-theme-border dark:border-gray-600 rounded-md dark:bg-transparent backdrop-blur-sm text-theme-text dark:text-white text-xs focus:border-blue-500"
              style={{ color: theme === 'dark' ? '#ffffff' : undefined }}
            />
            <button
              onClick={handleExportRange}
              className={`btn btn-sm !text-white border-none flex items-center gap-1 ${
                (selectedItems.length > 0 || (exportFrom && exportTo && exportCount > 0))
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FaDownload size={12} />
              {(selectedItems.length > 0 || (exportFrom && exportTo && exportCount > 0)) ? `${isRTL ? 'تصدير المحدد' : 'Export Selected'} (${exportCount})` : t('Export')}
            </button>
          </div>
        </div>
        </nav>
      </div>


       {/* Status Modal */}
       {showStatusModal && (
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold">
                  {statusAction?.type === 'cancel' ? (isRTL ? 'إلغاء الفاتورة' : 'Cancel Invoice') : (isRTL ? 'تحديث الحالة' : 'Update Status')}
                </h3>
                <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {isRTL ? 'الرجاء إدخال سبب لهذا الإجراء:' : 'Please enter a reason for this action:'}
                </p>
                <textarea
                  className="textarea w-full h-24"
                  placeholder={isRTL ? 'السبب...' : 'Reason...'}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                ></textarea>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-2">
                <button onClick={() => setShowStatusModal(false)} className="btn btn-ghost btn-sm">
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  onClick={() => executeStatusChange(statusAction)}
                  disabled={!statusReason.trim()}
                  className="btn btn-primary btn-sm"
                >
                  {isRTL ? 'تأكيد' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      )}

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up flex items-center gap-2">
          <span className="text-xl">✓</span>
          {successMessage}
        </div>
      )}

      {/* Modals */}
      <SalesInvoicesFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingItem(null); }}
        onSave={handleSaveInvoice}
        initialData={editingItem}
        isRTL={isRTL}
      />

      <SalesInvoicePreviewModal
        isOpen={showPreview}
        onClose={() => { setShowPreview(false); setPreviewItem(null); }}
        invoice={previewItem}
      />

      <SalesInvoicesPaymentModal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setPaymentItem(null); }}
        onSave={handleSavePayment}
        invoice={paymentItem}
      />

      {showImportModal && (
        <SalesInvoicesImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          isRTL={isRTL}
        />
      )}
    </div>
  )
}

// Components
const KpiCard = ({ title, value, subtext, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  }

  return (
    <div className="glass-card p-4 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      </div>
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        {/* Icon based on color/type */}
        <div className="w-6 h-6 rounded-full bg-current opacity-20" />
      </div>
    </div>
  )
}

const getStatusBadge = (status) => {
  const styles = {
    'Draft': 'badge-ghost',
    'Posted': 'badge-info',
    'Paid': 'badge-success',
    'Overdue': 'badge-error',
    'Cancelled': 'badge-warning',
    'Partial': 'badge-warning'
  }
  return styles[status] || 'badge-ghost'
}

const getPaymentStatusBadge = (status) => {
  const styles = {
    'Unpaid': 'badge-error',
    'Partial': 'badge-warning',
    'Paid': 'badge-success'
  }
  return styles[status] || 'badge-ghost'
}
