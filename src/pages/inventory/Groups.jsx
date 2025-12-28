import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SearchableSelect from '../../components/SearchableSelect'
import { FaFilter, FaSearch, FaChevronDown, FaTimes, FaEdit, FaTrash } from 'react-icons/fa'

export default function Groups() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const labels = useMemo(() => ({
    title: isArabic ? 'مجموعات الأصناف' : 'Item Groups',
    formTitle: isArabic ? 'بيانات المجموعة' : 'Group Details',
    add: isArabic ? 'إضافة مجموعة' : 'Add Group',
    close: isArabic ? 'إغلاق' : 'Close',
    filter: isArabic ? 'تصفية' : 'Filter',
    search: isArabic ? 'بحث' : 'Search',
    clearFilters: isArabic ? 'مسح المرشحات' : 'Clear Filters',
    name: isArabic ? 'اسم المجموعة' : 'Group Name',
    category: isArabic ? 'التصنيف (الأب)' : 'Category (Parent)',
    description: isArabic ? 'الوصف' : 'Description',
    save: isArabic ? 'حفظ' : 'Save',
    listTitle: isArabic ? 'كل المجموعات' : 'All Groups',
    empty: isArabic ? 'لا توجد مجموعات بعد' : 'No groups yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    delete: isArabic ? 'حذف' : 'Delete',
    edit: isArabic ? 'تعديل' : 'Edit',
  }), [isArabic])

  const STORAGE_KEY = 'inventoryGroups'
  const CAT_STORAGE_KEY = 'inventoryCategories'

  const [form, setForm] = useState({
    id: null,
    name: '',
    category: '',
    description: ''
  })

  const [groups, setGroups] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({ 
    search: '', 
    category: ''
  })

  useEffect(() => {
    // Load Groups
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGroups(parsed)
        } else {
          const sample = [
            { id: 1, name: 'Business Series', category: 'Laptops', description: 'Business class laptops' },
            { id: 2, name: 'Gaming Series', category: 'Laptops', description: 'High performance gaming laptops' },
            { id: 3, name: 'Budget Series', category: 'Laptops', description: 'Affordable laptops' },
            { id: 4, name: 'Smartphones', category: 'Mobiles', description: 'Latest smartphones' },
            { id: 5, name: 'Tablets', category: 'Mobiles', description: 'Portable tablets' },
            { id: 6, name: 'Headphones', category: 'Accessories', description: 'Wireless and wired headphones' },
            { id: 7, name: 'Keyboards', category: 'Accessories', description: 'Mechanical and membrane keyboards' },
            { id: 8, name: 'Mice', category: 'Accessories', description: 'Gaming and office mice' },
            { id: 9, name: 'Monitors', category: 'Laptops', description: 'External displays' },
            { id: 10, name: 'Chargers', category: 'Accessories', description: 'Power adapters and cables' },
            { id: 11, name: 'Printers', category: 'Office Equipment', description: 'Laser and inkjet printers' },
            { id: 12, name: 'Scanners', category: 'Office Equipment', description: 'Document scanners' },
            { id: 13, name: 'Projectors', category: 'Office Equipment', description: 'Meeting room projectors' },
            { id: 14, name: 'Desks', category: 'Furniture', description: 'Standing and sitting desks' },
            { id: 15, name: 'Chairs', category: 'Furniture', description: 'Ergonomic office chairs' },
            { id: 16, name: 'Cabinets', category: 'Furniture', description: 'Storage cabinets' },
            { id: 17, name: 'Paper', category: 'Stationery', description: 'A4 and A3 paper' },
            { id: 18, name: 'Pens', category: 'Stationery', description: 'Ballpoint and gel pens' },
            { id: 19, name: 'Notebooks', category: 'Stationery', description: 'Spiral and bound notebooks' },
            { id: 20, name: 'Folders', category: 'Stationery', description: 'Document organizers' }
          ]
          setGroups(sample)
        }
      } else {
        // Seed
        const sample = [
            { id: 1, name: 'Business Series', category: 'Laptops', description: 'Business class laptops' },
            { id: 2, name: 'Gaming Series', category: 'Laptops', description: 'High performance gaming laptops' },
            { id: 3, name: 'Budget Series', category: 'Laptops', description: 'Affordable laptops' },
            { id: 4, name: 'Smartphones', category: 'Mobiles', description: 'Latest smartphones' },
            { id: 5, name: 'Tablets', category: 'Mobiles', description: 'Portable tablets' },
            { id: 6, name: 'Headphones', category: 'Accessories', description: 'Wireless and wired headphones' },
            { id: 7, name: 'Keyboards', category: 'Accessories', description: 'Mechanical and membrane keyboards' },
            { id: 8, name: 'Mice', category: 'Accessories', description: 'Gaming and office mice' },
            { id: 9, name: 'Monitors', category: 'Laptops', description: 'External displays' },
            { id: 10, name: 'Chargers', category: 'Accessories', description: 'Power adapters and cables' },
            { id: 11, name: 'Printers', category: 'Office Equipment', description: 'Laser and inkjet printers' },
            { id: 12, name: 'Scanners', category: 'Office Equipment', description: 'Document scanners' },
            { id: 13, name: 'Projectors', category: 'Office Equipment', description: 'Meeting room projectors' },
            { id: 14, name: 'Desks', category: 'Furniture', description: 'Standing and sitting desks' },
            { id: 15, name: 'Chairs', category: 'Furniture', description: 'Ergonomic office chairs' },
            { id: 16, name: 'Cabinets', category: 'Furniture', description: 'Storage cabinets' },
            { id: 17, name: 'Paper', category: 'Stationery', description: 'A4 and A3 paper' },
            { id: 18, name: 'Pens', category: 'Stationery', description: 'Ballpoint and gel pens' },
            { id: 19, name: 'Notebooks', category: 'Stationery', description: 'Spiral and bound notebooks' },
            { id: 20, name: 'Folders', category: 'Stationery', description: 'Document organizers' }
        ]
        setGroups(sample)
      }
    } catch (e) { console.warn('Failed to load groups', e) }

    // Load Categories for dropdown
    try {
        const rawCat = localStorage.getItem(CAT_STORAGE_KEY)
        if (rawCat) {
            const parsed = JSON.parse(rawCat)
            setCategories(Array.isArray(parsed) ? parsed : [])
        } else {
            // Fallback seed if categories page wasn't visited/seeded
            setCategories([
                { name: 'Laptops' },
                { name: 'Mobiles' },
                { name: 'Accessories' }
            ])
        }
    } catch (e) { console.warn('Failed to load categories', e) }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(groups)) } catch (e) { void e }
  }, [groups])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return

    if (form.id) {
        setGroups(prev => prev.map(g => g.id === form.id ? {
            ...g,
            name,
            category: form.category || '',
            description: form.description.trim()
        } : g))
    } else {
        const newGroup = {
            id: Date.now(),
            name,
            category: form.category || '',
            description: form.description.trim()
        }
        setGroups(prev => [newGroup, ...prev])
    }
    setForm({ id: null, name: '', category: '', description: '' })
    setShowForm(false)
  }

  function onDelete(id) { 
      if (window.confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this group?')) {
        setGroups(prev => prev.filter(c => c.id !== id)) 
      }
  }

  function onEdit(group) { 
    setForm({ 
      id: group.id,
      name: group.name || '', 
      category: group.category || '', 
      description: group.description || '' 
    })
    setShowForm(true)
  }

  const categoryOptions = useMemo(() => Array.from(new Set(categories.map(c => c.name).filter(Boolean))), [categories])

  const filtered = useMemo(() => {
    return groups.filter(c => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!c.name.toLowerCase().includes(q) && !(c.description || '').toLowerCase().includes(q)) return false
      }
      if (filters.category && c.category !== filters.category) return false
      return true
    })
  }, [groups, filters])

  function clearFilters() { 
    setFilters({ search: '', category: '' }) 
  }

  return (
      <div className="space-y-6 pt-4">
        <div className={`flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
          <div className="relative inline-block">
            <h1 className={`page-title text-2xl font-semibold ${isArabic ? 'text-right' : 'text-left'}`}>{labels.title}</h1>
            <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isArabic ? 'auto' : '-4px', right: isArabic ? '-4px' : 'auto', bottom: '-4px' }}></span>
          </div>
          <button className="btn btn-sm bg-green-600 hover:bg-green-500 text-white border-none" onClick={() => {
              setForm({ id: null, name: '', category: '', description: '' })
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
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.category}</label>
              <SearchableSelect options={categoryOptions} value={filters.category} onChange={val=>setFilters(prev=>({...prev, category: val}))} isRTL={isArabic} />
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
                    <th className="text-start px-3 min-w-[160px]">{labels.category}</th>
                    <th className="text-start px-3 min-w-[220px]">{labels.description}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td className="px-3"><span className="font-medium">{c.name}</span></td>
                      <td className="px-3">{c.category || (isArabic ? 'بدون' : 'None')}</td>
                      <td className="px-3">{c.description}</td>
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
                <div className={`flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''} mb-4`}>
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
                    <label className="block text-sm mb-1">{labels.category}</label>
                    <SearchableSelect options={categoryOptions} value={form.category} onChange={val=>setForm(prev=>({...prev, category: val}))} isRTL={isArabic} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{labels.description}</label>
                    <textarea name="description" value={form.description} onChange={onChange} placeholder={labels.description} className="input w-full min-h-[80px]" />
                  </div>
                  <div className={`flex gap-3 mt-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
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
