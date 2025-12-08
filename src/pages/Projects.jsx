import React, { useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import { FaSearch, FaFilter, FaShareAlt, FaEllipsisV, FaPlus, FaMapMarkerAlt, FaBuilding, FaTimes, FaEye, FaEdit, FaTrash } from 'react-icons/fa'
import * as XLSX from 'xlsx'
import { Bar } from 'react-chartjs-2'

export default function Projects() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [query, setQuery] = useState('')
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [editProject, setEditProject] = useState(null)
  const [toasts, setToasts] = useState([])
  const [importLogs, setImportLogs] = useState([])
  const [selectedStatuses, setSelectedStatuses] = useState(['Planning','Active','Sales','Completed'])
  const [selectedCities, setSelectedCities] = useState([])
  const [selectedDevelopers, setSelectedDevelopers] = useState([])
  const [unitsRange, setUnitsRange] = useState([0, 500])
  const [phasesRange, setPhasesRange] = useState([0, 10])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const projects = useMemo(() => ([
    {
      name: 'Crown Medical Park',
      city: 'Elshiekh Zayed',
      units: 0,
      developer: 'Crown',
      status: 'Planning',
      phases: 2,
      docs: 12,
      lastUpdated: '2025-10-12',
      image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0f?q=80&w=1200&auto=format&fit=crop',
      logo: null,
      description: 'Premium medical complex with modern facilities.',
      completion: 25,
      revenue: 0
    },
    {
      name: 'Crown Medical Center',
      city: 'Elshiekh Zayed',
      units: 0,
      developer: 'Crown',
      status: 'Active',
      phases: 4,
      docs: 34,
      lastUpdated: '2025-10-11',
      image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop',
      logo: 'https://dummyimage.com/120x60/ffffff/2b2b2b&text=CROWN',
      description: 'A medical facility located in the heart of Sheikh Zayed.',
      completion: 60,
      revenue: 120000
    },
    {
      name: 'Sunset Residences',
      city: 'New Cairo',
      units: 24,
      developer: 'Sunrise Dev',
      status: 'Sales',
      phases: 3,
      docs: 19,
      lastUpdated: '2025-09-30',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop',
      logo: null,
      description: 'Residential compound with landscaped gardens and pools.',
      completion: 80,
      revenue: 450000
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

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

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
    setPage(1)
  }

  const Label = {
    title: isRTL ? 'المخزون > المشاريع' : 'Inventory > Projects',
    search: isRTL ? 'بحث' : 'Search',
    filter: isRTL ? 'تصفية' : 'Filter',
    importProjects: isRTL ? 'استيراد المشاريع' : 'Import Projects',
    createProject: isRTL ? 'إنشاء مشروع' : 'Create Project',
    location: isRTL ? 'الموقع' : 'Location',
    units: isRTL ? 'وحدات' : 'Units',
    share: isRTL ? 'مشاركة' : 'Share',
    more: isRTL ? 'المزيد' : 'More',
    developer: isRTL ? 'المطور' : 'Developer',
    status: isRTL ? 'الحالة' : 'Status',
    city: isRTL ? 'المدينة' : 'City',
    phases: isRTL ? 'المراحل' : 'Phases',
    clearFilters: isRTL ? 'مسح المرشحات' : 'Clear Filters',
    exportExcel: isRTL ? 'تصدير إكسل' : 'Export Excel',
    exportPdf: isRTL ? 'تصدير PDF' : 'Export PDF'
  }

  return (
    <Layout>
      <div className="p-4">
        {/* Header actions */}
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Search + Filter */}
            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={Label.search}
                  className="input w-full pl-9"
                />
              </div>
              <button className="btn btn-glass" onClick={() => setFilterOpen(v=>!v)}>
                <span className="inline-flex items-center gap-2"><FaFilter /> {Label.filter}</span>
              </button>
            </div>
            {/* Import + Create */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600" onClick={()=>setShowImportModal(true)}>
                {Label.importProjects}
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-white hover:brightness-110 inline-flex items-center gap-2" onClick={()=>setShowCreateModal(true)}>
                <FaPlus /> {Label.createProject}
              </button>
              <button className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700" onClick={()=>exportProjectsExcel(filtered)}>{Label.exportExcel}</button>
              <button className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700" onClick={()=>exportProjectsPdf(filtered)}>{Label.exportPdf}</button>
            </div>
          </div>

          {isFilterOpen && (
            <div className={`mt-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              {/* Status multi-select */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-[var(--muted-text)]">{Label.status}:</span>
                {allStatuses.map(s => (
                  <label key={s} className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={selectedStatuses.includes(s)} onChange={(e)=>{
                      setSelectedStatuses(prev => e.target.checked ? [...prev, s] : prev.filter(x=>x!==s))
                    }} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
              {/* City multi-select */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-[var(--muted-text)]">{Label.city}:</span>
                {allCities.map(c => (
                  <label key={c} className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={selectedCities.includes(c)} onChange={(e)=>{
                      setSelectedCities(prev => e.target.checked ? [...prev, c] : prev.filter(x=>x!==c))
                    }} />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
              {/* Developer multi-select */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-[var(--muted-text)]">{Label.developer}:</span>
                {allDevelopers.map(d => (
                  <label key={d} className="inline-flex items-center gap-2">
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
          <SummaryPanel projects={filtered} isRTL={isRTL} onFilterStatus={(s)=>{ setSelectedStatuses([s]); setPage(1) }} onFilterCity={(c)=>{ setSelectedCities([c]); setPage(1) }} />
        </div>

        {/* Projects list (each project on its own line) */}
        <div className="mt-4 flex flex-col gap-2">
          {paged.map((p, idx) => (
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
          {/* Pagination */}
          <div className="flex items-center justify-end gap-2">
            <button className="btn btn-glass" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>{isRTL ? 'السابق' : 'Prev'}</button>
            <span className="text-sm text-[var(--muted-text)]">{isRTL ? 'صفحة' : 'Page'} {page}</span>
            <button className="btn btn-glass" disabled={(page*pageSize)>=filtered.length} onClick={()=>setPage(p=>p+1)}>{isRTL ? 'التالي' : 'Next'}</button>
            <select className="input" value={pageSize} onChange={e=>{setPageSize(Number(e.target.value)); setPage(1)}}>
              {[6,9,12].map(s=> <option key={s} value={s}>{s}/page</option>)}
            </select>
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
            isRTL={isRTL}
            mode={editProject ? 'edit' : 'create'}
            initialValues={editProject ? { name: editProject.name || '', developer: editProject.developer || '' } : undefined}
          />
        )}

        {selectedProject && (
          <ProjectDetailsModal p={selectedProject} isRTL={isRTL} onClose={()=>setSelectedProject(null)} />
        )}
        {/* Toasts */}
        <div className="fixed z-50 top-20 right-4 flex flex-col gap-2">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-2 rounded-lg shadow-lg ${t.type==='success' ? 'bg-emerald-600 text-white' : t.type==='error' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-white'}`}>{t.message}</div>
          ))}
        </div>
      </div>
    </Layout>
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
      } catch (err) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 glass-panel rounded-xl p-4 w-[900px] max-w-[95vw]">
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
                  {previewRows[0] && Object.keys(previewRows[0]).map(k => <th key={k} className="px-2 py-1 text-left">{k}</th>)}
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
    { id: 'layout', label: isRTL ? 'المخطط' : 'Layout' },
    { id: 'master', label: isRTL ? 'ماستر بلان' : 'Master Plan' },
    { id: 'pdf', label: 'PDF' },
    { id: '3d', label: '3D' },
    { id: 'video', label: isRTL ? 'فيديو' : 'Video' },
    { id: 'map', label: isRTL ? 'خريطة' : 'Map' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Shell */}
      <div className="relative z-50 bg-white dark:bg-gray-900 w-full h-screen sm:w-[1100px] sm:max-w-[95vw] sm:max-h-[90vh] sm:h-auto sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{mode==='edit' ? (isRTL ? 'تعديل مشروع' : 'Edit Project') : (isRTL ? 'إنشاء مشروع' : 'Create Project')}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title={isRTL ? 'إغلاق' : 'Close'}>
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''} overflow-x-auto`}>
            {tabs.map(t => (
              <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`px-3 py-2 text-sm rounded-lg border ${activeTab===t.id ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-[var(--content-text)]'}`}>
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
                  <button onClick={()=>setActiveLang('en')} className={`px-4 py-2 rounded-lg ${activeLang==='en' ? 'bg-gray-200 dark:bg-gray-800' : 'bg-transparent border border-gray-200 dark:border-gray-700'}`}>English</button>
                  <button onClick={()=>setActiveLang('ar')} className={`px-4 py-2 rounded-lg ${activeLang==='ar' ? 'bg-gray-200 dark:bg-gray-800' : 'bg-transparent border border-gray-200 dark:border-gray-700'}`}>{isRTL ? 'النسخة العربي' : 'Arabic'}</button>
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
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ p, isRTL, Label, onView, onEdit }) {
  return (
    <div className="p-3">
      {/* Line header: name + status + actions */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-3`}>
          {p.image && (
            <img src={p.image} alt={p.name} className="h-16 w-28 md:h-20 md:w-32 object-cover rounded-lg" />
          )}
          {p.logo && <img src={p.logo} alt={`${p.name} logo`} className="h-7 w-auto" />}
          <h3 className="text-base font-semibold">{p.name}</h3>
          <span className="inline-flex px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">{p.status}</span>
        </div>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button className="btn btn-glass text-xs inline-flex items-center gap-2" onClick={()=>onView && onView(p)}><FaEye /> {isRTL ? 'عرض' : 'View'}</button>
          <button className="btn btn-glass text-xs inline-flex items-center gap-2" onClick={()=>onEdit && onEdit(p)}><FaEdit /> {isRTL ? 'تعديل' : 'Edit'}</button>
          <button className="btn btn-glass text-xs inline-flex items-center gap-2"><FaTrash /> {isRTL ? 'حذف' : 'Delete'}</button>
        </div>
      </div>

      {/* Compact line details */}
      <div className={`mt-2 grid grid-cols-2 md:grid-cols-6 gap-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/40 flex items-center gap-2"><FaMapMarkerAlt className="opacity-70" /> {p.city}</div>
        <div className="px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/40 flex items-center gap-2"><FaBuilding className="opacity-70" /> {p.developer}</div>
        <div className="px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/40">{Label.units}: <span className="font-semibold">{p.units}</span></div>
        <div className="px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/40">{isRTL ? 'المراحل' : 'Phases'}: <span className="font-semibold">{p.phases}</span></div>
        <div className="px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/40">{isRTL ? 'الملفات' : 'Docs'}: <span className="font-semibold">{p.docs}</span></div>
        <div className="px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/40">{isRTL ? 'آخر تحديث' : 'Updated'}: <span className="font-semibold">{p.lastUpdated}</span></div>
      </div>

      {/* Progress + Revenue (thin) */}
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-[var(--muted-text)] mb-1">{isRTL ? 'نسبة الإنجاز' : 'Completion'}</div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${p.completion||0}%` }} />
          </div>
        </div>
        <div>
          <div className="text-xs text-[var(--muted-text)] mb-1">{isRTL ? 'تقدير الإيراد' : 'Revenue Estimate'}</div>
          <div className="text-sm font-semibold">{p.revenue ? new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(p.revenue) : (isRTL ? 'غير متاح' : 'N/A')}</div>
        </div>
      </div>

      {/* Share */}
      <div className={`mt-2 flex items-center ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <button className="inline-flex items-center gap-2 text-primary hover:underline" title={Label.share}>
          <FaShareAlt /> {Label.share}
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
        <button className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 text-left" onClick={()=>onFilterStatus && onFilterStatus('All')}>
          <div className="text-[var(--muted-text)]">{isRTL ? 'عدد المشاريع' : 'Projects'}</div>
          <div className="text-xl font-bold">{projects.length}</div>
        </button>
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40">
          <div className="text-[var(--muted-text)]">{isRTL ? 'إجمالي الوحدات' : 'Total Units'}</div>
          <div className="text-xl font-bold">{totalUnits}</div>
        </div>
        <button className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 text-left" onClick={()=>onFilterStatus && onFilterStatus('Active')}>
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
function exportProjectsExcel(rows) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 glass-panel rounded-xl p-4 w-[900px] max-w-[95vw]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{isRTL ? 'تفاصيل المشروع' : 'Project Details'}</h2>
          <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إغلاق' : 'Close'}</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="text-sm"><span className="text-[var(--muted-text)]">{isRTL ? 'الاسم' : 'Name'}:</span> <span className="font-semibold">{p.name}</span></div>
            <div className="text-sm"><span className="text-[var(--muted-text)]">{isRTL ? 'الحالة' : 'Status'}:</span> <span className="font-semibold">{p.status}</span></div>
            <div className="text-sm"><span className="text-[var(--muted-text)]">{isRTL ? 'المدينة' : 'City'}:</span> <span className="font-semibold">{p.city}</span></div>
            <div className="text-sm"><span className="text-[var(--muted-text)]">{isRTL ? 'المطور' : 'Developer'}:</span> <span className="font-semibold">{p.developer}</span></div>
            <div className="text-sm"><span className="text-[var(--muted-text)]">{isRTL ? 'الوحدات' : 'Units'}:</span> <span className="font-semibold">{p.units}</span></div>
            <div className="text-sm"><span className="text-[var(--muted-text)]">{isRTL ? 'المراحل' : 'Phases'}:</span> <span className="font-semibold">{p.phases}</span></div>
            <div className="text-sm"><span className="text-[var(--muted-text)]">{isRTL ? 'الملفات' : 'Docs'}:</span> <span className="font-semibold">{p.docs}</span></div>
            <div className="text-sm"><span className="text-[var(--muted-text)]">{isRTL ? 'آخر تحديث' : 'Updated'}:</span> <span className="font-semibold">{p.lastUpdated}</span></div>
            <div className="text-sm"><span className="text-[var(--muted-text)]">{isRTL ? 'الوصف' : 'Description'}:</span> <span className="font-medium">{p.description}</span></div>
          </div>
          <div className="rounded-lg overflow-hidden h-48 md:h-full">
            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  )
}