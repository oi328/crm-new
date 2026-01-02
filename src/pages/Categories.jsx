import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SearchableSelect from '../components/SearchableSelect'
import { FaFilter,FaPlus, FaSearch, FaChevronDown, FaTimes, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function Categories() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const labels = useMemo(() => ({
    title: isArabic ? ' التصنيفات' : ' Categories',
    formTitle: isArabic ? 'بيانات التصنيف' : 'Category Details',
    add: isArabic ? 'إضافة تصنيف' : 'Add Category',
    close: isArabic ? 'إغلاق' : 'Close',
    filter: isArabic ? 'تصفية' : 'Filter',
    search: isArabic ? 'بحث' : 'Search',
    clearFilters: isArabic ? 'إعادة تعيين' : 'Reset',
    name: isArabic ? 'اسم التصنيف' : 'Category Name',
    code: isArabic ? 'الكود' : 'Code',
    appliesTo: isArabic ? 'ينطبق على' : 'Applies To',
    status: isArabic ? 'الحالة' : 'Status',
    offeringsCount: isArabic ? 'عدد العروض' : 'Offerings Count',
    description: isArabic ? 'الوصف' : 'Description',
    save: isArabic ? 'حفظ التصنيف' : 'Save Category',
    listTitle: isArabic ? 'كل التصنيفات' : 'All Categories',
    empty: isArabic ? 'لا توجد تصنيفات بعد' : 'No categories yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    delete: isArabic ? 'حذف' : 'Delete',
    edit: isArabic ? 'تعديل' : 'Edit',
    active: isArabic ? 'نشط' : 'Active',
    inactive: isArabic ? 'غير نشط' : 'Inactive',
    all: isArabic ? 'الكل' : 'All',
    product: isArabic ? 'منتج' : 'Product',
    service: isArabic ? 'خدمة' : 'Service',
    subscription: isArabic ? 'اشتراك' : 'Subscription',
    brandName: isArabic ? 'اسم العلامة التجارية' : 'Brand Name',
    productName: isArabic ? 'اسم المنتج' : 'Product Name',
    itemName: isArabic ? 'اسم الصنف' : 'Item Name',
    sku: isArabic ? 'SKU' : 'SKU',
    warehouseName: isArabic ? 'اسم المستودع' : 'Warehouse Name',
    warehouseCode: isArabic ? 'رمز المستودع' : 'Warehouse Code',
    warehouseType: isArabic ? 'نوع المستودع' : 'Warehouse Type',
    supplierName: isArabic ? 'اسم المورد' : 'Supplier Name',
    supplierCode: isArabic ? 'كود المورد' : 'Supplier Code',
    basicInfo: isArabic ? 'البيانات الأساسية' : 'Basic Info',
    scope: isArabic ? 'النطاق' : 'Category Scope',
  }), [isArabic])

  const appliesToOptions = useMemo(() => (
    ['All', 'Product', 'Service', 'Subscription', 'Package']
  ), [])

  const STORAGE_KEY = 'inventoryCategories'

  const [form, setForm] = useState({
    name: '',
    code: '',
    appliesTo: 'All',
    status: 'Active',
    description: ''
  })

  const [categories, setCategories] = useState([])
  const [families, setFamilies] = useState([]) // Add families state
  const [products, setProducts] = useState([])
  const [items, setItems] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const [showAllFilters, setShowAllFilters] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [filters, setFilters] = useState({ 
    search: '', 
    appliesTo: '',
    status: ''
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed)
        } else {
           // Seed data
          const sampleData = [
            { id: 1700000001, name: 'Electronics', code: 'ELEC', appliesTo: 'Product', status: 'Active', description: 'Electronic devices and accessories' },
            { id: 1700000002, name: 'Furniture', code: 'FURN', appliesTo: 'Product', status: 'Active', description: 'Office and home furniture' },
            { id: 1700000003, name: 'Clothing', code: 'CLOTH', appliesTo: 'Product', status: 'Active', description: 'Apparel and fashion' },
            { id: 1700000004, name: 'Laptops', code: 'LAPT', appliesTo: 'Product', status: 'Active', description: 'Portable computers' },
            { id: 1700000005, name: 'Smartphones', code: 'PHON', appliesTo: 'Product', status: 'Active', description: 'Mobile phones' },
            { id: 1700000011, name: 'Software', code: 'SOFT', appliesTo: 'Service', status: 'Active', description: 'Software licenses' },
            { id: 1700000012, name: 'Maintenance', code: 'MAIN', appliesTo: 'Service', status: 'Active', description: 'Maintenance services' },
            { id: 1700000013, name: 'Consulting', code: 'CONS', appliesTo: 'Service', status: 'Active', description: 'Consulting services' },
          ]
          setCategories(sampleData)
        }
      } else {
         // Seed data (duplicate block to handle null case safely or just rely on the if/else structure)
          const sampleData = [
            { id: 1700000001, name: 'Electronics', code: 'ELEC', appliesTo: 'Product', status: 'Active', description: 'Electronic devices and accessories' },
            { id: 1700000002, name: 'Furniture', code: 'FURN', appliesTo: 'Product', status: 'Active', description: 'Office and home furniture' },
            { id: 1700000011, name: 'Software', code: 'SOFT', appliesTo: 'Service', status: 'Active', description: 'Software licenses' }
          ]
          setCategories(sampleData)
      }
      
      const rawFamilies = localStorage.getItem('inventoryFamilies')
      if (rawFamilies) {
        setFamilies(JSON.parse(rawFamilies))
      }
      
      const rawProducts = localStorage.getItem('inventoryProducts')
      if (rawProducts) setProducts(JSON.parse(rawProducts))

      const rawItems = localStorage.getItem('inventoryItems')
      if (rawItems) setItems(JSON.parse(rawItems))

      const rawWarehouses = localStorage.getItem('inventoryWarehouses')
      if (rawWarehouses) setWarehouses(JSON.parse(rawWarehouses))

      const rawSuppliers = localStorage.getItem('inventorySuppliers')
      if (rawSuppliers) setSuppliers(JSON.parse(rawSuppliers))

    } catch (e) { console.warn('Failed to load data', e) }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(categories)) } catch (e) { void e }
  }, [categories])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return
    const newCat = {
      id: Date.now(),
      name,
      code: form.code || '',
      appliesTo: form.appliesTo || 'All',
      status: form.status || 'Active',
      description: form.description.trim(),
    }
    setCategories(prev => [newCat, ...prev])
    setForm({ name: '', code: '', appliesTo: 'All', status: 'Active', description: '' })
  }

  function onDelete(id) { setCategories(prev => prev.filter(c => c.id !== id)) }
  function onEdit(cat) { 
    setForm({ 
      name: cat.name || '', 
      code: cat.code || '',
      appliesTo: cat.appliesTo || 'All',
      status: cat.status || 'Active',
      description: cat.description || '' 
    })
    setShowForm(true)
    setActiveTab('basic')
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch (e) { void e }
  }

  const appliesToFilterOptions = useMemo(() => ['All', 'Product', 'Service', 'Subscription', 'Package'], [])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const filtered = useMemo(() => {
    return categories.filter(c => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!c.name.toLowerCase().includes(q) && !(c.description || '').toLowerCase().includes(q) && !(c.code || '').toLowerCase().includes(q)) return false
      }
      if (filters.appliesTo && filters.appliesTo !== 'All' && c.appliesTo !== filters.appliesTo) return false
      if (filters.status && filters.status !== 'All' && c.status !== filters.status) return false
      
      return true
    })
  }, [categories, filters])

  function clearFilters() { 
    setIsFiltering(true)
    setFilters({ 
      search: '', 
      appliesTo: '',
      status: ''
    })
    setTimeout(() => setIsFiltering(false), 300)
  }

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage])

  return (
      <div className="space-y-6 pt-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="relative inline-block">
            <h1 className={`page-title text-2xl font-semibold ${isArabic ? 'text-right' : 'text-left'}`}>{labels.title}</h1>
            <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isArabic ? 'auto' : '-4px', right: isArabic ? '-4px' : 'auto', bottom: '-4px' }}></span>
          </div>
          <button className="btn btn-sm bg-green-600 hover:bg-green-500 text-white border-none" onClick={() => { setShowForm(true); setActiveTab('basic'); }}><FaPlus />{labels.add}</button>
        </div>

        <div className="card p-4 sm:p-6 bg-transparent rounded-2xl filters-compact" style={{ backgroundColor: 'transparent' }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FaFilter className="text-blue-500" /> {labels.filter}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={clearFilters} className="px-3 py-1.5 text-sm  dark:text-white hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                {isArabic ? 'إعادة تعيين' : 'Reset'}
              </button>
            </div>
          </div>
          <div className="space-y-4 overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaSearch className="text-blue-500" size={10} /> {labels.search}</label>
                <input className="input w-full" value={filters.search} onChange={e=>setFilters(prev=>({...prev, search: e.target.value}))} placeholder={isArabic ? 'بحث...' : 'Search...'} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--muted-text)]">{labels.appliesTo}</label>
                <SearchableSelect options={appliesToFilterOptions} value={filters.appliesTo} onChange={val=>setFilters(prev=>({...prev, appliesTo: val}))} isRTL={isArabic} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--muted-text)]">{labels.status}</label>
                <select className="input w-full" value={filters.status} onChange={e=>setFilters(prev=>({...prev, status: e.target.value}))}>
                    <option value="">{isArabic ? 'الكل' : 'All'}</option>
                    <option value="Active">{labels.active}</option>
                    <option value="Inactive">{labels.inactive}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
          {filtered.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
          ) : (
            <>
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {paginatedCategories.map(c => (
                <div key={c.id} className=" dark:bg-gray-800/40 dark:backdrop-blur-md p-4 rounded-lg shadow-sm border border-gray-100 dark:border-white/10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg  dark:text-white">{c.name}</h3>
                      <p className="text-xs font-mono ">{c.code || '-'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 '}`}>
                      {c.status === 'Active' ? labels.active : labels.inactive}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm  dark:text-white mb-4">
                    <div className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                      <span className=" dark:text-white">{labels.appliesTo}:</span>
                      <span className="font-medium dark:text-white">{c.appliesTo}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                      <span className=" dark:text-white">{labels.offeringsCount}:</span>
                      <span className="font-medium dark:text-white">{items.filter(i => i.category === c.name).length}</span>
                    </div>
                     <div className="flex flex-col gap-1 pt-1">
                      <span className=" dark:text-white">{labels.description}:</span>
                      <p className=" dark:text-white text-sm line-clamp-2">{c.description}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                     <button type="button" className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50" onClick={() => onEdit(c)}>
                      <FaEdit size={16} className="mr-1" /> {labels.edit}
                    </button>
                    <button type="button" className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50" onClick={() => onDelete(c.id)}>
                      <FaTrash size={16} className="mr-1" /> {labels.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="nova-table w-full">
                <thead className="thead-soft">
                  <tr className=" dark:text-white">
                    <th className="text-start px-3 min-w-[200px]">{labels.name}</th>
                    <th className="text-start px-3 min-w-[100px]">{labels.code || 'Code'}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.appliesTo}</th>
                    <th className="text-start px-3 min-w-[100px]">{labels.status}</th>
                    <th className="text-center px-3 min-w-[120px]">{labels.offeringsCount}</th>
                    <th className="text-start px-3 min-w-[220px]">{labels.description}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map(c => (
                    <tr key={c.id}>
                      <td className="px-3"><span className="font-medium">{c.name}</span></td>
                      <td className="px-3 text-xs font-mono text-[var(--muted-text)]">{c.code || '-'}</td>
                      <td className="px-3">{c.appliesTo}</td>
                      <td className="px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 '}`}>
                          {c.status === 'Active' ? labels.active : labels.inactive}
                        </span>
                      </td>
                      <td className="px-3 text-center">{items.filter(i => i.category === c.name).length}</td>
                      <td className="px-3">{c.description}</td>
                      <td className="px-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button type="button" className="btn btn-sm btn-circle btn-ghost text-blue-600 hover:bg-blue-100" title={labels.edit} aria-label={labels.edit} onClick={() => onEdit(c)}>
                            <FaEdit size={16} />
                          </button>
                          <button type="button" className="btn btn-sm btn-circle btn-ghost text-red-600 hover:bg-red-100" title={labels.delete} aria-label={labels.delete} onClick={() => onDelete(c.id)}>
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}

          {/* Pagination Footer */}
          {filtered.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center justify-between rounded-xl p-2 glass-panel gap-4">
              <div className="text-xs text-[var(--muted-text)]">
                {isArabic 
                  ? `عرض ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filtered.length)} من ${filtered.length}` 
                  : `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filtered.length)} of ${filtered.length}`}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    title={isArabic ? 'السابق' : 'Prev'}
                  >
                    <FaChevronLeft className={isArabic ? 'scale-x-[-1]' : ''} />
                  </button>
                  <span className="text-sm whitespace-nowrap">{isArabic ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    title={isArabic ? 'التالي' : 'Next'}
                  >
                    <FaChevronRight className={isArabic ? 'scale-x-[-1]' : ''} />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[var(--muted-text)] whitespace-nowrap">{isArabic ? 'لكل صفحة:' : 'Per page:'}</span>
                  <select
                    className="input w-24 text-sm py-0 px-2 h-8"
                    value={itemsPerPage}
                    onChange={e => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>


        {showForm && (
          <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <div className="absolute inset-0 flex items-start justify-center p-6 md:p-6">
              <div className="card p-4 sm:p-6 mt-4 w-[92vw] sm:w-[80vw] lg:w-[60vw] xl:max-w-3xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold dark:!text-white">{labels.formTitle}</h2>
                  <button type="button" className="btn btn-glass btn-sm text-red-500 hover:text-red-600" onClick={() => setShowForm(false)} aria-label={labels.close}>
                    <FaTimes />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'basic' ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' : 'border-transparent  hover:text-gray-700 dark:text-white dark:hover:text-white'}`}
                    onClick={() => setActiveTab('basic')}
                  >
                    {labels.basicInfo}
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'scope' ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' : 'border-transparent  hover:text-gray-700 dark:text-white dark:hover:text-white'}`}
                    onClick={() => setActiveTab('scope')}
                  >
                    {labels.scope}
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'status' ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' : 'border-transparent  hover:text-gray-700 dark:text-white dark:hover:text-white'}`}
                    onClick={() => setActiveTab('status')}
                  >
                    {labels.status}
                  </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                  {/* 1. Basic Info */}
                  <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
                    <div className=" dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-300 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      {labels.basicInfo}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <label className="block dark:!text-white text-sm mb-1">{labels.name} <span className="text-red-500">*</span></label>
                        <input name="name" value={form.name} onChange={onChange} placeholder={labels.name} className="input w-full dark:!text-white" required />
                      </div>
                      <div className="col-span-1">
                        <label className="block dark:!text-white text-sm mb-1">{labels.code} <span className=" text-xs">({isArabic ? 'اختياري' : 'Optional'})</span></label>
                        <input name="code" value={form.code} onChange={onChange} placeholder={labels.code} className="input w-full dark:!text-white" />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block dark:!text-white text-sm mb-1">{labels.description} <span className="text-xs">({isArabic ? 'اختياري' : 'Optional'})</span></label>
                        <textarea name="description" value={form.description} onChange={onChange} placeholder={labels.description} className="input w-full h-20 dark:!text-white" />
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* 2. Category Scope */}
                  <div className={activeTab === 'scope' ? 'block' : 'hidden'}>
                    <div className=" dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-300 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      {labels.scope}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block dark:!text-white text-sm mb-1">{labels.appliesTo}</label>
                        <select name="appliesTo" value={form.appliesTo} onChange={onChange} className="input w-full dark:!text-white">
                          {appliesToOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <p className="text-xs  mt-1">{isArabic ? 'يحدد أين يمكن استخدام هذا التصنيف' : 'Determines where this category can be used'}</p>
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* 3. Status */}
                  <div className={activeTab === 'status' ? 'block' : 'hidden'}>
                    <div className=" dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-300 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      {labels.status}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block dark:!text-white text-sm mb-1">{labels.status}</label>
                        <select name="status" value={form.status} onChange={onChange} className="input w-full dark:!text-white">
                          <option value="Active">{labels.active}</option>
                          <option value="Inactive">{labels.inactive}</option>
                        </select>
                      </div>
                    </div>
                    </div>
                  </div>

                  <div className={`flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 ${isArabic ? 'justify-start' : 'justify-end'}`}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>{labels.close}</button>
                    <button type="submit" className="btn bg-green-600 hover:bg-green-500 text-white border-none px-6">{labels.save}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}
