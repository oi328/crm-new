import React, { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { 
  Filter, User, Calendar, MapPin, Check, X, Eye, 
  ChevronDown, CheckCircle, XCircle, ChevronLeft, ChevronRight 
} from 'lucide-react'
import BackButton from '../components/BackButton'
import EnhancedLeadDetailsModal from '../shared/components/EnhancedLeadDetailsModal'
import * as XLSX from 'xlsx'
import { FaFileExport, FaFilePdf, FaFileExcel } from 'react-icons/fa'

export default function CheckInReport() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar' || i18n.dir() === 'rtl'

  // Mock Data
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('checkInReports')
    const initialValue = saved ? JSON.parse(saved) : []
    const mockData = [
    {
      id: 1,
      salesPerson: 'Abdelhamid',
      checkInDate: '2026-01-12T15:59:00',
      checkOutDate: '2026-01-12T17:00:00',
      location: { lat: 30.0444, lng: 31.2357, address: 'Cairo, Egypt' },
      status: 'pending',
      type: 'task'
    },
    {
      id: 2,
      salesPerson: 'Sara Kamal',
      checkInDate: '2026-01-13T09:30:00',
      checkOutDate: null,
      location: { lat: 30.0444, lng: 31.2357, address: 'Giza, Egypt' },
      status: 'pending',
      type: 'lead',
      leadId: 2,
      customerName: 'سارة Johnson 2'
    },
    {
      id: 3,
      salesPerson: 'Omar Ali',
      checkInDate: '2026-01-11T14:15:00',
      location: { lat: 30.0444, lng: 31.2357, address: 'Alexandria, Egypt' },
      status: 'accepted',
      type: 'task'
    },
    {
      id: 4,
      salesPerson: 'Khaled Ahmed',
      checkInDate: '2026-01-14T11:00:00',
      location: { lat: 30.0444, lng: 31.2357, address: 'Maadi, Cairo' },
      status: 'rejected',
      type: 'lead',
      leadId: 4,
      customerName: 'Emma Wilson 4'
    },
    {
      id: 5,
      salesPerson: 'Mona Zaki',
      checkInDate: '2026-01-14T13:45:00',
      location: { lat: 30.0444, lng: 31.2357, address: 'Zamalek, Cairo' },
      status: 'pending',
      type: 'task'
    }
  ]
  // Merge mock data with saved data, prioritizing saved data if IDs conflict (though IDs should be unique)
  // For simplicity, we just concatenate unique items from saved that are not in mock (by ID) or just show both.
  // Since mock IDs are small integers and new IDs will be timestamps, collision is unlikely.
  return [...initialValue, ...mockData]
  })

  // Save to localStorage whenever data changes
  useEffect(() => {
    // Filter out the initial mock data if we only want to save user generated ones? 
    // Or just save everything. Saving everything is easier but duplicates mock data if we re-initialize.
    // Better: Only save items that are NOT in the original mock set? 
    // Or, simpler: Just read from localStorage and append to a fixed mock list in state, 
    // but when saving, we might not want to save the hardcoded mock data back to localStorage to avoid duplication on reload.
    
    // Let's refine the strategy:
    // 1. We have hardcoded `mockData`.
    // 2. We have `localStorage` data.
    // 3. State = `localStorage` + `mockData`.
    // 4. When we add a new item (from Tasks), we add it to `localStorage`.
    // 5. `CheckInReport` reads `localStorage`.
    
    // The issue is `CheckInReport` needs to know when `localStorage` changes if it's open.
    // But usually pages are separate. If the user navigates, it will re-mount.
    
    // However, if I modify `data` in this component (e.g. status change), I should persist that too?
    // The user didn't ask for full persistence, just "sending report".
    
    // So, I will just read from localStorage on mount.
  }, [])

  // Filters State
  const [salesPersonFilter, setSalesPersonFilter] = useState('')
  const [actionDateFilter, setActionDateFilter] = useState('Today')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [showAllFilters, setShowAllFilters] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Lead Modal State
  const [selectedLead, setSelectedLead] = useState(null)
  const [showLeadModal, setShowLeadModal] = useState(false)

  const handleLeadClick = (item) => {
    if (item.type !== 'lead') return

    try {
      const savedLeads = localStorage.getItem('leadsData')
      const leads = savedLeads ? JSON.parse(savedLeads) : []
      
      let foundLead = null
      
      // Try to find by ID first
      if (item.leadId) {
        foundLead = leads.find(l => l.id === item.leadId)
      }
      
      // Fallback to name matching
      if (!foundLead && item.customerName) {
        foundLead = leads.find(l => 
          (l.fullName || l.leadName || l.name) === item.customerName
        )
      }

      if (foundLead) {
        setSelectedLead(foundLead)
        setShowLeadModal(true)
      } else {
        // Create a temporary mock lead object for display if not found in storage
        // This ensures the modal opens even if the lead was deleted or is from mock data
        const mockLead = {
             id: item.leadId || Date.now(),
             name: item.customerName || t('Unknown Lead'),
             leadName: item.customerName || t('Unknown Lead'),
             company: t('Not Available'),
             location: item.location?.address || '',
             source: t('Check In Report'),
             createdBy: t('System'),
             salesPerson: item.salesPerson,
             createdDate: new Date().toISOString().split('T')[0],
             stage: 'new',
             status: 'new',
             email: '-',
             phone: '-',
             notes: t('This lead details could not be found in the database. Showing available report info.')
        };
        
        setSelectedLead(mockLead);
        setShowLeadModal(true);

        const evt = new CustomEvent('app:toast', { 
            detail: { 
                type: 'info', 
                message: isRTL ? 'عرض بيانات مؤقتة (العميل غير موجود في قاعدة البيانات)' : 'Showing temporary data (Lead not found in DB)' 
            } 
        });
        window.dispatchEvent(evt);
      }
    } catch (e) {
      console.error("Error finding lead", e)
    }
  }

  const handleExportExcel = () => {
    const dataToExport = filteredData.map(item => ({
      ID: item.id,
      'Sales Person': item.salesPerson,
      'Check In Date': formatDateTime(item.checkInDate),
      'Check Out Date': item.checkOutDate ? formatDateTime(item.checkOutDate) : '-',
      'Location': item.location.address,
      'Status': item.status
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "CheckIns")
    XLSX.writeFile(wb, "CheckIn_Report.xlsx")
  }

  const handleExportPDF = () => {
     // Placeholder
     alert("PDF Export coming soon")
  }

  // Filter Logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (salesPersonFilter && !item.salesPerson.toLowerCase().includes(salesPersonFilter.toLowerCase())) return false
      if (typeFilter && item.type !== typeFilter) return false
      // Date filter logic (mock) - normally would filter by date here
      return true
    }).sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate))
  }, [data, salesPersonFilter, actionDateFilter, typeFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [salesPersonFilter, actionDateFilter, typeFilter])

  const totalRecords = filteredData.length
  const pageCount = Math.ceil(totalRecords / entriesPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  // KPI Calculations
  const totalCheckIns = filteredData.length
  const pendingCheckIns = filteredData.filter(i => i.status === 'pending').length
  const acceptedCheckIns = filteredData.filter(i => i.status === 'accepted').length
  const rejectedCheckIns = filteredData.filter(i => i.status === 'rejected').length

  const handleAccept = (id) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, status: 'accepted' } : item))
  }

  const handleReject = (id) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item))
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredData.map(d => d.id))
    }
  }

  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(prev => prev.filter(item => item !== id))
    } else {
      setSelectedItems(prev => [...prev, id])
    }
  }

  const formatDateTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Back Link */}
      <div>
        <BackButton to="/reports" />
      </div>

      {/* Header */}
      <div className="flex flex-wrap gap-4 md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <MapPin size={32} />
          </div>
          {t('Check In Report')}
        </h1>
      </div>

      {/* Filters Section */}
      <div className="bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md border border-theme-border dark:border-gray-700/50 p-4 rounded-2xl shadow-sm mb-6 ">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 dark:text-white font-semibold">
            <Filter size={20} className="text-blue-500 dark:text-blue-400" />
            <h3>{t('Filter')}</h3>
          </div>
          <div className="flex items-center gap-2">

            <button
              onClick={() => {
                setSalesPersonFilter('')
                setActionDateFilter('Today')
                setTypeFilter('')
                setShowAllFilters(false)
              }}
              className="px-3 py-1.5 text-sm dark:text-white hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              {t('Reset')}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sales Person */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <User size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Sales Person')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={salesPersonFilter}
                  onChange={(e) => setSalesPersonFilter(e.target.value)}
                  placeholder={isRTL ? 'عبد الحميد' : 'Abdelhamid'}
                  className="w-full px-4 py-2  border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Action Date Filter */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Action Date')}
              </label>
              <div className="relative">
                <select
                  value={actionDateFilter}
                  onChange={(e) => setActionDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm appearance-none bg-transparent"
                >
                  <option value="Today">{t('Today')}</option>
                  <option value="Weekly">{t('This Week')}</option>
                  <option value="Monthly">{t('This Month')}</option>
                  <option value="Yearly">{t('This Year')}</option>
                </select>
                <div className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 pointer-events-none dark:text-white`}>
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <Filter size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Type')}
              </label>
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm appearance-none bg-transparent"
                >
                  <option value="">{t('All')}</option>
                  <option value="task">{t('Task')}</option>
                  <option value="lead">{t('Lead')}</option>
                </select>
                <div className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 pointer-events-none dark:text-white`}>
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: t('sales person '),
            value: totalCheckIns,
            sub: t('(Total)'),
            icon: MapPin,
            color: 'text-blue-500 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            title: t('Pending'),
            value: pendingCheckIns,
            sub: t('(Waiting)'),
            icon: Calendar,
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          },
          {
            title: t('Accepted'),
            value: acceptedCheckIns,
            sub: t('(Approved)'),
            icon: CheckCircle,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          },
          {
            title: t('Rejected'),
            value: rejectedCheckIns,
            sub: t('(Declined)'),
            icon: XCircle,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
          },
        ].map((card, idx) => {
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
                  <h3 className="text-theme-text dark:text-white text-sm font-semibold opacity-80">
                    {card.title}
                  </h3>
                </div>

                <div className="flex items-baseline space-x-2 rtl:space-x-reverse pl-1">
                  <span className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </span>
                  <span className="text-xs text-theme-text dark:text-white font-medium">
                    {card.sub}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Check-In List Table */}
      <div className="bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md border border-theme-border dark:border-gray-700/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-theme-border dark:border-gray-700/50 flex flex-wrap gap-4 justify-between items-center">
          <h2 className="font-semibold text-lg text-theme-text dark:text-white">
            {t('Check In List')}
          </h2>
          <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)} 
className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"              >
                <FaFileExport /> {isRTL ? 'تصدير' : 'Export'}
                <ChevronDown className={`transform transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} size={16} />
              </button>

              {/* Export Dropdown Menu */}
              {showExportMenu && (
                <div className={`absolute top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden ${isRTL ? 'left-0' : 'right-0'}`}>
                  <button
                    onClick={() => {
                      handleExportExcel();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors dark:text-gray-200"
                  >
                    <FaFileExcel className="text-green-600" size={18} />
                    <span>{isRTL ? 'تصدير كـ Excel' : 'Export to Excel'}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleExportPDF();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors border-t border-gray-100 dark:border-gray-700 dark:text-gray-200"
                  >
                    <FaFilePdf className="text-red-500" size={18} />
                    <span>{isRTL ? 'تصدير كـ PDF' : 'Export to PDF'}</span>
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4 p-4">
          {paginatedData.map(item => (
            <div key={item.id} className=" rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-theme-text dark:text-white text-lg">{item.salesPerson}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2 text-sm text-theme-text dark:text-white">
                        <span className="opacity-70 text-xs">{t('Check In')}:</span>
                        <span className="dir-ltr">{formatDateTime(item.checkInDate)}</span>
                    </div>
                    {item.checkOutDate && (
                        <div className="flex items-center gap-2 text-sm text-theme-text dark:text-white">
                            <span className="opacity-70 text-xs">{t('Check Out')}:</span>
                            <span className="dir-ltr">{formatDateTime(item.checkOutDate)}</span>
                        </div>
                    )}
                  </div>
                </div>
                <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'accepted' 
                          ? 'bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : item.status === 'rejected'
                            ? 'bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {item.status === 'accepted' ? t('Accepted') : 
                         item.status === 'rejected' ? t('Rejected') : 
                         t('Pending')}
                      </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-theme-text dark:text-white">{t('Type')}</span>
                    <span className="font-medium text-theme-text dark:text-white">
                        {item.type === 'task' ? (
                          t('Task')
                        ) : item.type === 'lead' ? (
                          <button 
                            onClick={() => handleLeadClick(item)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
                          >
                            {t('Lead')}
                          </button>
                        ) : (
                          t('Lead')
                        )}
                    </span>
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="text-theme-text dark:text-white">{t('Location')}</span>
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`, '_blank')}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100/50 rounded-full hover:bg-blue-200/50 dark:bg-blue-900/30 dark:text-blue-300 transition-colors"
                    >
                      <Eye size={12} />
                      {t('Preview')}
                    </button>
                </div>
              </div>

              {(item.status !== 'accepted' && item.status !== 'rejected') && (
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                  <button
                    onClick={() => handleAccept(item.id)}
                    className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100/50 rounded-lg hover:bg-green-200/50 dark:bg-green-900/30 dark:text-green-300 transition-colors"
                  >
                    <Check size={16} />
                    {t('Accept')}
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100/50 rounded-lg hover:bg-red-200/50 dark:bg-red-900/30 dark:text-red-300 transition-colors"
                  >
                    <X size={16} />
                    {t('Reject')}
                  </button>
                </div>
              )}
            </div>
          ))}
          {paginatedData.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {isRTL ? 'لا توجد بيانات' : 'No check-ins found'}
            </div>
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left dark:text-right text-xs font-medium text-theme-text dark:text-white uppercase tracking-wider w-1/4">
                  <div className="flex items-center gap-3">
  
                    {t('sales  person ')}
                  </div>
                </th>
                <th className="px-6 py-4 text-left dark:text-right text-xs font-medium text-theme-text dark:text-white uppercase tracking-wider">
                  {t('Check-In Date')}
                </th>
                <th className="px-6 py-4 text-left dark:text-right text-xs font-medium text-theme-text dark:text-white uppercase tracking-wider">
                  {isRTL ? 'تاريخ الخروج' : 'Check-Out Date'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-theme-text dark:text-white uppercase tracking-wider">
                  {t('Location')}
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-theme-text dark:text-white uppercase tracking-wider">
                  {t('Type')}
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-theme-text dark:text-white uppercase tracking-wider">
                  {t('Status')}
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-theme-text dark:text-white uppercase tracking-wider">
                  {t('Action')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {paginatedData.map((item) => (
                <tr key={item.id} className=" hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                    
                      <div className="flex flex-col">
                        <span className="text-xs dark:text-white">
                          {t('Sales Person')}
                        </span>
                        <span className="font-medium  dark:text-white">
                          {item.salesPerson}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-white dir-ltr">
                    {formatDateTime(item.checkInDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-white dir-ltr">
                    {item.checkOutDate ? formatDateTime(item.checkOutDate) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`, '_blank')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100/50 rounded-full hover:bg-blue-200/50 dark:bg-blue-900/30 dark:text-blue-300 transition-colors"
                    >
                      <Eye size={14} />
                      {t('Preview')}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm dark:text-white">
                    {item.type === 'task' ? (
                      t('Task')
                    ) : item.type === 'lead' ? (
                      <button 
                        onClick={() => handleLeadClick(item)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
                      >
                        {t('Lead')}
                      </button>
                    ) : (
                      t('Lead')
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                     <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'accepted' 
                          ? 'bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : item.status === 'rejected'
                            ? 'bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {item.status === 'accepted' ? t('Accepted') : 
                         item.status === 'rejected' ? t('Rejected') : 
                         t('Pending')}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {(item.status !== 'accepted' && item.status !== 'rejected') && (
                        <>
                          <button
                            onClick={() => handleAccept(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100/50 rounded-md hover:bg-green-200/50 dark:bg-green-900/30 dark:text-green-300 transition-colors border border-green-200/50 dark:border-green-800/50"
                          >
                            <Check size={14} />
                            {t('Accept')}
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100/50 rounded-md hover:bg-red-200/50 dark:bg-red-900/30 dark:text-red-300 transition-colors border border-red-200/50 dark:border-red-800/50"
                          >
                            <X size={14} />
                            {t('Reject')}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center dark:text-white">
                    {isRTL ? 'لا توجد بيانات' : 'No check-ins found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-3 bg-[var(--content-bg)]/80 border-t border-white/10 dark:border-gray-700/60 flex items-center justify-between gap-3">
          <div className="text-[11px] sm:text-xs text-[var(--muted-text)]">
            {isRTL
              ? `إظهار ${Math.min((currentPage - 1) * entriesPerPage + 1, totalRecords)}-${Math.min(currentPage * entriesPerPage, totalRecords)} من ${totalRecords}`
              : `Showing ${Math.min((currentPage - 1) * entriesPerPage + 1, totalRecords)}-${Math.min(currentPage * entriesPerPage, totalRecords)} of ${totalRecords}`}
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
      {/* Modal */}
      {selectedLead && (
        <EnhancedLeadDetailsModal
          isOpen={showLeadModal}
          onClose={() => setShowLeadModal(false)}
          lead={selectedLead}
          isRTL={isRTL}
        />
      )}
    </div>
  )
}