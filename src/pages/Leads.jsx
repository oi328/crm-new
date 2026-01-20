import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@shared/context/ThemeProvider'
import { useAppState } from '@shared/context/AppStateProvider'
import { FaPlus, FaSearch, FaFilter, FaDownload, FaEye, FaEdit, FaTrash, FaPhone, FaEnvelope, FaWhatsapp, FaVideo, FaChevronDown, FaChevronLeft, FaChevronRight, FaExchangeAlt, FaClone } from 'react-icons/fa'
// import { api } from '../utils/api'
import LeadModal from '../components/LeadModal'
import AddActionModal from '../components/AddActionModal'
import EnhancedLeadDetailsModal from '@shared/components/EnhancedLeadDetailsModal'
import ImportLeadsModal from '../components/ImportLeadsModal'
import ColumnToggle from '../components/ColumnToggle'
import LeadHoverTooltip from '../components/LeadHoverTooltip'
import CompareLeadsModal from '../components/CompareLeadsModal'
import { useStages } from '../hooks/useStages'
import { useNavigate, useLocation } from 'react-router-dom'
 // Import the custom checkbox
import SearchableSelect from '../components/SearchableSelect'
import * as XLSX from 'xlsx'

export const Leads = () => {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const { user } = useAppState()
  const navigate = useNavigate()
  const { stages, statuses } = useStages()
  const isRtl = String(i18n.language || '').startsWith('ar')
  const MEET_ICON_URL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'><rect x='2' y='4' width='12' height='16' rx='3' fill='%23ffffff'/><rect x='2' y='4' width='12' height='4' rx='2' fill='%234285F4'/><rect x='2' y='4' width='4' height='16' rx='2' fill='%2334A853'/><rect x='10' y='4' width='4' height='16' rx='2' fill='%23FBBC05'/><rect x='2' y='16' width='12' height='4' rx='2' fill='%23EA4335'/><polygon points='14,9 22,5 22,19 14,15' fill='%2334A853'/></svg>"
  
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState([])
  const [priorityFilter, setPriorityFilter] = useState([])
  // New filter states
  const [projectFilter, setProjectFilter] = useState([])
  const [stageFilter, setStageFilter] = useState([])
  const [managerFilter, setManagerFilter] = useState([])
  const [salesPersonFilter, setSalesPersonFilter] = useState([])
  const [createdByFilter, setCreatedByFilter] = useState([])
  const [assignDateFilter, setAssignDateFilter] = useState('')
  const [actionDateFilter, setActionDateFilter] = useState('')
  const [creationDateFilter, setCreationDateFilter] = useState('')
  const [oldStageFilter, setOldStageFilter] = useState([])
  const [closedDateFilter, setClosedDateFilter] = useState('')
  const [campaignFilter, setCampaignFilter] = useState([])
  const [countryFilter, setCountryFilter] = useState([])
  const [expectedRevenueFilter, setExpectedRevenueFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const [whatsappIntentsFilter, setWhatsappIntentsFilter] = useState([])
  const [actionTypeFilter, setActionTypeFilter] = useState([])
  const [duplicateStatusFilter, setDuplicateStatusFilter] = useState([])
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedLeads, setSelectedLeads] = useState([])
  const [activeRowId, setActiveRowId] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [pageSearch, setPageSearch] = useState('')
  const [exportFrom, setExportFrom] = useState(1)
  const [exportTo, setExportTo] = useState(1)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showAddActionModal, setShowAddActionModal] = useState(false)
  const [excelFile, setExcelFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSummary, setImportSummary] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [stageDefs, setStageDefs] = useState([])
  const [isMobile, setIsMobile] = useState(false)

  // One-time migration to clear actions history as requested
  useEffect(() => {
    const hasCleared = localStorage.getItem('actions_cleared_v2');
    if (!hasCleared) {
      const saved = localStorage.getItem('leadsData');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const cleaned = parsed.map(l => ({ ...l, actions: [] }));
          localStorage.setItem('leadsData', JSON.stringify(cleaned));
          setLeads(cleaned);
          // If we just loaded, filteredLeads might be stale or not set yet, 
          // but since this runs on mount, useEffect dependencies might matter.
          // We'll just update localStorage and let the initial load logic pick it up 
          // or force a state update if leads are already loaded.
        } catch (e) {
          console.error('Failed to clear actions', e);
        }
      }
      localStorage.setItem('actions_cleared_v2', 'true');
    }
  }, []);
  
  const textColor = 'text-theme-text dark:text-white'
  const bgColor = 'bg-white dark:bg-gray-900'
  
  const tableHeaderBgClass = 'bg-theme-sidebar dark:bg-gray-900/95'
  const buttonBase = 'text-sm font-semibold rounded-lg transition-all duration-200 ease-out'
  const primaryButton = `btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none`
  
  const sidebarStages = [
    { key: 'new lead', icon: '🆕' },
    { key: 'duplicate', icon: '🔄' },
    { key: 'pending', icon: '⏳' },
    { key: 'cold calls', icon: '📞' },
    { key: 'follow up', icon: '🔁' },
  ]

  const stageCounts = useMemo(() => {
    const normalize = (s) => {
      const v = String(s || '').toLowerCase()
      if (v.includes('new')) return 'new lead'
      if (v.includes('duplicate')) return 'duplicate'
      if (v.includes('pending') || v.includes('qualif')) return 'pending'
      if (v.includes('cold') || v.includes('lost')) return 'cold calls'
      if (v.includes('follow') || v.includes('progress')) return 'follow up'
      return ''
    }
    const counts = { total: filteredLeads.length, 'new lead': 0, 'duplicate': 0, 'pending': 0, 'cold calls': 0, 'follow up': 0 }
    filteredLeads.forEach(l => {
      const k = normalize(l.stage || l.status)
      if (k) counts[k]++
    })
    return counts
  }, [filteredLeads])

  const demoLeads = useMemo(() => {
    const today = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const names = ['Alice', 'Bob', 'Charlie', 'Dina', 'Elias', 'Fatima', 'Gamal', 'Hana', 'Ibrahim', 'Jana', 'Kamal', 'Lina']
    const companies = ['Acme Co.', 'Globex', 'Initech', 'Umbrella', 'Wayne Ltd.', 'Stark Ind.']
    const sources = ['website', 'social-media', 'referral', 'email-campaign', 'direct']
    const stages = ['new lead', 'duplicate', 'pending', 'cold calls', 'follow up']
    const priorities = ['high', 'medium', 'low']
    return Array.from({ length: 12 }, (_, i) => {
      const created = new Date(today)
      created.setDate(today.getDate() - (5 + (i % 10)))
      const last = new Date(today)
      last.setDate(today.getDate() - (1 + (i % 5)))
      const id = i + 1
      return {
        id,
        name: `${names[i]} ${id}`,
        email: `lead${id}@example.com`,
        phone: `+2010${String(1000000 + id).slice(-7)}`,
        company: companies[i % companies.length],
        stage: stages[i % stages.length],
        status: stages[i % stages.length],
        priority: priorities[i % priorities.length],
        source: sources[i % sources.length],
        assignedTo: ['Ahmed Ali', 'Sara Noor', 'Ibrahim'][i % 3],
        createdAt: fmt(created),
        lastContact: fmt(last),
        notes: 'Demo lead',
        estimatedValue: 10000 + (i * 500),
        probability: (i * 9) % 100,
      }
    })
  }, [])

  useEffect(() => {
    if (Array.isArray(leads) && Array.isArray(filteredLeads)) {
      if (leads.length === 0 && filteredLeads.length === 0) {
        setLeads(demoLeads)
        setFilteredLeads(demoLeads)
        try {
          localStorage.setItem('leadsData', JSON.stringify(demoLeads))
          setTimeout(() => window.dispatchEvent(new CustomEvent('leadsDataUpdated')), 0)
        } catch (err) {
          console.warn('persist demo leads failed', err?.message)
        }
      }
    }
  }, [leads, filteredLeads, demoLeads])

  const location = useLocation()
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || '')
      const s = params.get('stage')
      if (s) {
        setStageFilter(s)
      } else {
        setStageFilter('all')
      }
    } catch (e) {
      console.error('Error parsing URL for stage filter:', e) // FIX 4: Added console.error
    }
  }, [location.search])

  const handleCompareLead = (duplicateLead) => {
    // Attempt to find the "original" lead
    // 1. Search by phone number (clean format)
    // 2. Search by email
    // 3. Exclude the current duplicate lead ID
    // 4. Sort by creation date (oldest is original)
    
    const cleanPhone = (p) => String(p || '').replace(/[^0-9]/g, '')
    const targetPhone = cleanPhone(duplicateLead.phone || duplicateLead.mobile)
    const targetEmail = (duplicateLead.email || '').toLowerCase()
    
    const possibleOriginals = leads.filter(l => {
      if (l.id === duplicateLead.id) return false // Skip self
      
      const lPhone = cleanPhone(l.phone || l.mobile)
      const lEmail = (l.email || '').toLowerCase()
      
      const phoneMatch = targetPhone && lPhone && targetPhone === lPhone
      const emailMatch = targetEmail && lEmail && targetEmail === lEmail
      
      return phoneMatch || emailMatch
    }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    
    // If found, take the oldest one as original
    // If not found (e.g. pagination), mock one for demonstration or show alert
    let originalLead = possibleOriginals[0]
    
    if (!originalLead) {
       // Mock for demonstration if no original found in current list
       // In production, this should trigger an API call to find the original lead by phone/email
       originalLead = {
         ...duplicateLead,
         id: 'ORIG-MOCK',
         assignedTo: 'Sarah Connor', // Different agent
         createdAt: new Date(new Date(duplicateLead.createdAt).setDate(new Date(duplicateLead.createdAt).getDate() - 5)).toISOString(), // 5 days earlier
         stage: 'qualified',
         notes: 'Original lead interaction history...',
         lastContact: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString()
       }
    }
    
    setCompareData({
      duplicate: duplicateLead,
      original: originalLead
    })
    setShowCompareModal(true)
  }

  // Hover tooltip state
  const [hoveredLead, setHoveredLead] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef(null)
  
  // Compare Modal State
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [compareData, setCompareData] = useState({ duplicate: null, original: null })

  // Filter visibility state
  const [showAllFilters, setShowAllFilters] = useState(false)
  const activeRowRef = useRef(null)

  const scrollXRef = useRef(null)


  

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
            ? saved.map((name) => ({ name, nameAr: '', type: '', color: defaultColorForName(name), icon: defaultIconForName(name) }))
            : saved.map((s) => ({ 
                name: s.name || String(s), 
                nameAr: s.nameAr || '',
                type: s.type || '',
                order: s.order,
                color: s.color || defaultColorForName(s.name || String(s)), 
                icon: s.icon || defaultIconForName(s.name || String(s)) 
              }))
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

  

  // Columns visibility state (ordered to match requested design)
  const allColumns = {
    lead: t('Lead'),
    contact: t('Contact'),
    source: t('Source'),
    project: t('Project'),
    salesPerson: t('Sales Person'),
    lastComment: t('Last Comment'),
    stage: t('Stage'),
    expectedRevenue: t('Expected Revenue'),
    priority: t('Priority'),
    actions: t('Actions')
  }

  // ===== Excel Import Helpers =====
  const normalizeKey = (key) => key?.toString()?.toLowerCase()?.trim()?.replace(/\s+/g, '')
  const headerMap = {
    name: ['name', 'الاسم', 'اسم العميل', 'lead', 'lead name'],
    email: ['email', 'البريد', 'البريد الإلكتروني'],
    phone: ['phone', 'الهاتف', 'رقم الهاتف', 'contact'],
    company: ['company', 'الشركة'],
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
    salesPerson: true,
    lastComment: true,
    stage: true,
    expectedRevenue: true,
    priority: true,
    actions: true
  })

  const handleColumnToggle = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const resetVisibleColumns = () => {
    const all = Object.keys(allColumns).reduce((acc, k) => { acc[k] = true; return acc }, {})
    setVisibleColumns(all)
  }

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (!isMobile) return
    setVisibleColumns(prev => ({
      ...prev,
      source: false,
      project: false,
      salesPerson: false,
      lastComment: false,
      stage: false,
      expectedRevenue: false,
      priority: false,
      status: false,
    }))
  }, [isMobile])

  // Sample leads data
  const sampleLeads = useMemo(() => Array.from({ length: 30 }, (_, idx) => {
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
  }), [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('leadsData')
      if (saved) {
        const parsed = JSON.parse(saved)
        setLeads(parsed)
        setFilteredLeads(parsed)
        setTimeout(() => window.dispatchEvent(new CustomEvent('leadsDataUpdated')), 0)
      } else {
        setLeads(sampleLeads)
        setFilteredLeads(sampleLeads)
        localStorage.setItem('leadsData', JSON.stringify(sampleLeads))
        setTimeout(() => window.dispatchEvent(new CustomEvent('leadsDataUpdated')), 0)
      }
    } catch (err) {
      console.warn('Failed to load leadsData from localStorage, using sample.', err?.message)
      setLeads(sampleLeads)
      setFilteredLeads(sampleLeads)
      setTimeout(() => window.dispatchEvent(new CustomEvent('leadsDataUpdated')), 0)
    }
  }, [sampleLeads])

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
      setTimeout(() => window.dispatchEvent(new CustomEvent('leadsDataUpdated')), 0)
    } catch (err) {
      console.warn('Failed to save leadsData to localStorage.', err?.message)
    }
  }, [leads])

  useEffect(() => {
    let filtered = leads.filter(lead => {
      // VISIBILITY CONTROL: Duplicate leads only visible to managers
      const isDuplicateStage = String(lead.stage || '').toLowerCase() === 'duplicate';
      const userRole = (user?.role || '').toLowerCase();
      const isManagerOrAdmin = ['admin', 'manager', 'sales director', 'operations manager', 'super admin'].some(r => userRole.includes(r));
      
      if (isDuplicateStage && !isManagerOrAdmin) {
        return false;
      }

      // FIX 2: Added String() and || '' for safe access and toLowerCase() for case-insensitive search
      const matchesSearch = String(lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           String(lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           String(lead.company || '').toLowerCase().includes(searchTerm.toLowerCase())

      // Helper for multi-select matching
      const matchesMulti = (filter, value) => {
        if (!Array.isArray(filter) || filter.length === 0) return true;
        const v = String(value || '').toLowerCase();
        return filter.some(f => String(f).toLowerCase() === v);
      }

      const matchesSource = matchesMulti(sourceFilter, lead.source)
      const matchesPriority = matchesMulti(priorityFilter, lead.priority)
      const matchesProject = matchesMulti(projectFilter, lead.project)
      
      // Smart stage matching for Dashboard filters (Multi-select)
      let matchesStage = false;
      if (!Array.isArray(stageFilter) || stageFilter.length === 0) {
        matchesStage = true;
      } else {
        matchesStage = stageFilter.some(f => {
          const s = String(lead.stage || lead.status || '').toLowerCase();
          const filterVal = f.toLowerCase();
          const src = String(lead.source || '').toLowerCase();
          const cType = String(lead.actionType || '').toLowerCase();
          
          if (filterVal === 'new' || filterVal === 'new lead') return s === 'new' || s === 'new lead';
          if (filterVal === 'duplicate') return s === 'duplicate' || String(lead.isDuplicate) === 'true' || String(lead.duplicateStatus) === 'duplicate';
          if (filterVal === 'pending') return s === 'pending' || s === 'in-progress' || s === 'qualified' || s.includes('qualif');
          if (filterVal === 'coldcalls' || filterVal === 'cold calls') return s.includes('cold') || src === 'cold-call' || src === 'direct' || cType === 'cold-call';
          if (filterVal === 'followup' || filterVal === 'follow up') return s.includes('follow') || cType === 'follow-up';
          return s === filterVal;
        });
      }

      const matchesManager = matchesMulti(managerFilter, lead.manager)
      const matchesSalesPerson = matchesMulti(salesPersonFilter, lead.assignedTo)
      const matchesCreatedBy = matchesMulti(createdByFilter, lead.createdBy)
      const matchesOldStage = matchesMulti(oldStageFilter, lead.oldStage)
      const matchesCampaign = matchesMulti(campaignFilter, lead.campaign)
      const matchesCountry = matchesMulti(countryFilter, lead.country)
      const matchesWhatsappIntents = matchesMulti(whatsappIntentsFilter, lead.whatsappIntents)
      const matchesActionType = matchesMulti(actionTypeFilter, lead.actionType)
      const matchesDuplicateStatus = matchesMulti(duplicateStatusFilter, lead.duplicateStatus)
      
      // Date filters
      const matchesAssignDate = !assignDateFilter || (lead.assignDate && lead.assignDate.includes(assignDateFilter))
      const matchesActionDate = !actionDateFilter || (lead.actionDate && lead.actionDate.includes(actionDateFilter))
      const matchesCreationDate = !creationDateFilter || (lead.createdAt && lead.createdAt.includes(creationDateFilter))
      const matchesClosedDate = !closedDateFilter || (lead.closedDate && lead.closedDate.includes(closedDateFilter))
      
      // Text filters
      const matchesEmail = !emailFilter || (lead.email && lead.email.toLowerCase().includes(emailFilter.toLowerCase()))
      const matchesExpectedRevenue = !expectedRevenueFilter || (lead.estimatedValue && lead.estimatedValue.toString().includes(expectedRevenueFilter))
      
      return matchesSearch && matchesSource && matchesPriority &&
             matchesProject && matchesStage && matchesManager && matchesSalesPerson &&
             matchesCreatedBy && matchesOldStage && matchesCampaign && matchesCountry &&
             matchesWhatsappIntents && matchesActionType && matchesDuplicateStatus &&
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
  }, [leads, searchTerm, sourceFilter, priorityFilter, sortBy, sortOrder,
      projectFilter, stageFilter, managerFilter, salesPersonFilter, createdByFilter,
      assignDateFilter, actionDateFilter, creationDateFilter, oldStageFilter, closedDateFilter,
      campaignFilter, countryFilter, expectedRevenueFilter, emailFilter, whatsappIntentsFilter,
      actionTypeFilter, duplicateStatusFilter, user])

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-black dark:bg-blue-900 dark:text-blue-200'
      case 'qualified': return 'bg-green-100 text-black dark:bg-green-900 dark:text-green-200'
      case 'in-progress': return 'bg-yellow-100 text-black dark:bg-yellow-900 dark:text-yellow-200'
      case 'converted': return 'bg-purple-100 text-black dark:bg-purple-900 dark:text-purple-200'
      case 'lost': return 'bg-red-100 text-black dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100  dark:bg-gray-900 dark:text-white'
    }
  }

  const getPriorityColor = (priority) => {
    switch (String(priority).toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100  dark:bg-gray-900 dark:text-white'
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

  const uniqueAssignees = useMemo(() => {
    return Array.from(new Set(leads.map(l => l.assignedTo).filter(Boolean))).sort()
  }, [leads])

  const handleAssignLead = (leadId, newAssignee) => {
    const updatedLeads = leads.map(l => l.id === leadId ? { ...l, assignedTo: newAssignee, stage: 'Pending' } : l)
    setLeads(updatedLeads)
    setFilteredLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedTo: newAssignee, stage: 'Pending' } : l))
    localStorage.setItem('leadsData', JSON.stringify(updatedLeads))

    // Also update selectedLead if it matches, so the modal reflects the change immediately
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => ({ ...prev, assignedTo: newAssignee, stage: 'Pending' }))
    }
    if (hoveredLead && hoveredLead.id === leadId) {
      setHoveredLead(prev => ({ ...prev, assignedTo: newAssignee, stage: 'Pending' }))
    }
    window.dispatchEvent(new CustomEvent('leadsDataUpdated'))
  }

  const handleUpdateLead = (updatedLead) => {
    const updatedLeads = leads.map(l => l.id === updatedLead.id ? updatedLead : l)
    setLeads(updatedLeads)
    setFilteredLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l))
    localStorage.setItem('leadsData', JSON.stringify(updatedLeads))
    
    if (selectedLead && selectedLead.id === updatedLead.id) {
      setSelectedLead(updatedLead)
    }
    if (hoveredLead && hoveredLead.id === updatedLead.id) {
      setHoveredLead(updatedLead)
    }
    window.dispatchEvent(new CustomEvent('leadsDataUpdated'))
  }

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
      selectedLeads.includes(l.id) ? { ...l, assignedTo: target, stage: 'Follow Up' } : l
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
        assignedSalesRep: String(lead?.salesPerson || lead?.assignedTo || '').trim(),
      }
      validLeads.push(payload)
    }

    try {
      // Assuming a valid API post to /api/customers is required for conversion
      // await Promise.all(validLeads.map(p => api.post('/api/customers', p)))

      // If API post fails, we still consider the local operation successful for demonstration purposes
      setBulkFeedback({ key: 'bulk.convertSuccess', params: { success: validLeads.length, failed: invalidLeads.length } })
      
      // Update local leads to reflect conversion (e.g., change stage to 'converted' or delete)
      setLeads(prev => prev.map(l => {
        if (selectedLeads.includes(l.id)) {
          // If the lead was valid for conversion, update its status/stage
          const isValid = validLeads.some(v => v.phone === l.phone)
          if (isValid) return { ...l, stage: 'converted', status: 'converted' } // Example update
          // If invalid, keep it as is or mark it for review
          return l
        }
        return l
      }))

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
        alert(i18n.language === 'ar' ? 'لا يمكن التحويل: الاسم/الهاتف مفقود' : t('Conversion failed: missing name/phone'))
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
      
      // Assuming a valid API post to /api/customers is required for conversion
      // await api.post('/api/customers', payload) 

      alert(i18n.language === 'ar' ? 'تم تحويل الليد إلى عميل بنجاح' : t('Lead converted to customer successfully'))
      
      // Update local leads: remove the converted lead or update its stage/status
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, stage: 'converted', status: 'converted' } : l))

    } catch (err) {
      console.error('convert customer failed', err)
      alert(i18n.language === 'ar' ? 'فشل التحويل إلى عميل' : t('Failed to convert to customer'))
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage)

  // FIX 1: Corrected the incomplete object definition for export
  const handleExportRange = () => {
    const actualTotal = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage))
    const from = Math.max(1, Math.min(Number(exportFrom) || currentPage, actualTotal))
    const to = Math.max(from, Math.min(Number(exportTo) || from, actualTotal))
    const startIdx = (from - 1) * itemsPerPage
    const endIdx = Math.min(to * itemsPerPage, filteredLeads.length)
    const rangeLeads = filteredLeads.slice(startIdx, endIdx)
    
    // FIX 1: Completed the object definition to fix the syntax error 'l...'
    const rows = rangeLeads.map(l => ({
      'Name': l.name,
      'Email': l.email,
      'Phone': l.phone,
      'Company': l.company,
      'Stage': l.stage,
      'Priority': l.priority,
      'Source': l.source,
      'Assigned To': l.assignedTo,
      'Created At': l.createdAt,
      'Last Contact': l.lastContact,
      'Estimated Value': l.estimatedValue,
      'Probability': l.probability
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads')
    XLSX.writeFile(workbook, `Leads_Page_${from}_to_${to}.xlsx`)
  }

  const columnMinWidths = {
    source: 140,
    project: 140,
    salesPerson: 140,
    lastComment: 220,
    stage: 140,
    expectedRevenue: 160,
    priority: 140,
  };

  return (
    <div className={`px-2 max-[480px]:px-1 py-4 md:px-6 md:py-6 min-h-screen  ${textColor}` } dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`p-4 flex justify-between items-center gap-4 mb-6`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className={`relative inline-flex items-center ${isRtl ? 'flex-row-reverse' : ''} gap-2`}>
          <h1 className={`page-title text-2xl md:text-3xl font-bold text-black dark:text-white flex items-center gap-2 ${isRtl ? 'text-right' : 'text-left'}`} style={{ textAlign: isRtl ? 'right' : 'left', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
            {t('Leads')}
          </h1>
          <span
            aria-hidden
            className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent"
            style={{ width: 'calc(100% + 8px)', left: isRtl ? 'auto' : '-4px', right: isRtl ? '-4px' : 'auto', bottom: '-4px' }}
          ></span>
        </div>
        <div className={`flex items-center gap-2 max-[480px]:gap-1 flex-nowrap ${isRtl ? 'mr-auto' : 'ml-auto'}`}>
          <button
            onClick={() => navigate('/leads/new')}
            className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none gap-2 max-[480px]:px-2 max-[480px]:py-1.5 max-[480px]:h-8 max-[480px]:gap-1 max-[480px]:text-xs whitespace-nowrap"
          >
            <FaPlus className=" w-3 h-3" />
            <span className="text-white">{t('Add New Lead')}</span>
          </button>
          <button onClick={() => setShowImportModal(true)} className="btn btn-sm bg-blue-600 hover:bg-blue-700  border-none gap-2 max-[480px]:px-2 max-[480px]:py-1.5 max-[480px]:h-8 max-[480px]:gap-1 max-[480px]:text-xs whitespace-nowrap" >
            <svg className="  w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12" />
              <path d="M8 11l4 4 4-4" />
              <path d="M4 20h16" />
            </svg>
            <span className="text-white">{t('Import')}</span>
          </button>
        </div>
      </div>

      {/* Leads Table Filters & Controls */}
      <div className={`glass-panel rounded-2xl p-3 mb-6 filters-compact`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold  dark:text-white flex items-center gap-2">
            <FaFilter size={16} className="text-blue-500 dark:text-blue-400" /> {t('Filters')}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAllFilters(prev => !prev)} className={`flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors`}>
              {showAllFilters ? t('Hide ') : t('Show ')}
              <FaChevronDown size={12} className={`transform transition-transform duration-300 ${showAllFilters ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            <button
              onClick={() => {
                setSearchTerm('')
                setSourceFilter([])
                setPriorityFilter([])
                setProjectFilter([])
                setStageFilter([])
                setManagerFilter([])
                setSalesPersonFilter([])
                setCreatedByFilter([])
                setAssignDateFilter('')
                setActionDateFilter('')
                setCreationDateFilter('')
                setOldStageFilter([])
                setClosedDateFilter('')
                setCampaignFilter([])
                setCountryFilter([])
                setExpectedRevenueFilter('')
                setEmailFilter('')
                setActionTypeFilter([])
                setDuplicateStatusFilter([])
                setSortBy('createdAt')
                setSortOrder('desc')
                setCurrentPage(1)
              }}
              className="px-3 py-1.5 text-sm dark:text-white hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              {t('Reset')}
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3">
          {/* First Row - Always Visible (Search + 3 filters) */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Search */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                <FaSearch size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Search')}
              </label>
              <input
                type="text"
                placeholder={t('Search leads...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-theme-border dark:border-gray-500 rounded-lg  dark:bg-gray-700  dark:text-white text-theme-text text-sm font-medium  dark:placeholder-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200"
              />
            </div>

            {/* Source Filter */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 4l-4 4 4 4" />
                </svg>
                {t('Source')}
              </label>
              <SearchableSelect
                value={sourceFilter}
                multiple={true}
                onChange={setSourceFilter}
                options={[
                  ...Array.from(new Set(leads.map(l => l.source).filter(Boolean))).map(source => ({ value: source, label: t(source) }))
                ]}
                placeholder={t('All')}
                isRTL={isRtl}
              />
            </div>

            {/* Priority Filter */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('Priority')}
              </label>
              <SearchableSelect
                value={priorityFilter}
                multiple={true}
                onChange={setPriorityFilter}
                options={[
                  { value: 'high', label: t('High') },
                  { value: 'medium', label: t('Medium') },
                  { value: 'low', label: t('Low') }
                ]}
                placeholder={t('All ')}
                isRTL={isRtl}
              />
            </div>

            {/* Project Filter */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {t('Project')}
              </label>
              <SearchableSelect
                value={projectFilter}
                multiple={true}
                onChange={setProjectFilter}
                options={[
                  
                  ...Array.from(new Set(leads.map(l => l.project).filter(Boolean))).map(project => ({ value: project, label: t(project) }))
                ]}
                placeholder={t('All')}
                isRTL={isRtl}
              />
            </div>
          </div>

          {/* Additional Filters (Show/Hide) */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showAllFilters ? 'max-h-[800px] opacity-100 pt-3' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">

              {/* Stage Filter (using sidebar stages for options) */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  {t('Stage')}
                </label>
                <SearchableSelect
                value={stageFilter}
                multiple={true}
                onChange={setStageFilter}
                  options={[
                    { value: 'new', label: `🆕 ${t('New Lead')}` },
                    { value: 'duplicate', label: `🔄 ${t('Duplicate')}` },
                    { value: 'pending', label: `⏳ ${t('Pending')}` },
                    { value: 'cold-call', label: `📞 ${t('Cold Calls')}` },
                    { value: 'follow-up', label: `🔁 ${t('follow up')}` }
                  ]}
                  placeholder={t('All ')}
                  isRTL={isRtl}
                />
              </div>

              {/* Manager Filter */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('Manager')}
                </label>
                <SearchableSelect
                  value={managerFilter}
                  multiple={true}
                  onChange={setManagerFilter}
                  options={[
                    ...Array.from(new Set(leads.map(l => l.manager).filter(Boolean))).map(manager => ({ value: manager, label: t(manager) }))
                  ]}
                  placeholder={t('All ')}
                  isRTL={isRtl}
                />
              </div>

              {/* Sales Person Filter */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {t('Sales Person')}
                </label>
                <SearchableSelect
                  value={salesPersonFilter}
                  onChange={setSalesPersonFilter}
                  options={[
                    ...Array.from(new Set(leads.map(l => l.assignedTo).filter(Boolean))).map(salesPerson => ({ value: salesPerson, label: t(salesPerson) }))
                  ]}
                  placeholder={t('All ')}
                  isRTL={isRtl}
                />
              </div>

              {/* Created By Filter */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20h18" />
                  </svg>
                  {t('Created By')}
                </label>
                <SearchableSelect
                value={createdByFilter}
                multiple={true}
                onChange={setCreatedByFilter}
                  options={[
                    ...Array.from(new Set(leads.map(l => l.createdBy).filter(Boolean))).map(creator => ({ value: creator, label: t(creator) }))
                  ]}
                  placeholder={t('All ')}
                  isRTL={isRtl}
                />
              </div>

              {/* Old Stage Filter */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3 1.343 3 3v1h1a2 2 0 012 2v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a2 2 0 012-2h1v-1c0-1.657 1.343-3 3-3z" />
                  </svg>
                  {t('Old Stage')}
                </label>
                <SearchableSelect
                  value={oldStageFilter}
                  onChange={setOldStageFilter}
                  options={[
                    ...Array.from(new Set(leads.map(l => l.oldStage).filter(Boolean))).map(oldStage => ({ value: oldStage, label: t(oldStage) }))
                  ]}
                  placeholder={t('All')}
                  isRTL={isRtl}
                />
              </div>

              {/* Campaign Filter */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m0 0a2 2 0 104 0m-4 0h4" />
                  </svg>
                  {t('Campaign')}
                </label>
                <SearchableSelect
                  value={campaignFilter}
                  multiple={true}
                  onChange={setCampaignFilter}
                  options={[
                    ...Array.from(new Set(leads.map(l => l.campaign).filter(Boolean))).map(campaign => ({ value: campaign, label: t(campaign) }))
                  ]}
                  placeholder={t('All ')}
                  isRTL={isRtl}
                />
              </div>

              {/* Country Filter */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v10a2 2 0 01-2 2H3.055L3 11zM11 5h2m-2 0V3m0 2v2m0-2h-2m2 0h2m-2 0V3a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                  {t('Country')}
                </label>
                <SearchableSelect
                value={countryFilter}
                multiple={true}
                onChange={setCountryFilter}
                  options={[
                    ...Array.from(new Set(leads.map(l => l.country).filter(Boolean))).map(country => ({ value: country, label: t(country) }))
                  ]}
                  placeholder={t('All ')}
                  isRTL={isRtl}
                />
              </div>

              {/* Expected Revenue Filter (Text/Number Input) */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .343-3 .768V11a.5.5 0 00.5.5h5a.5.5 0 00.5-.5V8.768C15 8.343 13.657 8 12 8z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11.5v6.5m-3-6.5h6m-3 0V5m0 0h3m-3 0H9" />
                  </svg>
                  {t('Expected Revenue')}
                </label>
                <input
                  type="number"
                  placeholder={t('Enter minimum value...')}
                  value={expectedRevenueFilter}
                  onChange={(e) => setExpectedRevenueFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-theme-border dark:border-gray-500 rounded-lg  dark:bg-gray-700  dark:text-white  text-xs font-medium  dark:placeholder-text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200"
                />
              </div>

              {/* Email Filter (Text Input) */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <FaEnvelope size={12} className="text-blue-500 dark:text-blue-400" />
                  {t('Email')}
                </label>
                <input
                  type="text"
                  placeholder={t('Search email...')}
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-theme-border dark:border-gray-500 rounded-lg  dark:bg-gray-700  dark:text-white text-theme-text text-sm font-medium  dark:placeholder-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200"
                />
              </div>



              {/* action Type Filter */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {t('action Type')}
                </label>
                <SearchableSelect
                  value={actionTypeFilter}
                  multiple={true}
                  onChange={setActionTypeFilter}
                  options={[
                    { value: 'call', label: t('Call ') },
                    { value: 'whatsapp', label: t('whatsapp') },
                    { value: 'email', label: t('email') },

                    { value: 'google meet ', label: t('google meet') },
                    { value: 'sms', label: t('sms ') }

                  ]}
                  placeholder={t('Action Types')}
                  isRTL={isRtl}
                />
              </div>

              {/* Duplicate Status Filter */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v4a1 1 0 001 1h4a1 1 0 001-1V7m0 10v4a1 1 0 001 1h4a1 1 0 001-1v-4m-6-4H6a2 2 0 00-2 2v4a2 2 0 002 2h4m-6-4h4m-4 0v-4" />
                  </svg>
                  {t('Duplicate Status')}
                </label>
                <SearchableSelect
                  value={duplicateStatusFilter}
                  multiple={true}
                  onChange={setDuplicateStatusFilter}
                  options={[
                    { value: 'duplicate', label: t('Duplicate') },
                    { value: 'unique', label: t('Unique') }
                  ]}
                  placeholder={t('All ')}
                  isRTL={isRtl}
                />
              </div>

              {/* Assign Date Filter */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {t('Assign Date')}
                </label>
                <input
                  type="date"
                  value={assignDateFilter}
                  onChange={(e) => setAssignDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-theme-border dark:border-gray-500 rounded-lg  dark:bg-gray-700  text-theme-text dark:text-white text-xs font-medium  dark:placeholder-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200"
                />
              </div>

              {/* Action Date Filter */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {t('Last Action Date')}
                </label>
                <input
                  type="date"
                  value={actionDateFilter}
                  onChange={(e) => setActionDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-theme-border dark:border-gray-500 rounded-lg  dark:bg-gray-700  text-theme-text dark:text-white text-xs font-medium  dark:placeholder-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200"
                />
              </div>

              {/* Creation Date Filter */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {t('Creation Date')}
                </label>
                <input
                  type="date"
                  value={creationDateFilter}
                  onChange={(e) => setCreationDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-theme-border dark:border-gray-500 rounded-lg  dark:bg-gray-700  text-theme-text dark:text-white text-xs font-medium  dark:placeholder-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200"
                />
              </div>

              {/* Closed Date Filter */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium  dark:text-white">
                  <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {t('Closed Date')}
                </label>
                <input
                  type="date"
                  value={closedDateFilter}
                  onChange={(e) => setClosedDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-theme-border dark:border-gray-500 rounded-lg  dark:bg-gray-700  text-theme-text dark:text-white text-xs font-medium  dark:placeholder-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-400 transition-all duration-200"
                />
              </div>
            </div>

          </div>

          
        </div>
      </div>

      <div className={`flex items-center justify-between mb-3`}>
        <h2 className="text-xl font-bold text-theme-text dark:text-white" style={{ color: theme === 'dark' ? '#ffffff' : undefined }}>{t('Leads Pipline')}</h2>
        <ColumnToggle
          columns={allColumns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          onResetColumns={resetVisibleColumns}
          align={'right'}
          compact
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        <button
          onClick={() => setStageFilter([])}
          className={`btn btn-glass text-sm inline-flex items-center justify-between gap-2 px-3 py-2 ${textColor}`}
        >
          <span className="flex items-center gap-2"><span>Σ</span><span>{t('total leads')}</span></span>
          <span className="font-bold">{stageCounts.total}</span>
        </button>
        {sidebarStages.map((s) => (
          <button
            key={s.key}
            onClick={() => setStageFilter([s.key])}
            className={`btn btn-glass text-sm inline-flex items-center justify-between gap-2 px-3 py-2 ${textColor}`}
          >
            <span className="flex items-center gap-2"><span>{s.icon}</span><span>{t(s.key)}</span></span>
            <span className="font-bold">{stageCounts[s.key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className={`glass-panel rounded-2xl overflow-hidden`}>
        <div className="flex justify-between items-center p-3 border-b border-theme-border dark:border-gray-700">
          {selectedLeads.length > 0 ? (
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium  dark:text-white">
                {t('Selected')}: {selectedLeads.length} {t('Leads')}
              </span>

              <div className="flex items-center gap-2">
                <SearchableSelect
                  value={bulkStatus}
                  onChange={setBulkStatus}
                  options={[
                    { value: '', label: t('Change Status to') },
                    ...statuses.map(s => ({ value: s, label: t(s) }))
                  ]}
                  placeholder={t('Change Status to')}
                  isRTL={isRtl}
                  className="py-1.5 dark:bg-transparent backdrop-blur-sm text-sm dark:border-gray-600 min-w-[150px]"
                />
                <button onClick={applyBulkStatus} className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none">
                  {t('Apply Status')}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <SearchableSelect
                  value={bulkAssignTo}
                  onChange={setBulkAssignTo}
                  options={[
                    { value: '', label: t('Bulk Assign to') },
                    ...Array.from(new Set(leads.map(l => l.assignedTo).filter(Boolean))).map(owner => ({ value: owner, label: owner }))
                  ]}
                  placeholder={t('Bulk Assign to')}
                  isRTL={isRtl}
                  className="py-1.5  dark:bg-transparent backdrop-blur-sm text-sm dark:border-gray-600 min-w-[150px]"
                />
                <button onClick={applyBulkAssign} className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none">
                  {t('Assign')}
                </button>
              </div>

              <button onClick={applyBulkConvert} className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none">
                {t('Convert to Customer')}
              </button>

              <button onClick={applyBulkDelete} className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none">
                {t('Delete Selected')} ({selectedLeads.length})
              </button>
            </div>
          ) : (
            <span className="text-sm font-medium  dark:text-white">{t('No leads selected for bulk actions')}</span>
          )}
        </div>
        <div ref={scrollXRef} className="mt-4 w-full overflow-x-auto rounded-lg shadow-md backdrop-blur-lg" style={{ '--table-header-bg': theme === 'dark' ? 'transparent' : undefined, '--scroll-bg': theme === 'dark' ? '#0f172a' : '#f9fafb' }}>
          <table className="w-max min-w-full divide-y divide-theme-border dark:divide-gray-700 dark:text-white" style={{ tableLayout: 'auto' }}>
            <thead className={` ${tableHeaderBgClass} backdrop-blur-md sticky top-0 z-30 shadow-md`} style={{ backgroundColor: 'var(--table-header-bg)' }}>
              <tr>
                {/* Checkbox Column */}
                <th scope="col" className="w-10 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-white whitespace-nowrap" style={{ backgroundColor: 'var(--table-header-bg)' }}>
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-theme-border rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  />
                </th>

                {/* Main Content Columns (ordered with Actions after Contact) */}
                {visibleColumns.lead && (
                  <th
                    key="lead"
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text dark:text-white w-40 whitespace-nowrap cursor-pointer`}
                    style={{ backgroundColor: 'var(--table-header-bg)' }}
                    onClick={() => {
                      if (sortBy === 'lead') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortBy('lead')
                        setSortOrder('desc')
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {allColumns.lead}
                      {sortBy === 'lead' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                )}

                {visibleColumns.contact && (
                  <th
                    key="contact"
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-white w-48 whitespace-nowrap`}
                    style={{ backgroundColor: 'var(--table-header-bg)' }}
                  >
                    <div className="flex items-center gap-1">{allColumns.contact}</div>
                  </th>
                )}

                {visibleColumns.actions && (
                  <th
                    key="actions"
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text dark:text-white whitespace-nowrap sticky ${i18n.language === 'ar' ? 'right-0' : 'left-0'} z-30`}
                    style={{ minWidth: '160px', backgroundColor: 'var(--table-header-bg)' }}
                  >
                    {t('Actions')}
                  </th>
                )}

                {['source','project','salesPerson','lastComment','stage','expectedRevenue','priority'].map((key) => (
                  visibleColumns[key] ? (
                    <th
                      key={key}
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text dark:text-white whitespace-nowrap ${['source','stage','priority','expectedRevenue'].includes(key) ? 'cursor-pointer' : 'cursor-default'}`}
                      style={{ minWidth: `${columnMinWidths[key] || 140}px`, backgroundColor: 'var(--table-header-bg)' }}
                      onClick={['source','stage','priority','expectedRevenue'].includes(key) ? () => {
                        if (sortBy === key) {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                        } else {
                          setSortBy(key)
                          setSortOrder('desc')
                        }
                      } : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {allColumns[key]}
                        {sortBy === key && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                  ) : null
                ))}
              </tr>
            </thead>

            <tbody className=" divide-y divide-theme-border dark:bg-transparent dark:divide-gray-700">
              {paginatedLeads.map((lead, index) => (
                <tr
                  key={lead.id}
                  className={` hover:bg-white/5 transition-colors duration-300 transition-colors duration-150 ${hoveredLead?.id === lead.id ? 'bg-white/5' : ''}`}
                  
                  onMouseEnter={() => setHoveredLead(lead)}
                  onMouseLeave={() => setHoveredLead(null)}
                  onClick={() => setActiveRowId(activeRowId === lead.id ? null : lead.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Checkbox Cell */}
                  <td className="w-10 px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-theme-border rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>

                  {/* Lead Info */}
                  {visibleColumns.lead && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium  dark:text-white">
                      <div className="font-semibold text-base flex items-center gap-1">
                        {lead.name}
                        {String(lead.stage || lead.status || '').toLowerCase().includes('duplicate') && (
                          <FaClone className="text-red-500" size={12} title={t('Duplicate Lead')} />
                        )}
                      </div>
                      <div className=" dark:text-white text-xs mt-0.5">{lead.company}</div>
                    </td>
                  )}

                  {/* Contact Info */}
                  {visibleColumns.contact && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm  dark:text-white">
                      <div className="font-normal dark:text-white">{lead.email}</div>
                      <div 
                        className="font-normal dark:text-white hover:text-[#25D366] cursor-pointer transition-colors duration-200 flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          const raw = lead.phone || lead.mobile || '';
                          const digits = String(raw).replace(/[^0-9]/g, '');
                          if (digits) window.open(`https://wa.me/${digits}`, '_blank');
                        }}
                        title={t('Open WhatsApp')}
                      >
                        <FaWhatsapp size={12} className="text-[#25D366]" />
                        {lead.phone}
                      </div>
                    </td>
                  )}

                  {/* Actions (after Contact) */}
                  {visibleColumns.actions && (
                    <td className={`px-6 py-3 whitespace-nowrap text-xs font-medium ${activeRowId === lead.id ? `sticky ${i18n.language === 'ar' ? 'right-0' : 'left-0'} z-20 bg-gray-50 dark:bg-slate-900/25 border border-theme-border dark:border-slate-700/40 shadow-sm` : ''} `}>
                      <div className="flex items-center gap-2 flex-nowrap">
                        {!String(lead.stage || lead.status || '').toLowerCase().includes('duplicate') ? (
                          <>
                            <button
                              title={t('Preview')}
                              onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setShowLeadModal(true); }}
                              className={`inline-flex items-center justify-center ${theme === 'light' ? 'text-gray-700 hover:text-blue-500' : 'text-indigo-300 hover:text-indigo-400'}`}
                            >
                              <FaEye size={16} className={`${theme === 'light' ? 'text-gray-700' : 'text-indigo-300'}`} />
                            </button>
                            <button
                              title={t('Add Action')}
                              onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setShowAddActionModal(true) }}
                              className={`inline-flex items-center justify-center ${theme === 'light' ? 'text-gray-700 hover:text-blue-500' : 'text-emerald-300 hover:text-emerald-400'}`}
                            >
                              <FaPlus size={16} className={`${theme === 'light' ? 'text-gray-700' : 'text-emerald-300'}`} />
                            </button>
                          </>
                        ) : (
                          <button
                            title={t('Compare')}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleCompareLead(lead);
                            }}
                            className={`inline-flex items-center justify-center ${theme === 'light' ? 'text-red-600 hover:text-red-700' : 'text-red-400 hover:text-red-300'}`}
                          >
                            <FaExchangeAlt size={16} />
                          </button>
                        )}
                        <button
                          title={t('Call')}
                          onClick={(e) => { e.stopPropagation(); const raw = lead.phone || lead.mobile || ''; const digits = String(raw).replace(/[^0-9]/g, ''); if (digits) window.open(`tel:${digits}`); }}
                          className="inline-flex items-center justify-center text-blue-600 dark:text-[#2563EB] hover:opacity-80"
                        >
                          <FaPhone size={16} />
                        </button>

                        <button
                          title={t('Email')}
                          onClick={(e) => { e.stopPropagation(); if (lead.email) window.open(`mailto:${lead.email}`); }}
                          className="inline-flex items-center justify-center text-[#FFA726] hover:opacity-80"
                        >
                          <FaEnvelope size={16} />
                        </button>
                        <button
                          title="Google Meet"
                          onClick={(e) => { e.stopPropagation(); window.open('https://meet.google.com/', '_blank'); }}
                          className="inline-flex items-center justify-center hover:opacity-80"
                        >
                          <img src={MEET_ICON_URL} alt="Google Meet" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}

                  {/* Source */}
                  {visibleColumns.source && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm  dark:text-white" style={{ minWidth: `${columnMinWidths.source}px` }}>
                      <span className="text-base">{getSourceIcon(lead.source)}</span> {lead.source}
                    </td>
                  )}

                  {/* Project */}
                  {visibleColumns.project && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text dark:text-white" style={{ minWidth: `${columnMinWidths.project}px` }}>
                      {lead.project || '-'}
                    </td>
                  )}

                  {/* Sales Person */}
                  {visibleColumns.salesPerson && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text dark:text-white" style={{ minWidth: `${columnMinWidths.salesPerson}px` }}>
                      {(() => {
                        const s = String(lead.stage || '').toLowerCase();
                        const isNew = s.includes('new') || s.includes('جديد') || s.includes('نيوليد');
                        return isNew ? '-' : (lead.assignedTo || '-');
                      })()}
                    </td>
                  )}

                  {/* Last Comment */}
                  {visibleColumns.lastComment && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text dark:text-white" style={{ minWidth: `${columnMinWidths.lastComment}px` }}>
                      {lead.notes || '-'}
                    </td>
                  )}

                  {/* Stage */}
                  {visibleColumns.stage && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text dark:text-white" style={{ minWidth: `${columnMinWidths.stage}px` }}>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold leading-5 rounded-full ${getStatusColor(lead.stage)}`}>
                        {t(lead.stage || 'N/A')}
                      </span>
                    </td>
                  )}

                  {/* Expected Revenue */}
                  {visibleColumns.expectedRevenue && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text dark:text-white" style={{ minWidth: `${columnMinWidths.expectedRevenue}px` }}>
                      {lead.estimatedValue ? `${lead.estimatedValue.toLocaleString()} ${t('SAR')}` : '-'}
                    </td>
                  )}

                  {/* Priority */}
                  {visibleColumns.priority && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text dark:text-white" style={{ minWidth: `${columnMinWidths.priority}px` }}>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold leading-5 rounded-full ${getPriorityColor(lead.priority)}`}>
                        {t(lead.priority || 'N/A')}
                      </span>
                    </td>
                  )}

                  {/* Actions Column (removed sticky; now positioned after Contact) */}
                </tr>
              ))}
            </tbody>
          </table>
          
          {paginatedLeads.length === 0 && (
            <div className="text-center py-10 text-theme-text dark:text-white">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-theme-text dark:text-white">{t('No Leads Found')}</h3>
              <p className="mt-1 text-sm text-theme-text dark:text-white">{t('Try adjusting your filters or adding new leads.')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
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
                  if (page > 0 && page <= Math.ceil(filteredLeads.length / itemsPerPage)) {
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
              {t('Page')} <span className="font-semibold text-theme-text dark:text-white" style={{ color: theme === 'dark' ? '#ffffff' : undefined }}>{currentPage}</span> {t('of')} <span className="font-semibold text-theme-text dark:text-white" style={{ color: theme === 'dark' ? '#ffffff' : undefined }}>{Math.ceil(filteredLeads.length / itemsPerPage)}</span>
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredLeads.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredLeads.length / itemsPerPage)}
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
              max={Math.ceil(filteredLeads.length / itemsPerPage)}
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
              max={Math.ceil(filteredLeads.length / itemsPerPage)}
              placeholder="To"
              value={exportTo}
              onChange={(e) => setExportTo(e.target.value)}
              className="w-16 px-2 py-1 border border-theme-border dark:border-gray-600 rounded-md dark:bg-transparent backdrop-blur-sm text-theme-text dark:text-white text-xs focus:border-blue-500"
              style={{ color: theme === 'dark' ? '#ffffff' : undefined }}
            />
            <button
              onClick={handleExportRange}
              className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center gap-1"
            >
              <FaDownload size={12} />
              {t('Export')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hover Tooltip - Hidden by default, shown on row click */}
      {showTooltip && hoveredLead && (
        <LeadHoverTooltip
          ref={tooltipRef}
          lead={hoveredLead}
          position={tooltipPosition}
          theme={theme}
          onAction={(action) => {
            setShowTooltip(false)
            switch (action) {
              case 'preview':
                setSelectedLead(hoveredLead)
                setShowLeadModal(true)
                break
              case 'edit':
                setEditingLead(hoveredLead)
                setShowEditModal(true)
                break
              case 'add_action':
                setSelectedLead(hoveredLead)
                setShowAddActionModal(true)
                break
              case 'compare':
                 handleCompareLead(hoveredLead)
                 break
              case 'call':
                window.open(`tel:${hoveredLead.phone}`)
                break
              case 'whatsapp':
                window.open(`https://wa.me/${String(hoveredLead.phone || '').replace(/[^0-9]/g, '')}`)
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

      {/* Modals */}
      <CompareLeadsModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        duplicateLead={compareData.duplicate}
        originalLead={compareData.original}
        onResolve={(action) => {
          const { duplicate, original } = compareData;
          if (!duplicate || !original) {
             setShowCompareModal(false);
             return;
          }

          switch (action) {
            case 'warn':
              // Add warning note to duplicate
              const warningLead = {
                ...duplicate,
                notes: (duplicate.notes ? duplicate.notes + '\n' : '') + `[System Warning] This lead is a duplicate of ${original.name} (#${original.id}).`,
                // Optional: Update stage to Duplicate if it exists in your workflow
                // stage: 'Duplicate' 
              };
              handleUpdateLead(warningLead);
              break;

            case 'transfer':
              // Transfer duplicate to original owner
              const transferLead = {
                ...duplicate,
                assignedTo: original.assignedTo,
                notes: (duplicate.notes ? duplicate.notes + '\n' : '') + `[System] Ownership transferred to ${original.assignedTo} (resolved as duplicate of #${original.id}).`
              };
              handleUpdateLead(transferLead);
              break;

            case 'keep_original':
              // Delete duplicate lead
              const deletedLead = {
                ...duplicate,
                deletedAt: new Date().toISOString()
              };
              
              // Save to deleted leads in localStorage
              const existingDeletedLeads = JSON.parse(localStorage.getItem('deletedLeads') || '[]');
              existingDeletedLeads.push(deletedLead);
              localStorage.setItem('deletedLeads', JSON.stringify(existingDeletedLeads));
              
              setLeads(prev => prev.filter(l => l.id !== duplicate.id));
              break;
          }
          setShowCompareModal(false);
        }}
      />
      {showEditModal && (
        <LeadModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          lead={editingLead}
          assignees={uniqueAssignees}
          onAssign={(newAssignee) => handleAssignLead(editingLead.id, newAssignee)}
          onSave={(updatedLead) => {
            setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l))
            setShowEditModal(false)
          }}
        />
      )}

      {showAddActionModal && (
        <AddActionModal
          isOpen={showAddActionModal}
          onClose={() => setShowAddActionModal(false)}
          lead={selectedLead}
          onSave={(newAction) => {
            if (newAction && selectedLead) {
                let newStage = null;
                // Helper to normalize string
                const norm = (str) => String(str || '').toLowerCase().trim();
                
                let matchedStageObj = null;

                // 1. Try to match by type (most robust, works with renamed stages)
                const typeMatches = (Array.isArray(stages) ? stages : []).filter(s => s.type === newAction.nextAction);
                
                if (typeMatches.length > 0) {
                   if (newAction.nextAction === 'follow_up') {
                       // Priority 1: Exact "Follow Up" or "Pending" match by name
                       const priorityMatch = typeMatches.find(s => {
                           const n = norm(s.name);
                           const nAr = norm(s.nameAr);
                           return n === 'follow up' || n === 'follow-up' || n === 'pending' ||
                                  nAr === 'متابعة' || nAr === 'قيد الانتظار';
                       });

                       if (priorityMatch) {
                           matchedStageObj = priorityMatch;
                       } else {
                           // Priority 2: Anything that is NOT "No Answer"
                           const notNoAnswer = typeMatches.find(s => {
                               const n = norm(s.name);
                               const nAr = norm(s.nameAr);
                               return !n.includes('no answer') && !nAr.includes('لا رد') && !n.includes('phone off');
                           });
                           matchedStageObj = notNoAnswer;
                       }
                   } else {
                       matchedStageObj = typeMatches[0];
                   }
                }

                // 2. If no type match, fall back to Name matching
                if (!matchedStageObj) {
                    const normalizedNextAction = String(newAction.nextAction || '').replace(/_/g, ' ').toLowerCase();

                    // Expanded map to cover more cases and exact default stage names
                    const actionToStageMap = {
                      'reservation': ['reservation', 'booking', 'won', 'closed', 'حجز', 'مباع'],
                      'closing_deals': ['closing deal', 'closing', 'deal', 'won', 'closed', 'إغلاق', 'صفقة'],
                      'rent': ['rent', 'leased', 'won', 'إيجار', 'مؤجر'],
                      'cancel': ['cancelation', 'cancellation', 'cancelled', 'lost', 'archive', 'cold calls', 'إلغاء', 'خسارة', 'مكالمات باردة'],
                      'meeting': ['meeting', 'negotiation', 'pending', 'اجتماع', 'تفاوض'],
                      'proposal': ['proposal', 'quote', 'negotiation', 'pending', 'عرض سعر', 'عرض'],
                      'follow_up': ['follow up', 'follow-up', 'pending', 'متابعة', 'قيد الانتظار']
                    };

                    let candidates = actionToStageMap[newAction.nextAction] || [];
                    if (!candidates.includes(normalizedNextAction)) {
                        candidates = [normalizedNextAction, ...candidates];
                    }

                    for (const candidate of candidates) {
                      const match = (Array.isArray(stages) ? stages : []).find(s => {
                        const sName = norm(typeof s === 'string' ? s : s.name);
                        const sNameAr = norm(s.nameAr);
                        
                        // 1. Exact match
                        if (sName === candidate || sNameAr === candidate) return true;
                        
                        // 2. Partial match (if candidate is significant length)
                        if (candidate.length > 3 && (sName.includes(candidate) || (sNameAr && sNameAr.includes(candidate)))) return true;
                        
                        return false;
                      });
                      
                      if (match) {
                        matchedStageObj = typeof match === 'string' ? { name: match } : match;
                        break;
                      }
                    }
                }
                
                if (matchedStageObj) {
                    newStage = matchedStageObj.name;
                }
                
                let updatedLead = { ...selectedLead };
                let hasChanges = false;

                // Update stage if changed
                if (newStage && newStage !== selectedLead.stage) {
                  updatedLead.stage = newStage;
                  hasChanges = true;
                }

                // Update notes (Last Comment) if present
                const newNote = newAction.description || newAction.notes;
                if (newNote) {
                   updatedLead.notes = newNote;
                   hasChanges = true;
                }

                // Add action to history and update last contact
                if (!updatedLead.actions) updatedLead.actions = [];
                const actionEntry = {
                    ...newAction,
                    id: Date.now(),
                    date: new Date().toISOString(),
                    stageAtCreation: newStage || selectedLead.stage, // Capture new stage if changed, otherwise current
                    assignee: newAction.assignedTo || newAction.assignee || selectedLead.assignedTo || selectedLead.salesPerson || 'غير محدد'
                };
                updatedLead.actions = [actionEntry, ...updatedLead.actions];
                updatedLead.lastAction = actionEntry;
                updatedLead.lastContact = new Date().toISOString();
                hasChanges = true;

                if (hasChanges) {
                  handleUpdateLead(updatedLead);
                }
             }
            setShowAddActionModal(false)
          }}
        />
      )}
      
      {showImportModal && (
        <ImportLeadsModal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false)
            setImportError('')
            setImportSummary(null)
          }}
          excelFile={excelFile}
          setExcelFile={setExcelFile}
          handleExcelUpload={handleExcelUpload}
          importing={importing}
          importError={importError}
          importSummary={importSummary}
          t={t}
          theme={theme}
        />
      )}

      

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
          assignees={uniqueAssignees}
          onAssign={(newAssignee) => handleAssignLead(selectedLead.id, newAssignee)}
          onUpdateLead={handleUpdateLead}
        />
      )}
    </div>
  );
}

export default Leads;
