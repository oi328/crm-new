import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@shared/context/ThemeProvider'
import ColumnToggle from '../components/ColumnToggle'
import EnhancedLeadDetailsModal from '@shared/components/EnhancedLeadDetailsModal'
import RecycleActionsModal from '../components/RecycleActionsModal'
import LeadHoverTooltip from '../components/LeadHoverTooltip'
import { 
  FaSearch,
  FaDownload,
  FaEye,
  FaUndo,
  FaTrashAlt
} from 'react-icons/fa'
import * as XLSX from 'xlsx'
import { useLocation } from 'react-router-dom'

export function Recycle() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()

  // State for deleted leads
  const [deletedLeads, setDeletedLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [selectedLeads, setSelectedLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  
  // Modal states
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [showActionsModal, setShowActionsModal] = useState(false)
  const [actionsModalPosition, setActionsModalPosition] = useState({ x: 0, y: 0 })
  
  // Tooltip states
  const [showTooltip, setShowTooltip] = useState(false)
  const [hoveredLead, setHoveredLead] = useState(null)
  const [tooltipPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [managerFilter, setManagerFilter] = useState('all')
  const [salesPersonFilter, setSalesPersonFilter] = useState('all')
  const [createdByFilter, setCreatedByFilter] = useState('all')
  const [assignDateFilter, setAssignDateFilter] = useState('')
  const [actionDateFilter, setActionDateFilter] = useState('')
  const [creationDateFilter, setCreationDateFilter] = useState('')
  const [oldStageFilter, setOldStageFilter] = useState('all')
  const [closedDateFilter, setClosedDateFilter] = useState('')
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')
  const [expectedRevenueFilter, setExpectedRevenueFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const [whatsappIntentsFilter, setWhatsappIntentsFilter] = useState('all')
  const [callTypeFilter, setCallTypeFilter] = useState('all')
  const [duplicateStatusFilter, setDuplicateStatusFilter] = useState('all')
  const [deletedDateFilter, setDeletedDateFilter] = useState('')

  // UI states
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [sortBy, setSortBy] = useState('deletedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [pageSearch, setPageSearch] = useState('')
  const [exportFrom, setExportFrom] = useState('')
  const [exportTo, setExportTo] = useState('')

  // Bulk action states
  const [bulkFeedback, setBulkFeedback] = useState(null)
  
  // Mobile sidebar state
  

  const location = useLocation()
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || '')
      const s = params.get('stage')
      if (s) setStageFilter(s)
    } catch (e) { console.warn('Invalid stage param', e) }
  }, [location.search])

  // Column visibility
  const allColumns = {
    lead: t('Lead'),
    contact: t('Contact'),
    source: t('Source'),
    project: t('Project'),
    sales: t('Sales'),
    lastComment: t('Last Comment'),
    stage: t('Stage'),
    expectedRevenue: t('Expected Revenue'),
    priority: t('Priority'),
    status: t('Status'),
    deletedDate: t('Deleted Date'),
    actions: t('Actions')
  }
  const [visibleColumns, setVisibleColumns] = useState({
    lead: true,
    contact: true,
    source: true,
    project: true,
    sales: true,
    lastComment: true,
    stage: true,
    expectedRevenue: true,
    priority: true,
    status: true,
    deletedDate: true,
    actions: true
  })

  // Pipeline stages
  const [stages, setStages] = useState([])

  // Load pipeline stages from Settings
  useEffect(() => {
    const loadStages = () => {
      try {
        const savedStages = localStorage.getItem('crmStages')
        if (savedStages) {
          const parsedStages = JSON.parse(savedStages)
          setStages(parsedStages)
        } else {
          // If no stages in settings, use default stages
          const defaultStages = [
            { name: 'New', nameAr: 'جديد', icon: '🆕', color: '#3B82F6' },
            { name: 'Qualified', nameAr: 'مؤهل', icon: '✅', color: '#10B981' },
            { name: 'In Progress', nameAr: 'قيد التنفيذ', icon: '⏳', color: '#F59E0B' },
            { name: 'Converted', nameAr: 'تم التحويل', icon: '🎉', color: '#8B5CF6' },
            { name: 'Lost', nameAr: 'مفقود', icon: '❌', color: '#EF4444' }
          ]
          setStages(defaultStages)
        }
      } catch (e) {
        console.error('Failed to load stages:', e)
        setStages([])
      }
    }

    loadStages()

    // Listen for storage changes to update stages when modified in Settings
    const handleStorageChange = (e) => {
      if (e.key === 'crmStages') {
        loadStages()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Load deleted leads from localStorage
  useEffect(() => {
    const savedDeletedLeads = localStorage.getItem('deletedLeads')
    if (savedDeletedLeads) {
      setDeletedLeads(JSON.parse(savedDeletedLeads))
    }
  }, [])

  // Filter and sort deleted leads
  useEffect(() => {
    let filtered = [...deletedLeads]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter)
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.source === sourceFilter)
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(lead => lead.priority === priorityFilter)
    }

    // Apply project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(lead => lead.company === projectFilter)
    }

    // Apply stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(lead => lead.stage === stageFilter)
    }

    // Apply manager filter
    if (managerFilter !== 'all') {
      filtered = filtered.filter(lead => lead.assignedTo === managerFilter)
    }

    // Apply sales person filter
    if (salesPersonFilter !== 'all') {
      filtered = filtered.filter(lead => lead.assignedTo === salesPersonFilter)
    }

    // Apply created by filter
    if (createdByFilter !== 'all') {
      filtered = filtered.filter(lead => lead.createdBy === createdByFilter)
    }

    // Apply date filters
    if (deletedDateFilter) {
      filtered = filtered.filter(lead => {
        const deletedDate = new Date(lead.deletedAt).toDateString()
        const filterDate = new Date(deletedDateFilter).toDateString()
        return deletedDate === filterDate
      })
    }

    // Apply email filter
    if (emailFilter) {
      filtered = filtered.filter(lead => 
        lead.email?.toLowerCase().includes(emailFilter.toLowerCase())
      )
    }

    // Apply expected revenue filter
    if (expectedRevenueFilter) {
      filtered = filtered.filter(lead => 
        lead.estimatedValue >= parseFloat(expectedRevenueFilter)
      )
    }

    // Apply campaign filter
    if (campaignFilter !== 'all') {
      filtered = filtered.filter(lead => lead.campaign === campaignFilter)
    }

    // Apply country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter(lead => lead.country === countryFilter)
    }

    // Apply WhatsApp intents filter
    if (whatsappIntentsFilter !== 'all') {
      filtered = filtered.filter(lead => lead.whatsappIntent === whatsappIntentsFilter)
    }

    // Apply call type filter
    if (callTypeFilter !== 'all') {
      filtered = filtered.filter(lead => lead.callType === callTypeFilter)
    }

    // Apply duplicate status filter
    if (duplicateStatusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.duplicateStatus === duplicateStatusFilter)
    }

    // Apply assign date filter
    if (assignDateFilter) {
      filtered = filtered.filter(lead => {
        const assignDate = new Date(lead.assignedAt).toDateString()
        const filterDate = new Date(assignDateFilter).toDateString()
        return assignDate === filterDate
      })
    }

    // Apply action date filter
    if (actionDateFilter) {
      filtered = filtered.filter(lead => {
        const actionDate = new Date(lead.lastActionAt).toDateString()
        const filterDate = new Date(actionDateFilter).toDateString()
        return actionDate === filterDate
      })
    }

    // Apply creation date filter
    if (creationDateFilter) {
      filtered = filtered.filter(lead => {
        const creationDate = new Date(lead.createdAt).toDateString()
        const filterDate = new Date(creationDateFilter).toDateString()
        return creationDate === filterDate
      })
    }

    // Apply old stage filter
    if (oldStageFilter !== 'all') {
      filtered = filtered.filter(lead => lead.oldStage === oldStageFilter)
    }

    // Apply closed date filter
    if (closedDateFilter) {
      filtered = filtered.filter(lead => {
        const closedDate = new Date(lead.closedAt).toDateString()
        const filterDate = new Date(closedDateFilter).toDateString()
        return closedDate === filterDate
      })
    }

    // Sort leads
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'deletedAt') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredLeads(filtered)
    setCurrentPage(1)
  }, [
    deletedLeads, searchTerm, statusFilter, sourceFilter, priorityFilter,
    projectFilter, stageFilter, managerFilter, salesPersonFilter,
    createdByFilter, deletedDateFilter, emailFilter, expectedRevenueFilter,
    campaignFilter, countryFilter, whatsappIntentsFilter, callTypeFilter,
    duplicateStatusFilter, assignDateFilter, actionDateFilter, creationDateFilter,
    oldStageFilter, closedDateFilter, sortBy, sortOrder
  ])

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage)

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'qualified': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'converted': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'lost': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getSourceIcon = (source) => {
    const icons = {
      'website': '🌐',
      'social-media': '📱',
      'referral': '👥',
      'email': '📧',
      'phone': '📞',
      'advertisement': '📢'
    }
    return icons[source] || '📋'
  }

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedLeads.length === paginatedLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(paginatedLeads.map(lead => lead.id))
    }
  }

  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  // Row click handler
  const handleRowClick = (lead, e) => {
    if (e.target.type === 'checkbox') return
    
    // Calculate position for dropdown
    const rect = e.currentTarget.getBoundingClientRect()
    const position = {
      x: rect.left + rect.width / 2 - 160, // Center the dropdown (160 = half of 320px width)
      y: rect.bottom
    }
    
    setSelectedLead(lead)
    setActionsModalPosition(position)
    setShowActionsModal(true)
  }

  // Column toggle handlers
  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }))
  }

  const resetVisibleColumns = () => {
    const all = Object.keys(allColumns).reduce((acc, k) => { acc[k] = true; return acc }, {})
    setVisibleColumns(all)
  }

  // Restore lead function
  const handleRestoreLead = (leadId) => {
    const leadToRestore = deletedLeads.find(lead => lead.id === leadId)
    if (leadToRestore) {
      // Remove deletedAt timestamp
      const { deletedAt, ...restoredLead } = leadToRestore
      
      // Add back to active leads
      const existingLeads = JSON.parse(localStorage.getItem('leads') || '[]')
      existingLeads.push(restoredLead)
      localStorage.setItem('leads', JSON.stringify(existingLeads))
      localStorage.setItem('leadsData', JSON.stringify(existingLeads))
      try { window.dispatchEvent(new CustomEvent('leadsDataUpdated')) } catch {}
      
      // Remove from deleted leads
      const updatedDeletedLeads = deletedLeads.filter(lead => lead.id !== leadId)
      setDeletedLeads(updatedDeletedLeads)
      localStorage.setItem('deletedLeads', JSON.stringify(updatedDeletedLeads))
      
      setBulkFeedback({ key: 'Lead restored successfully', params: {} })
      setTimeout(() => setBulkFeedback(null), 3000)
    }
  }

  // Permanent delete function
  const handlePermanentDelete = (leadId) => {
    if (window.confirm(t('Are you sure you want to permanently delete this lead? This action cannot be undone.'))) {
      const updatedDeletedLeads = deletedLeads.filter(lead => lead.id !== leadId)
      setDeletedLeads(updatedDeletedLeads)
      localStorage.setItem('deletedLeads', JSON.stringify(updatedDeletedLeads))
      
      setBulkFeedback({ key: 'Lead permanently deleted', params: {} })
      setTimeout(() => setBulkFeedback(null), 3000)
    }
  }

  // Bulk restore function
  const handleBulkRestore = () => {
    const leadsToRestore = deletedLeads.filter(lead => selectedLeads.includes(lead.id))
    
    if (leadsToRestore.length > 0) {
      // Add back to active leads
      const existingLeads = JSON.parse(localStorage.getItem('leads') || '[]')
      const restoredLeads = leadsToRestore.map(({ deletedAt, ...lead }) => lead)
      existingLeads.push(...restoredLeads)
      localStorage.setItem('leads', JSON.stringify(existingLeads))
      localStorage.setItem('leadsData', JSON.stringify(existingLeads))
      try { window.dispatchEvent(new CustomEvent('leadsDataUpdated')) } catch {}
      
      // Remove from deleted leads
      const updatedDeletedLeads = deletedLeads.filter(lead => !selectedLeads.includes(lead.id))
      setDeletedLeads(updatedDeletedLeads)
      localStorage.setItem('deletedLeads', JSON.stringify(updatedDeletedLeads))
      
      setSelectedLeads([])
      setBulkFeedback({ key: `${leadsToRestore.length} leads restored successfully`, params: {} })
      setTimeout(() => setBulkFeedback(null), 3000)
    }
  }

  // Bulk permanent delete function
  const handleBulkPermanentDelete = () => {
    if (window.confirm(t('Are you sure you want to permanently delete selected leads? This action cannot be undone.'))) {
      const updatedDeletedLeads = deletedLeads.filter(lead => !selectedLeads.includes(lead.id))
      setDeletedLeads(updatedDeletedLeads)
      localStorage.setItem('deletedLeads', JSON.stringify(updatedDeletedLeads))
      
      const deletedCount = selectedLeads.length
      setSelectedLeads([])
      setBulkFeedback({ key: `${deletedCount} leads permanently deleted`, params: {} })
      setTimeout(() => setBulkFeedback(null), 3000)
    }
  }

  // Export function
  const handleExportRange = () => {
    const fromPage = Math.max(1, parseInt(exportFrom) || 1)
    const toPage = Math.min(totalPages, parseInt(exportTo) || totalPages)
    
    const startIdx = (fromPage - 1) * itemsPerPage
    const endIdx = toPage * itemsPerPage
    const dataToExport = filteredLeads.slice(startIdx, endIdx)
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport.map(lead => ({
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Company: lead.company,
      Source: lead.source,
      Status: lead.status,
      Priority: lead.priority,
      Stage: lead.stage,
      'Expected Revenue': lead.estimatedValue,
      'Assigned To': lead.assignedTo,
      'Deleted Date': new Date(lead.deletedAt).toLocaleDateString(),
      Notes: lead.notes
    })))
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Leads')
    XLSX.writeFile(workbook, `deleted_leads_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Reset filters function
  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setSourceFilter('all')
    setPriorityFilter('all')
    setProjectFilter('all')
    setStageFilter('all')
    setManagerFilter('all')
    setSalesPersonFilter('all')
    setCreatedByFilter('all')
    setAssignDateFilter('')
    setActionDateFilter('')
    setCreationDateFilter('')
    setOldStageFilter('all')
    setClosedDateFilter('')
    setCampaignFilter('all')
    setCountryFilter('all')
    setExpectedRevenueFilter('')
    setEmailFilter('')
    setWhatsappIntentsFilter('all')
    setCallTypeFilter('all')
    setDuplicateStatusFilter('all')
    setDeletedDateFilter('')
  }

  return (
    <div className="p-6 bg-[var(--content-bg)] text-[var(--content-text)] space-y-8 md:space-y-10 lg:space-y-12">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('Recycle Bin')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('Manage deleted leads')} ({filteredLeads.length} {t('leads')})
              </p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                {t('Filter Options')}
              </h3>
              <div className="flex items-center gap-3">
                {/* Show More/Less Button */}
                <button
                  onClick={() => setShowAllFilters(!showAllFilters)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${showAllFilters ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {showAllFilters ? t('Show Less') : t('Show More')}
                </button>
                {/* Reset Button */}
                <button 
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('Reset')}
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="space-y-4">
              {/* First Row - Always Visible (Search + 3 filters) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {t('Search')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('Search leads...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                  />
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('Status')}
                  </label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                  >
                    <option value="all">{t('All Status')}</option>
                    <option value="new">{t('New')}</option>
                    <option value="qualified">{t('Qualified')}</option>
                    <option value="in-progress">{t('In Progress')}</option>
                    <option value="converted">{t('Converted')}</option>
                    <option value="lost">{t('Lost')}</option>
                  </select>
                </div>

                {/* Source Filter */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {t('Source')}
                  </label>
                  <select 
                    value={sourceFilter} 
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                  >
                    <option value="all">{t('All Sources')}</option>
                    <option value="website">{t('Website')}</option>
                    <option value="social-media">{t('Social Media')}</option>
                    <option value="referral">{t('Referrals')}</option>
                    <option value="email-campaign">{t('Email Campaign')}</option>
                    <option value="direct">{t('Direct')}</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('Priority')}
                  </label>
                  <select 
                    value={priorityFilter} 
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                  >
                    <option value="all">{t('All Priority')}</option>
                    <option value="high">{t('High')}</option>
                    <option value="medium">{t('Medium')}</option>
                    <option value="low">{t('Low')}</option>
                  </select>
                </div>
              </div>

              {/* Additional Filters - Conditionally Visible */}
              {showAllFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  {/* Project Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {t('Project')}
                    </label>
                    <select 
                      value={projectFilter} 
                      onChange={(e) => setProjectFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    >
                      <option value="all">{t('All Projects')}</option>
                      <option value="project-a">{t('Project A')}</option>
                      <option value="project-b">{t('Project B')}</option>
                      <option value="project-c">{t('Project C')}</option>
                    </select>
                  </div>

                  {/* Stage Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {t('Stage')}
                    </label>
                    <select 
                      value={stageFilter} 
                      onChange={(e) => setStageFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    >
                      <option value="all">{t('All Stages')}</option>
                      {stages.map((stage) => (
                        <option key={stage.name} value={stage.name}>
                          {stage.icon} {i18n.language === 'ar' ? (stage.nameAr || stage.name) : stage.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Manager Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t('Manager')}
                    </label>
                    <select 
                      value={managerFilter} 
                      onChange={(e) => setManagerFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    >
                      <option value="all">{t('All Managers')}</option>
                      <option value="ibrahim">{t('Ibrahim Ahmed')}</option>
                      <option value="sara">{t('Sara Nour')}</option>
                      <option value="ahmed">{t('Ahmed Ali')}</option>
                    </select>
                  </div>

                  {/* Sales Person Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {t('Sales Person')}
                    </label>
                    <select 
                      value={salesPersonFilter} 
                      onChange={(e) => setSalesPersonFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    >
                      <option value="all">{t('All Sales People')}</option>
                      <option value="إبراهيم أحمد">{t('Ibrahim Ahmed')}</option>
                      <option value="سارة نور">{t('Sara Nour')}</option>
                      <option value="Ahmed Ali">{t('Ahmed Ali')}</option>
                    </select>
                  </div>

                  {/* Created By Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      {t('Created By')}
                    </label>
                    <select 
                      value={createdByFilter} 
                      onChange={(e) => setCreatedByFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    >
                      <option value="all">{t('All Creators')}</option>
                      <option value="system">{t('System')}</option>
                      <option value="admin">{t('Admin')}</option>
                      <option value="user">{t('User')}</option>
                    </select>
                  </div>

                  {/* Deleted Date Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t('Deleted Date')}
                    </label>
                    <input
                      type="date"
                      value={deletedDateFilter}
                      onChange={(e) => setDeletedDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    />
                  </div>

                  {/* Email Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {t('Email')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('Filter by email')}
                      value={emailFilter}
                      onChange={(e) => setEmailFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    />
                  </div>

                  {/* Expected Revenue Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      {t('Expected Revenue')}
                    </label>
                    <input
                      type="number"
                      placeholder={t('Minimum amount')}
                      value={expectedRevenueFilter}
                      onChange={(e) => setExpectedRevenueFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    />
                  </div>

                  {/* Campaign Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                      {t('Campaign')}
                    </label>
                    <select 
                      value={campaignFilter} 
                      onChange={(e) => setCampaignFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    >
                      <option value="all">{t('All Campaigns')}</option>
                      <option value="summer-2024">{t('Summer 2024')}</option>
                      <option value="winter-2024">{t('Winter 2024')}</option>
                      <option value="spring-2025">{t('Spring 2025')}</option>
                    </select>
                  </div>

                  {/* Country Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('Country')}
                    </label>
                    <select 
                      value={countryFilter} 
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    >
                      <option value="all">{t('All Countries')}</option>
                      <option value="saudi-arabia">{t('Saudi Arabia')}</option>
                      <option value="uae">{t('UAE')}</option>
                      <option value="egypt">{t('Egypt')}</option>
                      <option value="jordan">{t('Jordan')}</option>
                    </select>
                  </div>

                  {/* WhatsApp Intents Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {t('WhatsApp Intents')}
                    </label>
                    <select 
                      value={whatsappIntentsFilter} 
                      onChange={(e) => setWhatsappIntentsFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    >
                      <option value="all">{t('All Intents')}</option>
                      <option value="inquiry">{t('Inquiry')}</option>
                      <option value="support">{t('Support')}</option>
                      <option value="purchase">{t('Purchase')}</option>
                    </select>
                  </div>

                  {/* Call Type Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {t('Call Type')}
                    </label>
                    <select 
                      value={callTypeFilter} 
                      onChange={(e) => setCallTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    >
                      <option value="all">{t('All Call Types')}</option>
                      <option value="inbound">{t('Inbound')}</option>
                      <option value="outbound">{t('Outbound')}</option>
                      <option value="follow-up">{t('Follow-up')}</option>
                    </select>
                  </div>

                  {/* Duplicate Status Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {t('Duplicate Status')}
                    </label>
                    <select 
                      value={duplicateStatusFilter} 
                      onChange={(e) => setDuplicateStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    >
                      <option value="all">{t('All Status')}</option>
                      <option value="unique">{t('Unique')}</option>
                      <option value="duplicate">{t('Duplicate')}</option>
                      <option value="potential-duplicate">{t('Potential Duplicate')}</option>
                    </select>
                  </div>

                  {/* Assign Date Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t('Assign Date')}
                    </label>
                    <input
                      type="date"
                      value={assignDateFilter}
                      onChange={(e) => setAssignDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    />
                  </div>

                  {/* Action Date Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {i18n.language === 'ar' ? 'تاريخ الإجراء' : t('Action Date')}
                    </label>
                    <input
                      type="date"
                      value={actionDateFilter}
                      onChange={(e) => setActionDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    />
                  </div>

                  {/* Creation Date Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {t('Creation Date')}
                    </label>
                    <input
                      type="date"
                      value={creationDateFilter}
                      onChange={(e) => setCreationDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    />
                  </div>

                  {/* Old Stage Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('Old Stage')}
                    </label>
                    <select 
                      value={oldStageFilter} 
                      onChange={(e) => setOldStageFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    >
                      <option value="all">{t('All Stages')}</option>
                      {stages.map(stage => (
                        <option key={stage.name} value={stage.name}>
                          {i18n.language === 'ar' ? stage.nameAr : stage.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Closed Date Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t('Closed Date')}
                    </label>
                    <input
                      type="date"
                      value={closedDateFilter}
                      onChange={(e) => setClosedDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Empty spacer under Filter Options */}
          <div className="h-10 md:h-12 lg:h-14"></div>

          {/* Display Options Toggle */}
          <div className="flex justify-between items-center mt-0 mb-4">
            {/* Bulk Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (selectedLeads.length === 0) {
                    alert(t('Please select items to restore'))
                    return
                  }
                  if (window.confirm(t('Are you sure you want to restore the selected leads?'))) {
                    handleBulkRestore()
                  }
                }}
                className="flex items-center gap-3 px-10 py-5 my-6 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-green-500/50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 active:scale-95 border-4 border-green-300 hover:border-green-200 ring-4 ring-green-200/30 hover:ring-green-300/50"
              >
                <FaUndo className="text-xl" />
                {t('Restore All')}
              </button>
              <button
                onClick={() => {
                  if (selectedLeads.length === 0) {
                    alert(t('Please select items to delete'));
                    return;
                  }
                  if (window.confirm(t('Are you sure you want to permanently delete the selected leads? This action cannot be undone.'))) {
                    // Delete selected leads logic
                    setDeletedLeads(prev => prev.filter(lead => !selectedLeads.includes(lead.id)));
                    localStorage.setItem('deletedLeads', JSON.stringify(deletedLeads.filter(lead => !selectedLeads.includes(lead.id))));
                    setSelectedLeads([]);
                  }
                }}
                className="flex items-center gap-3 px-10 py-5 my-6 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-red-500/50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 active:scale-95 border-4 border-red-300 hover:border-red-200 ring-4 ring-red-200/30 hover:ring-red-300/50"
              >
                <FaTrashAlt className="text-xl" />
                {t('Permanent Delete')}
              </button>
            </div>

            {/* Display Options Toggle */}
            <ColumnToggle 
              columns={allColumns}
              visibleColumns={visibleColumns}
              onColumnToggle={handleColumnToggle}
              onResetColumns={resetVisibleColumns}
            />
          </div>

          {/* Stages Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mt-8 mb-0 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t('Deleted Lead Stages')}
              </h3>
              <button
                onClick={() => setStageFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  stageFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t('All Stages')}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => (
                <button
                  key={stage.name}
                  onClick={() => setStageFilter(stage.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                    stageFilter === stage.name
                      ? 'text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm hover:shadow-md'
                  }`}
                  style={stageFilter === stage.name ? { backgroundColor: stage.color || '#3B82F6' } : {}}
                >
                  <span className="text-lg">{stage.icon}</span>
                  <span>{i18n.language === 'ar' ? (stage.nameAr || stage.name) : stage.name}</span>
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                    stageFilter === stage.name
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {filteredLeads.filter(lead => lead.stage === stage.name).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Deleted Leads Table */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="p-4">
                      <div className="flex items-center">
                        <input 
                            id="checkbox-all-search" 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                            onChange={handleSelectAll}
                        />
                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                      </div>
                    </th>
                    {visibleColumns.lead && <th scope="col" className="px-6 py-3">{t('Lead')}</th>}
                    {visibleColumns.contact && <th scope="col" className="px-6 py-3">{t('Contact')}</th>}
                    {visibleColumns.source && <th scope="col" className="px-6 py-3">{t('Source')}</th>}
                    {visibleColumns.project && <th scope="col" className="px-6 py-3">{t('Project')}</th>}
                    {visibleColumns.sales && <th scope="col" className="px-6 py-3">{t('Sales')}</th>}
                    {visibleColumns.lastComment && <th scope="col" className="px-6 py-3">{t('Last Comment')}</th>}
                    {visibleColumns.stage && <th scope="col" className="px-6 py-3">{t('Stage')}</th>}
                    {visibleColumns.expectedRevenue && <th scope="col" className="px-6 py-3">{t('Expected Revenue')}</th>}
                    {visibleColumns.priority && <th scope="col" className="px-6 py-3">{t('Priority')}</th>}
                    {visibleColumns.status && <th scope="col" className="px-6 py-3">{t('Status')}</th>}
                    {visibleColumns.deletedDate && <th scope="col" className="px-6 py-3">{t('Deleted Date')}</th>}
                    {visibleColumns.actions && <th scope="col" className="px-6 py-3">{t('Actions')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={(e) => handleRowClick(lead, e)}
                    >
                      <td className="w-4 p-4">
                        <div className="flex items-center">
                          <input 
                            id={`checkbox-table-search-${lead.id}`}
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => handleSelectLead(lead.id)}
                          />
                          <label htmlFor={`checkbox-table-search-${lead.id}`} className="sr-only">checkbox</label>
                        </div>
                      </td>
                      {visibleColumns.lead && (
                        <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                          <div className="pl-3">
                            <div className="text-base font-semibold">{lead.name}</div>
                          </div>
                        </th>
                      )}
                      {visibleColumns.contact && (
                        <td className="px-6 py-4">
                          <div className="font-normal text-gray-500">{lead.email}</div>
                          <div className="font-normal text-gray-500">{lead.phone}</div>
                        </td>
                      )}
                      {visibleColumns.source && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span>{getSourceIcon(lead.source)}</span>
                            <span className="text-sm">{t(lead.source)}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.project && (
                        <td className="px-6 py-4">{lead.company}</td>
                      )}
                      {visibleColumns.sales && (
                        <td className="px-6 py-4">{lead.assignedTo}</td>
                      )}
                      {visibleColumns.lastComment && (
                        <td className="px-6 py-4">{lead.notes}</td>
                      )}
                      {visibleColumns.stage && (
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.stage)}`}>
                            {t(lead.stage)}
                          </span>
                        </td>
                      )}
                      {visibleColumns.expectedRevenue && (
                        <td className="px-6 py-4">${lead.estimatedValue?.toLocaleString()}</td>
                      )}
                      {visibleColumns.priority && (
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(lead.priority)}`}>
                            {t(lead.priority)}
                          </span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                            {t(lead.status)}
                          </span>
                        </td>
                      )}
                      {visibleColumns.deletedDate && (
                        <td className="px-6 py-4">
                          {new Date(lead.deletedAt).toLocaleDateString()}
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {/* View */}
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedLead(lead); 
                                setShowLeadModal(true); 
                              }}
                              className="text-blue-600 hover:text-blue-900 p-3"
                              title={t('preview')}
                            >
                              <FaEye size={16} />
                            </button>
                            {/* Restore */}
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleRestoreLead(lead.id); 
                              }}
                              className="text-green-600 hover:text-green-900 p-3"
                              title={t('Restore')}
                            >
                              <FaUndo size={16} />
                            </button>
                            {/* Permanent Delete */}
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handlePermanentDelete(lead.id); 
                              }}
                              className="text-red-600 hover:text-red-900 p-3"
                              title={t('Permanent Delete')}
                            >
                              <FaTrashAlt size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {paginatedLeads.length === 0 && (
              <div className="p-6 text-center text-gray-600 dark:text-gray-300">
                {t('No deleted leads found')}
              </div>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-between p-4" aria-label="Table navigation">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {t('Showing')} <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLeads.length)}</span> {t('of')} <span className="font-semibold text-gray-900 dark:text-white">{filteredLeads.length}</span>
                </span>
                <ul className="inline-flex items-center -space-x-px gap-2">
                  <li>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="block px-4 py-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50"
                    >
                      <span className="sr-only">{t('Previous')}</span>
                      <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </button>
                  </li>
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
                    <li key={page}>
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-3 leading-tight ${
                          currentPage === page
                            ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  <li className="flex items-center gap-2 ml-3">
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={pageSearch}
                      onChange={(e) => setPageSearch(e.target.value)}
                      placeholder={t('Search')}
                      className="w-16 px-2 py-1 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-200"
                    />
                    <button
                      onClick={() => {
                        const target = Math.max(1, Math.min(Number(pageSearch) || 1, totalPages));
                        setCurrentPage(target);
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                      <FaSearch className="w-4 h-4" />
                    </button>
                  </li>
                  <li className="flex items-center gap-2 ml-3">
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={exportFrom}
                      onChange={(e) => setExportFrom(e.target.value)}
                      placeholder={t('From')}
                      className="w-20 px-2 py-1 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-200"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('To')}</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={exportTo}
                      onChange={(e) => setExportTo(e.target.value)}
                      placeholder={t('To')}
                      className="w-20 px-2 py-1 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-200"
                    />
                    <button
                      onClick={handleExportRange}
                      className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 border rounded-md dark:bg-blue-500 dark:border-blue-400 flex items-center gap-1"
                    >
                      <FaDownload className="w-4 h-4" />
                      {t('Export Data')}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="block px-4 py-3 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50"
                    >
                      <span className="sr-only">{t('Next')}</span>
                      <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>

      {/* Enhanced Lead Details Modal */}
      {showLeadModal && (
        <EnhancedLeadDetailsModal
          isOpen={showLeadModal}
          onClose={() => {
            setShowLeadModal(false)
            setSelectedLead(null)
          }}
          lead={selectedLead}
          isArabic={i18n.language === 'ar'}
          theme={theme}
        />
      )}

      {/* Recycle Actions Modal */}
      {showActionsModal && (
        <RecycleActionsModal
          isOpen={showActionsModal}
          onClose={() => {
            setShowActionsModal(false)
            setSelectedLead(null)
          }}
          lead={selectedLead}
          position={actionsModalPosition}
          onRestore={handleRestoreLead}
          onPermanentDelete={handlePermanentDelete}
          onView={(lead) => {
            setSelectedLead(lead)
            setShowLeadModal(true)
          }}
          theme={theme}
          isArabic={i18n.language === 'ar'}
        />
      )}

      {/* Hover Tooltip */}
      {showTooltip && hoveredLead && (
        <LeadHoverTooltip
          lead={hoveredLead}
          position={tooltipPosition}
          innerRef={tooltipRef}
          onAction={(action) => {
            setShowTooltip(false)
            setHoveredLead(null)
            
            switch (action) {
              case 'view':
                setSelectedLead(hoveredLead)
                setShowLeadModal(true)
                break
              case 'restore':
                handleRestoreLead(hoveredLead.id)
                break
              case 'delete':
                handlePermanentDelete(hoveredLead.id)
                break
            }
          }}
          isRtl={i18n.language === 'ar'}
        />
      )}
    </div>
  )
 }
 
 export default Recycle
