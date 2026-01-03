import { useMemo, useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../shared/context/ThemeProvider'
import SearchableSelect from '../components/SearchableSelect'
import { FaFilter, FaShareAlt, FaEllipsisV, FaPlus, FaMapMarkerAlt, FaBuilding, FaTimes, FaEye, FaEdit, FaTrash, FaUpload, FaSearch, FaChevronDown, FaChevronUp, FaImage, FaFilePdf, FaVideo, FaPaperclip, FaTags, FaCity, FaCloudDownloadAlt, FaChevronLeft, FaChevronRight, FaDownload, FaFileExcel } from 'react-icons/fa'
import * as XLSX from 'xlsx'
import { Bar } from 'react-chartjs-2'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const REAL_IMAGES = [
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0f?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582582494701-1b907a70549e?q=80&w=1200&auto=format&fit=crop'
]

function pickImage(seed) {
  const s = String(seed || '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return REAL_IMAGES[h % REAL_IMAGES.length]
}
import CreateProjectModal from '../components/CreateProjectModal'
import CreatePropertyModal from '../components/CreatePropertyModal'
import { useCompanySetup } from './settings/company-setup/store/CompanySetupContext.jsx'
import { projectsData } from '../data/projectsData'

export default function Projects() {
  const { i18n } = useTranslation()
  const isRTL = String(i18n.language || '').startsWith('ar')
  const { companySetup } = useCompanySetup()

  useEffect(() => {
    try { document.documentElement.dir = isRTL ? 'rtl' : 'ltr' } catch {}
  }, [isRTL])

  const [showAllFilters, setShowAllFilters] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [editProject, setEditProject] = useState(null)
  const [toasts, setToasts] = useState([])
  const [_importLogs, setImportLogs] = useState([])
  const [showCreateUnitModal, setShowCreateUnitModal] = useState(false)
  const [unitProject, setUnitProject] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    project: '',
    developer: '',
    city: '',
    status: '',
    country: '',
    category: '',
    paymentPlan: '',
    createdBy: '',
    createdDate: '',
    minPrice: '',
    maxPrice: '',
    minSpace: '',
    maxSpace: ''
  })

  const exportProjectsCsv = () => {
    const headers = ['Project', 'Developer', 'City', 'Status', 'Units', 'Min Price', 'Max Price']
    const csvContent = [
      headers.join(','),
      ...projects.map(p => [
        `"${p.name}"`,
        `"${p.developer}"`,
        `"${p.city}"`,
        `"${p.status}"`,
        p.units,
        p.minPrice,
        p.maxPrice
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'projects.csv'
    a.click(); URL.revokeObjectURL(url)
  }

  const exportProjectsPdf = async (items) => {
    try {
      const jsPDF = (await import('jspdf')).default
      const autoTable = await import('jspdf-autotable')
      const doc = new jsPDF()
      
      const tableColumn = ["Project", "Developer", "City", "Status", "Units", "Min Price", "Max Price"]
      const tableRows = []

      items.forEach(item => {
        const projectData = [
          item.name,
          item.developer,
          item.city,
          item.status,
          item.units,
          new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(item.minPrice || 0),
          new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(item.maxPrice || 0)
        ]
        tableRows.push(projectData)
      })

      doc.text("Projects List", 14, 15)
      autoTable.default(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      })
      doc.save("projects_list.pdf")
    } catch (error) {
      console.error("Export PDF Error:", error)
    }
  }


  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem('inventoryProjects')
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to load projects from storage', e)
    }
    return projectsData
  })

  useEffect(() => {
    localStorage.setItem('inventoryProjects', JSON.stringify(projects))
  }, [projects])

  const handleSaveProject = (form) => {
    const newP = {
      ...form,
      lat: form.location?.lat || form.lat,
      lng: form.location?.lng || form.lng,
      image: form.mainImage?.[0] ? (typeof form.mainImage[0] === 'string' ? form.mainImage[0] : URL.createObjectURL(form.mainImage[0])) : (pickImage(form.name) || ''),
      logo: form.logo?.[0] ? (typeof form.logo[0] === 'string' ? form.logo[0] : URL.createObjectURL(form.logo[0])) : null,
      galleryImages: (form.gallery||[]).map(f => typeof f === 'string' ? f : URL.createObjectURL(f)),
      masterPlanImages: (form.masterPlan||[]).map(f => typeof f === 'string' ? f : URL.createObjectURL(f)),
      videoFiles: [], // New wizard handles video URL, not files yet
      videoUrls: form.videoUrl,
      units: form.units || 0,
      phases: form.phases || 0,
      docs: form.docs || 0,
      lastUpdated: new Date().toISOString().slice(0, 10),
      status: form.status || 'Active',
      completion: form.completion || 0,
      cil: (form.cilTo || form.cilSubject || form.cilContent || form.cilSignature || (form.cilAttachments||[]).length)
        ? {
            to: form.cilTo || '',
            subject: form.cilSubject || '',
            content: form.cilContent || '',
            signature: form.cilSignature || '',
            attachments: (form.cilAttachments || []).map(f => typeof f === 'string' ? f : f)
          }
        : (form.cil || null)
    }
    
    if (editProject) {
       setProjects(prev => prev.map(p => p === editProject ? { ...p, ...newP } : p))
       addToast('success', isRTL ? 'تم تحديث المشروع' : 'Project updated')
    } else {
       setProjects(prev => [newP, ...prev])
       addToast('success', isRTL ? 'تم إضافة المشروع' : 'Project added')
    }
  }

  const handleDeleteProject = (proj) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p !== proj))
      addToast('success', isRTL ? 'تم حذف المشروع' : 'Project deleted')
    }
  }

  const handleAddUnit = (project) => {
    setUnitProject(project)
    setShowCreateUnitModal(true)
  }

  const handleSaveUnit = (newUnit) => {
    setShowCreateUnitModal(false)
    setUnitProject(null)
    setToasts([...toasts, { id: Date.now(), message: isRTL ? 'تمت إضافة الوحدة بنجاح' : 'Unit added successfully', type: 'success' }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== Date.now())), 3000)
  }

  const allCities = useMemo(() => Array.from(new Set(projects.map(p => p.city))), [projects])
  const allDevelopers = useMemo(() => Array.from(new Set(projects.map(p => p.developer))), [projects])
  const allProjects = useMemo(() => Array.from(new Set(projects.map(p => p.name))).sort(), [projects])
  const allCategories = useMemo(() => Array.from(new Set(projects.map(p => p.category).filter(Boolean))).sort(), [projects])
  // const allPaymentPlans = useMemo(() => Array.from(new Set(projects.map(p => p.paymentPlan).filter(Boolean))).sort(), [projects])
  const allPaymentPlans = [] // Disabled as paymentPlan is now an array of objects
  const allUsers = useMemo(() => Array.from(new Set(projects.map(p => p.createdBy).filter(Boolean))).sort(), [projects])
  const priceLimits = useMemo(() => {
    const prices = projects.flatMap(p => [p.minPrice, p.maxPrice].filter(x => x != null))
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 10000000) }
  }, [projects])
  const spaceLimits = useMemo(() => {
    // Mock space limits since data might be missing
    return { min: 0, max: 1000 } 
  }, [projects])
  const allStatuses = ['Planning','Active','Sales','Completed']

  const filtered = useMemo(() => {
    return projects.filter(p => {
      // Search (Generic)
      if (filters.search) {
         const q = filters.search.toLowerCase()
         if (!p.name.toLowerCase().includes(q) && 
             !p.developer.toLowerCase().includes(q) && 
             !p.city.toLowerCase().includes(q)) return false
      }
      // Project Name
      if (filters.project && p.name !== filters.project) return false
      // Developer
      if (filters.developer && filters.developer !== 'All' && p.developer !== filters.developer) return false
      // City
      if (filters.city && filters.city !== 'All' && p.city !== filters.city) return false
      // Status
      if (filters.status && filters.status !== 'All' && p.status !== filters.status) return false
      // Country
      if (filters.country && !(p.country || 'Egypt').toLowerCase().includes(filters.country.toLowerCase())) return false
      // Category
      if (filters.category && !(p.category || '').toLowerCase().includes(filters.category.toLowerCase())) return false
      // Payment Plan
      // Disabled for now as paymentPlan is a complex object
      // if (filters.paymentPlan && !(p.paymentPlan || '').toLowerCase().includes(filters.paymentPlan.toLowerCase())) return false
      // Created By
      if (filters.createdBy && p.createdBy !== filters.createdBy) return false
      // Created Date
      if (filters.createdDate && (p.createdDate || p.lastUpdated) !== filters.createdDate) return false
      // Price Range
      if (filters.minPrice && (p.maxPrice || 0) < Number(filters.minPrice)) return false
      if (filters.maxPrice && (p.minPrice || 0) > Number(filters.maxPrice)) return false
      
      return true
    })
  }, [projects, filters])

  // Pagination state and derived values
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered, pageSize])
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), [filtered, page, pageSize])
  useEffect(() => { setPage(1) }, [filters, pageSize])
  const shownFrom = useMemo(() => (filtered.length === 0 ? 0 : (page - 1) * pageSize + 1), [page, pageSize, filtered.length])
  const shownTo = useMemo(() => Math.min(page * pageSize, filtered.length), [page, pageSize, filtered.length])
  const goPrevPage = () => setPage(p => Math.max(1, p - 1))
  const goNextPage = () => setPage(p => Math.min(totalPages, p + 1))

  const seededProjects = []
  
  /* 
  useEffect(() => {
    setProjects(seededProjects)
  }, [])
  */

  const addToast = (type, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      project: '',
      developer: '',
      city: '',
      status: '',
      country: '',
      category: '',
      paymentPlan: '',
      createdBy: '',
      createdDate: '',
      minPrice: '',
      maxPrice: '',
      minSpace: '',
      maxSpace: ''
    })
  }

  const Label = {
    title: isRTL ? 'المشاريع' : 'Projects',
    search: isRTL ? 'بحث' : 'Search',
    filter: isRTL ? 'تصفية' : 'Filter',
    importProjects: isRTL ? 'استيراد' : 'Import',
    createProject: isRTL ? 'إنشاء مشروع' : 'Add project',
    location: isRTL ? 'الموقع' : 'Location',
    units: isRTL ? 'وحدات' : 'Units',
    share: isRTL ? 'مشاركة' : 'Share',
    more: isRTL ? 'المزيد' : 'More',
    developer: isRTL ? 'المطور' : 'Developer',
    status: isRTL ? 'الحالة' : 'Status',
    city: isRTL ? 'المدينة' : 'City',
    phases: isRTL ? 'المراحل' : 'Phases',
    clearFilters: isRTL ? 'اعادة تعيين' : 'reset',
    exportPdf: isRTL ? 'تصدير PDF' : 'Export PDF',
    createdBy: isRTL ? 'بواسطة' : 'Created By',
    createdDate: isRTL ? 'تاريخ الإنشاء' : 'Created Date'
  }

  return (
    <div className="p-4 md:p-6 bg-[var(--content-bg)] text-[var(--content-text)] overflow-x-hidden min-w-0">
        {/* Header */}
        <div className="glass-panel rounded-xl p-4 md:p-6 relative z-30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="w-full lg:w-auto flex items-center justify-between lg:justify-start gap-3">
              <div className="relative flex flex-col items-start gap-1">
                <h1 className="page-title text-xl md:text-2xl font-bold text-start">{Label.title}</h1>
                <span
                  aria-hidden="true"
                  className="inline-block h-[2px] w-full rounded
               bg-gradient-to-r from-blue-500 to-purple-600"
                />
              </div>
           
            </div>

            <div className="w-full lg:w-auto flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-3">
              <button className="btn btn-sm w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center justify-center gap-2" onClick={()=>setShowImportModal(true)}>
                {Label.importProjects}
              </button>

              <button className="btn btn-sm w-full lg:w-auto bg-green-600 hover:bg-green-500 text-white border-none flex items-center justify-center gap-2" onClick={()=>setShowCreateModal(true)}>
                <FaPlus /> {Label.createProject}
              </button>
              
              <div className="relative w-full lg:w-auto">
                <button 
                  className="btn btn-sm w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center justify-center gap-2" 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  {isRTL ? 'تصدير' : 'Export'}
                  <FaChevronDown className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} size={10} />
                </button>
                
                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                    <div className="absolute top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 w-full sm:w-32 overflow-hidden ltr:right-0 rtl:left-0">
                      <button 
                        className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => {
                          exportProjectsCsv()
                          setShowExportMenu(false)
                        }}
                      >
                        CSV
                      </button>
                      <button 
                        className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => {
                          exportProjectsPdf(filtered)
                          setShowExportMenu(false)
                        }}
                      >
                        PDF
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Leads-style Filter Panel */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FaFilter className="text-blue-500" /> {Label.filter}
              </h2>
              <div className="w-full sm:w-auto flex items-center gap-2">
                <button onClick={() => setShowAllFilters(prev => !prev)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                  {showAllFilters ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'عرض الكل' : 'Show All')}
                  <FaChevronDown size={10} className={`transform transition-transform duration-300 ${showAllFilters ? 'rotate-180' : 'rotate-0'}`} />
                </button>
                <button onClick={clearFilters} className="flex-1 sm:flex-none px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-center">
                  {Label.clearFilters}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Top Row: Search, Category, Developer, Project */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaSearch className="text-blue-500" size={10} /> {isRTL ? 'بحث' : 'Search'}</label>
                   <input className="input w-full" value={filters.search} onChange={e=>setFilters({...filters, search: e.target.value})} placeholder={isRTL ? 'بحث...' : 'Search...'} />
                </div>
                {/* Category */}
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaTags className="text-blue-500" size={10} /> {isRTL ? 'التصنيف' : 'Category'}</label>
                    <SearchableSelect 
                      options={allCategories} 
                      value={filters.category} 
                      onChange={val => setFilters({...filters, category: val})} 
                      isRTL={isRTL} 
                    />
                 </div>
                 {/* Developer */}
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaBuilding className="text-blue-500" size={10} /> {isRTL ? 'المطور' : 'Developer'}</label>
                    <SearchableSelect 
                      options={allDevelopers} 
                      value={filters.developer} 
                      onChange={val => setFilters({...filters, developer: val})} 
                      isRTL={isRTL} 
                    />
                 </div>
                 {/* Project Name */}
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaCity className="text-blue-500" size={10} /> {isRTL ? 'مشروع' : 'Project'}</label>
                    <SearchableSelect 
                      options={allProjects} 
                      value={filters.project} 
                      onChange={val => setFilters({...filters, project: val})} 
                      isRTL={isRTL} 
                    />
                 </div>
              </div>

              {/* Collapsible Row */}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300 overflow-hidden ${showAllFilters ? 'max-h-[500px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                {/* City */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaMapMarkerAlt className="text-blue-500" size={10} /> {isRTL ? 'المدينة' : 'City'}</label>
                   <SearchableSelect 
                     options={allCities} 
                     value={filters.city} 
                     onChange={val => setFilters({...filters, city: val})} 
                     isRTL={isRTL} 
                   />
                </div>
                {/* Status */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaFilter className="text-blue-500" size={10} /> {isRTL ? 'الحالة' : 'Status'}</label>
                   <SearchableSelect 
                     options={allStatuses} 
                     value={filters.status} 
                     onChange={val => setFilters({...filters, status: val})} 
                     isRTL={isRTL} 
                   />
                </div>
                {/* Country */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)]">{isRTL ? 'الدولة' : 'Country'}</label>
                   <input className="input w-full" value={filters.country} onChange={e=>setFilters({...filters, country: e.target.value})} placeholder={isRTL ? 'مصر' : 'Egypt'} />
                </div>
                {/* Payment Plan */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)]">{isRTL ? 'خطة الدفع' : 'Payment Plan'}</label>
                   <SearchableSelect 
                     options={allPaymentPlans} 
                     value={filters.paymentPlan} 
                     onChange={val => setFilters({...filters, paymentPlan: val})} 
                     isRTL={isRTL} 
                   />
                </div>
                {/* Created By */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaFilter className="text-blue-500" size={10} /> {Label.createdBy}</label>
                   <SearchableSelect 
                     options={allUsers} 
                     value={filters.createdBy} 
                     onChange={val => setFilters({...filters, createdBy: val})} 
                     isRTL={isRTL} 
                   />
                </div>
                {/* Created Date */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaFilter className="text-blue-500" size={10} /> {Label.createdDate}</label>
                   <input 
                     type="date" 
                     className="input w-full"
                     value={filters.createdDate} 
                     onChange={e=>setFilters({...filters, createdDate: e.target.value})} 
                   />
                </div>
                {/* Price Range */}
                <div className="lg:col-span-2 space-y-1">
                   <RangeSlider 
                     label={isRTL ? 'نطاق السعر' : 'Price Range'} 
                     min={priceLimits.min} 
                     max={priceLimits.max}
                     value={[filters.minPrice === '' ? priceLimits.min : Number(filters.minPrice), filters.maxPrice === '' ? priceLimits.max : Number(filters.maxPrice)]}
                     onChange={([min, max]) => setFilters({...filters, minPrice: min, maxPrice: max})}
                     isRTL={isRTL}
                   />
                </div>
                {/* Space Range */}
                <div className="lg:col-span-2 space-y-1">
                   <RangeSlider 
                     label={isRTL ? 'نطاق المساحة' : 'Space Range'} 
                     min={spaceLimits.min} 
                     max={spaceLimits.max}
                     value={[filters.minSpace === '' ? spaceLimits.min : Number(filters.minSpace), filters.maxSpace === '' ? spaceLimits.max : Number(filters.maxSpace)]}
                     onChange={([min, max]) => setFilters({...filters, minSpace: min, maxSpace: max})}
                     isRTL={isRTL}
                   />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary row (full width) */}
        <div className="mt-4 relative z-10">
          <SummaryPanel projects={filtered} isRTL={isRTL} onFilterStatus={(s)=> setFilters(prev=>({...prev, status: s === 'All' ? '' : s}))} onFilterCity={(c)=> setFilters(prev=>({...prev, city: c === 'All' ? '' : c}))} />
        </div>

        {/* Projects list: two per row */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
          {paginated.map((p, idx) => (
            <div key={idx} className="glass-panel rounded-xl overflow-hidden">
              <ProjectCard
                p={p}
                isRTL={isRTL}
                Label={Label}
                companySetup={companySetup}
                onView={(proj)=>setSelectedProject(proj)}
                onEdit={(proj)=>{ setEditProject(proj); setShowCreateModal(true) }}
                onDelete={handleDeleteProject}
                onAddUnit={handleAddUnit}
              />
            </div>
          ))}
          
        </div>
        {/* Pagination Footer */}
        <div className="mt-2 flex items-center justify-between rounded-xl p-2 glass-panel">
          <div className="text-xs text-[var(--muted-text)]">
            {isRTL ? `عرض ${shownFrom}–${shownTo} من ${filtered.length}` : `Showing ${shownFrom}–${shownTo} of ${filtered.length}`}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                className="btn btn-sm btn-ghost"
                onClick={goPrevPage}
                disabled={page <= 1}
                title={isRTL ? 'السابق' : 'Prev'}
              >
                <FaChevronLeft className={isRTL ? 'scale-x-[-1]' : ''} />
              </button>
              <span className="text-sm">{isRTL ? `الصفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}</span>
              <button
                className="btn btn-sm btn-ghost"
                onClick={goNextPage}
                disabled={page >= totalPages}
                title={isRTL ? 'التالي' : 'Next'}
              >
                <FaChevronRight className={isRTL ? 'scale-x-[-1]' : ''} />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[var(--muted-text)]">{isRTL ? 'لكل صفحة:' : 'Per page:'}</span>
              <select
                className="input w-24 text-sm"
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
              >
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
              </select>
            </div>
          </div>
        </div>

        {/* Import Projects Modal */}
        {showImportModal && (
          <ProjectsImportModal onClose={()=>setShowImportModal(false)} isRTL={isRTL} addToast={addToast} addLog={(log)=>setImportLogs(prev=>[log,...prev])} />
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <CreateProjectModal
            onClose={()=>{ setShowCreateModal(false); setEditProject(null) }}
            onSave={handleSaveProject}
            isRTL={isRTL}
            mode={editProject ? 'edit' : 'create'}
            initialValues={editProject}
          />
        )}

        {/* Create Unit Modal */}
        {showCreateUnitModal && (
          <CreatePropertyModal
            onClose={() => { setShowCreateUnitModal(false); setUnitProject(null) }}
            onSave={handleSaveUnit}
            isRTL={isRTL}
            initialData={{ project: unitProject?.name }}
          />
        )}

        {selectedProject && (
          <ProjectDetailsModal p={selectedProject} isRTL={isRTL} onClose={()=>setSelectedProject(null)} />
        )}
        {/* Toasts */}
        <div className="fixed z-50 top-20 end-4 flex flex-col gap-2">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-2 rounded-lg shadow-lg ${t.type==='success' ? 'bg-emerald-600 text-white' : t.type==='error' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-white'}`}>{t.message}</div>
          ))}
        </div>
      </div>
  )
}

// Range Slider Component
const RangeSlider = ({ min, max, value, onChange, label, isRTL, unit = '' }) => {
  const [minVal, maxVal] = value
  
  // Handlers
  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), maxVal - 1)
    onChange([val, maxVal])
  }
  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), minVal + 1)
    onChange([minVal, val])
  }

  // Percentages for track
  const minPercent = ((minVal - min) / (max - min)) * 100
  const maxPercent = ((maxVal - min) / (max - min)) * 100

  return (
    <div className="w-full p-1">
      <h3 className="text-xs font-medium text-[var(--muted-text)] mb-4">{label}</h3>
      
      <div className="relative w-full h-4 mb-4 group">
        {/* Track Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded-full"></div>
        
        {/* Active Range Track */}
        <div 
          className="absolute top-1/2 h-1 bg-gray-800 dark:bg-gray-200 -translate-y-1/2 rounded-full"
          style={{ 
            left: isRTL ? `${100 - maxPercent}%` : `${minPercent}%`, 
            right: isRTL ? `${minPercent}%` : `${100 - maxPercent}%` 
          }}
        ></div>

        {/* Inputs */}
        <style>{`
          .range-slider-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            pointer-events: auto;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: white;
            border: 2px solid #333;
            cursor: pointer;
            margin-top: -5px; /* centers thumb on track */
          }
          .range-slider-thumb::-moz-range-thumb {
            pointer-events: auto;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: white;
            border: 2px solid #333;
            cursor: pointer;
            border: none;
          }
        `}</style>
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          className="range-slider-thumb absolute top-1/2 -translate-y-1/2 left-0 w-full appearance-none bg-transparent pointer-events-none z-20"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          className="range-slider-thumb absolute top-1/2 -translate-y-1/2 left-0 w-full appearance-none bg-transparent pointer-events-none z-20"
        />
      </div>
      
      <div className="flex items-center gap-3 mt-4">
        <div className="flex items-center gap-1.5">
           <span className="text-xs text-gray-500 font-medium">{isRTL ? 'من' : 'From'}</span>
           <div className="relative">
             <input 
               type="number" 
               value={minVal} 
               onChange={handleMinChange}
               className="input py-0.5 px-2 w-20 text-center text-xs font-bold border border-gray-300 dark:border-gray-600 rounded-lg"
             />
           </div>
        </div>
        <div className="flex items-center gap-1.5">
           <span className="text-xs text-gray-500 font-medium">{isRTL ? 'إلى' : 'To'}</span>
           <div className="relative">
             <input 
               type="number" 
               value={maxVal} 
               onChange={handleMaxChange}
               className="input py-0.5 px-2 w-20 text-center text-xs font-bold border border-gray-300 dark:border-gray-600 rounded-lg"
             />
           </div>
        </div>
      </div>
    </div>
  )
}

// Import Modal Component
function ProjectsImportModal({ onClose, isRTL, addToast, addLog }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [excelFile, setExcelFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState(null)
  const [importSummary, setImportSummary] = useState(null)
  const { t } = useTranslation() // Using hook if possible, otherwise fallback to hardcoded

  // Template Generator
  const generateTemplate = () => {
    const templateData = [
      {
        'Project Name': 'مشروع المثال',
        'Developer': 'اسم المطور',
        'City': 'القاهرة الجديدة',
        'Status': 'Active',
        'Units': '100',
        'Min Price': '1000000',
        'Max Price': '5000000',
        'Delivery Date': '2026-01-01',
        'Description': 'وصف المشروع'
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects Template')
    XLSX.writeFile(workbook, 'projects_template.xlsx')
  }

  // Validate Fields
  const validateRequiredFields = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          if (rows.length === 0) {
            reject(new Error(isRTL ? 'الملف فارغ' : 'File is empty'))
            return
          }

          const headers = rows[0].map(h => h?.toString()?.toLowerCase()?.trim())
          const requiredFields = ['project', 'developer', 'city']
          const missingFields = []

          requiredFields.forEach(field => {
            const found = headers.some(header => 
              header.includes(field) || 
              (header.includes('name') && field === 'project') ||
              (header.includes('اسم') && field === 'project') ||
              (header.includes('مطور') && field === 'developer') ||
              (header.includes('مدينة') && field === 'city')
            )
            if (!found) {
              missingFields.push(field)
            }
          })

          if (missingFields.length > 0) {
            reject(new Error((isRTL ? 'الحقول المطلوبة مفقودة: ' : 'Missing required fields: ') + missingFields.join(', ')))
          } else {
            resolve(true)
          }
        } catch (error) {
          reject(new Error(isRTL ? 'خطأ في قراءة الملف' : 'Error reading file'))
        }
      }
      reader.readAsArrayBuffer(file)
    })
  }

  // Handle File Upload
  const handleFileUpload = async (file) => {
    if (!file) return
    setImportError(null)
    setImportSummary(null)
    
    try {
      await validateRequiredFields(file)
      setExcelFile(file)
    } catch (error) {
      setImportError(error.message)
      setExcelFile(null)
    }
  }

  // Handle Import
  const handleImport = async () => {
    if (!excelFile) return
    setImporting(true)
    setImportError(null)

    try {
      // Simulate processing
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const ws = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(ws)
        
        // Log the import
        if (addLog) {
           addLog({ 
             fileName: excelFile.name, 
             user: 'Current User', 
             timestamp: new Date().toISOString(), 
             status: 'Success', 
             count: json.length
           })
        }
        
        if (addToast) {
           addToast('success', isRTL ? 'تم الاستيراد بنجاح' : 'Import successful')
        }
        
        setImportSummary({ added: json.length })
        setImporting(false)
        
        // Close after a short delay to show success
        setTimeout(() => {
          onClose()
        }, 1500)
      }
      reader.readAsArrayBuffer(excelFile)
    } catch (err) {
      setImportError(isRTL ? 'فشل الاستيراد' : 'Import failed')
      setImporting(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-[2000] ${isRTL ? 'rtl' : 'ltr'} flex items-start justify-center pt-20`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div 
        className="relative max-w-2xl w-full mx-4 rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] transition-colors duration-200"
        style={{
          backgroundColor: isDark ? '#172554' : 'white',
          borderColor: isDark ? '#1e3a8a' : '#e5e7eb',
          color: isDark ? 'white' : '#111827'
        }}
      >
        {/* Header */}
        <div 
          className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b transition-colors duration-200"
          style={{ borderColor: isDark ? '#1e3a8a' : '#e5e7eb' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <FaDownload className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold" style={{ color: isDark ? 'white' : '#111827' }}>{isRTL ? 'استيراد المشاريع' : 'Import Projects'}</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto custom-scrollbar">
          {/* Template Download Section */}
          <div 
            className="mb-6 p-4 rounded-xl border transition-colors duration-200"
            style={{
              backgroundColor: isDark ? 'rgba(30, 58, 138, 0.4)' : '#eff6ff',
              borderColor: isDark ? '#1e40af' : '#bfdbfe'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaFileExcel className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: isDark ? 'white' : '#111827' }}>
                    {isRTL ? 'تحميل نموذج Excel' : 'Download Excel Template'}
                  </h4>
                  <p className="text-xs" style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                    {isRTL ? 'استخدم هذا النموذج لإضافة مشاريع جديدة' : 'Use this template to add new projects'}
                  </p>
                </div>
              </div>
              <button
                onClick={generateTemplate}
                className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none flex items-center gap-2"
              >
                <FaDownload className="w-3 h-3" />
                {isRTL ? 'تحميل' : 'Download'}
              </button>
            </div>
            <div className="mt-3 text-xs" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              <strong>{isRTL ? 'الحقول المطلوبة: ' : 'Required Fields: '}</strong> Project Name, Developer, City
            </div>
          </div>

          {/* Dropzone */}
          <div
            className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed transition-colors duration-300"
            style={{
              backgroundColor: isDark ? 'rgba(30, 58, 138, 0.2)' : 'rgba(255, 255, 255, 0.7)',
              borderColor: isDark ? '#3b82f6' : '#93c5fd'
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault()
              const file = e.dataTransfer.files?.[0]
              if (file && (/\.xlsx$|\.xls$/i).test(file.name)) {
                await handleFileUpload(file)
              }
            }}
          >
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0l-3 3m3-3l3 3m7 4v12m0 0l-3-3m3 3l3-3" />
            </svg>
            <p className="text-sm text-center" style={{ color: isDark ? '#d1d5db' : '#374151' }}>
              {isRTL ? 'اسحب وأفلت ملف Excel هنا أو اضغط للاختيار' : 'Drag & drop Excel file here or click to browse'}
            </p>
            <input
              id="modal-excel-file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={async (e) => {
                const file = e.target.files?.[0] || null
                if (file) {
                  await handleFileUpload(file)
                } else {
                  setExcelFile(null)
                }
              }}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => document.getElementById('modal-excel-file-input')?.click()}
              className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none"
            >
              {isRTL ? 'اختيار ملف' : 'Browse File'}
            </button>

            {excelFile ? (
              <div className="mt-2 text-xs" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>{isRTL ? 'تم اختيار: ' + excelFile.name : 'Selected: ' + excelFile.name}</div>
            ) : (
              <div className="mt-2 text-xs" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>{isRTL ? 'لم يتم اختيار ملف' : 'No file selected'}</div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
            <button
              onClick={handleImport}
              disabled={!excelFile || importing}
              className={`btn btn-sm ${importing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white border-none flex items-center gap-2`}
            >
              <FaDownload className="w-4 h-4" />
              {importing ? (isRTL ? 'جاري الاستيراد...' : 'Importing...') : (isRTL ? 'استيراد البيانات' : 'Import Data')}
            </button>
            <span className="text-xs" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>{isRTL ? 'الملفات المدعومة: .xlsx, .xls' : 'Supported files: .xlsx, .xls'}</span>
          </div>

          {/* Feedback */}
          {importError && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
              {importError}
            </div>
          )}
          {importSummary && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800">
              {isRTL ? `تم استيراد ${importSummary.added} مشروع بنجاح` : `Successfully imported ${importSummary.added} projects`}
            </div>
          )}

          <div className="mt-3 text-xs" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            {isRTL ? 'الحقول المدعومة: اسم المشروع، المطور، المدينة، الحالة، الوحدات، السعر، الوصف' : 'Supported Fields: Project Name, Developer, City, Status, Units, Price, Description'}
          </div>
        </div>
      </div>
    </div>
  )
}



function FileUploadBox({ id, isRTL, multiple = false, accept, onChange, selectedText }) {
  const [files, setFiles] = useState([])
  const handleChange = (e) => {
    const arr = Array.from(e.target.files || [])
    setFiles(arr)
    if (onChange) onChange(e)
  }
  const rightText = selectedText !== undefined
    ? (selectedText || (isRTL ? 'لم يتم اختيار ملف' : 'No file chosen'))
    : (files.length ? files.map(f => f.name).join(', ') : (isRTL ? 'لم يتم اختيار ملف' : 'No file chosen'))
  const buttonLabel = multiple ? (isRTL ? 'اختر الملفات' : 'Choose Files') : (isRTL ? 'اختر ملف' : 'Choose File')
  return (
    <div className="relative">
      <input id={id} type="file" multiple={multiple} accept={accept} onChange={handleChange} className="hidden" />
      <label htmlFor={id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-800/40 px-3 py-2 cursor-pointer hover:bg-gray-100/60 dark:hover:bg-gray-700/60">
        <span className="inline-flex items-center gap-2">
          <FaUpload className="text-blue-500" />
          <span className="text-sm font-medium">{buttonLabel}</span>
        </span>
        <span className="text-sm text-[var(--muted-text)] truncate max-w-[60%]">{rightText}</span>
      </label>
    </div>
  )
}

function MapTab({ isRTL, form, setForm, onClose, onSave }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [coords, setCoords] = useState({ lat: Number(form.latitude) || 30.0444, lng: Number(form.longitude) || 31.2357 })
  const [zoom, setZoom] = useState(Number(form.mapZoom) || 12)
  const [status, setStatus] = useState('')
  const [mapError, setMapError] = useState(false)
  
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const abortController = useRef(null)

  const updateForm = (newCoords, newZoom) => {
    const lat = Number(newCoords.lat).toFixed(6)
    const lng = Number(newCoords.lng).toFixed(6)
    setForm(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      mapZoom: newZoom,
      mapUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${Math.round(newZoom)}/${lat}/${lng}`
    }))
  }

  useEffect(() => {
    if (!mapContainer.current) return
    if (mapRef.current) return

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'google-streets': {
              type: 'raster',
              tiles: ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'],
              tileSize: 256,
              attribution: '&copy; Google Maps'
            }
          },
          layers: [{
            id: 'google-streets',
            type: 'raster',
            source: 'google-streets',
            minzoom: 0,
            maxzoom: 22
          }]
        },
        center: [coords.lng, coords.lat],
        zoom: zoom
      })

      mapRef.current = map

      const marker = new maplibregl.Marker({ draggable: true })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map)
      markerRef.current = marker

      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat()
        setCoords({ lat, lng })
        updateForm({ lat, lng }, map.getZoom())
      })

      map.on('click', (e) => {
        marker.setLngLat(e.lngLat)
        setCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng })
        updateForm({ lat: e.lngLat.lat, lng: e.lngLat.lng }, map.getZoom())
      })

      map.on('zoomend', () => {
        const z = map.getZoom()
        setZoom(z)
        updateForm(coords, z)
      })

      map.on('error', (e) => {
           console.warn('Map error:', e)
      })

    } catch (err) {
      console.error('Map init error:', err)
      setMapError(true)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  const handleSearch = async (q) => {
    if (!q) return
    setSearching(true)
    setStatus('')
    if (abortController.current) abortController.current.abort()
    abortController.current = new AbortController()

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`, {
        signal: abortController.current.signal,
        headers: { 'User-Agent': 'besouhoula-app/1.0', 'Accept': 'application/json' }
      })
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(data)
      if (data.length === 0) setStatus(isRTL ? 'لا توجد نتائج' : 'No results found')
    } catch (err) {
      if (err.name !== 'AbortError') setStatus(isRTL ? 'خطأ في البحث' : 'Search error')
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) handleSearch(query)
    }, 500)
    return () => clearTimeout(timer)
  }, [query])

  const selectResult = (r) => {
    const lat = parseFloat(r.lat)
    const lng = parseFloat(r.lon)
    setCoords({ lat, lng })
    setResults([])
    setQuery(r.display_name)
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14 })
      if (markerRef.current) markerRef.current.setLngLat([lng, lat])
    }
    updateForm({ lat, lng }, 14)
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setStatus(isRTL ? 'غير مدعوم' : 'Not supported')
      return
    }
    setSearching(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14 })
          if (markerRef.current) markerRef.current.setLngLat([longitude, latitude])
        }
        updateForm({ lat: latitude, lng: longitude }, 14)
        setSearching(false)
      },
      () => {
        setStatus(isRTL ? 'تعذر تحديد الموقع' : 'Location denied')
        setSearching(false)
      }
    )
  }
  
  const getEmbedUrl = () => {
     const { lat, lng } = coords
     return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`
  }

  return (
    <div className="flex flex-col h-[650px] w-full gap-4">
       {/* Top Bar: Search & URL Inputs */}
       <div className="flex flex-col md:flex-row gap-3 items-end md:items-center justify-between">
          <div className="relative flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-3">
             {/* Search Input */}
             <div>
                <label className="text-xs text-[var(--muted-text)] mb-1 block">{isRTL ? 'بحث عن موقع' : 'Search Location'}</label>
                <div className="relative">
                   <input 
                      className="input w-full ps-9" 
                      value={query} 
                      onChange={e => setQuery(e.target.value)} 
                      placeholder={isRTL ? 'ابحث في خرائط جوجل...' : 'Search Google Maps...'} 
                   />
                   <FaSearch className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-text)] ${isRTL ? 'right-3' : 'left-3'}`} />
                   {searching && <div className={`absolute top-1/2 -translate-y-1/2 text-xs animate-pulse ${isRTL ? 'left-8' : 'right-3'}`}>...</div>}
                   {results.length > 0 && (
                      <ul className="absolute top-full left-0 right-0 mt-1 bg-[var(--content-bg)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                        {results.map((r, i) => (
                          <li key={i} onClick={() => selectResult(r)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm border-b border-gray-50 dark:border-gray-800 last:border-0">
                            {r.display_name}
                          </li>
                        ))}
                      </ul>
                   )}
                </div>
             </div>

             {/* URL Input */}
             <div>
                <label className="text-xs text-[var(--muted-text)] mb-1 block">{isRTL ? 'رابط الخريطة' : 'Map URL'}</label>
                <div className="flex gap-2">
                   <input 
                      className="input w-full" 
                      value={form.mapUrl || ''} 
                      onChange={e => setForm(f => ({ ...f, mapUrl: e.target.value }))}
                      placeholder="https://maps.google.com/..."
                   />
                   <button className="btn btn-sm btn-ghost text-blue-600" onClick={() => {
                      navigator.clipboard.writeText(form.mapUrl)
                      setStatus(isRTL ? 'تم النسخ' : 'Copied')
                   }} title={isRTL ? 'نسخ الرابط' : 'Copy URL'}>
                     <FaShareAlt />
                   </button>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto self-end pb-[2px]">
             <button className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none flex-1 md:flex-none" onClick={useMyLocation}>
               <FaMapMarkerAlt /> {isRTL ? 'موقعي' : 'My Location'}
             </button>
          </div>
       </div>

       {/* Map Area */}
       <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-100 dark:bg-gray-900">
          <div ref={mapContainer} className={`absolute inset-0 z-10 ${mapError ? 'hidden' : 'block'}`} />
          
          {/* Coordinates Overlay */}
          <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} z-20 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-2 rounded-lg shadow text-xs font-mono flex gap-3 pointer-events-none`}>
             <div>
                <span className="text-[var(--muted-text)] mr-1">Lat:</span>
                {coords.lat.toFixed(5)}
             </div>
             <div>
                <span className="text-[var(--muted-text)] mr-1">Lng:</span>
                {coords.lng.toFixed(5)}
             </div>
          </div>

          {mapError && (
             <div className="absolute inset-0 z-0">
                <iframe 
                  className="w-full h-full border-0" 
                  src={getEmbedUrl()} 
                  title="map-fallback"
                  loading="lazy"
                />
             </div>
          )}
       </div>

       {/* Footer Actions */}
       <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="text-xs text-[var(--muted-text)]">
             {status && <span className="text-amber-600">{status}</span>}
          </div>
          <div className="flex gap-3">
             <button className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
             <button className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none" onClick={onSave}>{isRTL ? 'حفظ' : 'Save'}</button>
          </div>
       </div>
    </div>
  )
}

function PaymentPlanTab({ isRTL, onClose, onSave }) {
  const [payment, setPayment] = useState({ basePrice: '', downPct: '', installments: '', startDate: '', frequency: 'monthly', graceMonths: '0', interestPct: '' })
  const [schedule, setSchedule] = useState([])
  const [showExportMenu, setShowExportMenu] = useState(false)
  const setPayVal = (key) => (e) => setPayment(v => ({ ...v, [key]: e.target.value }))
  const addMonths = (dateStr, months) => { const d = new Date(dateStr || new Date()); d.setMonth(d.getMonth() + months); return d.toISOString().slice(0,10) }
  const gen = () => {
    const base = Number(payment.basePrice) || 0
    const dp = Math.max(0, Math.min(100, Number(payment.downPct) || 0))
    const n = Math.max(0, Math.floor(Number(payment.installments) || 0))
    const grace = Math.max(0, Math.floor(Number(payment.graceMonths) || 0))
    const start = payment.startDate || new Date().toISOString().slice(0,10)
    const step = payment.frequency === 'quarterly' ? 3 : 1
    const dpAmount = +(base * dp / 100).toFixed(2)
    const remain = +(base - dpAmount).toFixed(2)
    const each = n > 0 ? +(remain / n).toFixed(2) : 0
    const rows = []
    if (dpAmount > 0) rows.push({ no: 0, label: isRTL ? 'مقدم' : 'Down Payment', dueDate: start, amount: dpAmount })
    let curDate = addMonths(start, grace)
    for (let i = 1; i <= n; i++) {
      rows.push({ no: i, label: isRTL ? 'قسط' : 'Installment', dueDate: curDate, amount: each })
      curDate = addMonths(curDate, step)
    }
    const sum = rows.reduce((a,b)=>a + (b.amount||0), 0)
    const diff = +(base - sum).toFixed(2)
    if (Math.abs(diff) >= 0.01 && rows.length) rows[rows.length-1].amount = +(rows[rows.length-1].amount + diff).toFixed(2)
    setSchedule(rows)
  }
  const exportCsv = () => {
    const headers = ['No','Label','DueDate','Amount']
    const csv = headers.join(',') + '\n' + schedule.map(r => [r.no, r.label, r.dueDate, r.amount].join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'payment_plan.csv'; a.click(); URL.revokeObjectURL(url)
  }
  const exportPdf = async () => {
    const jsPDF = (await import('jspdf')).default
    const autoTable = await import('jspdf-autotable')
    const doc = new jsPDF()
    const head = [['No','Label','DueDate','Amount']]
    const body = schedule.map(r => [String(r.no), r.label, r.dueDate, String(r.amount)])
    autoTable.default(doc, { head, body })
    doc.save('payment_plan.pdf')
  }
  const total = schedule.reduce((a,b)=>a + (b.amount||0), 0)
  return (
    <div className="space-y-4 text-[var(--content-text)]">
      <h3 className="text-lg font-semibold">{isRTL ? 'خطة الدفع' : 'Payment Plan'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'السعر الإجمالي' : 'Base Price'}</label>
          <input type="number" className="input w-full" value={payment.basePrice} onChange={setPayVal('basePrice')} placeholder={isRTL ? 'EGP' : 'EGP'} />
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'المقدم (%)' : 'Down Payment (%)'}</label>
          <input type="number" className="input w-full" value={payment.downPct} onChange={setPayVal('downPct')} placeholder={isRTL ? 'مثال: 10' : 'e.g., 10'} />
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'عدد الأقساط' : 'Installments Count'}</label>
          <input type="number" className="input w-full" value={payment.installments} onChange={setPayVal('installments')} placeholder={isRTL ? 'مثال: 48' : 'e.g., 48'} />
        </div>
        <div>
          <label className="block text_sm text-[var(--muted-text)] mb-1">{isRTL ? 'تاريخ البداية' : 'Start Date'}</label>
          <input type="date" className="input w-full" value={payment.startDate} onChange={setPayVal('startDate')} />
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'التكرار' : 'Frequency'}</label>
          <select className="input w-full" value={payment.frequency} onChange={setPayVal('frequency')}>
            <option value="monthly">{isRTL ? 'شهري' : 'Monthly'}</option>
            <option value="quarterly">{isRTL ? 'ربع سنوي' : 'Quarterly'}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'شهور سماح' : 'Grace Months'}</label>
          <input type="number" className="input w-full" value={payment.graceMonths} onChange={setPayVal('graceMonths')} placeholder={isRTL ? '0' : '0'} />
        </div>
      </div>
      <div className={`flex items-center justify-end gap-3`}>
        <button className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none" onClick={gen}>{isRTL ? 'توليد' : 'Generate'}</button>
      </div>
      {schedule.length > 0 && (
        <div className="space-y-3">
          <div className="glass-panel rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">{isRTL ? 'الإجمالي' : 'Total'}: <span className="font-semibold">{new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(total)}</span></div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center gap-2" onClick={() => setShowExportMenu(!showExportMenu)}>
                    {isRTL ? 'تصدير' : 'Export'} <FaChevronDown size={12} />
                  </button>
                  {showExportMenu && (
                    <div className="absolute bottom-full mb-1 end-0 bg-[var(--card-bg)] border border-[var(--panel-border)] rounded-lg shadow-lg py-1 min-w-[120px] z-50">
                      <button className="w-full text-start px-4 py-2 hover:bg-[var(--hover-bg)] text-sm" onClick={() => { exportCsv(); setShowExportMenu(false) }}>
                        CSV
                      </button>
                      <button className="w-full text-start px-4 py-2 hover:bg-[var(--hover-bg)] text-sm" onClick={() => { exportPdf(); setShowExportMenu(false) }}>
                        PDF
                      </button>
                    </div>
                  )}
                </div>
                <button className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none" onClick={()=>onSave && onSave(schedule)}>{isRTL ? 'حفظ' : 'Save'}</button>
              </div>
            </div>
          </div>
          <div className="rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-start p-2">#</th>
                  <th className="text-start p-2">{isRTL ? 'النوع' : 'Label'}</th>
                  <th className="text-start p-2">{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                  <th className="text-start p-2">{isRTL ? 'القيمة' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((r)=> (
                  <tr key={r.no} className="border-t">
                    <td className="p-2">{r.no}</td>
                    <td className="p-2">{r.label}</td>
                    <td className="p-2">{r.dueDate}</td>
                    <td className="p-2">{new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className={`flex items-center justify-end gap-3`}>
        <button className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
      </div>
    </div>
  )
}

function CilTab({ isRTL, onClose, onSave }) {
  const [cil, setCil] = useState({
    to: '',
    subject: '',
    content: '',
    signature: '',
    attachment: null
  })
  const setVal = (key) => (e) => setCil(v => ({ ...v, [key]: e.target.value }))
  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    setCil(v => ({ ...v, attachment: file || null }))
  }

  const exportPdf = async () => {
    const jsPDF = (await import('jspdf')).default
    const autoTable = await import('jspdf-autotable')
    const doc = new jsPDF()
    autoTable.default(doc, {
      head: [[isRTL ? 'بيان CIL' : 'CIL Statement']],
      body: [
        [ (isRTL ? 'إلى: ' : 'To: ') + (cil.to||'-') ],
        [ (isRTL ? 'الموضوع: ' : 'Subject: ') + (cil.subject||'-') ],
        [ (isRTL ? 'المحتوى: ' : 'Content: ') + (cil.content||'-') ],
        [ (isRTL ? 'مرفق: ' : 'Attachment: ') + (cil.attachment ? cil.attachment.name : '-') ],
        [ (isRTL ? 'التوقيع: ' : 'Signature: ') + (cil.signature||'-') ],
      ],
      styles: { halign: isRTL ? 'right' : 'left' },
    })
    doc.save('cil_statement.pdf')
  }

  const save = () => { onSave && onSave(cil) }

  return (
    <div className="space-y-4 text-[var(--content-text)]">
      <h3 className="text-lg font-semibold">CIL</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'إلى' : 'To'}</label>
          <input className="input w-full" value={cil.to} onChange={setVal('to')} placeholder={isRTL ? 'اسم المستلم' : 'Recipient Name'} />
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'الموضوع' : 'Subject'}</label>
          <input className="input w-full" value={cil.subject} onChange={setVal('subject')} placeholder={isRTL ? 'موضوع الرسالة' : 'Subject'} />
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'المحتوى' : 'Content'}</label>
          <textarea className="input w-full min-h-[150px]" value={cil.content} onChange={setVal('content')} placeholder={isRTL ? 'اكتب المحتوى هنا...' : 'Write content here...'} />
        </div>
        <div>
           <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'مرفق' : 'Attachment'}</label>
           <input type="file" className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
            " onChange={onFileChange} />
            {cil.attachment && <div className="text-xs mt-1 text-[var(--muted-text)]">{cil.attachment.name}</div>}
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'التوقيع' : 'Signature'}</label>
          <input className="input w-full" value={cil.signature} onChange={setVal('signature')} placeholder={isRTL ? 'التوقيع' : 'Signature'} />
        </div>
      </div>
      <div className={`flex items-center justify-end gap-3`}>
        <button className="btn btn-glass" onClick={exportPdf}>PDF</button>
        <button className="btn btn-primary" onClick={save}>{isRTL ? 'حفظ' : 'Save'}</button>
        <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
      </div>
    </div>
  )
}

function ProjectCard({ p, isRTL, Label, onView, onEdit, onDelete, onAddUnit, companySetup }) {
  const img = p.image || pickImage(p.name)
  return (
    <div className="p-3">
      <div className="flex items-center gap-3 min-w-0 mb-2">
        {p.logo && <img src={p.logo} alt={`${p.name} logo`} className="h-7 w-auto" />}
        <h3 className="text-base font-semibold truncate flex-1">{p.name}</h3>
        
        <div className={`flex items-center gap-1`}>
          <button
            className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm transition focus:outline-none"
            title={isRTL ? 'عرض' : 'View'} aria-label={isRTL ? 'عرض' : 'View'} onClick={()=>onView && onView(p)}
            style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
          >
            <FaEye className="w-3 h-3 text-[var(--nova-accent)] dark:text-white" />
          </button>
           <button
            className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm transition focus:outline-none"
            title={isRTL ? 'إضافة وحدة' : 'Add Unit'} aria-label={isRTL ? 'إضافة وحدة' : 'Add Unit'} onClick={(e)=>{ e.stopPropagation(); onAddUnit && onAddUnit(p); }}
            style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
          >
            <FaPlus className="w-3 h-3 text-[var(--nova-accent)] dark:text-white" />
          </button>
          <button
            className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm transition focus:outline-none"
            title={isRTL ? 'تعديل' : 'Edit'} aria-label={isRTL ? 'تعديل' : 'Edit'} onClick={()=>onEdit && onEdit(p)}
            style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
          >
            <FaEdit className="w-3 h-3 text-[var(--nova-accent)] dark:text-white" />
          </button>
          <button
            className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm transition focus:outline-none"
            title={isRTL ? 'حذف' : 'Delete'} aria-label={isRTL ? 'حذف' : 'Delete'} onClick={()=>onDelete && onDelete(p)}
            style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
          >
            <FaTrash className="w-3 h-3 text-[var(--nova-accent)] dark:text-white" />
          </button>
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between">
        {p.status && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            (p.status === 'Active' || p.status === 'Sales') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            p.status === 'Completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {p.status}
          </span>
        )}
      </div>

      {img && (
        <div className="mt-2 rounded-lg overflow-hidden">
          <img src={img} alt={p.name} className="w-full h-40 md:h-56 object-cover" />
        </div>
      )}

      {/* Compact line details */}
      <div className={`mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs leading-snug ${isRTL ? 'text-end' : 'text-start'}`}>
        <div className={`glass-panel tinted-blue px-1.5 py-1 rounded-md flex items-center gap-1.5 min-w-0`} style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
          <FaMapMarkerAlt className="opacity-70 flex-shrink-0" />
          <span className="min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{p.city}</span>
        </div>
        <div className={`glass-panel tinted-indigo px-1.5 py-1 rounded-md flex items-center gap-1.5 min-w-0`} style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
          <FaBuilding className="opacity-70 flex-shrink-0" />
          <span className="min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{p.developer}</span>
        </div>
        <div className="glass-panel tinted-emerald px-1.5 py-1 rounded-md min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{Label.units}: <span className="font-semibold">{p.units}</span></div>
        <div className="glass-panel tinted-violet px-1.5 py-1 rounded-md min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{isRTL ? 'التصنيف' : 'Category'}: <span className="font-semibold">{p.category}</span></div>
        <div className="glass-panel tinted-amber px-1.5 py-1 rounded-md min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{isRTL ? 'الحالة' : 'Status'}: <span className="font-semibold">{p.status}</span></div>
        <div className="glass-panel tinted-blue px-1.5 py-1 rounded-md min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{isRTL ? 'آخر تحديث' : 'Updated'}: <span className="font-semibold">{p.lastUpdated}</span></div>
      </div>

      {/* Progress + Revenue (thin) */}
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${isRTL ? 'text-end' : 'text-start'}`}>
          <div className="text-xs text-[var(--muted-text)] mb-1">{isRTL ? 'نسبة الإنجاز' : 'Completion'}</div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${p.completion||0}%` }} />
          </div>
        </div>
        <div className={`${isRTL ? 'text-end' : 'text-start'}`}>
          <div className="text-xs text-[var(--muted-text)] mb-1">{isRTL ? 'نطاق السعر' : 'Price Range'}</div>
          <div className="text-sm font-semibold flex flex-col">
            <div className={`inline-flex items-center ${isRTL ? 'justify-end' : 'justify-start'} gap-1`}>
              <span className="text-[var(--muted-text)] text-xs font-normal">{isRTL ? 'من' : 'From'}:</span>
              <span>{new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(p.minPrice||0)}</span>
            </div>
            <div className={`inline-flex items-center ${isRTL ? 'justify-end' : 'justify-start'} gap-1`}>
              <span className="text-[var(--muted-text)] text-xs font-normal">{isRTL ? 'إلى' : 'To'}:</span>
              <span>{new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(p.maxPrice||0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="mt-2 flex items-center justify-end">
        <button
          className={`inline-flex items-center gap-2 text-primary hover:underline`}
          title={Label.share}
          onClick={() => {
            try {
              const payload = {
                name: p.name,
                developer: p.developer,
                city: p.city,
                category: p.category,
                image: p.image,
                description: p.description,
                minPrice: p.minPrice,
                maxPrice: p.maxPrice,
                logo: p.logo,
                galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages : [],
                masterPlanImages: Array.isArray(p.masterPlanImages) ? p.masterPlanImages : [],
                videoUrls: p.videoUrls || '',
                mapUrl: p.mapUrl,
                address: p.address,
                paymentPlan: Array.isArray(p.paymentPlan) ? p.paymentPlan : [],
                minSpace: p.minSpace,
                maxSpace: p.maxSpace,
              }
              const json = JSON.stringify(payload)
              const bytes = new TextEncoder().encode(json)
              let bin = ''
              bytes.forEach(b => { bin += String.fromCharCode(b) })
              const data = btoa(bin)
              const base = (import.meta.env?.BASE_URL || '/')
              const prefix = base.endsWith('/') ? base.slice(0, -1) : base
              const scope = prefix === '/' ? '' : prefix
              const companyName = (companySetup && companySetup.companyInfo && companySetup.companyInfo.companyName) || ''
              const companyParam = companyName ? `&company=${encodeURIComponent(companyName)}` : ''
              const url = `${window.location.origin}${scope}/#/landing/project?data=${encodeURIComponent(data)}${companyParam}`
              if (navigator?.share) {
                navigator.share({ title: payload.name || 'Project', text: 'View project details', url })
              } else {
                navigator.clipboard && navigator.clipboard.writeText(url)
                const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: (isRTL ? 'تم نسخ رابط المشاركة' : 'Share link copied') } })
                window.dispatchEvent(evt)
              }
            } catch (e) {
              console.error('Share error:', e)
            }
          }}
        >
          <FaShareAlt className={isRTL ? 'scale-x-[-1]' : ''} /> {Label.share}
        </button>
      </div>
    </div>
  )
}
function SummaryPanel({ projects, isRTL, onFilterStatus, onFilterCity }) {
  const totalUnits = projects.reduce((sum, p) => sum + (p.units || 0), 0)
  const cities = Array.from(new Set(projects.map(p => p.city)))
  const activeCount = projects.filter(p => (p.status||'').toLowerCase() === 'active' || (p.status||'').toLowerCase() === 'sales').length
  const statusCounts = ['Planning','Active','Sales','Completed'].map(s => ({ s, count: projects.filter(p => p.status===s).length }))

  return (
    <div className="glass-panel rounded-xl p-3">
      <h3 className="text-sm font-semibold">{isRTL ? 'ملخص المشاريع' : 'Projects Summary'}</h3>
      <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
        <button className="glass-panel tinted-blue p-3 rounded-lg text-start" onClick={()=>onFilterStatus && onFilterStatus('All')}>
          <div className="text-[var(--muted-text)]">{isRTL ? 'عدد المشاريع' : 'Projects'}</div>
          <div className="text-xl font-bold">{projects.length}</div>
        </button>
        <div className="glass-panel tinted-indigo p-3 rounded-lg">
          <div className="text-[var(--muted-text)]">{isRTL ? 'إجمالي الوحدات' : 'Total Units'}</div>
          <div className="text-xl font-bold">{totalUnits}</div>
        </div>
        <button className="glass-panel tinted-emerald p-3 rounded-lg text-start" onClick={()=>onFilterStatus && onFilterStatus('Active')}>
          <div className="text-[var(--muted-text)]">{isRTL ? 'النشط' : 'Active'}</div>
          <div className="text-xl font-bold">{activeCount}</div>
        </button>
      </div>
      <div className="mt-2 text-sm text-[var(--muted-text)]">
        <div className="flex flex-wrap items-center gap-2">
          <span>{isRTL ? 'المدن' : 'Cities'}:</span>
          <button className="px-2 py-0.5 text-xs rounded-md bg-transparent border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={()=>onFilterCity && onFilterCity('All')}>{isRTL ? 'الكل' : 'All'}</button>
          {cities.map(c => (
            <button key={c} className="px-2 py-0.5 text-xs rounded-md bg-transparent border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={()=>onFilterCity && onFilterCity(c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <div className="h-36 min-w-[600px]" style={{ width: `${Math.max((projects||[]).length * 90, 600)}px` }}>
          <Bar
            data={{
              labels: projects.map(p => (p.name || '').length > 12 ? (p.name || '').slice(0,12) + '…' : (p.name || '')),
              datasets: [{ label: isRTL ? 'الوحدات' : 'Units', data: projects.map(p => p.units || 0), backgroundColor: 'rgba(59,130,246,0.6)', borderRadius: 6 }]
            }}
            options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { autoSkip: false, maxRotation: 0, minRotation: 0 } }, y: { ticks: { callback: v => `${v}` } } } }}
          />
        </div>
      </div>
    </div>
  )
}

// Export helpers
function ExportProjectsExcel(rows) {
  const data = rows.map(p => ({
    Name: p.name,
    City: p.city,
    Developer: p.developer,
    Status: p.status,
    Units: p.units,
    Phases: p.phases,
    Docs: p.docs,
    LastUpdated: p.lastUpdated,
    MinPrice: p.minPrice || 0,
    MaxPrice: p.maxPrice || 0,
    Completion: (p.completion || 0) + '%'
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Projects')
  XLSX.writeFile(wb, 'projects_export.xlsx')
}



// View details modal
function ProjectDetailsModal({ p, isRTL, onClose }) {
  const [activeTab, setActiveTab] = useState('core')
  const [preview, setPreview] = useState({ list: [], index: -1 })

  const tabs = [
    { id: 'core', label: isRTL ? 'التفاصيل الأساسية' : 'Core Details' },
    { id: 'features', label: isRTL ? 'مواصفات المشروع' : 'Features' },
    { id: 'media', label: isRTL ? 'الوسائط' : 'Media' },
    { id: 'location', label: isRTL ? 'الموقع' : 'Location' },
    { id: 'financial', label: isRTL ? 'المالية' : 'Financial' },
    { id: 'cil', label: isRTL ? 'بيانات العميل' : 'CIL' },
    { id: 'publish', label: isRTL ? 'النشر' : 'Publish' },
  ]

  const ReadOnlyField = ({ label, value }) => (
    <div>
      <label className="block text-xs text-[var(--muted-text)] mb-1">{label}</label>
      <div className="p-2 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700 text-sm min-h-[38px]">
        {value || '-'}
      </div>
    </div>
  )

  const SectionTitle = ({ children }) => (
    <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">{children}</h3>
  )
  const normalizeSrc = (img) => typeof img === 'string' ? img : (img ? URL.createObjectURL(img) : '')
  const openPreview = (list, idx) => setPreview({ list: (Array.isArray(list) ? list : []).map(normalizeSrc).filter(Boolean), index: idx })
  const closePreview = () => setPreview({ list: [], index: -1 })
  const prevImg = () => setPreview(v => ({ ...v, index: (v.index - 1 + v.list.length) % v.list.length }))
  const nextImg = () => setPreview(v => ({ ...v, index: (v.index + 1) % v.list.length }))
  const toDataUrl = async (src) => {
    if (src instanceof File) {
      return await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(src) })
    }
    const resp = await fetch(src)
    const blob = await resp.blob()
    return await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob) })
  }
  const fitAddImage = async (doc, dataUrl) => {
    const img = new Image()
    img.src = dataUrl
    await new Promise((r)=>{ img.onload = r })
    const pw = doc.internal.pageSize.getWidth()
    const ph = doc.internal.pageSize.getHeight()
    const m = 20
    const aw = pw - m*2
    const ah = ph - m*2
    const ratio = Math.min(aw / img.width, ah / img.height)
    const w = img.width * ratio
    const h = img.height * ratio
    const x = m + (aw - w)/2
    const y = m + (ah - h)/2
    const fmt = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
    doc.addImage(dataUrl, fmt, x, y, w, h)
  }
  const downloadImagesPdf = async () => {
    const list = [
      ...(p.image ? [p.image] : []),
      ...(Array.isArray(p.galleryImages) ? p.galleryImages : []),
      ...(Array.isArray(p.masterPlanImages) ? p.masterPlanImages : []),
    ]
    if (list.length === 0) return
    const jsPDF = (await import('jspdf')).default
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    for (let i = 0; i < list.length; i++) {
      const src = list[i]
      const dataUrl = typeof src === 'string' ? await toDataUrl(src) : await toDataUrl(src)
      await fitAddImage(doc, dataUrl)
      if (i < list.length - 1) doc.addPage()
    }
    doc.save(`${(p.name || 'project').replace(/[\\/:*?\"<>|]/g,'_')}_media.pdf`)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[210] bg-[var(--content-bg)] text-[var(--content-text)] w-full h-screen sm:w-[900px] sm:max-w-[92vw] sm:max-h-[88vh] sm:h-auto sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-xl font-bold truncate flex-1">{p.name}</h2>
            <span className={`px-2 py-0.5 text-xs rounded-full ${p.status==='Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
              {p.status}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title={isRTL ? 'إغلاق' : 'Close'}>
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className={`flex items-center gap-4 ${isRTL ? 'justify-end' : 'justify-start'} overflow-x-auto`} dir={isRTL ? 'rtl' : 'ltr'}>
            {(isRTL ? [...tabs].slice().reverse() : tabs).map(t => (
              <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`px-3 py-2 text-sm rounded-lg border whitespace-nowrap ${activeTab===t.id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-700 text-[var(--content-text)]'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 min-h-[400px]">
          {activeTab === 'core' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 gap-4 content-start">
                  <ReadOnlyField label={isRTL ? 'اسم المشروع' : 'Project Name'} value={p.name} />
                  <ReadOnlyField label={isRTL ? 'المطور' : 'Developer'} value={p.developer} />
                  <ReadOnlyField label={isRTL ? 'التصنيف' : 'Category'} value={p.category} />
                  <div className="grid grid-cols-2 gap-4">
                    <ReadOnlyField label={isRTL ? 'الحالة' : 'Status'} value={p.status} />
                    <ReadOnlyField label={isRTL ? 'تاريخ التسليم' : 'Delivery Date'} value={p.deliveryDate} />
                  </div>
                  <ReadOnlyField label={isRTL ? 'وصف المشروع' : 'Project Description'} value={p.description} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <SectionTitle>{isRTL ? 'مواصفات المشروع' : 'Features'}</SectionTitle>
              {Array.isArray(p.amenities) && p.amenities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {p.amenities.map((item, idx) => (
                    <div key={idx} className="p-2 rounded border border-gray-200 dark:border-gray-700 text-sm">
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--muted-text)]">{isRTL ? 'لا توجد مواصفات' : 'No features'}</div>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label">{isRTL ? 'شعار المشروع' : 'Project Logo'}</label>
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-24 w-24 bg-transparent flex items-center justify-center">
                    {p.logo ? <img src={p.logo} alt="logo" className="w-full h-full object-contain p-2" /> : <FaImage className="text-2xl text-gray-300" />}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label">{isRTL ? 'الصورة الرئيسية' : 'Main Image'}</label>
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-48 bg-transparent flex items-center justify-center">
                    {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <FaImage className="text-4xl text-gray-300" />}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <SectionTitle>{isRTL ? 'معرض الصور' : 'Gallery'}</SectionTitle>
                  <button className="btn btn-glass inline-flex items-center gap-2 text-xs" onClick={downloadImagesPdf} title={isRTL ? 'تنزيل PDF' : 'Download PDF'}>
                    <FaCloudDownloadAlt /> {isRTL ? 'تنزيل PDF' : 'Download PDF'}
                  </button>
                </div>
                {Array.isArray(p.galleryImages) && p.galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {p.galleryImages.map((img, idx) => {
                      const src = typeof img === 'string' ? img : URL.createObjectURL(img)
                      return (
                        <button key={idx} className="rounded-lg overflow-hidden h-32 border border-gray-200 dark:border-gray-700 focus:outline-none" onClick={()=>openPreview(p.galleryImages, idx)} title={isRTL ? 'عرض' : 'View'}>
                          <img src={src} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-[var(--muted-text)]">{isRTL ? 'لا توجد صور' : 'No images'}</div>
                )}
              </div>
              <div className="space-y-4">
                <SectionTitle>{isRTL ? 'المخطط العام' : 'Master Plan'}</SectionTitle>
                {Array.isArray(p.masterPlanImages) && p.masterPlanImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p.masterPlanImages.map((img, idx) => (
                      <button key={idx} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 focus:outline-none" onClick={()=>openPreview(p.masterPlanImages, idx)} title={isRTL ? 'عرض' : 'View'}>
                        <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt={`master-plan-${idx}`} className="w-full h-auto object-contain" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-[var(--muted-text)] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    {isRTL ? 'لا توجد صور' : 'No images'}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <SectionTitle>{isRTL ? 'رابط الفيديو' : 'Video URL'}</SectionTitle>
                {p.videoUrls ? (
                  <div className="space-y-2">
                    {p.videoUrls.split('\n').map((url, i) => (
                      url.trim() && (
                        <div key={i} className="p-3 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700">
                          <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                            <FaVideo /> {url}
                          </a>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--muted-text)]">{isRTL ? 'لا يوجد فيديو' : 'No videos'}</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4 h-full min-h-[400px] flex flex-col">
              <SectionTitle>{isRTL ? 'العنوان' : 'Address'}</SectionTitle>
              <ReadOnlyField label={isRTL ? 'العنوان' : 'Address'} value={p.address} />
              <div className="grid grid-cols-2 gap-4">
                <ReadOnlyField label={isRTL ? 'المدينة' : 'City'} value={p.city} />
              </div>
              <SectionTitle>{isRTL ? 'الموقع على الخريطة' : 'Location Map'}</SectionTitle>
              <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 relative">
                {p.mapUrl ? (
                  <iframe src={p.mapUrl} className="w-full h-full border-0" title="project-map" loading="lazy" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--muted-text)]">
                    <div className="text-center">
                      <FaMapMarkerAlt className="mx-auto text-4xl mb-2 opacity-30" />
                      <p>{isRTL ? 'الخريطة غير متوفرة' : 'Map not available'}</p>
                      {p.latitude && p.longitude && <p className="text-xs mt-1">Lat: {p.latitude}, Lng: {p.longitude}</p>}
                    </div>
                  </div>
                )}
              </div>
              {p.latitude && p.longitude && (
                <div className="flex gap-4 text-sm text-[var(--muted-text)]">
                  <span>Lat: {p.latitude}</span>
                  <span>Lng: {p.longitude}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <SectionTitle>{isRTL ? 'نطاق السعر' : 'Price Range'}</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <ReadOnlyField label={isRTL ? 'من' : 'From'} value={new Intl.NumberFormat('en-EG', { style: 'currency', currency: p.currency || 'EGP', maximumFractionDigits: 0 }).format(p.minPrice||0)} />
                  <ReadOnlyField label={isRTL ? 'إلى' : 'To'} value={new Intl.NumberFormat('en-EG', { style: 'currency', currency: p.currency || 'EGP', maximumFractionDigits: 0 }).format(p.maxPrice||0)} />
                </div>
              </div>
              <div className="space-y-4">
                <SectionTitle>{isRTL ? 'نطاق المساحة (متر مربع)' : 'Space Range (sqm)'}</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <ReadOnlyField label={isRTL ? 'من' : 'From'} value={p.minSpace} />
                  <ReadOnlyField label={isRTL ? 'إلى' : 'To'} value={p.maxSpace} />
                </div>
              </div>
              <div className="space-y-4">
                <SectionTitle>{isRTL ? 'خطط الدفع' : 'Payment Plans'}</SectionTitle>
                {Array.isArray(p.paymentPlan) && p.paymentPlan.length > 0 ? (
                  <div className="rounded-xl overflow-x-auto border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead className="bg-transparent border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="text-start p-3">{isRTL ? '#' : 'No'}</th>
                          <th className="text-start p-3">{isRTL ? 'البيان' : 'Label'}</th>
                          <th className="text-start p-3">{isRTL ? 'التاريخ' : 'Date'}</th>
                          <th className="text-start p-3">{isRTL ? 'القيمة' : 'Amount'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.paymentPlan.map((r, i) => (
                          <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                            <td className="p-3">{r.no}</td>
                            <td className="p-3">{r.label}</td>
                            <td className="p-3">{r.dueDate}</td>
                            <td className="p-3 font-semibold">{new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(r.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--muted-text)]">{isRTL ? 'لا توجد خطة دفع' : 'No payment plan'}</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'more' && (
             <div className="space-y-4">
               <SectionTitle>{isRTL ? 'معلومات إضافية' : 'More Info'}</SectionTitle>
               <ReadOnlyField label={isRTL ? 'العنوان' : 'Address'} value={p.address} />
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <ReadOnlyField label={isRTL ? 'الحد الأدنى للسعر' : 'Min Price'} value={new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(p.minPrice||0)} />
                 <ReadOnlyField label={isRTL ? 'الحد الأقصى للسعر' : 'Max Price'} value={new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(p.maxPrice||0)} />
                 <ReadOnlyField label={isRTL ? 'أقل مساحة' : 'Min Space'} value={p.minSpace} />
                 <ReadOnlyField label={isRTL ? 'أقصى مساحة' : 'Max Space'} value={p.maxSpace} />
               </div>
               <div>
                 <label className="block text-xs text-[var(--muted-text)] mb-1">Drive URL</label>
                 {p.driveUrl ? (
                   <a href={p.driveUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all text-sm">{p.driveUrl}</a>
                 ) : <span className="text-sm text-gray-400">-</span>}
               </div>
             </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <SectionTitle>{isRTL ? 'معرض الصور' : 'Gallery'}</SectionTitle>
              {Array.isArray(p.galleryImages) && p.galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {p.galleryImages.map((img, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden h-32 border border-gray-200 dark:border-gray-700 group relative">
                      <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-[var(--muted-text)]">{isRTL ? 'لا توجد صور' : 'No images'}</div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-4 h-full min-h-[400px] flex flex-col">
               <SectionTitle>{isRTL ? 'الموقع على الخريطة' : 'Location Map'}</SectionTitle>
               <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 relative">
                  {p.mapUrl ? (
                    <iframe src={p.mapUrl} className="w-full h-full border-0" title="project-map" loading="lazy" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--muted-text)]">
                       <div className="text-center">
                         <FaMapMarkerAlt className="mx-auto text-4xl mb-2 opacity-30" />
                         <p>{isRTL ? 'الخريطة غير متوفرة' : 'Map not available'}</p>
                         {p.latitude && p.longitude && <p className="text-xs mt-1">Lat: {p.latitude}, Lng: {p.longitude}</p>}
                       </div>
                    </div>
                  )}
               </div>
               {p.latitude && p.longitude && (
                  <div className="flex gap-4 text-sm text-[var(--muted-text)]">
                    <span>Lat: {p.latitude}</span>
                    <span>Lng: {p.longitude}</span>
                  </div>
               )}
            </div>
          )}

          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <SectionTitle>{isRTL ? 'ملفات PDF' : 'PDF Files'}</SectionTitle>
              <div className="space-y-2">
                 {Array.isArray(p.pdfFiles) && p.pdfFiles.length > 0 ? (
                   p.pdfFiles.map((f, i) => (
                     <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <FaFilePdf className="text-red-500 text-xl" />
                          <span className="text-sm font-medium">{f.name || `File ${i+1}`}</span>
                        </div>
                        <button className="btn btn-glass btn-compact text-blue-600">{isRTL ? 'تحميل' : 'Download'}</button>
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-8 text-[var(--muted-text)]">{isRTL ? 'لا توجد ملفات' : 'No files'}</div>
                 )}
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-4">
              <SectionTitle>{isRTL ? 'فيديو' : 'Videos'}</SectionTitle>
              {Array.isArray(p.videoFiles) && p.videoFiles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {p.videoFiles.map((v, i) => (
                    <div key={i} className="rounded-lg overflow-hidden bg-black aspect-video relative">
                       <video controls className="w-full h-full">
                         <source src={v} />
                       </video>
                    </div>
                  ))}
                </div>
              )}
              {p.videoUrls ? (
                 <div className="space-y-2">
                   {p.videoUrls.split('\n').map((url, i) => (
                     url.trim() && (
                       <div key={i} className="p-3 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700">
                          <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                            <FaVideo /> {url}
                          </a>
                       </div>
                     )
                   ))}
                 </div>
              ) : (
                <div className="text-center py-8 text-[var(--muted-text)]">{isRTL ? 'لا يوجد فيديو' : 'No videos'}</div>
              )}
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-4">
              <SectionTitle>{isRTL ? 'خطة الدفع' : 'Payment Plan'}</SectionTitle>
              {Array.isArray(p.paymentPlan) && p.paymentPlan.length > 0 ? (
                <div className="rounded-xl overflow-x-auto border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                <thead className="bg-transparent border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="text-start p-3">{isRTL ? '#' : 'No'}</th>
                        <th className="text-start p-3">{isRTL ? 'البيان' : 'Label'}</th>
                        <th className="text-start p-3">{isRTL ? 'التاريخ' : 'Date'}</th>
                        <th className="text-start p-3">{isRTL ? 'القيمة' : 'Amount'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.paymentPlan.map((r, i) => (
                        <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="p-3">{r.no}</td>
                          <td className="p-3">{r.label}</td>
                          <td className="p-3">{r.dueDate}</td>
                          <td className="p-3 font-semibold">{new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(r.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--muted-text)]">{isRTL ? 'لا توجد خطة دفع' : 'No payment plan'}</div>
              )}
            </div>
          )}

          {activeTab === 'master' && (
             <div className="space-y-4">
               <SectionTitle>{isRTL ? 'الماستر بلان' : 'Master Plan'}</SectionTitle>
               {Array.isArray(p.masterPlanImages) && p.masterPlanImages.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {p.masterPlanImages.map((img, idx) => (
                     <div key={idx} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                       <img src={img} alt={`master-plan-${idx}`} className="w-full h-auto object-contain" />
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-10 text-[var(--muted-text)] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                   {isRTL ? 'لا توجد صور' : 'No images'}
                 </div>
               )}
             </div>
          )}

          {activeTab === 'cil' && (
             <div className="space-y-4">
               <SectionTitle>{isRTL ? 'بيانات العميل' : 'CIL'}</SectionTitle>
               {p.cil ? (
                 <div className="space-y-3">
                   <ReadOnlyField label={isRTL ? 'إلى' : 'To'} value={p.cil.to} />
                   <ReadOnlyField label={isRTL ? 'الموضوع' : 'Subject'} value={p.cil.subject} />
                   <div className="p-4 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700 text-sm whitespace-pre-wrap">
                     {p.cil.content || '-'}
                   </div>
                   <ReadOnlyField label={isRTL ? 'التوقيع' : 'Signature'} value={p.cil.signature} />
                   {Array.isArray(p.cil.attachments) && p.cil.attachments.length > 0 ? (
                     <div className="space-y-2">
                       {p.cil.attachments.map((att, i) => (
                         <div key={i} className="flex items-center gap-2 text-sm text-blue-600">
                           <FaPaperclip />
                           <span>
                             {typeof att === 'string' ? att : (att.name || 'Attachment')}
                           </span>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-sm text-[var(--muted-text)]">{isRTL ? 'لا توجد مرفقات' : 'No attachments'}</div>
                   )}
                 </div>
               ) : (
                 <div className="text-center py-8 text-[var(--muted-text)]">{isRTL ? 'لا توجد بيانات' : 'No CIL data'}</div>
               )}
             </div>
          )}

          {activeTab === 'publish' && (
            <div className="space-y-4">
              <SectionTitle>{isRTL ? 'النشر' : 'Publish'}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-[var(--muted-text)] block text-xs uppercase tracking-wider">{isRTL ? 'الاسم' : 'Name'}</span>
                  <div className="p-2 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700 min-h-[38px]">{p.contactName || '-'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[var(--muted-text)] block text-xs uppercase tracking-wider">{isRTL ? 'الحزمة التسويقية' : 'Marketing Package'}</span>
                  <div className="p-2 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700 min-h-[38px]">{p.marketingPackage || '-'}</div>
                </div>
              </div>
            </div>
          )}

        </div>
        {preview.index >= 0 && (
          <div className="absolute inset-0 z-[220] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={closePreview} />
            <div className="relative z-[230] max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-3">
              <img src={preview.list[preview.index]} alt="preview" className="max-w-[90vw] max-h-[75vh] object-contain rounded-xl border border-gray-200 dark:border-gray-700" />
              <div className="flex items-center gap-2">
                <button aria-label="Prev" className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 text-white border border-white/30 hover:bg-white/25" onClick={prevImg}>
                  <FaChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button aria-label="Next" className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 text-white border border-white/30 hover:bg-white/25" onClick={nextImg}>
                  <FaChevronRight className="w-3.5 h-3.5" />
                </button>
                <button className="px-3 py-1.5 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700" onClick={closePreview}>
                  {isRTL ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}