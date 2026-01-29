import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { api } from '../utils/api'
import { mockStorage } from '../utils/mockStorage'
import SearchableSelect from '../components/SearchableSelect'
import CustomersImportModal from '../components/CustomersImportModal'
import CustomersFormModal from '../components/CustomersFormModal'
import QuotationsFormModal from '../components/QuotationsFormModal'
import SalesOrdersFormModal from '../components/SalesOrdersFormModal'
import { useTheme } from '../shared/context/ThemeProvider'
import { 
  FaPlus, FaDownload, FaEye, FaEdit, FaTrash, 
  FaPhone, FaEnvelope, FaChevronLeft, FaChevronRight,
  FaFileImport, FaFileExport, FaStickyNote, FaSave, FaTimes,
  FaFileInvoiceDollar, FaShoppingCart
} from 'react-icons/fa'
import { Filter, ChevronDown, Search, Calendar, X } from 'lucide-react'
import * as XLSX from 'xlsx'

// Mock data for initial state or fallback
const MOCK_CUSTOMERS = [
  {
    id: 'CUST-001',
    name: 'Ahmed Mohamed',
    phone: '+201234567890',
    email: 'ahmed@example.com',
    type: 'Individual',
    source: 'New',
    companyName: '',
    taxNumber: '',
    country: 'Egypt',
    city: 'Cairo',
    addressLine: 'Nasr City',
    assignedSalesRep: 'Ibrahim',
    createdBy: 'Admin',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    notes: 'Interested in new product',
    tags: ['VIP']
  },
  {
    id: 'CUST-002',
    name: 'Techno LLC',
    phone: '+971555123456',
    email: 'sales@techno.com',
    type: 'Company',
    source: 'Lead',
    companyName: 'Techno LLC',
    taxNumber: 'TRN-12345',
    country: 'UAE',
    city: 'Dubai',
    addressLine: 'Business Bay',
    assignedSalesRep: 'Adam',
    createdBy: 'Sarah',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    notes: 'Requested quotation',
    tags: ['B2B']
  },
  {
    id: 'CUST-003',
    name: 'John Doe',
    phone: '+12025550123',
    email: 'john.doe@example.com',
    type: 'Individual',
    source: 'Lead',
    companyName: '',
    taxNumber: '',
    country: 'USA',
    city: 'New York',
    addressLine: '5th Avenue',
    assignedSalesRep: 'Noura',
    createdBy: 'System',
    createdAt: new Date().toISOString(), // Today
    notes: 'Follow up needed',
    tags: ['Priority']
  },
  {
    id: 'CUST-004',
    name: 'Global Solutions',
    phone: '+966501234567',
    email: 'info@globalsolutions.sa',
    type: 'Company',
    source: 'Referral',
    companyName: 'Global Solutions',
    taxNumber: '300012345600003',
    country: 'KSA',
    city: 'Riyadh',
    addressLine: 'Olaya Street',
    assignedSalesRep: 'Ibrahim',
    createdBy: 'Admin',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    notes: 'Contract signed',
    tags: ['Contracted']
  },
  {
    id: 'CUST-005',
    name: 'Smart Systems',
    phone: '+201009876543',
    email: 'contact@smartsystems.eg',
    type: 'Company',
    source: 'Web',
    companyName: 'Smart Systems',
    taxNumber: '123-456-789',
    country: 'Egypt',
    city: 'Alexandria',
    addressLine: 'Corniche',
    assignedSalesRep: 'Adam',
    createdBy: 'Sarah',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    notes: 'Pending payment',
    tags: ['Pending']
  },
  {
    id: 'CUST-006',
    name: 'Omar Hassan',
    phone: '+966555123456',
    email: 'omar.hassan@example.com',
    type: 'Individual',
    source: 'Social Media',
    companyName: '',
    taxNumber: '',
    country: 'KSA',
    city: 'Jeddah',
    addressLine: 'King Abdulaziz Road',
    assignedSalesRep: 'Noura',
    createdBy: 'Admin',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
    notes: 'High potential',
    tags: ['Prospect']
  },
  {
    id: 'CUST-007',
    name: 'Tech Pioneers',
    phone: '+14155551234',
    email: 'hello@techpioneers.com',
    type: 'Company',
    source: 'Conference',
    companyName: 'Tech Pioneers',
    taxNumber: 'EIN-987654321',
    country: 'USA',
    city: 'San Francisco',
    addressLine: 'Market Street',
    assignedSalesRep: 'Ibrahim',
    createdBy: 'System',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    notes: 'Partnership discussion',
    tags: ['Partner']
  },
  {
    id: 'CUST-008',
    name: 'Nadia Youssef',
    phone: '+971501239876',
    email: 'nadia.y@example.ae',
    type: 'Individual',
    source: 'Walk-in',
    companyName: '',
    taxNumber: '',
    country: 'UAE',
    city: 'Abu Dhabi',
    addressLine: 'Corniche Road',
    assignedSalesRep: 'Adam',
    createdBy: 'Sarah',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    notes: '',
    tags: []
  },
  {
    id: 'CUST-009',
    name: 'Green Energy',
    phone: '+493012345678',
    email: 'info@greenenergy.de',
    type: 'Company',
    source: 'Web',
    companyName: 'Green Energy GmbH',
    taxNumber: 'DE123456789',
    country: 'Germany',
    city: 'Berlin',
    addressLine: 'Alexanderplatz',
    assignedSalesRep: 'Noura',
    createdBy: 'Admin',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
    notes: 'Sustainability project',
    tags: ['Eco']
  },
  {
    id: 'CUST-010',
    name: 'Ali Baba',
    phone: '+905551234567',
    email: 'ali.b@example.tr',
    type: 'Individual',
    source: 'Referral',
    companyName: '',
    taxNumber: '',
    country: 'Turkey',
    city: 'Istanbul',
    addressLine: 'Taksim',
    assignedSalesRep: 'Ibrahim',
    createdBy: 'System',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    notes: 'Old customer returning',
    tags: ['Returning']
  },
  {
    id: 'CUST-011',
    name: 'Creative Minds',
    phone: '+97433312345',
    email: 'create@minds.qa',
    type: 'Company',
    source: 'Ads',
    companyName: 'Creative Minds WLL',
    taxNumber: 'QA-12345',
    country: 'Qatar',
    city: 'Doha',
    addressLine: 'West Bay',
    assignedSalesRep: 'Adam',
    createdBy: 'Sarah',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    notes: 'Needs branding',
    tags: ['Creative']
  },
  {
    id: 'CUST-012',
    name: 'Lina Mahmoud',
    phone: '+9613123456',
    email: 'lina.m@example.lb',
    type: 'Individual',
    source: 'New',
    companyName: '',
    taxNumber: '',
    country: 'Lebanon',
    city: 'Beirut',
    addressLine: 'Hamra',
    assignedSalesRep: 'Noura',
    createdBy: 'Admin',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    notes: '',
    tags: []
  },
  {
    id: 'CUST-013',
    name: 'Alpha Corp',
    phone: '+201112223334',
    email: 'sales@alphacorp.eg',
    type: 'Company',
    source: 'Cold Call',
    companyName: 'Alpha Corp',
    taxNumber: '456-789-012',
    country: 'Egypt',
    city: 'Giza',
    addressLine: 'Pyramids Road',
    assignedSalesRep: 'Ibrahim',
    createdBy: 'Sarah',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    notes: 'Initial meeting set',
    tags: ['Hot Lead']
  },
  {
    id: 'CUST-014',
    name: 'Beta Ltd',
    phone: '+96599912345',
    email: 'info@betaltd.kw',
    type: 'Company',
    source: 'Exhibition',
    companyName: 'Beta Ltd',
    taxNumber: 'KW-98765',
    country: 'Kuwait',
    city: 'Kuwait City',
    addressLine: 'Sharq',
    assignedSalesRep: 'Adam',
    createdBy: 'Admin',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
    notes: '',
    tags: []
  },
  {
    id: 'CUST-015',
    name: 'Charlie Brown',
    phone: '+14165550987',
    email: 'charlie.b@example.ca',
    type: 'Individual',
    source: 'Web',
    companyName: '',
    taxNumber: '',
    country: 'Canada',
    city: 'Toronto',
    addressLine: 'Yonge Street',
    assignedSalesRep: 'Noura',
    createdBy: 'System',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    notes: 'Inactive',
    tags: ['Inactive']
  }
]

export const Customers = () => {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const isRTL = String(i18n.language || '').startsWith('ar')
  
  // State
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [activeRowId, setActiveRowId] = useState(null)
  
  // Notes Modal State
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [currentNoteItem, setCurrentNoteItem] = useState(null)
  const [noteContent, setNoteContent] = useState('')

  // Quotation & Sales Order Modal State
  const [showQuotationModal, setShowQuotationModal] = useState(false)
  const [showSalesOrderModal, setShowSalesOrderModal] = useState(false)
  const [targetCustomer, setTargetCustomer] = useState(null)

  // Filters
  const [q, setQ] = useState('') // Main search query
  const [filters, setFilters] = useState({
    type: '',
    source: '',
    country: '',
    city: '',
    assignedSalesRep: [], // Changed to array for multi-select
    createdBy: '',
    dateFrom: '',
    dateTo: '',
    datePeriod: '' // 'today', 'week', 'month', 'custom'
  })
  const [showAllFilters, setShowAllFilters] = useState(false)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [pageSearch, setPageSearch] = useState('')
  const [exportFrom, setExportFrom] = useState('')
  const [exportTo, setExportTo] = useState('')

  // Sorting
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Selection
  const [selectedItems, setSelectedItems] = useState([])

  // Helper for success messages
  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Load Data
  const load = async () => {
    try {
      setLoading(true)
      setError('')
      // Simulate API call or use real one
      // const { data } = await api.get('/api/customers')
      // setItems(data?.data?.items || [])
      
      // Using Mock for now
      setTimeout(() => {
        const stored = mockStorage.getCustomers()
        if (stored && stored.length > 0) {
          setItems(stored)
        } else {
          // If empty, maybe init with MOCK? 
          // mockStorage.init() already puts SEED_DATA if empty.
          // So if we get here, it might be empty because user deleted all, or just init.
          // Let's trust mockStorage.
          setItems(mockStorage.getCustomers())
        }
        setLoading(false)
      }, 500)
    } catch (e) {
      setError('Failed to load customers')
      setItems(MOCK_CUSTOMERS)
      setLoading(false)
    }
  }

  const isFirstRender = useRef(true)

  useEffect(() => {
    load()
  }, [])

  // Removed legacy localStorage sync
  // useEffect(() => {
  //   if (isFirstRender.current) {
  //     isFirstRender.current = false
  //     return
  //   }
  //   try {
  //     localStorage.setItem('customersData', JSON.stringify(items))
  //   } catch (e) {}
  // }, [items])

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search
      if (q) {
        const query = q.toLowerCase()
        const match = 
          item.name?.toLowerCase().includes(query) ||
          item.phone?.toLowerCase().includes(query) ||
          item.email?.toLowerCase().includes(query) ||
          item.id?.toLowerCase().includes(query) ||
          item.companyName?.toLowerCase().includes(query)
        if (!match) return false
      }

      // Filters
      if (filters.type && item.type !== filters.type) return false
      if (filters.source && item.source !== filters.source) return false
      if (filters.country && item.country !== filters.country) return false
      if (filters.city && item.city !== filters.city) return false
      
      // Multi-select for Sales Rep
      if (filters.assignedSalesRep && filters.assignedSalesRep.length > 0) {
        if (!filters.assignedSalesRep.includes(item.assignedSalesRep)) return false
      }

      if (filters.createdBy && item.createdBy !== filters.createdBy) return false
      
      if (filters.dateFrom) {
        if (new Date(item.createdAt) < new Date(filters.dateFrom)) return false
      }
      if (filters.dateTo) {
        // Add one day to include the end date fully
        const endDate = new Date(filters.dateTo)
        endDate.setDate(endDate.getDate() + 1)
        if (new Date(item.createdAt) >= endDate) return false
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

  const handleDelete = async (id) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا العميل؟' : 'Are you sure you want to delete this customer?')) {
      setLoading(true)
      try {
        // await api.delete(`/api/customers/${id}`)
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        setItems(prev => prev.filter(i => i.id !== id))
        showSuccess(isRTL ? 'تم حذف العميل بنجاح' : 'Customer deleted successfully')
      } catch (e) {
        alert(isRTL ? 'فشل الحذف' : 'Delete failed')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleImport = (importedData) => {
    const newItems = importedData.map((item, index) => ({
      ...item,
      id: `CUST-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      createdBy: 'Import'
    }))
    setItems(prev => [...newItems, ...prev])
    setShowImportModal(false)
    showSuccess(isRTL ? `تم استيراد ${importedData.length} عميل بنجاح` : `Successfully imported ${importedData.length} customers`)
  }

  const handleSaveCustomer = (customerData) => {
    let savedItem
    if (editingItem) {
      // Edit
      const updatedItem = { ...editingItem, ...customerData }
      mockStorage.saveCustomer(updatedItem)
      setItems(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item))
      showSuccess(isRTL ? 'تم تحديث بيانات العميل' : 'Customer updated successfully')
    } else {
      // Add
      const newItem = {
        ...customerData,
        id: customerData.customerCode || `CUST-${Date.now()}`, // Use code as ID if possible, or gen new
        createdAt: new Date().toISOString(),
        createdBy: 'Admin' // Should be current user
      }
      mockStorage.saveCustomer(newItem)
      setItems(prev => [newItem, ...prev])
      showSuccess(isRTL ? 'تم إضافة العميل بنجاح' : 'Customer added successfully')
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const saveNote = () => {
    if (!currentNoteItem) return
    setItems(prev => prev.map(item => {
      if (item.id === currentNoteItem.id) {
        return { ...item, notes: noteContent }
      }
      return item
    }))
    setShowNoteModal(false)
    showSuccess(isRTL ? 'تم حفظ الملاحظة' : 'Note saved')
  }

  // Options for filters
  const typeOptions = useMemo(() => [...new Set(items.map(i => i.type).filter(Boolean))], [items])
  const sourceOptions = ['Lead', 'New']
  const countryOptions = useMemo(() => [...new Set(items.map(i => i.country).filter(Boolean))], [items])
  const repOptions = useMemo(() => [...new Set(items.map(i => i.assignedSalesRep).filter(Boolean))], [items])
  const createdByOptions = useMemo(() => [...new Set(items.map(i => i.createdBy).filter(Boolean))], [items])

  const clearFilters = () => {
    setQ('')
    setFilters({
      type: '',
      source: '',
      country: '',
      city: '',
      assignedSalesRep: [],
      createdBy: '',
      dateFrom: '',
      dateTo: '',
      datePeriod: ''
    })
  }

  const handleDatePeriodChange = (period) => {
    const now = new Date()
    let from = ''
    let to = ''

    if (period === 'today') {
      from = now.toISOString().split('T')[0]
      to = now.toISOString().split('T')[0]
    } else if (period === 'week') {
      const first = new Date(now.setDate(now.getDate() - now.getDay()))
      const last = new Date(now.setDate(now.getDate() - now.getDay() + 6))
      from = first.toISOString().split('T')[0]
      to = last.toISOString().split('T')[0]
    } else if (period === 'month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      from = first.toISOString().split('T')[0]
      to = last.toISOString().split('T')[0]
    }

    setFilters(prev => ({
      ...prev,
      datePeriod: period,
      dateFrom: from,
      dateTo: to
    }))
  }

  const handleExportRange = () => {
    const from = parseInt(exportFrom)
    const to = parseInt(exportTo)
    if (!from || !to || from > to || from < 1) return
    
    // Calculate range of items
    const startIdx = (from - 1) * itemsPerPage
    const endIdx = to * itemsPerPage
    const itemsToExport = filteredItems.slice(startIdx, endIdx)
    
    if (itemsToExport.length === 0) return

    const data = itemsToExport.map(item => ({
      ID: item.id,
      Name: item.name,
      Phone: item.phone,
      Email: item.email,
      Type: item.type,
      Source: item.source,
      Company: item.companyName,
      TaxNumber: item.taxNumber,
      Country: item.country,
      City: item.city,
      SalesRep: item.assignedSalesRep,
      CreatedBy: item.createdBy,
      CreatedAt: new Date(item.createdAt).toLocaleDateString(),
      Notes: item.notes
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Customers")
    XLSX.writeFile(wb, "customers_export.xlsx")
  }

  const handleBulkExport = () => {
    if (selectedItems.length === 0) return

    const itemsToExport = items.filter(item => selectedItems.includes(item.id))
    
    const data = itemsToExport.map(item => ({
      ID: item.id,
      Name: item.name,
      Phone: item.phone,
      Email: item.email,
      Type: item.type,
      Source: item.source,
      Company: item.companyName,
      TaxNumber: item.taxNumber,
      Country: item.country,
      City: item.city,
      SalesRep: item.assignedSalesRep,
      CreatedBy: item.createdBy,
      CreatedAt: new Date(item.createdAt).toLocaleDateString(),
      Notes: item.notes
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Selected Customers")
    XLSX.writeFile(wb, "selected_customers_export.xlsx")
    showSuccess(isRTL ? `تم تصدير ${itemsToExport.length} عميل` : `Exported ${itemsToExport.length} customers`)
  }

  const handleBulkAction = (action) => {
    if (selectedItems.length === 0) return

    if (action === 'Add Quotation' || action === 'Add Sales Order') {
      if (selectedItems.length > 1) {
        alert(isRTL ? 'الرجاء تحديد عميل واحد فقط' : 'Please select only one customer')
        return
      }

      const customerId = selectedItems[0]
      const customer = items.find(i => i.id === customerId)
      
      if (customer) {
        const preparedData = {
          customerCode: customer.id,
          customerName: customer.name,
          salesPerson: customer.assignedSalesRep
        }
        setTargetCustomer(preparedData)
        
        if (action === 'Add Quotation') {
          setShowQuotationModal(true)
        } else {
          setShowSalesOrderModal(true)
        }
      }
      return
    }

    // Placeholder for future implementation
    alert(`${isRTL ? 'سيتم تنفيذ' : 'Executing'}: ${action} ${isRTL ? 'على' : 'on'} ${selectedItems.length} ${isRTL ? 'عنصر' : 'items'}`)
  }

  // Styles
  const tableHeaderBgClass = 'bg-theme-sidebar dark:bg-gray-900/95'
  const primaryButton = `btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none`

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className=" rounded-xl p-4 md:p-6 relative  mb-6">
        <div className="flex flex-wrap lg:flex-row lg:items-center justify-between gap-4">
          <div className="w-full lg:w-auto flex items-center justify-between lg:justify-start gap-3">
            <div className="relative flex flex-col items-start gap-1">
              <h1 className="text-xl md:text-2xl font-bold text-start text-theme-text dark:text-white flex items-center gap-2">
                {t('Customers')}
                <span className="text-sm font-normal text-[var(--muted-text)] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {filteredItems.length}
                </span>
              </h1>
              <span aria-hidden="true" className="inline-block h-[2px] w-full rounded bg-gradient-to-r from-blue-500 to-purple-600" />
              <p className="text-sm text-[var(--muted-text)] mt-1">
                {isRTL ? 'إدارة قاعدة بيانات العملاء' : 'Manage your customer database'}
              </p>
            </div>
          </div>
          
          <div className="w-full lg:w-auto flex flex-wrap lg:flex-row items-stretch lg:items-center gap-2 lg:gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-sm w-full lg:w-auto bg-blue-600 hover:bg-blue-700 !text-white border-none flex items-center justify-center gap-2"
            >
              <FaFileImport />
              {isRTL ? 'استيراد' : 'Import'}
            </button>
            
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-sm w-full lg:w-auto bg-green-600 hover:bg-green-500 !text-white border-none flex items-center justify-center gap-2"
            >
              <FaPlus />
              {isRTL ? 'إضافة عميل' : 'Add Customer'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section - Matching Developers.jsx Style */}
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
              {showAllFilters ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'عرض الكل' : 'Show All')} 
              <ChevronDown size={14} className={`transform transition-transform ${showAllFilters ? 'rotate-180' : ''}`} />
            </button>
            <button 
              onClick={clearFilters} 
              className="px-3 py-1.5 text-sm text-theme-text hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              {isRTL ? 'إعادة تعيين' : 'Reset'}
            </button>
          </div>
        </div>

        {/* Primary Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. SEARCH BY ALL DATA */}
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

          {/* 2. TYPE */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">
              {isRTL ? 'النوع' : 'Type'}
            </label>
            <SearchableSelect
              options={typeOptions.map(o => ({ value: o, label: o }))}
              value={filters.type}
              onChange={(v) => setFilters(prev => ({ ...prev, type: v }))}
              placeholder={isRTL ? 'اختر النوع' : 'Select Type'}
              className="w-full"
              isRTL={isRTL}
            />
          </div>

          {/* 3. SALES PERSONS (Multi-select) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">
              {isRTL ? 'مسؤول المبيعات' : 'Sales Persons'}
            </label>
            <SearchableSelect
              options={repOptions.map(o => ({ value: o, label: o }))}
              value={filters.assignedSalesRep}
              onChange={(v) => setFilters(prev => ({ ...prev, assignedSalesRep: v }))}
              placeholder={isRTL ? 'اختر المسؤولين' : 'Select Sales Person'}
              className="w-full"
              isRTL={isRTL}
              multiple={true}
            />
          </div>

          {/* 4. CREATED BY */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">
              {isRTL ? 'تم الإنشاء بواسطة' : 'Created By'}
            </label>
            <SearchableSelect
              options={createdByOptions.map(o => ({ value: o, label: o }))}
              value={filters.createdBy}
              onChange={(v) => setFilters(prev => ({ ...prev, createdBy: v }))}
              placeholder={isRTL ? 'منشئ السجل' : 'Record Creator'}
              className="w-full"
              isRTL={isRTL}
            />
          </div>
        </div>

        {/* Secondary/Hidden Filters Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300 overflow-hidden ${showAllFilters ? 'max-h-[500px] opacity-100 pt-3' : 'max-h-0 opacity-0'}`}>
          
          {/* 5. CREATED DATE (Range) */}
          <div className="col-span-1 md:col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1">
              <Calendar className="text-blue-500" size={10} /> {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
            </label>
            <div className="w-full">
              <DatePicker
                popperContainer={({ children }) => createPortal(children, document.body)}
                selectsRange={true}
                startDate={filters.dateFrom ? new Date(filters.dateFrom) : null}
                endDate={filters.dateTo ? new Date(filters.dateTo) : null}
                onChange={(update) => {
                  const [start, end] = update;
                  // Adjust for timezone offset if needed, but ISO string split is usually safe for dates
                  // However, DatePicker returns local Date objects.
                  // To avoid timezone issues when converting to YYYY-MM-DD:
                  const formatDate = (date) => {
                     if (!date) return '';
                     const offset = date.getTimezoneOffset();
                     const localDate = new Date(date.getTime() - (offset*60*1000));
                     return localDate.toISOString().split('T')[0];
                  };

                  setFilters(prev => ({
                    ...prev,
                    dateFrom: formatDate(start),
                    dateTo: formatDate(end),
                    datePeriod: ''
                  }));
                }}
                isClearable={true}
                placeholderText={isRTL ? "من - إلى" : "From - To"}
                className="input w-full"
                wrapperClassName="w-full"
                dateFormat="yyyy-MM-dd"
              />
              <div className="flex items-center gap-2 mt-2">
                <button 
                  onClick={() => handleDatePeriodChange('today')} 
                  className={`text-[10px] px-2 py-1 rounded-full transition-colors ${filters.datePeriod === 'today' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-theme-bg   text-theme-text hover:bg-gray-700/50 dark:hover:bg-gray-700'}`}
                >
                  {isRTL ? 'اليوم' : 'Today'}
                </button>
                <button 
                  onClick={() => handleDatePeriodChange('week')} 
                  className={`text-[10px] px-2 py-1 rounded-full transition-colors ${filters.datePeriod === 'week' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-theme-bg   text-theme-text hover:bg-gray-700/50 dark:hover:bg-gray-700'}`}
                >
                  {isRTL ? 'أسبوع' : 'Week'}
                </button>
                <button 
                  onClick={() => handleDatePeriodChange('month')} 
                  className={`text-[10px] px-2 py-1 rounded-full transition-colors ${filters.datePeriod === 'month' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-theme-bg   text-theme-text hover:bg-gray-700/50 dark:hover:bg-gray-700'}`}
                >
                  {isRTL ? 'شهر' : 'Month'}
                </button>
              </div>
            </div>
          </div>

          {/* Extra Filters (Source & Country) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">
              {isRTL ? 'المصدر' : 'Source'}
            </label>
            <SearchableSelect
              options={sourceOptions.map(o => ({ value: o, label: o }))}
              value={filters.source}
              onChange={(v) => setFilters(prev => ({ ...prev, source: v }))}
              placeholder={isRTL ? 'المصدر' : 'Source'}
              className="w-full"
              isRTL={isRTL}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">
              {isRTL ? 'الدولة' : 'Country'}
            </label>
            <SearchableSelect
              options={countryOptions.map(o => ({ value: o, label: o }))}
              value={filters.country}
              onChange={(v) => setFilters(prev => ({ ...prev, country: v }))}
              placeholder={isRTL ? 'الدولة' : 'Country'}
              className="w-full"
              isRTL={isRTL}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 flex items-center justify-center">
            <div className="loading loading-spinner loading-lg text-blue-600"></div>
          </div>
        )}
        
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-xs uppercase text-theme-text font-semibold backdrop-blur-sm">
              <tr>
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-xs"
                    checked={paginatedItems.length > 0 && selectedItems.length === paginatedItems.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th onClick={() => handleSort('id')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors">
                  {isRTL ? 'كود العميل' : 'Customer Code'}
                </th>
                <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors">
                  {isRTL ? 'اسم العميل' : 'Customer Name'}
                </th>
                <th className="p-4 whitespace-nowrap">{isRTL ? 'جهة الاتصال' : 'Contact Info'}</th>
                <th onClick={() => handleSort('type')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors">
                  {isRTL ? 'النوع' : 'Type'}
                </th>
                <th onClick={() => handleSort('source')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors">
                  {isRTL ? 'المصدر' : 'Source'}
                </th>
                <th onClick={() => handleSort('companyName')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors">
                  {isRTL ? 'اسم الشركة' : 'Company Name'}
                </th>
                <th className="p-4 whitespace-nowrap">{isRTL ? 'الرقم الضريبي' : 'Tax Number'}</th>
                <th onClick={() => handleSort('country')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors">
                  {isRTL ? 'الدولة' : 'Country'}
                </th>
                <th onClick={() => handleSort('city')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors">
                  {isRTL ? 'المدينة' : 'City'}
                </th>
                <th onClick={() => handleSort('assignedSalesRep')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors">
                  {isRTL ? 'مسؤول المبيعات' : 'Sales Rep'}
                </th>
                <th onClick={() => handleSort('createdBy')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors">
                  {isRTL ? 'تم الإنشاء بواسطة' : 'Created By'}
                </th>
                <th onClick={() => handleSort('createdAt')} className="p-4 cursor-pointer hover:text-blue-600 whitespace-nowrap transition-colors">
                  {isRTL ? 'تاريخ الإنشاء' : 'Creation Date'}
                </th>
                <th className="p-4 whitespace-nowrap">{isRTL ? 'الملاحظات' : 'Notes'}</th>
                <th className="p-4 whitespace-nowrap w-[140px]">
                  {isRTL ? 'خيارات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="15" className="p-8 text-center text-theme-text">
                    {isRTL ? 'لا توجد بيانات' : 'No data available'}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`transition-colors group cursor-pointer ${activeRowId === item.id ? ' dark:bg-blue-900/20' : 'hover:bg-blue-900/10'}`}
                    onClick={() => setActiveRowId(activeRowId === item.id ? null : item.id)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-xs"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                      />
                    </td>
                    <td className="p-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="p-4 font-semibold text-theme-text whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        {item.phone && (
                          <div className="flex items-center gap-2 text-xs text-theme-text">
                            <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <FaPhone size={10} />
                            </div>
                            <span dir="ltr" className="font-mono">{item.phone}</span>
                          </div>
                        )}
                        {item.email && (
                          <div className="flex items-center gap-2 text-xs text-theme-text">
                            <div className="w-5 h-5 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                              <FaEnvelope size={10} />
                            </div>
                            <span>{item.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.source === 'Lead' 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {item.source}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-theme-text">
                      {item.companyName || '—'}
                    </td>
                    <td className="p-4 whitespace-nowrap text-theme-text">
                      {item.taxNumber || '—'}
                    </td>
                    <td className="p-4 whitespace-nowrap text-theme-text">
                      {item.country}
                    </td>
                    <td className="p-4 whitespace-nowrap text-theme-text">
                      {item.city}
                    </td>
                    <td className="p-4 whitespace-nowrap text-theme-text">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 flex items-center justify-center text-xs font-bold">
                          {item.assignedSalesRep?.charAt(0)}
                        </div>
                        {item.assignedSalesRep}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-theme-text">
                      {item.createdBy}
                    </td>
                    <td className="p-4 whitespace-nowrap text-theme-text" dir="ltr">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 whitespace-nowrap max-w-[200px] truncate text-theme-text" title={item.notes}>
                      {item.notes || '—'}
                    </td>
                    <td className={`p-4 whitespace-nowrap sticky ltr:right-0 rtl:left-0 bg-theme-bg shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-none z-10 transition-opacity duration-200 ${activeRowId === item.id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <div className="flex items-center justify-end gap-3">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors shadow-sm">
                          <FaEye size={14} />
                          <span className="hidden xl:inline">{isRTL ? 'معاينة' : 'Preview'}</span>
                        </button>
                        <button 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors shadow-sm" 
                          onClick={() => {
                            setEditingItem(item)
                            setShowForm(true)
                          }}
                        >
                          <FaEdit size={14} />
                          <span className="hidden xl:inline">{isRTL ? 'تعديل' : 'Edit'}</span>
                        </button>
                        <button 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors shadow-sm" 
                          onClick={() => handleDelete(item.id)}
                        >
                          <FaTrash size={14} />
                          <span className="hidden xl:inline">{isRTL ? 'حذف' : 'Delete'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {paginatedItems.length === 0 ? (
            <div className="text-center p-8 text-[var(--muted-text)]">
              {isRTL ? 'لا توجد بيانات' : 'No data available'}
            </div>
          ) : (
            paginatedItems.map((item) => (
              <div key={item.id} className="  rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-theme-text">{item.name}</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{item.id}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {item.type}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {item.phone && (
                    <div className="flex items-center gap-2 text-sm text-theme-text">
                      <FaPhone size={12} className="text-[var(--muted-text)]" />
                      <span dir="ltr">{item.phone}</span>
                    </div>
                  )}
                  {item.email && (
                    <div className="flex items-center gap-2 text-sm text-theme-text">
                      <FaEnvelope size={12} className="text-[var(--muted-text)]" />
                      <span>{item.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-theme-text">
                    <span className="text-[var(--muted-text)]">{isRTL ? 'المصدر:' : 'Source:'}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      item.source === 'Lead' 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {item.source}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button 
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                    onClick={() => {/* Preview logic */}}
                  >
                    <FaEye size={16} />
                  </button>
                  <button 
                    className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
                    onClick={() => {
                      setEditingItem(item)
                      setShowForm(true)
                    }}
                  >
                    <FaEdit size={16} />
                  </button>
                  <button 
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                    onClick={() => handleDelete(item.id)}
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
      <nav className="flex flex-col gap-4 p-3 lg:p-4 border-t border-theme-border dark:border-gray-700 dark:bg-transparent rounded-b-lg backdrop-blur-sm">
        {/* Row 1: Show Entries & Page Navigation */}
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

        {/* Row 2: Export Controls */}
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
              className="w-16 px-2 py-1 border border-theme-border dark:border-gray-600 rounded-md dark:bg-transparent backdrop-blur-sm text-white text-xs focus:border-blue-500"
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
              className="btn btn-sm bg-blue-600 hover:bg-blue-700 !text-white border-none flex items-center gap-1"
            >
              <FaDownload size={12} />
              {t('Export')}
            </button>
          </div>
        </div>
      </nav>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <CustomersImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          isRTL={isRTL}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <CustomersFormModal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
          onSave={handleSaveCustomer}
          initialData={editingItem}
          isRTL={isRTL}
        />
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNoteModal(false)} />
          <div className="relative w-full max-w-md bg-theme-bg dark:bg-gray-900 rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
              <FaStickyNote className="text-yellow-500" />
              {isRTL ? 'ملاحظات العميل' : 'Customer Notes'}
            </h3>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full h-32 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder={isRTL ? 'اكتب ملاحظاتك هنا...' : 'Type notes here...'}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowNoteModal(false)}
                className="btn btn-sm btn-ghost"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={saveNote}
                className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none"
              >
                {isRTL ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Form Modal */}
      {showQuotationModal && (
        <QuotationsFormModal
          isOpen={showQuotationModal}
          onClose={() => {
            setShowQuotationModal(false)
            setTargetCustomer(null)
          }}
          onSave={(data) => {
            // Read existing
            const existing = localStorage.getItem('quotationsData') ? JSON.parse(localStorage.getItem('quotationsData')) : []
            // Add new
            const newItem = {
               ...data,
               id: data.id || `QUO-${Math.floor(Math.random() * 100000)}`, // Ensure ID
               createdAt: new Date().toISOString()
            }
            const updated = [newItem, ...existing]
            // Save
            localStorage.setItem('quotationsData', JSON.stringify(updated))

            setShowQuotationModal(false)
            setTargetCustomer(null)
            showSuccess(isRTL ? 'تم إضافة عرض السعر بنجاح' : 'Quotation added successfully')
          }}
          initialData={targetCustomer}
          isRTL={isRTL}
        />
      )}

      {/* Sales Order Form Modal */}
      {showSalesOrderModal && (
        <SalesOrdersFormModal
          isOpen={showSalesOrderModal}
          onClose={() => {
            setShowSalesOrderModal(false)
            setTargetCustomer(null)
          }}
          onSave={(data) => {
            // Read existing
            const existing = localStorage.getItem('salesOrdersData') ? JSON.parse(localStorage.getItem('salesOrdersData')) : []
            // Add new
            const newItem = {
               ...data,
               id: data.id || `SO-${Math.floor(Math.random() * 100000)}`,
               createdAt: new Date().toISOString()
            }
            const updated = [newItem, ...existing]
            // Save
            localStorage.setItem('salesOrdersData', JSON.stringify(updated))

            setShowSalesOrderModal(false)
            setTargetCustomer(null)
            showSuccess(isRTL ? 'تم إضافة طلب البيع بنجاح' : 'Sales Order added successfully')
          }}
          initialData={targetCustomer}
          isRTL={isRTL}
        />
      )}

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 card dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 text-sm font-medium text-theme-text border-r border-gray-200 dark:border-gray-700 pr-4 rtl:border-l rtl:border-r-0 rtl:pl-4 rtl:pr-0">
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{selectedItems.length}</span>
            <span>{isRTL ? 'محدد' : 'Selected'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleBulkAction('Add Notes')}
              className="p-2 text-theme-text hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors tooltip"
              title={isRTL ? 'إضافة ملاحظات' : 'Add Notes'}
            >
              <FaStickyNote size={18} />
            </button>
            
            <button 
              onClick={() => handleBulkAction('Add Quotation')}
              className="p-2 text-theme-text hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
              title={isRTL ? 'إضافة عرض سعر' : 'Add Quotation'}
            >
              <FaFileInvoiceDollar size={18} />
            </button>

            <button 
              onClick={() => handleBulkAction('Add Sales Order')}
              className="p-2 text-theme-text hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-colors"
              title={isRTL ? 'إضافة طلب بيع' : 'Add Sales Order'}
            >
              <FaShoppingCart size={18} />
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

            <button 
              onClick={handleBulkExport}
              className="p-2 text-theme-text hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors"
              title={isRTL ? 'تصدير' : 'Export'}
            >
              <FaFileExport size={18} />
            </button>
            
            <button 
              onClick={() => setSelectedItems([])}
              className="ml-2 p-1 text-theme-text hover:text-red-500 rounded-full transition-colors"
              title={isRTL ? 'إلغاء التحديد' : 'Deselect All'}
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
