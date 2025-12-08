import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@shared/context/ThemeProvider'
import { FaPlus, FaSearch, FaFilter, FaDownload, FaEye, FaEdit, FaTrash, FaPhone, FaEnvelope, FaWhatsapp, FaVideo, FaUserPlus } from 'react-icons/fa'
import { api } from '../utils/api'
import LeadModal from '../components/LeadModal'
import EnhancedLeadDetailsModal from '@shared/components/EnhancedLeadDetailsModal'
import ImportLeadsModal from '../components/ImportLeadsModal'
import ColumnToggle from '../components/ColumnToggle'
import LeadHoverTooltip from '../components/LeadHoverTooltip'
import { useStages } from '../hooks/useStages'
import { useNavigate, useLocation } from 'react-router-dom'
 // Import the custom checkbox
import * as XLSX from 'xlsx'

export const Leads = () => {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { stages, statuses } = useStages()
  
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  // New filter states
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
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedLeads, setSelectedLeads] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [pageSearch, setPageSearch] = useState('')
  const [exportFrom, setExportFrom] = useState(1)
  const [exportTo, setExportTo] = useState(1)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [excelFile, setExcelFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSummary, setImportSummary] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [stageDefs, setStageDefs] = useState([])

  const location = useLocation()
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || '')
      const s = params.get('stage')
      if (s) setStageFilter(s)
    } catch (e) {}
  }, [location.search])

  // Hover tooltip state
  const [hoveredLead, setHoveredLead] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef(null)

  // Filter visibility state
  const [showAllFilters, setShowAllFilters] = useState(false)
  const activeRowRef = useRef(null)


  // Generate and add temporary leads for demonstration
  const handleAddTemporaryLeads = (count = 10) => {
    const maxId = leads.reduce((m, l) => Math.max(m, Number(l?.id) || 0), 0)
    const availableStages = (stages && stages.length > 0)
      ? stages.map((s) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
      : ['new', 'qualified', 'in-progress', 'converted', 'lost']
    const availableStatuses = (statuses && statuses.length > 0)
      ? statuses.map((s) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
      : ['new', 'qualified', 'in-progress', 'converted', 'lost']
    const priorities = ['high', 'medium', 'low']
    const sources = ['website', 'social-media', 'referral', 'email-campaign', 'direct']
    const assignees = ['إبراهيم أحمد', 'سارة نور', 'Ahmed Ali']
    const names = ['عميل تجريبي', 'Temporary Lead', 'Test Prospect', 'Lead Demo', 'Prospect Sample']
    const companies = ['شركة مؤقتة', 'Temp Co.', 'Demo LLC', 'Sample Inc.', 'شركة تجريبية']

    const today = new Date()
    const toDateStr = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
}

    const newLeads = Array.from({ length: count }, (_, idx) => {
      const id = maxId + idx + 1
      const stage = String(availableStages[idx % availableStages.length])
      const status = String(availableStatuses[idx % availableStatuses.length])
      const priority = priorities[idx % priorities.length]
      const source = sources[idx % sources.length]
      const assignedTo = assignees[idx % assignees.length]
      const name = `${names[idx % names.length]} ${id}`
      const email = `temp${id}@example.com`
      const phone = `+9665${String(90000000 + id).slice(-8)}`

      const created = new Date(today)
      created.setDate(today.getDate() - (3 + (idx % 10)))
      const last = new Date(today)
      last.setDate(today.getDate() - (1 + (idx % 5)))

      return {
        id,
        name,
        email,
        phone,
        company: companies[idx % companies.length],
        stage,
        status,
        priority,
        source,
        assignedTo,
        createdAt: toDateStr(created),
        lastContact: toDateStr(last),
        notes: 'ليد مؤقتة للاختبار',
        estimatedValue: 10000 + (idx * 750),
        probability: (idx * 11) % 101,
        isTemporary: true,
      }
    })

    setLeads(prev => {
      const updatedLeads = [...newLeads, ...prev];
      // Trigger event to notify Dashboard of data change
      window.dispatchEvent(new CustomEvent('leadsDataUpdated'));
      return updatedLeads;
    });
  }

  // Load pipeline stages with colors from settings
  const defaultIconForName = (name) => {
    const key = (name || '').toLowerCase();
    if (key.includes('convert')) return '✅';
    if (key.includes('progress')) return '⏳';
    if (key.includes('lost')) return '❌';
    if (key.includes('new')) return '🆕';
    if (key.includes('qual')) return '🎯';
    return '📊';
  }
  useEffect(() => {
    const defaultColorForName = (name) => {
      const key = (name || '').toLowerCase();
      if (key.includes('convert')) return '#10b981'; // green-500
      if (key.includes('progress')) return '#f59e0b'; // amber-500
      if (key.includes('lost')) return '#ef4444'; // red-500
      if (key.includes('new')) return '#3b82f6'; // blue-500
      if (key.includes('qual')) return '#8b5cf6'; // violet-500
      return '#3b82f6';
    };
    try {
      const saved = JSON.parse(localStorage.getItem('crmStages') || '[]');
      const normalized = Array.isArray(saved)
        ? (typeof saved[0] === 'string'
            ? saved.map((name) => ({ name, color: defaultColorForName(name), icon: defaultIconForName(name) }))
            : saved.map((s) => ({ name: s.name || String(s), color: s.color || defaultColorForName(s.name || String(s)), icon: s.icon || defaultIconForName(s.name || String(s)) }))
          )
        : [];
      
      // If no stages are saved, use default stages
      if (normalized.length === 0) {
        const defaultStages = [
          { name: 'new', color: '#10b981', icon: '🆕' },
          { name: 'qualified', color: '#3b82f6', icon: '✅' },
          { name: 'in-progress', color: '#f59e0b', icon: '⏳' },
          { name: 'converted', color: '#059669', icon: '🎉' },
          { name: 'lost', color: '#ef4444', icon: '❌' }
        ];
        setStageDefs(defaultStages);
      } else {
        setStageDefs(normalized);
      }
    } catch (e) {
      // If there's an error, use default stages
      const defaultStages = [
        { name: 'new', color: '#10b981', icon: '🆕' },
        { name: 'qualified', color: '#3b82f6', icon: '✅' },
        { name: 'in-progress', color: '#f59e0b', icon: '⏳' },
        { name: 'converted', color: '#059669', icon: '🎉' },
        { name: 'lost', color: '#ef4444', icon: '❌' }
      ];
      setStageDefs(defaultStages);
    }
  }, [])



  // Color style presets for stage cards
  const COLOR_STYLES = {
    blue: {
      container: 'border-blue-400 dark:border-blue-500 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 shadow-blue-300/50 dark:shadow-blue-500/25',
      patternFrom: 'from-blue-200',
      patternTo: 'to-blue-300',
      iconBg: 'bg-blue-600 dark:bg-blue-500',
    },
    green: {
      container: 'border-green-400 dark:border-green-500 bg-gradient-to-br from-green-100 via-green-200 to-green-300 dark:from-green-800 dark:via-green-700 dark:to-green-600 shadow-green-300/50 dark:shadow-green-500/25',
      patternFrom: 'from-green-200',
      patternTo: 'to-green-300',
      iconBg: 'bg-green-600 dark:bg-green-500',
    },
    yellow: {
      container: 'border-yellow-400 dark:border-yellow-500 bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 dark:from-yellow-800 dark:via-yellow-700 dark:to-yellow-600 shadow-yellow-300/50 dark:shadow-yellow-500/25',
      patternFrom: 'from-yellow-200',
      patternTo: 'to-yellow-300',
      iconBg: 'bg-yellow-600 dark:bg-yellow-500',
    },
    red: {
      container: 'border-red-400 dark:border-red-500 bg-gradient-to-br from-red-100 via-red-200 to-red-300 dark:from-red-800 dark:via-red-700 dark:to-red-600 shadow-red-300/50 dark:shadow-red-500/25',
      patternFrom: 'from-red-200',
      patternTo: 'to-red-300',
      iconBg: 'bg-red-600 dark:bg-red-500',
    },
    purple: {
      container: 'border-purple-400 dark:border-purple-500 bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 dark:from-purple-800 dark:via-purple-700 dark:to-purple-600 shadow-purple-300/50 dark:shadow-purple-500/25',
      patternFrom: 'from-purple-200',
      patternTo: 'to-purple-300',
      iconBg: 'bg-purple-600 dark:bg-purple-500',
    },
  }

  // Helpers to support custom hex colors from Settings
  const isHexColor = (c) => typeof c === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)
  const hexToRgb = (hex) => {
    try {
      let h = String(hex || '').replace('#', '')
      if (h.length === 3) h = h.split('').map(x => x + x).join('')
      const num = parseInt(h, 16)
      const r = (num >> 16) & 255
      const g = (num >> 8) & 255
      const b = num & 255
      return { r, g, b }
    } catch (e) { return { r: 0, g: 0, b: 0 } }
  }
  const withAlpha = (hex, alpha) => {
    const { r, g, b } = hexToRgb(hex)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Columns visibility state (ordered to match requested design)
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
    actions: t('Actions')
  }

  // ===== Excel Import Helpers =====
  const normalizeKey = (key) => key?.toString()?.toLowerCase()?.trim()?.replace(/\s+/g, '')
  const headerMap = {
    name: ['name', 'الاسم', 'اسم العميل', 'lead', 'lead name'],
    email: ['email', 'البريد', 'البريد الإلكتروني'],
    phone: ['phone', 'الهاتف', 'رقم الهاتف', 'contact'],
    company: ['company', 'الشركة'],
    status: ['status', 'الحالة'],
    priority: ['priority', 'الأولوية'],
    source: ['source', 'المصدر'],
    assignedTo: ['assignedto', 'assigned', 'المسؤول', 'المسند إليه', 'salesperson'],
    createdAt: ['createdat', 'تاريخ الإنشاء', 'created'],
    lastContact: ['lastcontact', 'آخر اتصال'],
    estimatedValue: ['estimatedvalue', 'القيمة التقديرية', 'value'],
    probability: ['probability', 'الاحتمالية'],
    notes: ['notes', 'ملاحظات']
  }

  const findValue = (row, keys) => {
    const rowKeys = Object.keys(row || {})
    for (const rk of rowKeys) {
      const nk = normalizeKey(rk)
      for (const k of keys) {
        if (nk === normalizeKey(k)) {
          return row[rk]
        }
      }
    }
    return ''
  }

  const parseExcelToLeads = async (file) => {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
    const nowDateStr = new Date().toISOString().slice(0, 10)
    const parsed = rows.map((row) => ({
      id: Date.now() + Math.random(),
      name: String(findValue(row, headerMap.name) || '').trim(),
      email: String(findValue(row, headerMap.email) || '').trim(),
      phone: String(findValue(row, headerMap.phone) || '').trim(),
      company: String(findValue(row, headerMap.company) || '').trim(),
      status: String(findValue(row, headerMap.status) || 'new').toLowerCase().trim(),
      priority: String(findValue(row, headerMap.priority) || 'medium').toLowerCase().trim(),
      source: String(findValue(row, headerMap.source) || 'import').trim(),
      assignedTo: String(findValue(row, headerMap.assignedTo) || '').trim(),
      createdAt: String(findValue(row, headerMap.createdAt) || nowDateStr).trim(),
      lastContact: String(findValue(row, headerMap.lastContact) || nowDateStr).trim(),
      estimatedValue: Number(findValue(row, headerMap.estimatedValue)) || 0,
      probability: Number(findValue(row, headerMap.probability)) || 0,
      notes: String(findValue(row, headerMap.notes) || '').trim(),
    }))
    return parsed
  }

  const handleExcelUpload = async () => {
    if (!excelFile) {
      setImportError('import.selectFileError')
      return
    }
    setImporting(true)
    setImportError(null)
    setImportSummary(null)
    try {
      const newLeads = await parseExcelToLeads(excelFile)
      // محاولة حفظ في الـ API إن وُجدت
      try {
        await fetch('/api/leads/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leads: newLeads })
        })
      } catch (apiErr) {
        console.warn('API import endpoint not reachable, adding locally only.', apiErr?.message)
      }
      setLeads((prev) => [...newLeads, ...prev])
      setExcelFile(null)
      setImportSummary({ added: newLeads.length })
    } catch (err) {
      console.error(err)
      setImportError('import.readFileError')
    } finally {
      setImporting(false)
    }
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
    actions: true
  })

  const handleColumnToggle = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const resetVisibleColumns = () => {
    const all = Object.keys(allColumns).reduce((acc, k) => { acc[k] = true; return acc }, {})
    setVisibleColumns(all)
  }

  // Sample leads data
  const sampleLeads = Array.from({ length: 30 }, (_, idx) => {
    const id = idx + 1
    const statuses = ['new', 'in-progress', 'qualified', 'converted', 'lost']
    const priorities = ['high', 'medium', 'low']
    const sources = ['website', 'social-media', 'referral', 'email-campaign', 'direct']
    const assignees = ['إبراهيم أحمد', 'سارة نور', 'Ahmed Ali']
    const names = ['أحمد محمد', 'سارة Johnson', 'محمد علي', 'Emma Wilson', 'خالد عبدالله']
    const companies = ['شركة التقنية', 'ABC Corporation', 'مؤسسة الأعمال', 'Tech Solutions', 'مؤسسة المشاريع']

    const status = statuses[idx % statuses.length]
    const priority = priorities[idx % priorities.length]
    const source = sources[idx % sources.length]
    const assignedTo = assignees[idx % assignees.length]
    const name = `${names[idx % names.length]} ${id}`
    const email = `lead${id}@example.com`
    const phone = `+9665${String(12345670 + id).slice(-8)}`
    const createdAt = `2024-01-${String(1 + (idx % 28)).padStart(2, '0')}`
    const lastContact = `2024-01-${String(1 + ((idx + 3) % 28)).padStart(2, '0')}`
    const notes = 'ملاحظة تجريبية'
    const estimatedValue = 50000 + (idx * 1000)
    const probability = (idx * 7) % 101

    return {
      id,
      name,
      email,
      phone,
      company: companies[idx % companies.length],
      stage: status,
      status,
      priority,
      source,
      assignedTo,
      createdAt,
      lastContact,
      notes,
      estimatedValue,
      probability
    }
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('leadsData')
      if (saved) {
        const parsed = JSON.parse(saved)
        setLeads(parsed)
        setFilteredLeads(parsed)
        // Trigger event to notify Dashboard of data load
        window.dispatchEvent(new CustomEvent('leadsDataUpdated'));
      } else {
        setLeads(sampleLeads)
        setFilteredLeads(sampleLeads)
        localStorage.setItem('leadsData', JSON.stringify(sampleLeads))
        // Trigger event to notify Dashboard of data load
        window.dispatchEvent(new CustomEvent('leadsDataUpdated'));
      }
    } catch (err) {
      console.warn('Failed to load leadsData from localStorage, using sample.', err?.message)
      setLeads(sampleLeads)
      setFilteredLeads(sampleLeads)
      // Trigger event to notify Dashboard of data load
      window.dispatchEvent(new CustomEvent('leadsDataUpdated'));
    }
  }, [])

  // Sync leads when localStorage is updated (avoid loops)
  useEffect(() => {
    const syncLeadsFromStorage = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('leadsData') || '[]')
        setLeads(saved)
      } catch (e) {
        console.warn('Failed to sync leadsData from localStorage.', e?.message)
      }
    }

    const handleStorage = (e) => {
      if (e.key === 'leadsData') {
        syncLeadsFromStorage()
      }
    }
    window.addEventListener('storage', handleStorage)

    // Initial sync attempt (in case data changed before mount)
    syncLeadsFromStorage()

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // Persist leads to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('leadsData', JSON.stringify(leads))
      // Trigger event to notify Dashboard of data change
      window.dispatchEvent(new CustomEvent('leadsDataUpdated'));
    } catch (err) {
      console.warn('Failed to save leadsData to localStorage.', err?.message)
    }
  }, [leads])

  useEffect(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.company.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter
      
      // New filter conditions
      const matchesProject = projectFilter === 'all' || lead.project === projectFilter
      const matchesStage = stageFilter === 'all' || lead.stage === stageFilter
      const matchesManager = managerFilter === 'all' || lead.manager === managerFilter
      const matchesSalesPerson = salesPersonFilter === 'all' || lead.assignedTo === salesPersonFilter
      const matchesCreatedBy = createdByFilter === 'all' || lead.createdBy === createdByFilter
      const matchesOldStage = oldStageFilter === 'all' || lead.oldStage === oldStageFilter
      const matchesCampaign = campaignFilter === 'all' || lead.campaign === campaignFilter
      const matchesCountry = countryFilter === 'all' || lead.country === countryFilter
      const matchesWhatsappIntents = whatsappIntentsFilter === 'all' || lead.whatsappIntents === whatsappIntentsFilter
      const matchesCallType = callTypeFilter === 'all' || lead.callType === callTypeFilter
      const matchesDuplicateStatus = duplicateStatusFilter === 'all' || lead.duplicateStatus === duplicateStatusFilter
      
      // Date filters
      const matchesAssignDate = !assignDateFilter || (lead.assignDate && lead.assignDate.includes(assignDateFilter))
      const matchesActionDate = !actionDateFilter || (lead.actionDate && lead.actionDate.includes(actionDateFilter))
      const matchesCreationDate = !creationDateFilter || (lead.createdAt && lead.createdAt.includes(creationDateFilter))
      const matchesClosedDate = !closedDateFilter || (lead.closedDate && lead.closedDate.includes(closedDateFilter))
      
      // Text filters
      const matchesEmail = !emailFilter || (lead.email && lead.email.toLowerCase().includes(emailFilter.toLowerCase()))
      const matchesExpectedRevenue = !expectedRevenueFilter || (lead.expectedRevenue && lead.expectedRevenue.toString().includes(expectedRevenueFilter))
      
      return matchesSearch && matchesStatus && matchesSource && matchesPriority &&
             matchesProject && matchesStage && matchesManager && matchesSalesPerson &&
             matchesCreatedBy && matchesOldStage && matchesCampaign && matchesCountry &&
             matchesWhatsappIntents && matchesCallType && matchesDuplicateStatus &&
             matchesAssignDate && matchesActionDate && matchesCreationDate && matchesClosedDate &&
             matchesEmail && matchesExpectedRevenue
    })

    // Sort leads
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'createdAt' || sortBy === 'lastContact') {
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
  }, [leads, searchTerm, statusFilter, sourceFilter, priorityFilter, sortBy, sortOrder,
      projectFilter, stageFilter, managerFilter, salesPersonFilter, createdByFilter,
      assignDateFilter, actionDateFilter, creationDateFilter, oldStageFilter, closedDateFilter,
      campaignFilter, countryFilter, expectedRevenueFilter, emailFilter, whatsappIntentsFilter,
      callTypeFilter, duplicateStatusFilter])

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'qualified': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'converted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getSourceIcon = (source) => {
    switch (source) {
      case 'Facebook': return '📱'
      case 'Website': return '🌐'
      case 'Referral': return '👥'
      case 'Campaign': return '📧'
      case 'website': return '🌐'
      case 'social-media': return '📱'
      case 'referral': return '👥'
      case 'email-campaign': return '📧'
      case 'direct': return '🏢'
      default: return '📋'
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(paginatedLeads.map(lead => lead.id))
    } else {
      setSelectedLeads([])
    }
  }

  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  // Click-based tooltip: show on row click
  const handleRowClick = (lead, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    activeRowRef.current = event.currentTarget
    setHoveredLead(lead)
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
    setShowTooltip(true)
  }

  // Click-away to hide tooltip when clicking any other element
  useEffect(() => {
    const handleDocumentMouseDown = (e) => {
      if (!showTooltip) return
      // If clicking inside tooltip, ignore
      if (tooltipRef.current && tooltipRef.current.contains(e.target)) return
      // If clicking the active row, ignore (we handle showing via row click)
      if (activeRowRef.current && activeRowRef.current.contains(e.target)) return
      // Otherwise hide
      setShowTooltip(false)
      setHoveredLead(null)
      activeRowRef.current = null
    }
    document.addEventListener('mousedown', handleDocumentMouseDown)
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown)
  }, [showTooltip])

  const [bulkAssignTo, setBulkAssignTo] = useState('')
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkFeedback, setBulkFeedback] = useState(null)

  // Rotation rules: guard bulk assignment using settings (working hours, allow/delay)
  const { canAssignNow } = (() => {
    try {
      // Lazy import to avoid bundling cycles
      const mod = require('../utils/rotation')
      return { canAssignNow: mod.canAssignNow }
    } catch {
      return { canAssignNow: () => ({ ok: true }) }
    }
  })()

  const applyBulkAssign = () => {
    const target = bulkAssignTo?.trim()
    if (!target) {
      setBulkFeedback({ key: 'bulk.selectAssigneeError' })
      return
    }
    const guard = canAssignNow(new Date())
    if (!guard.ok) {
      setBulkFeedback({ key: 'bulk.assignBlocked', params: { reason: guard.reason } })
      return
    }
    setLeads(prev => prev.map(l => (
      selectedLeads.includes(l.id) ? { ...l, assignedTo: target } : l
    )))
    setBulkFeedback({ key: 'bulk.assignSuccess', params: { count: selectedLeads.length, target } })
    setSelectedLeads([])
    setBulkAssignTo('')
  }

  const applyBulkStatus = () => {
    const status = bulkStatus?.trim()
    if (!status) {
      setBulkFeedback({ key: 'bulk.selectStatusError' })
      return
    }
    setLeads(prev => prev.map(l => (
      selectedLeads.includes(l.id) ? { ...l, status } : l
    )))
    setBulkFeedback({ key: 'bulk.statusUpdateSuccess', params: { count: selectedLeads.length, status } })
    setSelectedLeads([])
    setBulkStatus('')
  }

  const applyBulkDelete = () => {
    // Get leads to delete
    const leadsToDelete = leads.filter(l => selectedLeads.includes(l.id))
    
    // Add deletion timestamp to each lead
    const deletedLeads = leadsToDelete.map(lead => ({
      ...lead,
      deletedAt: new Date().toISOString()
    }))
    
    // Save to deleted leads in localStorage
    const existingDeletedLeads = JSON.parse(localStorage.getItem('deletedLeads') || '[]')
    existingDeletedLeads.push(...deletedLeads)
    localStorage.setItem('deletedLeads', JSON.stringify(existingDeletedLeads))
    
    setLeads(prev => prev.filter(l => !selectedLeads.includes(l.id)))
    setBulkFeedback({ key: 'bulk.deleteSuccess', params: { count: selectedLeads.length } })
    setSelectedLeads([])
  }

  // Bulk Convert selected leads to Customers
  const applyBulkConvert = async () => {
    const leadsToConvert = leads.filter(l => selectedLeads.includes(l.id))
    if (leadsToConvert.length === 0) return

    const validLeads = []
    const invalidLeads = []
    for (const lead of leadsToConvert) {
      const name = String(lead?.name || lead?.company || '').trim()
      const phone = String(lead?.phone || '').trim()
      if (!name || !phone || phone.length < 5) {
        invalidLeads.push(lead)
        continue
      }
      const tagsArr = Array.isArray(lead?.tags)
        ? lead.tags
        : (lead?.tags ? String(lead.tags).split(',').map(s => s.trim()).filter(Boolean) : (lead?.source ? [String(lead.source)] : []))

      const payload = {
        name,
        phone,
        email: String(lead?.email || '').trim(),
        type: String(lead?.type || (lead?.company ? 'Company' : 'Individual')),
        companyName: lead?.company || '',
        country: String(lead?.country || '').trim(),
        city: String(lead?.city || '').trim(),
        addressLine: String(lead?.address || '').trim(),
        contacts: lead?.company ? [{
          name: String(lead?.name || '').trim(),
          phone: String(lead?.phone || '').trim(),
          email: String(lead?.email || '').trim(),
        }] : [],
        tags: tagsArr,
        notes: String(lead?.notes || '').trim(),
        assignedSalesRep: String(lead?.sales || lead?.assignedTo || '').trim(),
      }
      validLeads.push(payload)
    }

    try {
      await Promise.all(validLeads.map(p => api.post('/api/customers', p)))
      setBulkFeedback({ key: 'bulk.convertSuccess', params: { success: validLeads.length, failed: invalidLeads.length } })
      setSelectedLeads([])
    } catch (e) {
      console.error('bulk convert failed', e)
      setBulkFeedback({ key: 'bulk.convertError' })
    }
  }

  // Delete single lead (ظهر فقط إذا كان الصف مُحدد)
  const handleDeleteLead = (leadId) => {
    const leadToDelete = leads.find(l => l.id === leadId)
    if (leadToDelete) {
      // Add deletion timestamp
      const deletedLead = {
        ...leadToDelete,
        deletedAt: new Date().toISOString()
      }
      
      // Save to deleted leads in localStorage
      const existingDeletedLeads = JSON.parse(localStorage.getItem('deletedLeads') || '[]')
      existingDeletedLeads.push(deletedLead)
      localStorage.setItem('deletedLeads', JSON.stringify(existingDeletedLeads))
    }
    
    setLeads(prev => prev.filter(l => l.id !== leadId))
    setSelectedLeads(prev => prev.filter(id => id !== leadId))
  }

  // Convert Lead -> Customer (إضافة إلى جدول العملاء)
  const handleConvertCustomer = async (lead) => {
    try {
      const name = String(lead?.name || lead?.company || '').trim()
      const phone = String(lead?.phone || '').trim()
      if (!name || !phone || phone.length < 5) {
        alert(i18n.language === 'ar' ? 'لا يمكن التحويل: الاسم/الهاتف مفقود' : t('Cannot convert: missing name/phone'))
        return
      }

      const tagsArr = Array.isArray(lead?.tags)
        ? lead.tags
        : (lead?.tags ? String(lead.tags).split(',').map(s => s.trim()).filter(Boolean) : (lead?.source ? [String(lead.source)] : []))

      const payload = {
        name,
        phone,
        email: String(lead?.email || '').trim(),
        type: String(lead?.type || (lead?.company ? 'Company' : 'Individual')),
        companyName: lead?.company || '',
        country: String(lead?.country || '').trim(),
        city: String(lead?.city || '').trim(),
        addressLine: String(lead?.address || '').trim(),
        contacts: lead?.company ? [{
          name: String(lead?.name || '').trim(),
          phone: String(lead?.phone || '').trim(),
          email: String(lead?.email || '').trim(),
        }] : [],
        tags: tagsArr,
        notes: String(lead?.notes || '').trim(),
        assignedSalesRep: String(lead?.sales || lead?.assignedTo || '').trim(),
      }

      await api.post('/api/customers', payload)
      alert(i18n.language === 'ar' ? 'تم تحويل الليد إلى عميل بنجاح' : t('Lead converted to customer successfully'))
    } catch (err) {
      console.error('convert customer failed', err)
      alert(i18n.language === 'ar' ? 'فشل التحويل إلى عميل' : t('Failed to convert to customer'))
    }
  }

  // Pagination
  const totalPages = 1000
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage)

  const handleExportRange = () => {
    const actualTotal = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage))
    const from = Math.max(1, Math.min(Number(exportFrom) || currentPage, actualTotal))
    const to = Math.max(from, Math.min(Number(exportTo) || from, actualTotal))

    const startIdx = (from - 1) * itemsPerPage
    const endIdx = Math.min(to * itemsPerPage, filteredLeads.length)
    const rangeLeads = filteredLeads.slice(startIdx, endIdx)

    const rows = rangeLeads.map(l => ({
      'Name': l.name,
      'Email': l.email,
      'Phone': l.phone,
      'Company': l.company,
      'Status': t(l.status),
      'Priority': t(l.priority),
      'Source': t(l.source),
      'Assigned To': l.assignedTo,
      'Created At': new Date(l.createdAt).toLocaleDateString(),
      'Last Contact': new Date(l.lastContact).toLocaleDateString(),
      'Estimated Value': l.estimatedValue
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Leads')
    const filename = `leads_pages_${from}-${to}.xlsx`
    XLSX.writeFile(wb, filename)
  }
  

  return (
    <div className={`p-6 bg-[var(--content-bg)] text-[var(--content-text)] space-y-8 md:space-y-10 lg:space-y-12`}>
          {/* Page Title and Add Button */}
          <div className="flex w-full items-center justify-between gap-6 mb-4 lg:gap-0">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{t('Lead Management')}</h1>
            </div>
            
            {/* Toolbar: Add + Import */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 flex-nowrap justify-end">
                <button
                  onClick={() => navigate('/leads/new')}
                  className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 hover:from-emerald-400 hover:via-green-500 hover:to-emerald-700 text-white border-2 border-emerald-300/30 shadow-[0_8px_30px_rgb(34,197,94,0.3)] hover:shadow-[0_20px_40px_rgb(34,197,94,0.6)] transition-all duration-300 ease-out hover:brightness-125 hover:scale-110 hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/50 hover:ring-4 hover:ring-emerald-300/70 active:scale-95 active:translate-y-0 overflow-hidden"
                >
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.5)_50%,transparent_70%)] animate-pulse"></span>
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full group-hover:duration-700"></span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                  </svg>
                  <span>{t('Add New Lead')}</span>
                </button>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 hover:from-indigo-400 hover:via-blue-500 hover:to-indigo-700 text-white border-2 border-blue-300/30 shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:shadow-[0_20px_40px_rgb(59,130,246,0.6)] transition-all duration-300 ease-out hover:brightness-125 hover:scale-110 hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/50 hover:ring-4 hover:ring-blue-300/70 active:scale-95 active:translate-y-0 overflow-hidden"
                >
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.5)_50%,transparent_70%)] animate-pulse"></span>
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full group-hover:duration-700"></span>
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v12" />
                    <path d="M8 11l4 4 4-4" />
                    <path d="M4 20h16" />
                  </svg>
                  <span>{t('Import Leads')}</span>
                </button>

                <button
                  onClick={() => handleAddTemporaryLeads(15)}
                  className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600 hover:from-amber-400 hover:via-orange-500 hover:to-amber-700 text-white border-2 border-orange-300/30 shadow-[0_8px_30px_rgb(245,158,11,0.3)] hover:shadow-[0_20px_40px_rgb(245,158,11,0.6)] transition-all duration-300 ease-out hover:brightness-125 hover:scale-110 hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/50 hover:ring-4 hover:ring-orange-300/70 active:scale-95 active:translate-y-0 overflow-hidden"
                >
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.5)_50%,transparent_70%)] animate-pulse"></span>
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full group-hover:duration-700"></span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{t('Add Demo Leads')}</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Filter Section - Same style as Dashboard */}
          <section className="p-4 rounded-xl shadow-lg glass-panel w-full mb-8">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-primary">
                  {t('Filter Options')}
                </h3>
              </div>
              {/* Buttons Container */}
              <div className="flex items-center gap-3">
                {/* Show More/Less Button */}
                <button
                  onClick={() => setShowAllFilters(!showAllFilters)}
                  className="btn btn-primary"
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
                <button className="btn btn-ghost">
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
                  {statuses.map((status) => (
                    <option key={status.name} value={status.name}>
                      {status.icon} {i18n.language === 'ar' && status.nameAr ? status.nameAr : status.name}
                    </option>
                  ))}
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

              {/* Assign Date Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('Old Stage')}
                </label>
                <select 
                  value={oldStageFilter} 
                  onChange={(e) => setOldStageFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                >
                  <option value="all">{t('All Old Stages')}</option>
                  {stages.map((stage) => (
                    <option key={stage.name} value={stage.name}>
                      {stage.icon} {i18n.language === 'ar' ? (stage.nameAr || stage.name) : stage.name}
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
                  placeholder={t('Min amount...')}
                  value={expectedRevenueFilter}
                  onChange={(e) => setExpectedRevenueFilter(e.target.value)}
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
                  placeholder={t('Search by email...')}
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                />
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
              </div>
            )}
            </div>
          </section>

          <div className="h-10 md:h-12 lg:h-14" aria-hidden="true" />

          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <div className="glass-panel rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">
                  {t('Bulk Actions')} ({selectedLeads.length} {t('selected')})
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={applyBulkDelete}
                    className="btn btn-danger"
                  >
                    <FaTrash />
                    {t('Delete')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bulk Status Update */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label htmlFor="bulk-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Update Status')}</label>
                  <div className="flex items-center gap-3">
                    <select
                      id="bulk-status"
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className="flex-grow bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm p-2.5"
                    >
                      <option value="">{t('Select Status')}</option>
                      <option value="new">{t('New')}</option>
                      <option value="qualified">{t('Qualified')}</option>
                      <option value="in-progress">{t('In Progress')}</option>
                      <option value="converted">{t('Converted')}</option>
                      <option value="lost">{t('Lost')}</option>
                    </select>
                    <button
                      onClick={applyBulkStatus}
                      className="btn btn-primary"
                    >
                      {t('Apply Status')}
                    </button>
                  </div>
                </div>

                {/* Assign Owner */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label htmlFor="bulk-assign" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Assign Owner')}</label>
                  <div className="flex items-center gap-3">
                    <select
                      id="bulk-assign"
                      value={bulkAssignTo}
                      onChange={(e) => setBulkAssignTo(e.target.value)}
                      className="flex-grow bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5"
                    >
                      <option value="">{t('Select Owner')}</option>
                      {Array.from(new Set(leads.map(l => l.assignedTo).filter(Boolean))).map(owner => (
                        <option key={owner} value={owner}>{owner}</option>
                      ))}
                    </select>
                    <button
                      onClick={applyBulkAssign}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                      {t('Assign')}
                    </button>
                  </div>
                </div>

                {/* Bulk Convert to Customers */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Convert Selected to Customers')}</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={applyBulkConvert}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                      {t('Convert')}
                    </button>
                    {selectedLeads.length > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('Selected')}: {selectedLeads.length}</span>
                    )}
                  </div>
                </div>
              </div>

              {bulkFeedback && (
                <div className={`mt-4 px-4 py-3 rounded-lg ${bulkFeedback.key.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'}`}>
                  {t(bulkFeedback.key, bulkFeedback.params)}
                </div>
              )}
            </div>
          )}

          

          {/* Display Options Toggle - under Lead Statistics and above Leads Table */}
          <div className="flex justify-end mt-6 mb-4">
            <ColumnToggle 
              columns={allColumns}
              visibleColumns={visibleColumns}
              onColumnToggle={handleColumnToggle}
              onResetColumns={resetVisibleColumns}
            />
          </div>

          {/* Stages Bar */}
          <div className="glass-panel rounded-xl shadow-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a 2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t('Lead Stages')}
              </h3>
              <button
                onClick={() => setStageFilter('all')}
                className={`btn ${stageFilter === 'all' ? 'btn-primary' : ''}`}
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
                      : 'bg-[var(--panel-bg)] text-[var(--app-text)] border border-[var(--panel-border)] hover:border-[var(--panel-border)] shadow-sm hover:shadow-md'
                  }`}
                  style={stageFilter === stage.name ? { backgroundColor: stage.color || '#3B82F6' } : {}}
                >
                  <span className="text-lg">{stage.icon}</span>
                  <span>{i18n.language === 'ar' ? (stage.nameAr || stage.name) : stage.name}</span>
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                    stageFilter === stage.name
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--panel-bg)] text-[var(--muted-text)] border border-[var(--panel-border)]'
                  }`}>
                    {filteredLeads.filter(lead => lead.stage === stage.name).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Leads Table - Modern Design */}
          <div className="glass-panel rounded-2xl shadow-xl overflow-hidden">
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
                        <td className="px-6 py-4">${lead.estimatedValue.toLocaleString()}</td>
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
                      {visibleColumns.actions && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {/* Seen */}
                            <button
                              onClick={() => { setSelectedLead(lead); setShowLeadModal(true); }}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title={t('preview')}
                            >
                              <FaEye size={16} />
                            </button>
                            {/* Call */}
                            <button
                              onClick={() => console.log('Call lead:', lead?.phone)}
                              className="text-purple-600 hover:text-purple-900 p-1"
                              title="Call"
                            >
                              <FaPhone size={16} />
                            </button>
                            {/* WhatsApp */}
                            <button
                              onClick={() => console.log('WhatsApp lead:', lead?.phone)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="WhatsApp"
                            >
                              <FaWhatsapp size={16} />
                            </button>
                            {/* Email */}
                            <button
                              onClick={() => console.log('Email lead:', lead?.email)}
                              className="text-gray-600 hover:text-gray-900 p-1"
                              title="Email"
                            >
                              <FaEnvelope size={16} />
                            </button>
                          {/* Google Meet */}
                          <button
                            onClick={() => console.log('Google Meet lead:', lead?.email)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Google Meet"
                          >
                            <FaVideo size={16} />
                          </button>
                          {/* Convert to Customer */}
                          <button
                            onClick={() => handleConvertCustomer(lead)}
                            className="text-teal-600 hover:text-teal-900 p-1"
                            title={t('Convert Customer')}
                          >
                            <FaUserPlus size={16} />
                          </button>
                          {/* Delete (show only if selected) */}
                          {selectedLeads.includes(lead.id) && (
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title={t('Delete')}
                            >
                              <FaTrash size={16} />
                            </button>
                          )}
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
                {t('empty.noMoreCustomers')}
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
                      className="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50"
                    >
                      <span className="sr-only">{t('Previous')}</span>
                      <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </button>
                  </li>
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
                    <li key={page}>
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 leading-tight ${
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
                      className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 border rounded-md dark:bg-gray-700 dark:border-gray-600"
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
                      className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 border rounded-md dark:bg-blue-500 dark:border-blue-400 flex items-center gap-1"
                    >
                      <FaDownload className="w-4 h-4" />
                      {t('Export Data')}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50"
                    >
                      <span className="sr-only">{t('Next')}</span>
                      <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
          {/* Import Modal Mount */}
          {showImportModal && (
            <ImportLeadsModal
              isOpen={showImportModal}
              onClose={() => setShowImportModal(false)}
              excelFile={excelFile}
              setExcelFile={setExcelFile}
              importing={importing}
              importError={importError}
              importSummary={importSummary}
              onImport={handleExcelUpload}
            />
          )}
       

       {/* Floating Add New Lead Button for Mobile */}
       <button 
         onClick={() => navigate('/leads/new')}
         className="fixed bottom-10 right-6 z-50 md:hidden p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
         aria-label={t('Add New Lead')}
       >
         <FaPlus className="w-6 h-6" />
       <span className="sr-only">{t('Add New Lead')}</span>
      </button>


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
              case 'call':
                window.open(`tel:${hoveredLead.phone}`)
                break
              case 'whatsapp':
                window.open(`https://wa.me/${hoveredLead.phone.replace(/[^0-9]/g, '')}`)
                break
              case 'email':
                window.open(`mailto:${hoveredLead.email}`)
                break
              case 'video':
                // Handle video call action
                console.log('Video call:', hoveredLead)
                break
              case 'convert':
                handleConvertCustomer(hoveredLead)
                break
              case 'delete':
                if (window.confirm(t('Are you sure you want to delete this lead?'))) {
                  // Add deletion timestamp
                  const deletedLead = {
                    ...hoveredLead,
                    deletedAt: new Date().toISOString()
                  }
                  
                  // Save to deleted leads in localStorage
                  const existingDeletedLeads = JSON.parse(localStorage.getItem('deletedLeads') || '[]')
                  existingDeletedLeads.push(deletedLead)
                  localStorage.setItem('deletedLeads', JSON.stringify(existingDeletedLeads))
                  
                  setLeads(prev => prev.filter(l => l.id !== hoveredLead.id))
                }
                break
            }
          }}
          isRtl={i18n.language === 'ar'}
        />
      )}
     </div>
  )
}

export default Leads
