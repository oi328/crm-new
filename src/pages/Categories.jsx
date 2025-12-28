import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SearchableSelect from '../components/SearchableSelect'
import { FaFilter, FaSearch, FaChevronDown, FaTimes, FaEdit, FaTrash } from 'react-icons/fa'

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
    clearFilters: isArabic ? 'مسح المرشحات' : 'Clear Filters',
    name: isArabic ? 'اسم التصنيف' : 'Category Name',
    parent: isArabic ? 'العائلات' : 'Families',
    itemsCount: isArabic ? 'عدد الأصناف' : 'Number of Items',
    description: isArabic ? 'الوصف' : 'Description',
    save: isArabic ? 'حفظ التصنيف' : 'Save Category',
    listTitle: isArabic ? 'كل التصنيفات' : 'All Categories',
    empty: isArabic ? 'لا توجد تصنيفات بعد' : 'No categories yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    delete: isArabic ? 'حذف' : 'Delete',
    edit: isArabic ? 'تعديل' : 'Edit',
    type: isArabic ? 'نوع التصنيف' : 'Category Type',
    brandName: isArabic ? 'اسم العلامة التجارية' : 'Brand Name',
    productName: isArabic ? 'اسم المنتج' : 'Product Name',
    itemName: isArabic ? 'اسم الصنف' : 'Item Name',
    sku: isArabic ? 'SKU' : 'SKU',
    warehouseName: isArabic ? 'اسم المستودع' : 'Warehouse Name',
    warehouseCode: isArabic ? 'رمز المستودع' : 'Warehouse Code',
    warehouseType: isArabic ? 'نوع المستودع' : 'Warehouse Type',
    supplierName: isArabic ? 'اسم المورد' : 'Supplier Name',
    supplierCode: isArabic ? 'كود المورد' : 'Supplier Code',
  }), [isArabic])

  const categoryTypeOptions = useMemo(() => (
    isArabic ? ['منتجات', 'خدمات', 'أصول'] : ['Products', 'Services', 'Assets']
  ), [isArabic])

  const STORAGE_KEY = 'inventoryCategories'

  const [form, setForm] = useState({
    name: '',
    type: '',
    parent: '',
    description: ''
  })

  const [categories, setCategories] = useState([])
  const [families, setFamilies] = useState([]) // Add families state
  const [products, setProducts] = useState([])
  const [items, setItems] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [showForm, setShowForm] = useState(false)
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [filters, setFilters] = useState({ 
    search: '', 
    parent: '',
    type: '',
    brandName: '',
    productName: '',
    itemName: '',
    sku: '',
    warehouseName: '',
    warehouseCode: '',
    warehouseType: '',
    supplierName: '',
    supplierCode: ''
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
            { id: 1700000001, name: 'Electronics', type: 'Products', parent: '', description: 'Electronic devices and accessories' },
            { id: 1700000002, name: 'Furniture', type: 'Assets', parent: '', description: 'Office and home furniture' },
            { id: 1700000003, name: 'Clothing', type: 'Products', parent: '', description: 'Apparel and fashion' },
            { id: 1700000004, name: 'Laptops', type: 'Products', parent: 'Electronics', description: 'Portable computers' },
            { id: 1700000005, name: 'Smartphones', type: 'Products', parent: 'Electronics', description: 'Mobile phones' },
            { id: 1700000006, name: 'Desks', type: 'Assets', parent: 'Furniture', description: 'Office desks' },
            { id: 1700000007, name: 'Chairs', type: 'Assets', parent: 'Furniture', description: 'Office chairs' },
            { id: 1700000008, name: 'Men Fashion', type: 'Products', parent: 'Clothing', description: 'Clothing for men' },
            { id: 1700000009, name: 'Women Fashion', type: 'Products', parent: 'Clothing', description: 'Clothing for women' },
            { id: 1700000010, name: 'Accessories', type: 'Products', parent: 'Electronics', description: 'Cables, chargers, etc.' },
            { id: 1700000011, name: 'Software', type: 'Services', parent: '', description: 'Software licenses' },
            { id: 1700000012, name: 'Maintenance', type: 'Services', parent: '', description: 'Maintenance services' },
            { id: 1700000013, name: 'Consulting', type: 'Services', parent: '', description: 'Consulting services' },
            { id: 1700000014, name: 'Vehicles', type: 'Assets', parent: '', description: 'Company vehicles' },
            { id: 1700000015, name: 'Stationery', type: 'Products', parent: '', description: 'Office supplies' },
            { id: 1700000016, name: 'Cleaning', type: 'Products', parent: '', description: 'Cleaning supplies' },
            { id: 1700000017, name: 'Kitchen', type: 'Assets', parent: 'Furniture', description: 'Kitchen furniture' },
            { id: 1700000018, name: 'Lighting', type: 'Assets', parent: 'Furniture', description: 'Lamps and lights' },
            { id: 1700000019, name: 'Security', type: 'Assets', parent: 'Electronics', description: 'Cameras and alarms' },
            { id: 1700000020, name: 'Networking', type: 'Assets', parent: 'Electronics', description: 'Routers and switches' }
          ]
          setCategories(sampleData)
        }
      } else {
         // Seed data (duplicate block to handle null case safely or just rely on the if/else structure)
          const sampleData = [
            { id: 1700000001, name: 'Electronics', type: 'Products', parent: '', description: 'Electronic devices and accessories' },
            { id: 1700000002, name: 'Furniture', type: 'Assets', parent: '', description: 'Office and home furniture' },
            { id: 1700000003, name: 'Clothing', type: 'Products', parent: '', description: 'Apparel and fashion' }
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
      type: form.type || '',
      parent: form.parent || '',
      description: form.description.trim(),
    }
    setCategories(prev => [newCat, ...prev])
    setForm({ name: '', type: '', parent: '', description: '' })
  }

  function onDelete(id) { setCategories(prev => prev.filter(c => c.id !== id)) }
  function onEdit(cat) { 
    setForm({ 
      name: cat.name || '', 
      type: cat.type || '', 
      parent: cat.parent || '', 
      description: cat.description || '' 
    })
    setShowForm(true)
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch (e) { void e }
  }

  const parentOptions = useMemo(() => [''].concat(categories.map(c => c.name)), [categories])
  const parentFilterOptions = useMemo(() => Array.from(new Set(categories.map(c => c.parent).filter(Boolean))), [categories])
  
  // Filter Options
  const brandNameOptions = useMemo(() => Array.from(new Set(products.map(p => p.brand).filter(Boolean))), [products])
  const productNameOptions = useMemo(() => Array.from(new Set(products.map(p => p.name).filter(Boolean))), [products])
  const itemNameOptions = useMemo(() => Array.from(new Set(items.map(i => i.itemName).filter(Boolean))), [items])
  const skuOptions = useMemo(() => Array.from(new Set(items.map(i => i.sku).filter(Boolean))), [items])
  
  const warehouseNameOptions = useMemo(() => Array.from(new Set(warehouses.map(w => w.warehouseName).filter(Boolean))), [warehouses])
  const warehouseCodeOptions = useMemo(() => Array.from(new Set(warehouses.map(w => w.warehouseCode).filter(Boolean))), [warehouses])
  const warehouseTypeOptions = useMemo(() => Array.from(new Set(warehouses.map(w => w.warehouseType).filter(Boolean))), [warehouses])
  
  const supplierNameOptions = useMemo(() => Array.from(new Set(suppliers.map(s => s.supplierName).filter(Boolean))), [suppliers])
  const supplierCodeOptions = useMemo(() => Array.from(new Set(suppliers.map(s => s.supplierCode).filter(Boolean))), [suppliers])

  const filtered = useMemo(() => {
    return categories.filter(c => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!c.name.toLowerCase().includes(q) && !(c.description || '').toLowerCase().includes(q)) return false
      }
      if (filters.parent && c.parent !== filters.parent) return false
      if (filters.type && c.type !== filters.type) return false
      
      // Indirect Filters
      if (filters.brandName) {
        const hasBrand = products.some(p => p.category === c.name && p.brand === filters.brandName)
        if (!hasBrand) {
           // Also check items -> product -> brand? Usually items have product link.
           // Assuming basic link for now: Product Category
           return false
        }
      }
      if (filters.productName) {
        if (!products.some(p => p.category === c.name && p.name === filters.productName)) return false
      }
      if (filters.itemName) {
        if (!items.some(i => i.category === c.name && i.itemName === filters.itemName)) return false
      }
      if (filters.sku) {
        if (!items.some(i => i.category === c.name && i.sku === filters.sku)) return false
      }
      
      // Warehouse Filters (via Items)
      if (filters.warehouseName || filters.warehouseCode || filters.warehouseType) {
        const matchesWarehouse = items.some(i => {
          if (i.category !== c.name) return false
          const w = warehouses.find(w => w.warehouseName === i.warehouse) // Assuming item.warehouse stores name
          if (!w) return false
          
          if (filters.warehouseName && w.warehouseName !== filters.warehouseName) return false
          if (filters.warehouseCode && w.warehouseCode !== filters.warehouseCode) return false
          if (filters.warehouseType && w.warehouseType !== filters.warehouseType) return false
          return true
        })
        if (!matchesWarehouse) return false
      }
      
      // Supplier Filters (via Items or Products)
      if (filters.supplierName || filters.supplierCode) {
        const matchesSupplier = items.some(i => {
          if (i.category !== c.name) return false
          const s = suppliers.find(s => s.supplierName === i.supplier)
          if (!s) return false
          if (filters.supplierName && s.supplierName !== filters.supplierName) return false
          if (filters.supplierCode && s.supplierCode !== filters.supplierCode) return false
          return true
        }) || products.some(p => {
          if (p.category !== c.name) return false
          const s = suppliers.find(s => s.supplierName === p.supplier)
          if (!s) return false
          if (filters.supplierName && s.supplierName !== filters.supplierName) return false
          if (filters.supplierCode && s.supplierCode !== filters.supplierCode) return false
          return true
        })
        if (!matchesSupplier) return false
      }

      return true
    })
  }, [categories, filters, products, items, warehouses, suppliers])

  function clearFilters() { 
    setFilters({ 
      search: '', 
      parent: '',
      type: '',
      brandName: '',
      productName: '',
      itemName: '',
      sku: '',
      warehouseName: '',
      warehouseCode: '',
      warehouseType: '',
      supplierName: '',
      supplierCode: ''
    }) 
  }

  return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div className="relative inline-block">
            <h1 className={`page-title text-2xl font-semibold ${isArabic ? 'text-right' : 'text-left'}`}>{labels.title}</h1>
            <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isArabic ? 'auto' : '-4px', right: isArabic ? '-4px' : 'auto', bottom: '-4px' }}></span>
          </div>
          <button className="btn btn-sm bg-green-600 hover:bg-green-500 text-white border-none" onClick={() => setShowForm(true)}>{labels.add}</button>
        </div>

        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FaFilter className="text-blue-500" /> {labels.filter}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAllFilters(prev => !prev)} className="btn btn-glass btn-compact text-blue-600">
                {showAllFilters ? (isArabic ? 'إخفاء' : 'Hide') : (isArabic ? 'إظهار' : 'Show')} <FaChevronDown className={`transform transition-transform ${showAllFilters ? 'rotate-180' : ''}`} />
              </button>
              <button onClick={clearFilters} className="btn btn-glass btn-compact text-[var(--muted-text)] hover:text-red-500">
                {labels.clearFilters}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaSearch className="text-blue-500" size={10} /> {labels.search}</label>
              <input className="input w-full" value={filters.search} onChange={e=>setFilters(prev=>({...prev, search: e.target.value}))} placeholder={isArabic ? 'بحث...' : 'Search...'} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.type}</label>
              <SearchableSelect options={categoryTypeOptions} value={filters.type} onChange={val=>setFilters(prev=>({...prev, type: val}))} isRTL={isArabic} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.parent}</label>
              <SearchableSelect options={parentFilterOptions} value={filters.parent} onChange={val=>setFilters(prev=>({...prev, parent: val}))} isRTL={isArabic} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.brandName}</label>
              <SearchableSelect options={brandNameOptions} value={filters.brandName} onChange={val=>setFilters(prev=>({...prev, brandName: val}))} isRTL={isArabic} />
            </div>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300 overflow-hidden ${showAllFilters ? 'max-h-[600px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
             <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.productName}</label>
              <SearchableSelect options={productNameOptions} value={filters.productName} onChange={val=>setFilters(prev=>({...prev, productName: val}))} isRTL={isArabic} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.itemName}</label>
              <SearchableSelect options={itemNameOptions} value={filters.itemName} onChange={val=>setFilters(prev=>({...prev, itemName: val}))} isRTL={isArabic} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.sku}</label>
              <SearchableSelect options={skuOptions} value={filters.sku} onChange={val=>setFilters(prev=>({...prev, sku: val}))} isRTL={isArabic} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.warehouseName}</label>
              <SearchableSelect options={warehouseNameOptions} value={filters.warehouseName} onChange={val=>setFilters(prev=>({...prev, warehouseName: val}))} isRTL={isArabic} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.warehouseCode}</label>
              <SearchableSelect options={warehouseCodeOptions} value={filters.warehouseCode} onChange={val=>setFilters(prev=>({...prev, warehouseCode: val}))} isRTL={isArabic} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.warehouseType}</label>
              <select className="input w-full" value={filters.warehouseType} onChange={e=>setFilters(prev=>({...prev, warehouseType: e.target.value}))}>
                <option value="">{isArabic ? 'الكل' : 'All'}</option>
                {warehouseTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.supplierName}</label>
              <SearchableSelect options={supplierNameOptions} value={filters.supplierName} onChange={val=>setFilters(prev=>({...prev, supplierName: val}))} isRTL={isArabic} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.supplierCode}</label>
              <SearchableSelect options={supplierCodeOptions} value={filters.supplierCode} onChange={val=>setFilters(prev=>({...prev, supplierCode: val}))} isRTL={isArabic} />
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
                    <th className="text-start px-3 min-w-[160px]">{labels.parent}</th>
                    <th className="text-center px-3 min-w-[120px]">{labels.itemsCount}</th>
                    <th className="text-start px-3 min-w-[220px]">{labels.description}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td className="px-3"><span className="font-medium">{c.name}</span></td>
                      <td className="px-3">{c.parent || (isArabic ? 'بدون' : 'None')}</td>
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
                <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">{labels.name}</label>
                <input name="name" value={form.name} onChange={onChange} placeholder={labels.name} className="input" required />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.type}</label>
                <select name="type" value={form.type} onChange={onChange} className="input">
                  <option value="">{isArabic ? 'اختر...' : 'Select...'}</option>
                  {categoryTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.parent}</label>
                <SearchableSelect options={parentOptions} value={form.parent} onChange={val=>setForm(prev=>({...prev, parent: val}))} isRTL={isArabic} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">{labels.description}</label>
                <textarea name="description" value={form.description} onChange={onChange} placeholder={labels.description} className="input h-24" />
              </div>
                  <div className={`md:col-span-2 flex gap-2 ${isArabic ? 'justify-start' : 'justify-end'}`}>
                    <button type="submit" className="btn btn-sm bg-green-600 hover:bg-green-500 text-white border-none">{labels.save}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}
