import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaBuilding, FaCity, FaInfoCircle } from 'react-icons/fa'

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
  }), [isArabic])

  const STORAGE_KEY = 'inventoryBuildings'
  const [buildings, setBuildings] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ id: null, name: '', project: '', status: 'Planning', description: '' })
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')

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
          { id: 2, name: 'Block B', project: 'October Business Park', status: 'Completed', description: 'Office block' }
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

  const filteredData = useMemo(() => {
    return buildings.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.project.toLowerCase().includes(search.toLowerCase())
      const matchProject = projectFilter ? item.project === projectFilter : true
      return matchSearch && matchProject
    })
  }, [buildings, search, projectFilter])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaBuilding className="text-blue-600" />
            {labels.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{labels.subtitle}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <FaPlus size={14} />
          <span>{labels.add}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={labels.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
          />
        </div>
        <div className="relative min-w-[200px]">
          <FaFilter className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
          >
            <option value="">{labels.allProjects}</option>
            {MOCK_PROJECTS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider">
                <th className={`p-4 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{labels.name}</th>
                <th className={`p-4 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{labels.project}</th>
                <th className={`p-4 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{labels.status}</th>
                <th className={`p-4 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{labels.description}</th>
                <th className={`p-4 font-semibold text-center w-32`}>{labels.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.length > 0 ? (
                filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <FaCity className="text-gray-400" size={12} />
                        {item.project}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        item.status === 'Under Construction' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        item.status === 'Sold Out' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 text-sm max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title={labels.edit}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
                  <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FaInfoCircle size={24} className="text-gray-300 dark:text-gray-600" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {form.id ? (isArabic ? 'تعديل بيانات المبنى' : 'Edit Building') : (isArabic ? 'إضافة مبنى جديد' : 'Add New Building')}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                <FaPlus className="transform rotate-45" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {labels.name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {labels.project} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.project}
                  onChange={e => setForm({ ...form, project: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="" disabled>{isArabic ? 'اختر المشروع' : 'Select Project'}</option>
                  {MOCK_PROJECTS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {labels.status}
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {labels.description}
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {labels.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  {labels.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
