import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SearchableSelect from '../../components/SearchableSelect'
import { FaFilter, FaSearch, FaChevronDown, FaTimes, FaEdit, FaTrash, FaCheck, FaBan } from 'react-icons/fa'

export default function Families() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const labels = useMemo(() => ({
    title: isArabic ? 'عائلات الأصناف' : 'Item Families',
    formTitle: isArabic ? 'بيانات العائلة' : 'Family Details',
    add: isArabic ? 'إضافة عائلة' : 'Add Family',
    close: isArabic ? 'إغلاق' : 'Close',
    filter: isArabic ? 'تصفية' : 'Filter',
    search: isArabic ? 'بحث' : 'Search',
    clearFilters: isArabic ? 'مسح المرشحات' : 'Clear Filters',
    name: isArabic ? 'اسم العائلة' : 'Family Name',
    description: isArabic ? 'الوصف' : 'Description',
    status: isArabic ? 'الحالة' : 'Status',
    active: isArabic ? 'نشط' : 'Active',
    inactive: isArabic ? 'غير نشط' : 'Inactive',
    save: isArabic ? 'حفظ' : 'Save',
    listTitle: isArabic ? 'كل العائلات' : 'All Families',
    empty: isArabic ? 'لا توجد عائلات بعد' : 'No families yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    delete: isArabic ? 'حذف' : 'Delete',
    edit: isArabic ? 'تعديل' : 'Edit',
  }), [isArabic])

  const STORAGE_KEY = 'inventoryFamilies'

  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    isActive: true
  })

  const [families, setFamilies] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({ 
    search: '', 
    status: 'all'
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFamilies(parsed)
        } else {
          // Seed data
          const sampleData = [
            { id: 1, name: 'Electronics', description: 'Electronic devices and gadgets', isActive: true },
            { id: 2, name: 'Software', description: 'Software licenses and subscriptions', isActive: true },
            { id: 3, name: 'Maintenance', description: 'Maintenance services and parts', isActive: true },
            { id: 4, name: 'Furniture', description: 'Office furniture and fixtures', isActive: true },
            { id: 5, name: 'Stationery', description: 'Office supplies and paper products', isActive: true },
            { id: 6, name: 'Vehicles', description: 'Company cars and transport', isActive: true },
            { id: 7, name: 'Networking', description: 'Routers, switches, and cabling', isActive: true },
            { id: 8, name: 'Security', description: 'Cameras, alarms, and access control', isActive: true },
            { id: 9, name: 'Cleaning', description: 'Cleaning supplies and equipment', isActive: true },
            { id: 10, name: 'Pantry', description: 'Kitchen and pantry supplies', isActive: true },
            { id: 11, name: 'Uniforms', description: 'Staff uniforms and safety gear', isActive: true },
            { id: 12, name: 'Marketing', description: 'Promotional materials and displays', isActive: true },
            { id: 13, name: 'Tools', description: 'Hand tools and power tools', isActive: true },
            { id: 14, name: 'Raw Materials', description: 'Basic materials for production', isActive: true },
            { id: 15, name: 'Packaging', description: 'Boxes, tape, and packing materials', isActive: true },
            { id: 16, name: 'Lighting', description: 'Bulbs, fixtures, and lamps', isActive: true },
            { id: 17, name: 'HVAC', description: 'Heating, ventilation, and AC parts', isActive: true },
            { id: 18, name: 'Decor', description: 'Decorative items and plants', isActive: true },
            { id: 19, name: 'Books', description: 'Reference books and manuals', isActive: true },
            { id: 20, name: 'Events', description: 'Event supplies and decorations', isActive: true }
          ]
          setFamilies(sampleData)
        }
      } else {
          const sampleData = [
            { id: 1, name: 'Electronics', description: 'Electronic devices and gadgets', isActive: true },
            { id: 2, name: 'Software', description: 'Software licenses and subscriptions', isActive: true },
            { id: 3, name: 'Maintenance', description: 'Maintenance services and parts', isActive: true }
          ]
          setFamilies(sampleData)
      }
    } catch (e) { console.warn('Failed to load data', e) }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(families)) } catch (e) { void e }
  }, [families])

  function onChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }))
  }

  function onSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return

    if (form.id) {
        // Edit
        setFamilies(prev => prev.map(f => f.id === form.id ? {
            ...f,
            name,
            description: form.description.trim(),
            isActive: form.isActive
        } : f))
    } else {
        // Add
        const newFamily = {
            id: Date.now(),
            name,
            description: form.description.trim(),
            isActive: form.isActive
        }
        setFamilies(prev => [newFamily, ...prev])
    }
    setForm({ id: null, name: '', description: '', isActive: true })
    setShowForm(false)
  }

  function onDelete(id) { 
      if (window.confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this family?')) {
        setFamilies(prev => prev.filter(c => c.id !== id)) 
      }
  }

  function onEdit(fam) { 
    setForm({ 
      id: fam.id,
      name: fam.name || '', 
      description: fam.description || '',
      isActive: fam.isActive === undefined ? true : fam.isActive
    })
    setShowForm(true)
  }

  const filtered = useMemo(() => {
    return families.filter(c => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!c.name.toLowerCase().includes(q) && !(c.description || '').toLowerCase().includes(q)) return false
      }
      if (filters.status !== 'all') {
          const isAct = filters.status === 'active'
          if (c.isActive !== isAct) return false
      }
      return true
    })
  }, [families, filters])

  function clearFilters() { 
    setFilters({ search: '', status: 'all' }) 
  }

  return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div className="relative inline-block">
            <h1 className={`page-title text-2xl font-semibold ${isArabic ? 'text-right' : 'text-left'}`}>{labels.title}</h1>
            <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isArabic ? 'auto' : '-4px', right: isArabic ? '-4px' : 'auto', bottom: '-4px' }}></span>
          </div>
          <button className="btn btn-sm bg-green-600 hover:bg-green-500 text-white border-none" onClick={() => {
              setForm({ id: null, name: '', description: '', isActive: true })
              setShowForm(true)
          }}>{labels.add}</button>
        </div>

        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FaFilter className="text-blue-500" /> {labels.filter}
            </h2>
            <button onClick={clearFilters} className="btn btn-glass btn-compact text-[var(--muted-text)] hover:text-red-500">
                {labels.clearFilters}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaSearch className="text-blue-500" size={10} /> {labels.search}</label>
              <input className="input w-full" value={filters.search} onChange={e=>setFilters(prev=>({...prev, search: e.target.value}))} placeholder={isArabic ? 'بحث...' : 'Search...'} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.status}</label>
              <select className="input w-full" value={filters.status} onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}>
                  <option value="all">{isArabic ? 'الكل' : 'All'}</option>
                  <option value="active">{labels.active}</option>
                  <option value="inactive">{labels.inactive}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
          {filtered.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="nova-table w-full">
                <thead className="thead-soft">
                  <tr className="text-gray-600 dark:text-gray-300">
                    <th className="text-start px-3 min-w-[200px]">{labels.name}</th>
                    <th className="text-start px-3 min-w-[220px]">{labels.description}</th>
                    <th className="text-center px-3 min-w-[100px]">{labels.status}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td className="px-3"><span className="font-medium">{c.name}</span></td>
                      <td className="px-3">{c.description}</td>
                      <td className="px-3 text-center">
                          {c.isActive ? 
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                {labels.active}
                            </span>
                          : 
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {labels.inactive}
                            </span>
                          }
                      </td>
                      <td className="px-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button type="button" className="btn btn-sm btn-circle btn-ghost text-blue-600 hover:bg-blue-100" title={labels.edit} onClick={() => onEdit(c)}>
                            <FaEdit size={16} />
                          </button>
                          <button type="button" className="btn btn-sm btn-circle btn-ghost text-red-600 hover:bg-red-100" title={labels.delete} onClick={() => onDelete(c.id)}>
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <div className="absolute inset-0 flex items-start justify-center p-6 md:p-6">
              <div className="card p-4 sm:p-6 mt-4 w-[92vw] sm:w-[80vw] lg:w-[60vw] xl:max-w-3xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium">{labels.formTitle}</h2>
                  <button type="button" className="btn btn-glass btn-sm text-red-500 hover:text-red-600" onClick={() => setShowForm(false)} aria-label={labels.close}>
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm mb-1">{labels.name}</label>
                    <input name="name" value={form.name} onChange={onChange} placeholder={labels.name} className="input w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{labels.description}</label>
                    <textarea name="description" value={form.description} onChange={onChange} placeholder={labels.description} className="input w-full min-h-[80px]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} className="checkbox checkbox-primary" />
                        <span className="text-sm">{labels.active}</span>
                    </label>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="submit" className="btn bg-blue-600 hover:bg-blue-500 text-white flex-1">{labels.save}</button>
                    <button type="button" className="btn btn-ghost flex-1" onClick={() => setShowForm(false)}>{labels.close}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}
