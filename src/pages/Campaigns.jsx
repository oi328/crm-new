import React, { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaPlus, FaFilter, FaSearch, FaEdit, FaTrash, FaTimes, FaChevronLeft, FaChevronRight, FaChevronDown } from 'react-icons/fa'
import SearchableSelect from '../components/SearchableSelect'

const MOCK_CAMPAIGNS = [
  { id: 1, name: 'Summer Sale 2024', source: 'Meta', budgetType: 'daily', totalBudget: 50, startDate: '2024-06-01', endDate: '2024-06-30', status: 'Active', landingPage: 'lp1' },
  { id: 2, name: 'Back to School', source: 'Google', budgetType: 'lifetime', totalBudget: 1500, startDate: '2024-08-15', endDate: '2024-09-15', status: 'Scheduled', landingPage: 'lp2' },
  { id: 3, name: 'Winter Clearance', source: 'TikTok', budgetType: 'daily', totalBudget: 75, startDate: '2024-12-01', endDate: '2024-12-31', status: 'Ended', landingPage: 'lp3' },
  { id: 4, name: 'Brand Awareness', source: 'LinkedIn', budgetType: 'lifetime', totalBudget: 5000, startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active', landingPage: 'lp1' },
  { id: 5, name: 'Lead Gen - eBook', source: 'Meta', budgetType: 'daily', totalBudget: 30, startDate: '2024-03-01', endDate: '2024-04-01', status: 'Paused', landingPage: 'lp2' },
  { id: 6, name: 'Black Friday 2024', source: 'Meta', budgetType: 'lifetime', totalBudget: 2000, startDate: '2024-11-20', endDate: '2024-11-30', status: 'Scheduled', landingPage: 'lp1' },
  { id: 7, name: 'Retargeting Campaign', source: 'Google', budgetType: 'daily', totalBudget: 45, startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active', landingPage: 'lp3' },
  { id: 8, name: 'App Install Push', source: 'TikTok', budgetType: 'lifetime', totalBudget: 3000, startDate: '2024-05-01', endDate: '2024-06-01', status: 'Ended', landingPage: 'lp2' },
  { id: 9, name: 'Webinar Signups', source: 'LinkedIn', budgetType: 'daily', totalBudget: 100, startDate: '2024-09-01', endDate: '2024-09-15', status: 'Scheduled', landingPage: 'lp3' },
  { id: 10, name: 'Holiday Special', source: 'Meta', budgetType: 'lifetime', totalBudget: 1200, startDate: '2024-12-15', endDate: '2024-12-31', status: 'Scheduled', landingPage: 'lp1' },
  { id: 11, name: 'Spring Collection', source: 'Pinterest', budgetType: 'lifetime', totalBudget: 800, startDate: '2025-03-01', endDate: '2025-03-31', status: 'Scheduled', landingPage: 'lp1' },
  { id: 12, name: 'Influencer Collab', source: 'Instagram', budgetType: 'daily', totalBudget: 150, startDate: '2024-07-01', endDate: '2024-07-15', status: 'Ended', landingPage: 'lp2' },
  { id: 13, name: 'Q4 Push', source: 'Google', budgetType: 'daily', totalBudget: 200, startDate: '2024-10-01', endDate: '2024-12-31', status: 'Active', landingPage: 'lp3' },
  { id: 14, name: 'New Feature Promo', source: 'Twitter', budgetType: 'lifetime', totalBudget: 500, startDate: '2024-02-01', endDate: '2024-02-14', status: 'Ended', landingPage: 'lp1' },
  { id: 15, name: 'Loyalty Program', source: 'Email', budgetType: 'daily', totalBudget: 20, startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active', landingPage: 'lp2' }
]

const MOCK_LEADS = [
  // Summer Sale 2024 (id: 1) - 10 leads, 2 closed
  ...Array(8).fill({ campaign: 'Summer Sale 2024', stage: 'new' }),
  ...Array(2).fill({ campaign: 'Summer Sale 2024', stage: 'closed' }),
  // Back to School (id: 2) - 25 leads, 5 closed
  ...Array(20).fill({ campaign: 'Back to School', stage: 'contacted' }),
  ...Array(5).fill({ campaign: 'Back to School', stage: 'closed' }),
  // Winter Clearance (id: 3) - 10 leads, 0 closed
  ...Array(10).fill({ campaign: 'Winter Clearance', stage: 'new' }),
  // Brand Awareness (id: 4) - 20 leads, 0 closed
  ...Array(20).fill({ campaign: 'Brand Awareness', stage: 'contacted' }),
  // Lead Gen - eBook (id: 5) - 15 leads, 5 closed
  ...Array(10).fill({ campaign: 'Lead Gen - eBook', stage: 'qualified' }),
  ...Array(5).fill({ campaign: 'Lead Gen - eBook', stage: 'closed' }),
  // Black Friday 2024 (id: 6) - 50 leads, 10 closed
  ...Array(40).fill({ campaign: 'Black Friday 2024', stage: 'qualified' }),
  ...Array(10).fill({ campaign: 'Black Friday 2024', stage: 'closed' }),
  // Retargeting Campaign (id: 7) - 5 leads, 1 closed
  ...Array(4).fill({ campaign: 'Retargeting Campaign', stage: 'new' }),
  ...Array(1).fill({ campaign: 'Retargeting Campaign', stage: 'closed' }),
  // App Install Push (id: 8) - 100 leads, 20 closed
  ...Array(80).fill({ campaign: 'App Install Push', stage: 'contacted' }),
  ...Array(20).fill({ campaign: 'App Install Push', stage: 'closed' }),
  // Webinar Signups (id: 9) - 30 leads, 15 closed
  ...Array(15).fill({ campaign: 'Webinar Signups', stage: 'qualified' }),
  ...Array(15).fill({ campaign: 'Webinar Signups', stage: 'closed' }),
  // Holiday Special (id: 10) - 15 leads, 2 closed
  ...Array(13).fill({ campaign: 'Holiday Special', stage: 'new' }),
  ...Array(2).fill({ campaign: 'Holiday Special', stage: 'closed' }),
  // Influencer Collab (id: 12) - 12 leads, 1 closed
  ...Array(11).fill({ campaign: 'Influencer Collab', stage: 'contacted' }),
  ...Array(1).fill({ campaign: 'Influencer Collab', stage: 'closed' }),
  // Q4 Push (id: 13) - 8 leads, 0 closed
  ...Array(8).fill({ campaign: 'Q4 Push', stage: 'new' }),
  // New Feature Promo (id: 14) - 5 leads, 0 closed
  ...Array(5).fill({ campaign: 'New Feature Promo', stage: 'contacted' }),
  // Loyalty Program (id: 15) - 40 leads, 10 closed
  ...Array(30).fill({ campaign: 'Loyalty Program', stage: 'qualified' }),
  ...Array(10).fill({ campaign: 'Loyalty Program', stage: 'closed' })
]

export default function Campaigns() {
  const { i18n } = useTranslation()
  const isArabic = (i18n?.language || '').toLowerCase().startsWith('ar')

  const [campaigns, setCampaigns] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({ 
    search: '', 
    source: '',
    status: '',
    budgetType: '',
    startDateFrom: '',
    startDateTo: '',
    endDateFrom: '',
    endDateTo: '',
    budgetMin: '',
    budgetMax: '',
    cplMin: '',
    cplMax: '',
    cpaMin: '',
    cpaMax: '',
    convMin: '',
    convMax: '',
    cpdMin: '',
    cpdMax: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [showAllFilters, setShowAllFilters] = useState(false)

  const [form, setForm] = useState({
    id: null,
    name: '',
    source: '',
    budgetType: 'daily',
    totalBudget: '',
    startDate: '',
    endDate: '',
    landingPage: '',
    notes: '',
    status: 'Active'
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [landingPages, setLandingPages] = useState([])
  const [leadsData, setLeadsData] = useState([])

  // Load Data
  useEffect(() => {
    try {
      const raw = localStorage.getItem('marketingCampaigns')
      let loaded = raw ? JSON.parse(raw) : []

      // Force update if we have more mock data than loaded data (indicating stale data)
      if (!loaded.length || loaded.length < MOCK_CAMPAIGNS.length) {
        setCampaigns(MOCK_CAMPAIGNS)
        localStorage.setItem('marketingCampaigns', JSON.stringify(MOCK_CAMPAIGNS))
        
        // Also reset leads to match the full mock set
        localStorage.setItem('leadsData', JSON.stringify(MOCK_LEADS))
        window.dispatchEvent(new Event('leadsDataUpdated'))
      } else {
        setCampaigns(loaded)

        // Ensure leads exist
        if (!localStorage.getItem('leadsData')) {
          localStorage.setItem('leadsData', JSON.stringify(MOCK_LEADS))
          window.dispatchEvent(new Event('leadsDataUpdated'))
        }
      }
    } catch {
      setCampaigns(MOCK_CAMPAIGNS)
    }

    // Load Landing Pages
    try {
      const rawLP = localStorage.getItem('marketingLandingPages')
      if (rawLP) {
        setLandingPages(JSON.parse(rawLP))
      } else {
        setLandingPages([
          { id: 'lp1', name: 'LP - Registration' },
          { id: 'lp2', name: 'LP - Pricing' },
          { id: 'lp3', name: 'LP - Webinar' }
        ])
      }
    } catch {
      setLandingPages([])
    }
  }, [])

  // Sync leads data from localStorage for CPL/CPA/Conversion calculations
  useEffect(() => {
    const syncLeads = () => {
      try {
        const arr = JSON.parse(localStorage.getItem('leadsData') || '[]')
        setLeadsData(Array.isArray(arr) ? arr : [])
      } catch {
        setLeadsData([])
      }
    }
    syncLeads()
    const onStorage = (e) => {
      if (!e || e.key === 'leadsData') syncLeads()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('leadsDataUpdated', syncLeads)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('leadsDataUpdated', syncLeads)
    }
  }, [])

  const normalize = (s) => String(s || '').toLowerCase().trim()
  const getDays = (start, end) => {
    if (!start || !end) return 0
    const s = new Date(start)
    const e = new Date(end)
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0
    const diffMs = e.getTime() - s.getTime()
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1
    return Math.max(1, days)
  }
  const getPlannedSpend = (c) => {
    const total = Number(c.totalBudget) || 0
    if (c.budgetType === 'daily') {
      const d = getDays(c.startDate, c.endDate)
      return d > 0 ? total * d : total
    }
    return total
  }
  const getCostPerDay = (c) => {
    const total = Number(c.totalBudget) || 0
    if (c.budgetType === 'daily') return total
    const d = getDays(c.startDate, c.endDate)
    return d > 0 ? (total / d) : 0
  }
  const getCampaignLeadsStats = (campaignName) => {
    const leads = leadsData.filter(l => normalize(l.campaign) === normalize(campaignName))
    const totalLeads = leads.length
    const closed = leads.filter(l => normalize(l.stage) === 'closed').length
    return { totalLeads, closed }
  }

  // Filtering
  const filteredCampaigns = useMemo(() => {
    const toNum = (v) => {
      if (v === '' || v === null || v === undefined) return null
      const n = Number(v)
      return isFinite(n) ? n : null
    }
    const toMs = (d) => {
      const t = new Date(d).getTime()
      return isFinite(t) ? t : null
    }
    const sFrom = toMs(filters.startDateFrom)
    const sTo = toMs(filters.startDateTo)
    const eFrom = toMs(filters.endDateFrom)
    const eTo = toMs(filters.endDateTo)
    const bMin = toNum(filters.budgetMin)
    const bMax = toNum(filters.budgetMax)
    const cplMin = toNum(filters.cplMin)
    const cplMax = toNum(filters.cplMax)
    const cpaMin = toNum(filters.cpaMin)
    const cpaMax = toNum(filters.cpaMax)
    const convMin = toNum(filters.convMin)
    const convMax = toNum(filters.convMax)
    const cpdMin = toNum(filters.cpdMin)
    const cpdMax = toNum(filters.cpdMax)
    return campaigns.filter(c => {
      if (filters.search && !c.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.source && c.source !== filters.source) return false
      if (filters.status && c.status && c.status !== filters.status) return false
      const sMs = toMs(c.startDate)
      const eMs = toMs(c.endDate)
      if (sFrom && (!sMs || sMs < sFrom)) return false
      if (sTo && (!sMs || sMs > sTo)) return false
      if (eFrom && (!eMs || eMs < eFrom)) return false
      if (eTo && (!eMs || eMs > eTo)) return false
      const budget = Number(c.totalBudget) || 0
      if (bMin != null && budget < bMin) return false
      if (bMax != null && budget > bMax) return false
      const spend = getPlannedSpend(c)
      const { totalLeads, closed } = getCampaignLeadsStats(c.name)
      const cpl = totalLeads > 0 ? (spend / totalLeads) : 0
      const cpa = closed > 0 ? (spend / closed) : 0
      const conv = totalLeads > 0 ? (closed / totalLeads) * 100 : 0
      const cpd = getCostPerDay(c)
      if (cplMin != null && cpl < cplMin) return false
      if (cplMax != null && cpl > cplMax) return false
      if (cpaMin != null && cpa < cpaMin) return false
      if (cpaMax != null && cpa > cpaMax) return false
      if (convMin != null && conv < convMin) return false
      if (convMax != null && conv > convMax) return false
      if (cpdMin != null && cpd < cpdMin) return false
      if (cpdMax != null && cpd > cpdMax) return false
      return true
    })
  }, [campaigns, filters, leadsData])

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage)
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCampaigns.slice(start, start + itemsPerPage)
  }, [filteredCampaigns, currentPage])

  function clearFilters() {
    setFilters({ 
      search: '', 
      
      source: '',
      status:'',
      startDateFrom: '',
      startDateTo: '',
      endDateFrom: '',
      endDateTo: '',
      budgetMin: '',
      budgetMax: '',
      cplMin: '',
      cplMax: '',
      cpaMin: '',
      cpaMax: '',
      convMin: '',
      convMax: '',
      cpdMin: '',
      cpdMax: ''
    })
    setCurrentPage(1)
  }

  function handleEdit(campaign) {
    setForm(campaign)
    setShowForm(true)
    setMessage(null)
  }

  function handleDelete(id) {
    if (window.confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) {
      const updated = campaigns.filter(c => c.id !== id)
      setCampaigns(updated)
      localStorage.setItem('marketingCampaigns', JSON.stringify(updated))
    }
  }

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.source) {
      setMessage({ type: 'error', text: isArabic ? 'من فضلك أدخل الاسم والمنصة' : 'Please enter name and platform' })
      return
    }

    setSaving(true)
    try {
      let updatedCampaigns
      if (form.id) {
        updatedCampaigns = campaigns.map(c => c.id === form.id ? { ...form } : c)
      } else {
        const newCampaign = { ...form, id: Date.now() }
        updatedCampaigns = [newCampaign, ...campaigns]
        setCurrentPage(1)
      }
      
      setCampaigns(updatedCampaigns)
      localStorage.setItem('marketingCampaigns', JSON.stringify(updatedCampaigns))
      
      setMessage({ type: 'success', text: isArabic ? 'تم حفظ الحملة بنجاح' : 'Campaign saved successfully' })
      setTimeout(() => {
        setShowForm(false)
        setForm({ name: '', source: '', budgetType: 'daily', totalBudget: '', startDate: '', endDate: '', landingPage: '', notes: '', status: 'Active' })
        setMessage(null)
      }, 1000)
    } catch (err) {
      setMessage({ type: 'error', text: isArabic ? 'حدث خطأ أثناء الحفظ' : 'Error while saving' })
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <div className="space-y-6 pt-4 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative inline-block">
          <h1 className="text-2xl font-semibold">{isArabic ? 'الحملات' : 'Campaigns'}</h1>
          <span className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent w-full bottom-[-4px]"></span>
        </div>
        
        <button 
          className="btn btn-sm bg-green-600 hover:bg-blue-700 text-white border-none gap-2 flex items-center" 
          onClick={() => {
            setForm({ id: null, name: '', source: '', budgetType: 'daily', totalBudget: '', startDate: '', endDate: '', landingPage: '', notes: '', status: 'Active' })
            setShowForm(true)
            setMessage(null)
          }}
        >
          <FaPlus /> {isArabic ? 'إضافة حملة' : 'Create Campaign'}
        </button>
      </div>

      {/* Filter Section */}
      <div className="card p-4 sm:p-6 bg-transparent rounded-2xl border border-white/10" style={{ backgroundColor: 'transparent' }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FaFilter className="text-blue-500" /> {isArabic ? 'تصفية' : 'Filter'}
          </h2>  
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAllFilters(prev => !prev)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                {showAllFilters ? (isArabic ? 'إخفاء' : 'Hide') : (isArabic ? 'عرض الكل' : 'Show All')} 
                <FaChevronDown size={14} className={`transform transition-transform ${showAllFilters ? 'rotate-180' : ''}`} />
              </button>
            <button onClick={clearFilters} className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              {isArabic ? 'إعادة تعيين' : 'Reset'}
            </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1">
              <FaSearch className="text-blue-500" size={10} /> {isArabic ? 'بحث' : 'Search'}
            </label>
            <input 
              className="input w-full" 
              value={filters.search} 
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))} 
              placeholder={isArabic ? 'اسم الحملة...' : 'Campaign Name...'} 
            />
          </div>

          {/* Source */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'المصدر' : 'Source'}</label>
            <SearchableSelect
              value={filters.source}
              onChange={(val) => setFilters(prev => ({ ...prev, source: val }))}
              options={[
                '',
                ...Array.from(new Set(campaigns.map(c => c.source).filter(Boolean)))
              ]}
              isRTL={isArabic}
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'الحالة' : 'Status'}</label>
            <select 
              className="input w-full" 
              value={filters.status} 
              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">{isArabic ? 'الكل' : 'All'}</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Ended">Ended</option>
            </select>
          </div>

          {/* Budget Type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'نوع الميزانية' : 'Budget Type'}</label>
            <select 
              className="input w-full" 
              value={filters.budgetType} 
              onChange={e => setFilters(prev => ({ ...prev, budgetType: e.target.value }))}
            >
              <option value="">{isArabic ? 'الكل' : 'All'}</option>
              <option value="daily">{isArabic ? 'يومي' : 'Daily'}</option>
              <option value="lifetime">{isArabic ? 'إجمالي' : 'Lifetime'}</option>
            </select>
          </div>
        </div>
        <div className={`mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300 overflow-hidden ${showAllFilters ? 'max-h-[1000px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'تاريخ البداية من' : 'Start Date From'}</label>
            <input type="date" className="input w-full" value={filters.startDateFrom} onChange={e => setFilters(p => ({ ...p, startDateFrom: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'تاريخ البداية إلى' : 'Start Date To'}</label>
            <input type="date" className="input w-full" value={filters.startDateTo} onChange={e => setFilters(p => ({ ...p, startDateTo: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'تاريخ الانتهاء من' : 'End Date From'}</label>
            <input type="date" className="input w-full" value={filters.endDateFrom} onChange={e => setFilters(p => ({ ...p, endDateFrom: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'تاريخ الانتهاء إلى' : 'End Date To'}</label>
            <input type="date" className="input w-full" value={filters.endDateTo} onChange={e => setFilters(p => ({ ...p, endDateTo: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'الميزانية من' : 'Budget Min'}</label>
            <input type="number" className="input w-full" value={filters.budgetMin} onChange={e => setFilters(p => ({ ...p, budgetMin: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'الميزانية إلى' : 'Budget Max'}</label>
            <input type="number" className="input w-full" value={filters.budgetMax} onChange={e => setFilters(p => ({ ...p, budgetMax: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">CPL Min</label>
            <input type="number" className="input w-full" value={filters.cplMin} onChange={e => setFilters(p => ({ ...p, cplMin: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">CPL Max</label>
            <input type="number" className="input w-full" value={filters.cplMax} onChange={e => setFilters(p => ({ ...p, cplMax: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">CPA Min</label>
            <input type="number" className="input w-full" value={filters.cpaMin} onChange={e => setFilters(p => ({ ...p, cpaMin: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">CPA Max</label>
            <input type="number" className="input w-full" value={filters.cpaMax} onChange={e => setFilters(p => ({ ...p, cpaMax: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'معدل التحويل من' : 'Conv. Rate Min (%)'}</label>
            <input type="number" className="input w-full" value={filters.convMin} onChange={e => setFilters(p => ({ ...p, convMin: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'معدل التحويل إلى' : 'Conv. Rate Max (%)'}</label>
            <input type="number" className="input w-full" value={filters.convMax} onChange={e => setFilters(p => ({ ...p, convMax: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'التكلفة اليومية من' : 'Cost/Day Min'}</label>
            <input type="number" className="input w-full" value={filters.cpdMin} onChange={e => setFilters(p => ({ ...p, cpdMin: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'التكلفة اليومية إلى' : 'Cost/Day Max'}</label>
            <input type="number" className="input w-full" value={filters.cpdMax} onChange={e => setFilters(p => ({ ...p, cpdMax: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
        <h2 className="text-xl font-medium mb-4">{isArabic ? 'قائمة الحملات' : 'Campaigns List'}</h2>
        
        {filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <p className="text-sm text-[var(--muted-text)]">{isArabic ? 'لا توجد حملات مطابقة للبحث' : 'No campaigns match your search'}</p>
            <button 
              onClick={() => {
                if(window.confirm(isArabic ? 'هل تريد استعادة البيانات التجريبية؟ سيتم حذف أي تغييرات.' : 'Reset to sample data? This will clear changes.')) {
                   localStorage.removeItem('marketingCampaigns')
                   localStorage.removeItem('leadsData')
                   window.location.reload()
                }
              }}
              className="text-xs text-blue-500 hover:text-blue-400 underline opacity-80 hover:opacity-100 transition-opacity"
            >
              {isArabic ? 'استعادة البيانات الافتراضية' : 'Restore Default Data'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 mb-4">
              {paginatedCampaigns.map(campaign => (
                <div key={campaign.id} className="card glass-card p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div>
                      <h4 className="font-semibold text-sm">{campaign.name}</h4>
                      <p className="text-xs text-[var(--muted-text)]">{campaign.source || '-'}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        campaign.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        campaign.status === 'Paused' ? 'bg-yellow-500/20 text-yellow-400' :
                        campaign.status === 'Ended' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {campaign.status || 'Active'}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(campaign)} className="text-blue-400 hover:text-blue-300 transition-colors p-1">
                          <FaEdit size={14} />
                        </button>
                        <button onClick={() => handleDelete(campaign.id)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Grid Stats */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-text)] text-xs">{isArabic ? 'تاريخ البداية' : 'Start Date'}</span>
                      <span className="text-xs">{campaign.startDate || '-'}</span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-text)] text-xs">{isArabic ? 'تاريخ الانتهاء' : 'End Date'}</span>
                      <span className="text-xs">{campaign.endDate || '-'}</span>
                    </div>

                    <div className="flex justify-between items-center col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">
                       <span className="text-[var(--muted-text)] text-xs">{isArabic ? 'الميزانية' : 'Budget'}</span>
                       <div className="flex flex-col text-right">
                          <span className="font-semibold font-mono text-sm">{(Number(campaign.totalBudget) || 0).toLocaleString()}</span>
                          <span className="text-[10px] opacity-60 capitalize">{campaign.budgetType}</span>
                       </div>
                    </div>

                     {(() => {
                      const spend = getPlannedSpend(campaign)
                      const { totalLeads, closed } = getCampaignLeadsStats(campaign.name)
                      const cpl = totalLeads > 0 ? (spend / totalLeads) : 0
                      const cpa = closed > 0 ? (spend / closed) : 0
                      const conv = totalLeads > 0 ? (closed / totalLeads) * 100 : 0
                      const cpd = getCostPerDay(campaign)
                      return (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--muted-text)] text-xs">{isArabic ? 'CPL' : 'CPL'}</span>
                            <span className="font-mono font-medium">{cpl ? `$${cpl.toFixed(2)}` : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--muted-text)] text-xs">{isArabic ? 'CPA' : 'CPA'}</span>
                            <span className="font-mono font-medium">{cpa ? `$${cpa.toFixed(2)}` : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--muted-text)] text-xs">{isArabic ? 'معدل التحويل' : 'Conv. Rate'}</span>
                            <span className="font-medium">{conv ? `${conv.toFixed(1)}%` : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--muted-text)] text-xs">{isArabic ? 'التكلفة اليومية' : 'Cost/Day'}</span>
                            <span className="font-mono font-medium">{cpd ? `$${cpd.toFixed(2)}` : '-'}</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              ))}
            </div>

            <table className="hidden md:table w-full text-sm text-left rtl:text-right">
              <thead className="text-xs text-[var(--muted-text)] uppercase bg-gray-50/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">{isArabic ? 'اسم الحملة' : 'Campaign Name'}</th>
                  <th className="px-4 py-3">{isArabic ? 'المصدر' : 'Source'}</th>
                  <th className="px-4 py-3">{isArabic ? 'تاريخ البداية' : 'Start Date'}</th>
                  <th className="px-4 py-3">{isArabic ? 'تاريخ الانتهاء' : 'End Date'}</th>
                  <th className="px-4 py-3">{isArabic ? 'الميزانية' : 'Budget'}</th>
                  <th className="px-4 py-3">{isArabic ? 'CPL' : 'CPL'}</th>
                  <th className="px-4 py-3">{isArabic ? 'CPA' : 'CPA'}</th>
                  <th className="px-4 py-3">{isArabic ? 'معدل التحويل' : 'Conversion Rate'}</th>
                  <th className="px-4 py-3">{isArabic ? 'التكلفة اليومية' : 'Cost per Day'}</th>
                  <th className="px-4 py-3">{isArabic ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3 text-center">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCampaigns.map(campaign => (
                  <tr key={campaign.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium">{campaign.name}</td>
                    <td className="px-4 py-3 opacity-80">{campaign.source || '-'}</td>
                    <td className="px-4 py-3 text-xs">{campaign.startDate || '-'}</td>
                    <td className="px-4 py-3 text-xs">{campaign.endDate || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold">{(Number(campaign.totalBudget) || 0).toLocaleString()}</span>
                        <span className="opacity-60 capitalize">{campaign.budgetType}</span>
                      </div>
                    </td>
                    {(() => {
                      const spend = getPlannedSpend(campaign)
                      const { totalLeads, closed } = getCampaignLeadsStats(campaign.name)
                      const cpl = totalLeads > 0 ? (spend / totalLeads) : 0
                      const cpa = closed > 0 ? (spend / closed) : 0
                      const conv = totalLeads > 0 ? (closed / totalLeads) * 100 : 0
                      const cpd = getCostPerDay(campaign)
                      return (
                        <>
                          <td className="px-4 py-3 text-xs font-semibold">{cpl ? `$${cpl.toFixed(2)}` : '-'}</td>
                          <td className="px-4 py-3 text-xs font-semibold">{cpa ? `$${cpa.toFixed(2)}` : '-'}</td>
                          <td className="px-4 py-3 text-xs">{conv ? `${conv.toFixed(1)}%` : '-'}</td>
                          <td className="px-4 py-3 text-xs font-semibold">{cpd ? `$${cpd.toFixed(2)}` : '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              campaign.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                              campaign.status === 'Paused' ? 'bg-yellow-500/20 text-yellow-400' :
                              campaign.status === 'Ended' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {campaign.status || 'Active'}
                            </span>
                          </td>
                        </>
                      )
                    })()}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(campaign)} className="text-blue-400 hover:text-blue-300 transition-colors">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(campaign.id)} className="text-red-400 hover:text-red-300 transition-colors">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredCampaigns.length > 0 && (
          <div className="mt-2 flex items-center justify-between rounded-xl p-1.5 sm:p-2 glass-panel">
            <div className="text-[10px] sm:text-xs text-[var(--muted-text)]">
              {isArabic 
                ? `عرض ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filteredCampaigns.length)} من ${filteredCampaigns.length}` 
                : `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filteredCampaigns.length)} of ${filteredCampaigns.length}`}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1">
                <button
                  className="btn btn-ghost p-1 h-7 w-7 sm:btn-sm sm:h-8 sm:w-8"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  title={isArabic ? 'السابق' : 'Prev'}
                >
                  <FaChevronLeft className={isArabic ? 'scale-x-[-1]' : ''} size={12} />
                </button>
                <span className="text-xs sm:text-sm">{isArabic ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>
                <button
                  className="btn btn-ghost p-1 h-7 w-7 sm:btn-sm sm:h-8 sm:w-8"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  title={isArabic ? 'التالي' : 'Next'}
                >
                  <FaChevronRight className={isArabic ? 'scale-x-[-1]' : ''} size={12} />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-xs text-[var(--muted-text)]">{isArabic ? 'لكل صفحة:' : 'Per page:'}</span>
                <select
                  className="input w-20 sm:w-24 text-xs sm:text-sm h-7 sm:h-8 min-h-0"
                  value={itemsPerPage}
                  onChange={e => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="absolute inset-0 flex items-start justify-center p-6 md:p-6 overflow-y-auto">
            <div className="card p-4 sm:p-6 mt-4 w-[95vw] sm:w-[85vw] lg:w-[70vw] xl:max-w-4xl my-auto dark:bg-gray-800 dark:text-white shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">{isArabic ? (form.id ? 'تعديل حملة' : 'إضافة حملة') : (form.id ? 'Edit Campaign' : 'create Campaign')}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition-colors">
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={onSubmit} className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}>
                {/* Campaign Name */}
                <div>
                  <label className="block dark:!text-white text-sm mb-1">{isArabic ? 'اسم الحملة' : 'Campaign Name'}</label>
                  <input name="name" value={form.name} onChange={onChange} placeholder={isArabic ? 'اكتب اسم الحملة' : 'Enter campaign name'} className="input w-full dark:!text-white" />
                </div>

                {/* Platform */}
                <div>
                  <label className="block dark:!text-white text-sm mb-1">{isArabic ? 'المنصة' : 'source'}</label>
                  <select name="source" value={form.source} onChange={onChange} className="input w-full dark:!text-white">
                    <option value="">{isArabic ? 'اختر المنصة' : 'Select source'}</option>
                    <option value="Meta">Meta</option>
                    <option value="Google">Google</option>
                    <option value="TikTok">TikTok</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Manual">{isArabic ? 'يدوي' : 'Manual'}</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block dark:!text-white text-sm mb-1">{isArabic ? 'الحالة' : 'Status'}</label>
                  <select name="status" value={form.status} onChange={onChange} className="input w-full dark:!text-white">
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Ended">Ended</option>
                  </select>
                </div>

                {/* Budget Section Group */}
                <div className="p-4 rounded-xl bg-gray-50/5 border border-white/5 space-y-4">
                  {/* Budget Type */}
                  <div>
                    <label className="block dark:!text-white text-sm font-medium mb-2">{isArabic ? 'نوع الميزانية' : 'Budget Type'}</label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-900/50 p-1 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, budgetType: 'daily' }))}
                        className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                          form.budgetType === 'daily' 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {isArabic ? 'يومي' : 'Daily'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, budgetType: 'lifetime' }))}
                        className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                          form.budgetType === 'lifetime' 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {isArabic ? 'مدى الحياة' : 'Lifetime'}
                      </button>
                    </div>
                  </div>

                  {/* Total Budget */}
                  <div>
                    <label className="block dark:!text-white text-sm font-medium mb-2">
                      {isArabic ? 'الميزانية الإجمالية' : 'Total Budget'}
                      <span className="text-xs font-normal text-gray-500 mx-1">
                        ({form.budgetType === 'daily' ? (isArabic ? 'في اليوم' : 'per day') : (isArabic ? 'للحملة كاملة' : 'for entire campaign')})
                      </span>
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 ${isArabic ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                        <span className="text-gray-400 font-bold">$</span>
                      </div>
                      <input 
                        type="number" 
                        name="totalBudget" 
                        value={form.totalBudget} 
                        onChange={onChange} 
                        className={`input w-full dark:!text-white ${isArabic ? 'pr-8' : 'pl-8'} font-mono text-lg`} 
                        placeholder="0.00" 
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block dark:!text-white text-sm mb-1">{isArabic ? 'تاريخ البداية' : 'Start Date'}</label>
                    <input type="date" name="startDate" value={form.startDate} onChange={onChange} className="input w-full dark:!text-white" />
                  </div>
                  <div>
                    <label className="block dark:!text-white text-sm mb-1">{isArabic ? 'تاريخ الانتهاء' : 'End Date'}</label>
                    <input type="date" name="endDate" value={form.endDate} onChange={onChange} className="input w-full dark:!text-white" />
                  </div>
                </div>

                {/* Linked Landing Page */}
                <div>
                  <label className="block dark:!text-white text-sm mb-1">{isArabic ? 'ربط بصفحة هبوط' : 'Linked Landing Page'}</label>
                  <select name="landingPage" value={form.landingPage} onChange={onChange} className="input w-full dark:!text-white">
                    <option value="">{isArabic ? 'اختر صفحة هبوط' : 'Select Landing Page'}</option>
                    {landingPages.map(lp => (
                      <option key={lp.id} value={lp.id}>{lp.name || lp.title || `LP ${lp.id}`}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block dark:!text-white text-sm mb-1">{isArabic ? 'ملاحظات' : 'Notes'}</label>
                  <textarea name="notes" value={form.notes} onChange={onChange} className="input w-full dark:!text-white" rows={3} placeholder={isArabic ? 'ملاحظات إضافية' : 'Additional notes'} />
                </div>

                {/* Save */}
                <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'} gap-3 pt-4 border-t border-white/10 mt-6`}>
                   <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...') : (isArabic ? 'حفظ' : 'Save')}
                  </button>
                </div>

                {message && (
                  <div className={`text-sm mt-2 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message.text}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
