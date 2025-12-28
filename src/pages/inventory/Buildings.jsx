import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaCity, FaInfoCircle, FaTimes, FaChevronDown } from 'react-icons/fa'

// Mock Projects List (matching Projects.jsx)
const MOCK_PROJECTS = [
  'Nile Tower Residences',
  'October Business Park',
  'Marina Seaview',
  'Maadi Gardens',
  'Nasr City Medical Hub',
  'Zayed Heights',
  'River Walk',
  'Capital Business Hub',
  'Blue Lagoon Resort',
  'El Shorouk Gardens'
]

const STATUS_OPTIONS = ['Planning', 'Under Construction', 'Completed', 'Sold Out']

export default function Buildings() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const isRTL = isArabic

  const labels = useMemo(() => ({
    title: isArabic ? 'المباني' : 'Buildings',
    subtitle: isArabic ? 'إدارة المباني والمراحل' : 'Manage Buildings & Phases',
    add: isArabic ? 'إضافة مبنى' : 'Add Building',
    search: isArabic ? 'بحث...' : 'Search...',
    name: isArabic ? 'اسم المبنى' : 'Building Name',
    project: isArabic ? 'المشروع' : 'Project',
    status: isArabic ? 'الحالة' : 'Status',
    description: isArabic ? 'الوصف' : 'Description',
    actions: isArabic ? 'إجراءات' : 'Actions',
    save: isArabic ? 'حفظ' : 'Save',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    deleteConfirm: isArabic ? 'هل أنت متأكد من حذف هذا المبنى؟' : 'Are you sure you want to delete this building?',
    noData: isArabic ? 'لا توجد مباني' : 'No buildings found',
    filterProject: isArabic ? 'تصفية حسب المشروع' : 'Filter by Project',
    allProjects: isArabic ? 'كل المشاريع' : 'All Projects',
    filter: isArabic ? 'تصفية' : 'Filter',
    clearFilters: isArabic ? 'مسح المرشحات' : 'Clear Filters',
    show: isArabic ? 'إظهار' : 'Show',
    hide: isArabic ? 'إخفاء' : 'Hide',
    allStatuses: isArabic ? 'كل الحالات' : 'All Statuses',
    edit: isArabic ? 'تعديل' : 'Edit',
    delete: isArabic ? 'حذف' : 'Delete',
    formTitleAdd: isArabic ? 'إضافة مبنى جديد' : 'Add New Building',
    formTitleEdit: isArabic ? 'تعديل بيانات المبنى' : 'Edit Building',
    required: isArabic ? 'مطلوب' : 'Required',
    selectProject: isArabic ? 'اختر المشروع' : 'Select Project'
  }), [isArabic])

  const STORAGE_KEY = 'inventoryBuildings'
  const [buildings, setBuildings] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ id: null, name: '', project: '', status: 'Planning', description: '' })
  
  // Filter States
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    project: '',
    status: ''
  })

  // Load from LocalStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setBuildings(parsed)
      } else {
        // Seed data
        const sampleData = [
          { id: 1, name: 'Tower A', project: 'Nile Tower Residences', status: 'Under Construction', description: 'Main residential tower' },
          { id: 2, name: 'Block B', project: 'October Business Park', status: 'Completed', description: 'Office block' },
          { id: 3, name: 'Phase 1 - Villas', project: 'Marina Seaview', status: 'Sold Out', description: 'Luxury villas facing the sea' },
          { id: 4, name: 'Building C', project: 'Maadi Gardens', status: 'Planning', description: 'Mixed-use building' },
          { id: 5, name: 'Medical Center', project: 'Nasr City Medical Hub', status: 'Completed', description: 'Specialized clinics' },
          { id: 6, name: 'Heights 1', project: 'Zayed Heights', status: 'Under Construction', description: 'High-rise apartments' },
          { id: 7, name: 'Riverside Walk', project: 'River Walk', status: 'Planning', description: 'Commercial promenade' },
          { id: 8, name: 'Hub One', project: 'Capital Business Hub', status: 'Completed', description: 'Administrative offices' },
          { id: 9, name: 'Lagoon View', project: 'Blue Lagoon Resort', status: 'Under Construction', description: 'Chalet complex' },
          { id: 10, name: 'Gardenia', project: 'El Shorouk Gardens', status: 'Sold Out', description: 'Townhouses' }
        ]
        setBuildings(sampleData)
      }
    } catch (e) { console.warn('Failed to load buildings data', e) }
  }, [])

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(buildings))
    } catch (e) { void e }
  }, [buildings])

  function handleSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name || !form.project) return

    if (form.id) {
      // Edit
      setBuildings(prev => prev.map(item => item.id === form.id ? {
        ...item,
        name,
        project: form.project,
        status: form.status,
        description: form.description.trim()
      } : item))
    } else {
      // Add
      const newItem = {
        id: Date.now(),
        name,
        project: form.project,
        status: form.status,
        description: form.description.trim()
      }
      setBuildings(prev => [newItem, ...prev])
    }
    resetForm()
  }

  function handleEdit(item) {
    setForm(item)
    setShowForm(true)
  }

  function handleDelete(id) {
    if (window.confirm(labels.deleteConfirm)) {
      setBuildings(prev => prev.filter(item => item.id !== id))
    }
  }

  function resetForm() {
    setForm({ id: null, name: '', project: '', status: 'Planning', description: '' })
    setShowForm(false)
  }

  function clearFilters() {
    setFilters({
      search: '',
      project: '',
      status: ''
    })
  }

  const filteredData = useMemo(() => {
    return buildings.filter(item => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matchName = item.name.toLowerCase().includes(q)
        const matchProject = item.project.toLowerCase().includes(q)
        if (!matchName && !matchProject) return false
      }
      
      // Project
      if (filters.project && item.project !== filters.project) return false
      
      // Status
      if (filters.status && item.status !== filters.status) return false

      return true
    })
  }, [buildings, filters])

  return (
    <div className="p-4 md:p-6 bg-[var(--content-bg)] text-[var(--content-text)] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative inline-block">
          <h1 className="page-title text-2xl font-bold">{labels.title}</h1>
          <span className="absolute block h-[2px] w-full bg-gradient-to-r from-blue-500 to-purple-600 bottom-[-4px]"></span>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn btn-sm btn-primary flex items-center gap-2"
        >
          <FaPlus size={14} />
          <span>{labels.add}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-xl mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FaFilter className="text-blue-500" size={16} /> {labels.filter}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAllFilters(prev => !prev)} className="btn btn-glass btn-compact text-blue-600 flex items-center gap-1">
              {showAllFilters ? labels.hide : labels.show} 
              <FaChevronDown size={14} className={`transform transition-transform ${showAllFilters ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={clearFilters} className="btn btn-glass btn-compact text-[var(--muted-text)] hover:text-red-500">
              {labels.clearFilters}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1">
              <FaSearch className="text-blue-500" size={10} /> {labels.search}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={labels.search}
                value={filters.search}
                onChange={e => setFilters(prev => ({...prev, search: e.target.value}))}
                className={`input w-full ${isRTL ? 'pr-4 pl-4' : 'pl-4 pr-4'}`}
              />
            </div>
          </div>
          
          <div className={`space-y-1 ${!showAllFilters && 'hidden md:block'}`}>
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.project}</label>
            <div className="relative">
              <select
                value={filters.project}
                onChange={e => setFilters(prev => ({...prev, project: e.target.value}))}
                className="input w-full appearance-none cursor-pointer"
              >
                <option value="">{labels.allProjects}</option>
                {MOCK_PROJECTS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <FaChevronDown className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-text)] pointer-events-none ${isArabic ? 'left-3' : 'right-3'}`} size={12} />
            </div>
          </div>

          <div className={`space-y-1 ${!showAllFilters && 'hidden md:block'}`}>
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.status}</label>
            <div className="relative">
              <select
                value={filters.status}
                onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}
                className="input w-full appearance-none cursor-pointer"
              >
                <option value="">{labels.allStatuses}</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <FaChevronDown className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-text)] pointer-events-none ${isArabic ? 'left-3' : 'right-3'}`} size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="nova-table w-full">
            <thead className="thead-soft">
              <tr>
                <th className="px-4 py-3 text-start">{labels.name}</th>
                <th className="px-4 py-3 text-start">{labels.project}</th>
                <th className="px-4 py-3 text-start">{labels.status}</th>
                <th className="px-4 py-3 text-start">{labels.description}</th>
                <th className="px-4 py-3 text-center w-32">{labels.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--panel-border)]">
              {filteredData.length > 0 ? (
                filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3 font-medium text-[var(--content-text)]">{item.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-[var(--muted-text)]">
                        <FaCity size={12} />
                        {item.project}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        item.status === 'Under Construction' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        item.status === 'Sold Out' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-text)] max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-sm btn-circle btn-ghost text-blue-600"
                          title={labels.edit}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-sm btn-circle btn-ghost text-red-600"
                          title={labels.delete}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-[var(--muted-text)]">
                    <div className="flex flex-col items-center gap-2">
                      <FaInfoCircle size={24} className="opacity-50" />
                      <p>{labels.noData}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
            <div className="card p-4 sm:p-6 w-full max-w-md animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">
                  {form.id ? labels.formTitleEdit : labels.formTitleAdd}
                </h3>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-red-600 hover:bg-red-50 shadow-md transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--muted-text)]">
                    {labels.name} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--muted-text)]">
                    {labels.project} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={form.project}
                      onChange={e => setForm({ ...form, project: e.target.value })}
                      className={`input w-full appearance-none ${isRTL ? 'pl-10' : 'pr-10'}`}
                    >
                      <option value="" disabled>{labels.selectProject}</option>
                      {MOCK_PROJECTS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <FaChevronDown className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-text)] pointer-events-none ${isArabic ? 'left-3' : 'right-3'}`} size={12} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--muted-text)]">
                    {labels.status}
                  </label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className={`input w-full appearance-none ${isRTL ? 'pl-10' : 'pr-10'}`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <FaChevronDown className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-text)] pointer-events-none ${isArabic ? 'left-3' : 'right-3'}`} size={12} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--muted-text)]">
                    {labels.description}
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="input w-full min-h-[80px]"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium"
                  >
                    {labels.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
