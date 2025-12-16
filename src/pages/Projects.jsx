import React, { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaFilter, FaShareAlt, FaEllipsisV, FaPlus, FaMapMarkerAlt, FaBuilding, FaTimes, FaEye, FaEdit, FaTrash } from 'react-icons/fa'
import * as XLSX from 'xlsx'
import { Bar } from 'react-chartjs-2'

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

export default function Projects() {
  const { i18n } = useTranslation()
  const isRTL = String(i18n.language || '').startsWith('ar')

  useEffect(() => {
    try { document.documentElement.dir = isRTL ? 'rtl' : 'ltr' } catch {}
  }, [isRTL])

  const [query, setQuery] = useState('')
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [editProject, setEditProject] = useState(null)
  const [toasts, setToasts] = useState([])
  const [_importLogs, setImportLogs] = useState([])
  const [selectedStatuses, setSelectedStatuses] = useState(['Planning','Active','Sales','Completed'])
  const [selectedCities, setSelectedCities] = useState([])
  const [selectedDevelopers, setSelectedDevelopers] = useState([])
  const [unitsRange, setUnitsRange] = useState([0, 500])
  const [phasesRange, setPhasesRange] = useState([0, 10])

  const projects = useMemo(() => ([
    {
      name: 'Nile Tower Residences',
      city: 'New Cairo',
      units: 180,
      developer: 'Nile Real Estate',
      status: 'Sales',
      phases: 5,
      docs: 42,
      lastUpdated: '2025-12-10',
      image: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop',
      logo: null,
      description: 'Luxury apartments overlooking the Nile corridor with modern amenities.',
      completion: 70,
      revenue: 980000
    },
    {
      name: 'October Business Park',
      city: '6th of October',
      units: 65,
      developer: 'Horizon Builders',
      status: 'Active',
      phases: 3,
      docs: 28,
      lastUpdated: '2025-12-08',
      image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop',
      logo: null,
      description: 'Mixed-use business complex with offices and retail spaces.',
      completion: 55,
      revenue: 520000
    },
    {
      name: 'Marina Seaview',
      city: 'Alexandria',
      units: 120,
      developer: 'Marina Group',
      status: 'Completed',
      phases: 6,
      docs: 60,
      lastUpdated: '2025-11-25',
      image: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?q=80&w=1200&auto=format&fit=crop',
      logo: null,
      description: 'Beachfront residences with panoramic sea views and club access.',
      completion: 100,
      revenue: 2150000
    },
    {
      name: 'Maadi Gardens',
      city: 'Maadi',
      units: 90,
      developer: 'Alpha Dev',
      status: 'Active',
      phases: 4,
      docs: 33,
      lastUpdated: '2025-12-12',
      image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1200&auto=format&fit=crop',
      logo: null,
      description: 'Green compound offering family-friendly living with parks and pools.',
      completion: 48,
      revenue: 640000
    },
    {
      name: 'Nasr City Medical Hub',
      city: 'Nasr City',
      units: 40,
      developer: 'CarePlus Developments',
      status: 'Planning',
      phases: 2,
      docs: 18,
      lastUpdated: '2025-12-05',
      image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop',
      logo: null,
      description: 'Integrated medical hub with clinics, labs, and outpatient facilities.',
      completion: 20,
      revenue: 0
    },
    {
      name: 'Zayed Heights',
      city: 'Elshiekh Zayed',
      units: 150,
      developer: 'Skyline Properties',
      status: 'Sales',
      phases: 5,
      docs: 39,
      lastUpdated: '2025-12-09',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop',
      logo: null,
      description: 'Premium high-rise living close to business districts and schools.',
      completion: 62,
      revenue: 1120000
    }
  ]), [])

  const allCities = useMemo(() => Array.from(new Set(projects.map(p => p.city))), [projects])
  const allDevelopers = useMemo(() => Array.from(new Set(projects.map(p => p.developer))), [projects])
  const allStatuses = ['Planning','Active','Sales','Completed']

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter(p => {
      const qOk = !q || [p.name, p.city, p.developer, p.description].some(v => (v||'').toLowerCase().includes(q))
      const statusOk = selectedStatuses.includes(p.status)
      const cityOk = selectedCities.length === 0 || selectedCities.includes(p.city)
      const devOk = selectedDevelopers.length === 0 || selectedDevelopers.includes(p.developer)
      const unitsOk = (p.units || 0) >= unitsRange[0] && (p.units || 0) <= unitsRange[1]
      const phasesOk = (p.phases || 0) >= phasesRange[0] && (p.phases || 0) <= phasesRange[1]
      return qOk && statusOk && cityOk && devOk && unitsOk && phasesOk
    })
  }, [projects, query, selectedStatuses, selectedCities, selectedDevelopers, unitsRange, phasesRange])

  const addToast = (type, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedStatuses(['Planning','Active','Sales','Completed'])
    setSelectedCities([])
    setSelectedDevelopers([])
    setUnitsRange([0,500])
    setPhasesRange([0,10])
  }

  const Label = {
    title: isRTL ? 'المشاريع' : 'Projects',
    search: isRTL ? 'بحث' : 'Search',
    filter: isRTL ? 'تصفية' : 'Filter',
    importProjects: isRTL ? 'استيراد المشاريع' : 'Import Projects',
    createProject: isRTL ? 'إنشاء مشروع' : 'Add project',
    location: isRTL ? 'الموقع' : 'Location',
    units: isRTL ? 'وحدات' : 'Units',
    share: isRTL ? 'مشاركة' : 'Share',
    more: isRTL ? 'المزيد' : 'More',
    developer: isRTL ? 'المطور' : 'Developer',
    status: isRTL ? 'الحالة' : 'Status',
    city: isRTL ? 'المدينة' : 'City',
    phases: isRTL ? 'المراحل' : 'Phases',
    clearFilters: isRTL ? 'مسح المرشحات' : 'Clear Filters',
    exportPdf: isRTL ? 'تصدير PDF' : 'Export PDF'
  }

  return (
    <div className="p-4 md:p-6 bg-[var(--content-bg)] text-[var(--content-text)] overflow-x-hidden min-w-0">
        {/* Header */}
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="relative inline-flex items-center gap-2">
              <span
                aria-hidden
  className="inline-block h-[1px] w-12 rounded
             bg-gradient-to-r from-blue-500 via-purple-500 to-transparent"
              />
              <h1 className="page-title text-2xl font-bold text-start">{Label.title}</h1>
              
            </div>
            <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button className="btn btn-glass btn-compact" onClick={() => setFilterOpen(v=>!v)}>
                <span className="inline-flex items-center gap-2">
                <FaFilter /> {Label.filter}
                </span>
              </button>
              <button className="btn btn-glass btn-compact" onClick={()=>setShowImportModal(true)}>
                {Label.importProjects}
              </button>
              <button className="btn btn-primary btn-compact" onClick={()=>setShowCreateModal(true)}>
                <span className="inline-flex items-center gap-2">
                <FaPlus /> {Label.createProject}
                </span>
              </button>
              <button className="btn btn-glass btn-compact" onClick={()=>exportProjectsPdf(filtered)}>{Label.exportPdf}</button>
            </div>
          </div>

          {isFilterOpen && (
            <div className={`mt-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm ${isRTL ? 'text-end' : 'text-start'}`}>
              {/* Status multi-select */}
              <div className={`flex flex-wrap items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-[var(--muted-text)]">{Label.status}:</span>
                {allStatuses.map(s => (
                  <label key={s} className={`inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <input type="checkbox" checked={selectedStatuses.includes(s)} onChange={(e)=>{
                      setSelectedStatuses(prev => e.target.checked ? [...prev, s] : prev.filter(x=>x!==s))
                    }} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
              {/* City multi-select */}
              <div className={`flex flex-wrap items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-[var(--muted-text)]">{Label.city}:</span>
                {allCities.map(c => (
                  <label key={c} className={`inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <input type="checkbox" checked={selectedCities.includes(c)} onChange={(e)=>{
                      setSelectedCities(prev => e.target.checked ? [...prev, c] : prev.filter(x=>x!==c))
                    }} />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
              {/* Developer multi-select */}
              <div className={`flex flex-wrap items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-[var(--muted-text)]">{Label.developer}:</span>
                {allDevelopers.map(d => (
                  <label key={d} className={`inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <input type="checkbox" checked={selectedDevelopers.includes(d)} onChange={(e)=>{
                      setSelectedDevelopers(prev => e.target.checked ? [...prev, d] : prev.filter(x=>x!==d))
                    }} />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
              {/* Range sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted-text)]">{Label.units}</span>
                    <span className="text-xs">{unitsRange[0]} - {unitsRange[1]}</span>
                  </div>
                  <input type="range" min="0" max="500" value={unitsRange[0]} onChange={e=>setUnitsRange([Number(e.target.value), unitsRange[1]])} />
                  <input type="range" min="0" max="500" value={unitsRange[1]} onChange={e=>setUnitsRange([unitsRange[0], Number(e.target.value)])} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted-text)]">{Label.phases}</span>
                    <span className="text-xs">{phasesRange[0]} - {phasesRange[1]}</span>
                  </div>
                  <input type="range" min="0" max="10" value={phasesRange[0]} onChange={e=>setPhasesRange([Number(e.target.value), phasesRange[1]])} />
                  <input type="range" min="0" max="10" value={phasesRange[1]} onChange={e=>setPhasesRange([phasesRange[0], Number(e.target.value)])} />
                </div>
              </div>
              <div className={`mt-3 flex items-center ${isRTL ? 'justify-start' : 'justify-end'}`}>
                <button className="btn btn-glass" onClick={clearFilters}>{Label.clearFilters}</button>
              </div>
            </div>
          )}
        </div>

        {/* Summary row (full width) */}
        <div className="mt-4">
          <SummaryPanel projects={filtered} isRTL={isRTL} onFilterStatus={(s)=> setSelectedStatuses([s])} onFilterCity={(c)=> setSelectedCities([c])} />
        </div>

        {/* Projects list: two per row */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
          {filtered.map((p, idx) => (
            <div key={idx} className="glass-panel rounded-xl overflow-hidden">
              <ProjectCard
                p={p}
                isRTL={isRTL}
                Label={Label}
                onView={(proj)=>setSelectedProject(proj)}
                onEdit={(proj)=>{ setEditProject(proj); setShowCreateModal(true) }}
              />
            </div>
          ))}
          
        </div>

        {/* Import Projects Modal */}
        {showImportModal && (
          <ProjectsImportModal onClose={()=>setShowImportModal(false)} isRTL={isRTL} addToast={addToast} addLog={(log)=>setImportLogs(prev=>[log,...prev])} />
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <CreateProjectModal
            onClose={()=>{ setShowCreateModal(false); setEditProject(null) }}
            isRTL={isRTL}
            mode={editProject ? 'edit' : 'create'}
            initialValues={editProject ? { name: editProject.name || '', developer: editProject.developer || '' } : undefined}
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

function ProjectsImportModal({ onClose, isRTL, addToast, addLog }) {
  const [files, setFiles] = useState([])
  const [previewRows, setPreviewRows] = useState([])

  const handleTemplate = (type='csv') => {
    const headerCols = ['Project','City','Developer','Units','Phases','Status','Docs','LastUpdated','Image','Logo','Description']
    const sampleCols = ['Sample Project','New Cairo','Sample Dev','12','3','Planning','5','2025-10-10','https://picsum.photos/1200/800','','Sample description']
    if (type==='csv') {
      const csv = headerCols.join(',') + '\n' + sampleCols.join(',') + '\n'
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'projects_template.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      const ws = XLSX.utils.aoa_to_sheet([headerCols, sampleCols])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Template')
      XLSX.writeFile(wb, 'projects_template.xlsx')
    }
  }

  const onFilesChange = async (e) => {
    const list = Array.from(e.target.files || [])
    setFiles(list)
    if (list[0]) {
      try {
        const arrBuff = await list[0].arrayBuffer()
        const wb = XLSX.read(arrBuff, { type: 'array' })
        const wsName = wb.SheetNames[0]
        const ws = wb.Sheets[wsName]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
        setPreviewRows(rows.slice(0, 50))
      } catch {
        addToast('error', isRTL ? 'تعذر قراءة الملف' : 'Failed to read file')
      }
    }
  }

  const onImport = () => {
    if (!files.length) {
      addToast('error', isRTL ? 'اختر ملفات أولاً' : 'Select files first')
      return
    }
    files.forEach(f => addLog({ fileName: f.name, user: 'Current User', timestamp: new Date().toISOString(), status: 'Success' }))
    addToast('success', isRTL ? 'تم الاستيراد بنجاح' : 'Import successful')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-[210] glass-panel rounded-xl p-4 w-[800px] max-w-[90vw] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{isRTL ? 'استيراد المشاريع' : 'Import Projects'}</h2>
          <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إغلاق' : 'Close'}</button>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-[var(--muted-text)]">{isRTL ? 'ارفع ملفات CSV/XLSX، ستظهر معاينة.' : 'Upload CSV/XLSX files, a preview will show.'}</p>
          <div className="flex items-center gap-3">
            <input type="file" accept=".csv,.xlsx" multiple onChange={onFilesChange} />
            <button className="btn btn-glass" onClick={()=>handleTemplate('csv')}>{isRTL ? 'تنزيل قالب CSV' : 'Download CSV Template'}</button>
            <button className="btn btn-glass" onClick={()=>handleTemplate('xlsx')}>{isRTL ? 'تنزيل قالب XLSX' : 'Download XLSX Template'}</button>
          </div>
          {/* Preview */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-[300px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {previewRows[0] && Object.keys(previewRows[0]).map(k => <th key={k} className="px-2 py-1 text-start">{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r, idx) => (
                  <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                    {Object.values(r).map((v, i) => <td key={i} className="px-2 py-1">{String(v)}</td>)}
                  </tr>
                ))}
                {previewRows.length === 0 && (
                  <tr><td className="px-2 py-3 text-center text-[var(--muted-text)]">{isRTL ? 'لا توجد معاينة' : 'No preview'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
            <button className="btn btn-primary" onClick={onImport}>{isRTL ? 'استيراد' : 'Import'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateProjectModal({ onClose, isRTL, mode = 'create', initialValues }) {
  const [activeLang, setActiveLang] = useState(isRTL ? 'ar' : 'en')
  const [activeTab, setActiveTab] = useState('basic')
  const [form, setForm] = useState({
    // Basic
    name: initialValues?.name || '', developer: initialValues?.developer || '', category: '', unitPrefix: '', indirectName: '', indirectPhone: '',
    // More Info
    address: '', minPrice: '', maxPrice: '', minSpace: '', maxSpace: '', driveUrl: '',
    // Files
    logoFile: null, mainImageFile: null
  })

  const setVal = (key) => (e) => setForm(v => ({ ...v, [key]: e.target.value }))

  const tabs = [
    { id: 'basic', label: isRTL ? 'المعلومات الأساسية' : 'Basic Info' },
    { id: 'more', label: isRTL ? 'المزيد' : 'More Info' },
    { id: 'gallery', label: isRTL ? 'معرض' : 'Gallery' },
    { id: 'pdf', label: 'PDF' },
    { id: 'video', label: isRTL ? 'فيديو' : 'Video' },
    { id: 'payment', label: isRTL ? 'خطة الدفع' : 'Payment Plan' },
    { id: 'master', label: isRTL ? 'ماستر بلان' : 'Master Plan' },
    { id: 'map', label: isRTL ? 'خريطة' : 'Map' },
    { id: 'cil', label: isRTL ? 'CIL' : 'CIL' },
  ]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Shell */}
      <div className="relative z-[210] bg-[var(--content-bg)] text-[var(--content-text)] w-full h-screen sm:w-[900px] sm:max-w-[92vw] sm:max-h-[88vh] sm:h-auto sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{mode==='edit' ? (isRTL ? 'تعديل مشروع' : 'Edit Project') : (isRTL ? 'إنشاء مشروع' : 'Add project')}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title={isRTL ? 'إغلاق' : 'Close'}>
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'} overflow-x-auto`} dir={isRTL ? 'rtl' : 'ltr'}>
            {(isRTL ? [...tabs].slice().reverse() : tabs).map(t => (
              <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`px-3 py-2 text-sm rounded-lg border ${activeTab===t.id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-700 text-[var(--content-text)]'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Language Switch */}
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={()=>setActiveLang('en')} className={`btn btn-glass btn-compact ${activeLang==='en' ? 'border-blue-500 text-blue-600 dark:text-blue-300 font-semibold' : ''}`}>English</button>
                <button onClick={()=>setActiveLang('ar')} className={`btn btn-glass btn-compact ${activeLang==='ar' ? 'border-blue-500 text-blue-600 dark:text-blue-300 font-semibold' : ''}`}>{isRTL ? 'العربية' : 'Arabic'}</button>
              </div>
              </div>

              {/* Logo & Main Image Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'رفع اللوجو' : 'Upload Logo'}</label>
                  <input type="file" accept="image/*" onChange={(e)=>setForm(v=>({...v, logoFile: e.target.files?.[0] || null}))} />
                  {form.logoFile && (
                    <div className="mt-2">
                      <img src={URL.createObjectURL(form.logoFile)} alt="logo preview" className="h-16 w-auto object-contain rounded-md border" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'رفع الصورة الرئيسية' : 'Upload Main Image'}</label>
                  <input type="file" accept="image/*" onChange={(e)=>setForm(v=>({...v, mainImageFile: e.target.files?.[0] || null}))} />
                  {form.mainImageFile && (
                    <div className="mt-2">
                      <img src={URL.createObjectURL(form.mainImageFile)} alt="main preview" className="h-28 w-full object-cover rounded-md border" />
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'اسم المشروع' : 'Project Name'}</label>
                  <input className="input w-full" value={form.name} onChange={setVal('name')} placeholder={isRTL ? 'اسم المشروع' : 'Project Name'} />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'المطور' : 'Developer'}</label>
                  <input className="input w-full" value={form.developer} onChange={setVal('developer')} placeholder={isRTL ? 'المطور' : 'Developer'} />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'التصنيف' : 'Category'}</label>
                  <input className="input w-full" value={form.category} onChange={setVal('category')} placeholder={isRTL ? 'التصنيف' : 'Category'} />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'بادئة كود الوحدة' : 'Unit Code Prefix'}</label>
                  <input className="input w-full" value={form.unitPrefix} onChange={setVal('unitPrefix')} placeholder={isRTL ? 'بادئة كود الوحدة' : 'Unit Code Prefix'} />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'اسم المبيعات غير المباشرة' : 'Indirect Sales Name'}</label>
                  <input className="input w-full" value={form.indirectName} onChange={setVal('indirectName')} placeholder={isRTL ? 'اسم المبيعات غير المباشرة' : 'Indirect Sales Name'} />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'هاتف المبيعات غير المباشرة' : 'Indirect Sales Phone'}</label>
                  <input className="input w-full" value={form.indirectPhone} onChange={setVal('indirectPhone')} placeholder={isRTL ? 'هاتف المبيعات غير المباشرة' : 'Indirect Sales Phone'} />
                </div>
              </div>

              {/* Footer */}
              <div className={`flex items-center justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
                <button className="btn btn-primary" onClick={onClose}>{mode==='edit' ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'حفظ' : 'Save')}</button>
              </div>
            </div>
          )}

        {activeTab === 'more' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{isRTL ? 'معلومات إضافية' : 'More Info'}</h3>
              <div>
                <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'العنوان' : 'Address'}</label>
                <input className="input w-full" value={form.address} onChange={setVal('address')} placeholder={isRTL ? 'العنوان' : 'Address'} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'الحد الأدنى للسعر' : 'Min Price'}</label>
                  <input type="number" className="input w-full" value={form.minPrice} onChange={setVal('minPrice')} placeholder={isRTL ? 'أقل سعر' : 'Min Price'} />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'الحد الأقصى للسعر' : 'Max Price'}</label>
                  <input type="number" className="input w-full" value={form.maxPrice} onChange={setVal('maxPrice')} placeholder={isRTL ? 'أعلى سعر' : 'Max Price'} />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'أقل مساحة' : 'Min Space'}</label>
                  <input type="number" className="input w-full" value={form.minSpace} onChange={setVal('minSpace')} placeholder={isRTL ? 'أقل مساحة' : 'Min Space'} />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'أقصى مساحة' : 'Max Space'}</label>
                  <input type="number" className="input w-full" value={form.maxSpace} onChange={setVal('maxSpace')} placeholder={isRTL ? 'أقصى مساحة' : 'Max Space'} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--muted-text)] mb-1">Drive URL</label>
                <input className="input w-full" value={form.driveUrl} onChange={setVal('driveUrl')} placeholder="Drive URL" />
              </div>
              <div className={`flex items-center justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
                <button className="btn btn-primary" onClick={onClose}>{isRTL ? 'حفظ' : 'Save'}</button>
              </div>
          </div>
        )}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{isRTL ? 'معرض' : 'Gallery'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'صور المعرض' : 'Gallery Images'}</label>
                <input type="file" multiple accept="image/*" />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'الصورة الرئيسية' : 'Main Image'}</label>
                <input type="file" accept="image/*" />
              </div>
            </div>
            <div className={`flex items-center justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
              <button className="btn btn-primary" onClick={onClose}>{isRTL ? 'حفظ' : 'Save'}</button>
            </div>
          </div>
        )}
        {activeTab === 'pdf' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">PDF</h3>
            <div>
              <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'ملفات PDF' : 'PDF Files'}</label>
              <input type="file" multiple accept="application/pdf" />
            </div>
            <div className={`flex items-center justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
              <button className="btn btn-primary" onClick={onClose}>{isRTL ? 'حفظ' : 'Save'}</button>
            </div>
          </div>
        )}
        {activeTab === 'video' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{isRTL ? 'فيديو' : 'Video'}</h3>
            <div>
              <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'روابط الفيديو' : 'Video URLs'}</label>
              <textarea className="input w-full" rows={3} placeholder={isRTL ? 'أدخل روابط الفيديو، كل سطر رابط' : 'Enter video URLs, one per line'} />
            </div>
            <div className={`flex items-center justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
              <button className="btn btn-primary" onClick={onClose}>{isRTL ? 'حفظ' : 'Save'}</button>
            </div>
          </div>
        )}
        {activeTab === 'payment' && (
          <PaymentPlanTab isRTL={isRTL} onClose={onClose} onSave={(rows)=>{ setForm(v=>({...v, paymentPlan: rows})); onClose(); }} />
        )}
        {activeTab === 'master' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{isRTL ? 'ماستر بلان' : 'Master Plan'}</h3>
            <div>
              <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'صور الماستر بلان' : 'Master Plan Images'}</label>
              <input type="file" multiple accept="image/*" />
            </div>
            <div className={`flex items-center justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
              <button className="btn btn-primary" onClick={onClose}>{isRTL ? 'حفظ' : 'Save'}</button>
            </div>
          </div>
        )}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{isRTL ? 'خريطة' : 'Map'}</h3>
            <div>
              <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'رابط الخريطة' : 'Map URL'}</label>
              <input className="input w-full" placeholder="https://..." />
            </div>
            <div className={`flex items-center justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
              <button className="btn btn-primary" onClick={onClose}>{isRTL ? 'حفظ' : 'Save'}</button>
            </div>
          </div>
        )}
        {activeTab === 'cil' && (
          <CilTab isRTL={isRTL} onClose={onClose} onSave={(cil)=>{ setForm(v=>({...v, cil })); onClose(); }} />
        )}
        </div>
      </div>
    </div>
  )
}

function PaymentPlanTab({ isRTL, onClose, onSave }) {
  const [payment, setPayment] = useState({ basePrice: '', downPct: '', installments: '', startDate: '', frequency: 'monthly', graceMonths: '0', interestPct: '' })
  const [schedule, setSchedule] = useState([])
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
      <div className={`flex items-center justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button className="btn btn-glass" onClick={gen}>{isRTL ? 'توليد' : 'Generate'}</button>
      </div>
      {schedule.length > 0 && (
        <div className="space-y-3">
          <div className="glass-panel rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">{isRTL ? 'الإجمالي' : 'Total'}: <span className="font-semibold">{new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(total)}</span></div>
              <div className="flex items-center gap-2">
                <button className="btn btn-glass" onClick={exportCsv}>{isRTL ? 'CSV' : 'CSV'}</button>
                <button className="btn btn-glass" onClick={exportPdf}>{isRTL ? 'PDF' : 'PDF'}</button>
                <button className="btn btn-primary" onClick={()=>onSave && onSave(schedule)}>{isRTL ? 'حفظ' : 'Save'}</button>
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
      <div className={`flex items-center justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
      </div>
    </div>
  )
}

function CilTab({ isRTL, onClose, onSave }) {
  const [cil, setCil] = useState({
    brokerCompany: '',
    brokerRegId: '',
    commissionType: 'percentage',
    commissionValue: '',
    attributedClient: true,
    leadId: '',
    campaignSource: '',
    effectiveFrom: '',
    effectiveTo: '',
    status: 'Pending',
    terms: '',
    notes: '',
    cilFile: null,
    supportDocs: [],
  })
  const setVal = (key) => (e) => setCil(v => ({ ...v, [key]: e.target?.type === 'checkbox' ? e.target.checked : e.target.value }))
  const onFiles = (key) => (e) => {
    const files = Array.from(e.target.files || [])
    setCil(v => ({ ...v, [key]: key === 'cilFile' ? (files[0] || null) : files }))
  }
  const validate = () => {
    const okBroker = String(cil.brokerCompany || '').trim().length > 0
    const val = Number(cil.commissionValue)
    const okComm = !isNaN(val) && val > 0
    return okBroker && okComm
  }
  const exportPdf = async () => {
    const jsPDF = (await import('jspdf')).default
    const autoTable = await import('jspdf-autotable')
    const doc = new jsPDF()
    autoTable.default(doc, {
      head: [[isRTL ? 'بيان CIL' : 'CIL Statement']],
      body: [
        [ (isRTL ? 'شركة البروكر: ' : 'Broker Company: ') + (cil.brokerCompany||'-') ],
        [ (isRTL ? 'رقم التسجيل: ' : 'Registration ID: ') + (cil.brokerRegId||'-') ],
        [ (isRTL ? 'نمط العمولة: ' : 'Commission Type: ') + (cil.commissionType==='percentage' ? (isRTL ? 'نسبة' : 'Percentage') : (isRTL ? 'قيمة ثابتة' : 'Fixed Amount')) ],
        [ (isRTL ? 'قيمة العمولة: ' : 'Commission Value: ') + String(cil.commissionValue||'-') ],
        [ (isRTL ? 'منسوب عميل للبروكر: ' : 'Attributed Client: ') + (cil.attributedClient ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No')) ],
        [ (isRTL ? 'رقم العميل/الليد: ' : 'Lead ID: ') + (cil.leadId||'-') ],
        [ (isRTL ? 'مصدر الحملة: ' : 'Campaign Source: ') + (cil.campaignSource||'-') ],
        [ (isRTL ? 'ساري من: ' : 'Effective From: ') + (cil.effectiveFrom||'-') ],
        [ (isRTL ? 'ساري إلى: ' : 'Effective To: ') + (cil.effectiveTo||'-') ],
        [ (isRTL ? 'الحالة: ' : 'Status: ') + (cil.status||'-') ],
        [ (isRTL ? 'الشروط: ' : 'Terms: ') + (cil.terms||'-') ],
        [ (isRTL ? 'ملاحظات: ' : 'Notes: ') + (cil.notes||'-') ],
      ],
      styles: { halign: isRTL ? 'right' : 'left' },
    })
    doc.save('cil_statement.pdf')
  }
  const save = () => { if (!validate()) return alert(isRTL ? 'أكمل الحقول المطلوبة' : 'Please fill required fields'); onSave && onSave(cil) }
  return (
    <div className="space-y-4 text-[var(--content-text)]">
      <h3 className="text-lg font-semibold">CIL</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'شركة البروكر' : 'Broker Company'}</label>
          <input className="input w-full" value={cil.brokerCompany} onChange={setVal('brokerCompany')} />
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'رقم التسجيل' : 'Registration ID'}</label>
          <input className="input w-full" value={cil.brokerRegId} onChange={setVal('brokerRegId')} />
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'نمط العمولة' : 'Commission Type'}</label>
          <select className="input w-full" value={cil.commissionType} onChange={setVal('commissionType')}>
            <option value="percentage">{isRTL ? 'نسبة' : 'Percentage'}</option>
            <option value="fixed">{isRTL ? 'قيمة ثابتة' : 'Fixed Amount'}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'قيمة العمولة' : 'Commission Value'}</label>
          <input type="number" className="input w-full" value={cil.commissionValue} onChange={setVal('commissionValue')} placeholder={cil.commissionType==='percentage' ? (isRTL ? '٪' : '%') : (isRTL ? 'EGP' : 'EGP')} />
        </div>
        <div className={`md:col-span-2 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={cil.attributedClient} onChange={setVal('attributedClient')} />
            <span className="text-sm">{isRTL ? 'عميل منسوب للبروكر (أحقية عمولة)' : 'Client attributed to broker (commission eligibility)'}</span>
          </label>
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'رقم الليد' : 'Lead ID'}</label>
          <input className="input w-full" value={cil.leadId} onChange={setVal('leadId')} />
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'مصدر الحملة' : 'Campaign Source'}</label>
          <input className="input w-full" value={cil.campaignSource} onChange={setVal('campaignSource')} />
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'ساري من' : 'Effective From'}</label>
          <input type="date" className="input w-full" value={cil.effectiveFrom} onChange={setVal('effectiveFrom')} />
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'ساري إلى' : 'Effective To'}</label>
          <input type="date" className="input w-full" value={cil.effectiveTo} onChange={setVal('effectiveTo')} />
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'الحالة' : 'Status'}</label>
          <select className="input w-full" value={cil.status} onChange={setVal('status')}>
            <option value="Pending">{isRTL ? 'قيد المراجعة' : 'Pending'}</option>
            <option value="Approved">{isRTL ? 'معتمد' : 'Approved'}</option>
            <option value="Rejected">{isRTL ? 'مرفوض' : 'Rejected'}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'ملف CIL' : 'CIL File'}</label>
          <input type="file" accept="application/pdf,image/*" onChange={onFiles('cilFile')} />
          <div className="text-xs text-[var(--muted-text)] mt-1">{cil.cilFile ? (cil.cilFile.name||'1 file') : (isRTL ? 'لم يتم اختيار ملف' : 'No file selected')}</div>
        </div>
        <div>
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'مستندات داعمة' : 'Supporting Documents'}</label>
          <input type="file" multiple accept="application/pdf,image/*" onChange={onFiles('supportDocs')} />
          <div className="text-xs text-[var(--muted-text)] mt-1">{cil.supportDocs?.length || 0} {isRTL ? 'ملفات' : 'files'}</div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'الشروط' : 'Terms'}</label>
          <textarea className="input w-full" rows={3} value={cil.terms} onChange={setVal('terms')} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-[var(--muted-text)] mb-1">{isRTL ? 'ملاحظات' : 'Notes'}</label>
          <textarea className="input w-full" rows={2} value={cil.notes} onChange={setVal('notes')} />
        </div>
      </div>
      <div className={`flex items-center justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button className="btn btn-glass" onClick={exportPdf}>PDF</button>
        <button className="btn btn-primary" onClick={save}>{isRTL ? 'حفظ' : 'Save'}</button>
        <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
      </div>
    </div>
  )
}

function ProjectCard({ p, isRTL, Label, onView, onEdit }) {
  const img = p.image || pickImage(p.name)
  return (
    <div className="p-3">
      {/* Line header: name + status + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {p.logo && <img src={p.logo} alt={`${p.name} logo`} className="h-7 w-auto" />}
          <h3 className="text-base font-semibold">{p.name}</h3>
          <span className="inline-flex px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">{p.status}</span>
        </div>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button className="btn-icon" title={isRTL ? 'عرض' : 'View'} aria-label={isRTL ? 'عرض' : 'View'} onClick={()=>onView && onView(p)}>
            <FaEye className="w-4 h-4" />
          </button>
          <button className="btn-icon" title={isRTL ? 'تعديل' : 'Edit'} aria-label={isRTL ? 'تعديل' : 'Edit'} onClick={()=>onEdit && onEdit(p)}>
            <FaEdit className="w-4 h-4" />
          </button>
          <button className="btn-icon" title={isRTL ? 'حذف' : 'Delete'} aria-label={isRTL ? 'حذف' : 'Delete'}>
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {img && (
        <div className="mt-2 rounded-lg overflow-hidden">
          <img src={img} alt={p.name} className="w-full h-40 md:h-56 object-cover" />
        </div>
      )}

      {/* Compact line details */}
      <div className={`mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm ${isRTL ? 'text-end' : 'text-start'}`}>
        <div className={`glass-panel tinted-blue px-2 py-1 rounded-md flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}><FaMapMarkerAlt className="opacity-70" /> {p.city}</div>
        <div className={`glass-panel tinted-indigo px-2 py-1 rounded-md flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}><FaBuilding className="opacity-70" /> {p.developer}</div>
        <div className="glass-panel tinted-emerald px-2 py-1 rounded-md">{Label.units}: <span className="font-semibold">{p.units}</span></div>
        <div className="glass-panel tinted-violet px-2 py-1 rounded-md">{isRTL ? 'المراحل' : 'Phases'}: <span className="font-semibold">{p.phases}</span></div>
        <div className="glass-panel tinted-amber px-2 py-1 rounded-md">{isRTL ? 'الملفات' : 'Docs'}: <span className="font-semibold">{p.docs}</span></div>
        <div className="glass-panel tinted-blue px-2 py-1 rounded-md">{isRTL ? 'آخر تحديث' : 'Updated'}: <span className="font-semibold">{p.lastUpdated}</span></div>
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
          <div className="text-xs text-[var(--muted-text)] mb-1">{isRTL ? 'تقدير الإيراد' : 'Revenue Estimate'}</div>
          <div className="text-sm font-semibold">{p.revenue ? new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(p.revenue) : (isRTL ? 'غير متاح' : 'N/A')}</div>
        </div>
      </div>

      {/* Share */}
      <div className="mt-2 flex items-center justify-end">
        <button className={`inline-flex items-center gap-2 text-primary hover:underline ${isRTL ? 'flex-row-reverse' : ''}`} title={Label.share}>
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
          {cities.map(c => (
            <button key={c} className="px-2 py-0.5 text-xs rounded-md bg-gray-100 dark:bg-gray-800" onClick={()=>onFilterCity && onFilterCity(c)}>{c}</button>
          ))}
        </div>
      </div>
      {/* Mini chart: projects per status */}
      <div className="mt-3 h-28">
        <Bar
          data={{
            labels: statusCounts.map(x=>x.s),
            datasets: [{ label: isRTL ? 'حسب الحالة' : 'By Status', data: statusCounts.map(x=>x.count), backgroundColor: 'rgba(59,130,246,0.6)', borderRadius: 6 }]
          }}
          options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: v => `${v}` } } } }}
        />
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
    Revenue: p.revenue || 0,
    Completion: (p.completion || 0) + '%'
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Projects')
  XLSX.writeFile(wb, 'projects_export.xlsx')
}

async function exportProjectsPdf(rows) {
  try {
    const jsPDF = (await import('jspdf')).default
    const autoTable = await import('jspdf-autotable')
    const doc = new jsPDF()
    const head = [['Name','City','Developer','Status','Units','Phases','Docs','Updated']]
    const body = rows.map(p => [p.name, p.city, p.developer, p.status, String(p.units), String(p.phases), String(p.docs), p.lastUpdated])
    autoTable.default(doc, { head, body })
    doc.save('projects_export.pdf')
  } catch (err) {
    console.error(err)
    alert('Failed to export PDF')
  }
}

// View details modal
function ProjectDetailsModal({ p, isRTL, onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-[210] glass-panel rounded-xl p-4 w-[800px] max-w-[90vw] max-h-[85vh] overflow-y-auto">
        <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-lg font-semibold">{isRTL ? 'تفاصيل المشروع' : 'Project Details'}</h2>
          <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إغلاق' : 'Close'}</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className={`text-sm ${isRTL ? 'text-end' : 'text-start'}`}><span className="text-[var(--muted-text)]">{isRTL ? 'الاسم' : 'Name'}:</span> <span className="font-semibold">{p.name}</span></div>
            <div className={`text-sm ${isRTL ? 'text-end' : 'text-start'}`}><span className="text-[var(--muted-text)]">{isRTL ? 'الحالة' : 'Status'}:</span> <span className="font-semibold">{p.status}</span></div>
            <div className={`text-sm ${isRTL ? 'text-end' : 'text-start'}`}><span className="text-[var(--muted-text)]">{isRTL ? 'المدينة' : 'City'}:</span> <span className="font-semibold">{p.city}</span></div>
            <div className={`text-sm ${isRTL ? 'text-end' : 'text-start'}`}><span className="text-[var(--muted-text)]">{isRTL ? 'المطور' : 'Developer'}:</span> <span className="font-semibold">{p.developer}</span></div>
            <div className={`text-sm ${isRTL ? 'text-end' : 'text-start'}`}><span className="text-[var(--muted-text)]">{isRTL ? 'الوحدات' : 'Units'}:</span> <span className="font-semibold">{p.units}</span></div>
            <div className={`text-sm ${isRTL ? 'text-end' : 'text-start'}`}><span className="text-[var(--muted-text)]">{isRTL ? 'المراحل' : 'Phases'}:</span> <span className="font-semibold">{p.phases}</span></div>
            <div className={`text-sm ${isRTL ? 'text-end' : 'text-start'}`}><span className="text-[var(--muted-text)]">{isRTL ? 'الملفات' : 'Docs'}:</span> <span className="font-semibold">{p.docs}</span></div>
            <div className={`text-sm ${isRTL ? 'text-end' : 'text-start'}`}><span className="text-[var(--muted-text)]">{isRTL ? 'آخر تحديث' : 'Updated'}:</span> <span className="font-semibold">{p.lastUpdated}</span></div>
            <div className={`text-sm ${isRTL ? 'text-end' : 'text-start'}`}><span className="text-[var(--muted-text)]">{isRTL ? 'الوصف' : 'Description'}:</span> <span className="font-medium">{p.description}</span></div>
          </div>
          <div className="rounded-lg overflow-hidden h-48 md:h-full">
            <img src={p.image || pickImage(p.name)} alt={p.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  )
}
