import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SearchableSelect from '../../components/SearchableSelect'
import { FaFilter, FaSearch, FaChevronDown, FaTimes, FaEdit, FaTrash } from 'react-icons/fa'

const MOCK_ITEMS = [
  { id: 1, name: 'iPhone 13 Pro', family: 'Electronics', category: 'Mobiles', group: 'Smartphones', type: 'Product', sku: 'MOB-IPH-13P', price: 999, stock: 50, minStock: 10, unit: 'pcs', status: 'Active', description: 'Apple iPhone 13 Pro 128GB' },
  { id: 2, name: 'Samsung Galaxy S22', family: 'Electronics', category: 'Mobiles', group: 'Smartphones', type: 'Product', sku: 'MOB-SAM-S22', price: 899, stock: 45, minStock: 10, unit: 'pcs', status: 'Active', description: 'Samsung Galaxy S22 5G' },
  { id: 3, name: 'Dell XPS 15', family: 'Electronics', category: 'Computers', group: 'Laptops', type: 'Product', sku: 'LAP-DEL-XPS', price: 1500, stock: 20, minStock: 5, unit: 'pcs', status: 'Active', description: 'Dell XPS 15 Laptop' },
  { id: 4, name: 'MacBook Air M2', family: 'Electronics', category: 'Computers', group: 'Laptops', type: 'Product', sku: 'LAP-APP-AIR', price: 1199, stock: 30, minStock: 5, unit: 'pcs', status: 'Active', description: 'Apple MacBook Air M2' },
  { id: 5, name: 'iPad Air 5', family: 'Electronics', category: 'Computers', group: 'Tablets', type: 'Product', sku: 'TAB-APP-AIR', price: 599, stock: 40, minStock: 8, unit: 'pcs', status: 'Active', description: 'Apple iPad Air 5th Gen' },
  { id: 6, name: 'Sony WH-1000XM5', family: 'Electronics', category: 'Audio', group: 'Headphones', type: 'Product', sku: 'AUD-SON-XM5', price: 349, stock: 60, minStock: 10, unit: 'pcs', status: 'Active', description: 'Noise Cancelling Headphones' },
  { id: 7, name: 'Logitech MX Master 3S', family: 'Electronics', category: 'Accessories', group: 'Mice', type: 'Product', sku: 'ACC-LOG-MX3', price: 99, stock: 100, minStock: 20, unit: 'pcs', status: 'Active', description: 'Wireless Performance Mouse' },
  { id: 8, name: 'Keychron K2', family: 'Electronics', category: 'Accessories', group: 'Keyboards', type: 'Product', sku: 'ACC-KEY-K2', price: 79, stock: 80, minStock: 15, unit: 'pcs', status: 'Active', description: 'Mechanical Keyboard' },
  { id: 9, name: 'Office Chair Ergonomic', family: 'Furniture', category: 'Office', group: 'Chairs', type: 'Product', sku: 'FUR-CHR-ERG', price: 250, stock: 25, minStock: 5, unit: 'pcs', status: 'Active', description: 'Ergonomic Mesh Chair' },
  { id: 10, name: 'Standing Desk', family: 'Furniture', category: 'Office', group: 'Desks', type: 'Product', sku: 'FUR-DSK-STD', price: 400, stock: 15, minStock: 3, unit: 'pcs', status: 'Active', description: 'Electric Standing Desk' },
  { id: 11, name: 'Filing Cabinet', family: 'Furniture', category: 'Office', group: 'Cabinets', type: 'Product', sku: 'FUR-CAB-FIL', price: 150, stock: 30, minStock: 5, unit: 'pcs', status: 'Active', description: '3-Drawer Filing Cabinet' },
  { id: 12, name: 'A4 Paper Ream', family: 'Stationery', category: 'Paper', group: 'Office Supplies', type: 'Product', sku: 'STA-PAP-A4', price: 5, stock: 500, minStock: 50, unit: 'ream', status: 'Active', description: '80gsm A4 Paper' },
  { id: 13, name: 'Ballpoint Pens (Blue)', family: 'Stationery', category: 'Writing', group: 'Pens', type: 'Product', sku: 'STA-PEN-BLU', price: 10, stock: 200, minStock: 20, unit: 'box', status: 'Active', description: 'Box of 12 Blue Pens' },
  { id: 14, name: 'HP LaserJet Pro', family: 'Electronics', category: 'Office', group: 'Printers', type: 'Product', sku: 'PRT-HP-LJP', price: 300, stock: 10, minStock: 2, unit: 'pcs', status: 'Active', description: 'Monochrome Laser Printer' },
  { id: 15, name: 'Monitor 27"', family: 'Electronics', category: 'Computers', group: 'Monitors', type: 'Product', sku: 'MON-GEN-27', price: 200, stock: 35, minStock: 5, unit: 'pcs', status: 'Active', description: '27-inch IPS Monitor' },
  { id: 16, name: 'USB-C Hub', family: 'Electronics', category: 'Accessories', group: 'Cables', type: 'Product', sku: 'ACC-USB-HUB', price: 40, stock: 75, minStock: 10, unit: 'pcs', status: 'Active', description: '7-in-1 USB-C Hub' },
  { id: 17, name: 'Webcam 1080p', family: 'Electronics', category: 'Accessories', group: 'Cameras', type: 'Product', sku: 'ACC-CAM-1080', price: 60, stock: 50, minStock: 10, unit: 'pcs', status: 'Active', description: 'HD Webcam' },
  { id: 18, name: 'Projector', family: 'Electronics', category: 'Office', group: 'Projectors', type: 'Product', sku: 'PRJ-EPS-GEN', price: 500, stock: 8, minStock: 2, unit: 'pcs', status: 'Active', description: 'Meeting Room Projector' },
  { id: 19, name: 'Whiteboard', family: 'Furniture', category: 'Office', group: 'Boards', type: 'Product', sku: 'FUR-BRD-WHT', price: 80, stock: 20, minStock: 5, unit: 'pcs', status: 'Active', description: 'Magnetic Whiteboard' },
  { id: 20, name: 'Stapler Heavy Duty', family: 'Stationery', category: 'Office', group: 'Supplies', type: 'Product', sku: 'STA-STP-HD', price: 15, stock: 40, minStock: 10, unit: 'pcs', status: 'Active', description: 'Heavy Duty Stapler' }
];

export default function ItemsPage() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const labels = useMemo(() => ({
    title: isArabic ? 'إدارة الأصناف' : 'Items Management',
    formTitle: isArabic ? 'بيانات الصنف' : 'Item Details',
    add: isArabic ? 'إضافة صنف' : 'Add Item',
    close: isArabic ? 'إغلاق' : 'Close',
    filter: isArabic ? 'تصفية' : 'Filter',
    search: isArabic ? 'بحث' : 'Search',
    clearFilters: isArabic ? 'مسح المرشحات' : 'Clear Filters',
    name: isArabic ? 'اسم الصنف' : 'Item Name',
    family: isArabic ? 'العائلة' : 'Family',
    category: isArabic ? 'التصنيف' : 'Category',
    group: isArabic ? 'المجموعة' : 'Group',
    brand: isArabic ? 'العلامة التجارية' : 'Brand',
    supplier: isArabic ? 'المورد' : 'Supplier',
    type: isArabic ? 'النوع' : 'Type',
    price: isArabic ? 'السعر' : 'Price',
    status: isArabic ? 'الحالة' : 'Status',
    stock: isArabic ? 'المخزون' : 'Stock',
    minStock: isArabic ? 'الحد الأدنى' : 'Min Stock',
    unit: isArabic ? 'الوحدة' : 'Unit',
    sku: 'SKU',
    description: isArabic ? 'الوصف' : 'Description',
    save: isArabic ? 'حفظ' : 'Save',
    listTitle: isArabic ? 'قائمة الأصناف' : 'Items List',
    empty: isArabic ? 'لا توجد أصناف بعد' : 'No items yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    active: isArabic ? 'نشط' : 'Active',
    inactive: isArabic ? 'غير نشط' : 'Inactive',
    delete: isArabic ? 'حذف' : 'Delete',
    edit: isArabic ? 'تعديل' : 'Edit',
  }), [isArabic])

  const STORAGE_KEY = 'inventoryItems'
  const FAMILY_KEY = 'inventoryFamilies'
  const CAT_KEY = 'inventoryCategories'
  const GROUP_KEY = 'inventoryGroups'
  const BRAND_KEY = 'inventoryBrands'
  const THIRD_PARTY_KEY = 'inventoryThirdParties'

  const [form, setForm] = useState({
    id: null,
    name: '',
    family: '',
    category: '',
    group: '',
    brand: '',
    supplier: '',
    type: 'Product',
    sku: '',
    price: '',
    stock: 0,
    minStock: 0,
    unit: 'pcs',
    status: 'Active',
    description: ''
  })

  const [items, setItems] = useState([])
  const [families, setFamilies] = useState([])
  const [categories, setCategories] = useState([])
  const [groups, setGroups] = useState([])
  const [brands, setBrands] = useState([])
  const [thirdParties, setThirdParties] = useState([])
  const [showForm, setShowForm] = useState(false)
  
  const [filters, setFilters] = useState({ 
    search: '', 
    family: '',
    category: '',
    group: '',
    brand: '',
    supplier: '',
    status: 'all',
    type: 'all'
  })

  const [inventoryMode, setInventoryMode] = useState('advanced')

  useEffect(() => {
    const loadMode = () => {
      try {
        // Try systemPrefs first
        const prefs = localStorage.getItem('systemPrefs')
        if (prefs) {
          const parsed = JSON.parse(prefs)
          if (parsed.inventoryMode) {
            setInventoryMode(parsed.inventoryMode)
            return
          }
        }
        // Fallback to legacy key
        const mode = localStorage.getItem('inventoryMode')
        if (mode) setInventoryMode(mode)
      } catch {}
    }

    loadMode()
    window.addEventListener('inventoryModeUpdated', loadMode)
    window.addEventListener('storage', loadMode)
    return () => {
      window.removeEventListener('inventoryModeUpdated', loadMode)
      window.removeEventListener('storage', loadMode)
    }
  }, [])

  useEffect(() => {
    // Load Items
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed)
        } else {
          setItems(MOCK_ITEMS)
        }
      } else {
        setItems(MOCK_ITEMS)
      }
    } catch (e) { 
      console.warn('Failed to load items', e)
      setItems(MOCK_ITEMS)
    }

    // Load Families
    try {
      const raw = localStorage.getItem(FAMILY_KEY)
      if (raw) setFamilies(JSON.parse(raw))
    } catch (e) { console.warn('Failed to load families', e) }

    // Load Categories
    try {
      const raw = localStorage.getItem(CAT_KEY)
      if (raw) setCategories(JSON.parse(raw))
    } catch (e) { console.warn('Failed to load categories', e) }

    // Load Groups
    try {
      const raw = localStorage.getItem(GROUP_KEY)
      if (raw) setGroups(JSON.parse(raw))
    } catch (e) { console.warn('Failed to load groups', e) }

    // Load Brands
    try {
      const raw = localStorage.getItem(BRAND_KEY)
      if (raw) setBrands(JSON.parse(raw))
    } catch (e) { console.warn('Failed to load brands', e) }

    // Load Third Parties
    try {
      const raw = localStorage.getItem(THIRD_PARTY_KEY)
      if (raw) setThirdParties(JSON.parse(raw))
    } catch (e) { console.warn('Failed to load third parties', e) }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch (e) { void e }
  }, [items])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()
    if (!form.name) return

    if (form.id) {
      setItems(prev => prev.map(item => item.id === form.id ? { ...form } : item))
    } else {
      setItems(prev => [{ ...form, id: Date.now() }, ...prev])
    }
    setForm({
      id: null, name: '', family: '', category: '', group: '', type: 'Product', sku: '', price: '', stock: 0, minStock: 0, unit: 'pcs', status: 'Active', description: ''
    })
    setShowForm(false)
  }

  function onDelete(id) {
    if (window.confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this item?')) {
      setItems(prev => prev.filter(i => i.id !== id))
    }
  }

  function onEdit(item) {
    setForm({ ...item })
    setShowForm(true)
  }

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!item.name.toLowerCase().includes(q) && !(item.sku || '').toLowerCase().includes(q)) return false
      }
      if (filters.status !== 'all' && item.status !== filters.status) return false
      if (filters.type !== 'all' && item.type !== filters.type) return false
      if (filters.family && item.family !== filters.family) return false
      if (filters.category && item.category !== filters.category) return false
      if (filters.group && item.group !== filters.group) return false
      if (filters.brand && item.brand !== filters.brand) return false
      if (filters.supplier && item.supplier !== filters.supplier) return false
      return true
    })
  }, [items, filters])

  function clearFilters() {
    setFilters({ search: '', status: 'all', type: 'all', family: '', category: '', group: '', brand: '', supplier: '' })
  }

  // Filter Dropdown Options
  const familyOptions = useMemo(() => families.map(f => f.name), [families])
  const categoryOptions = useMemo(() => categories.filter(c => !filters.family || c.parent === filters.family).map(c => c.name), [categories, filters.family])
  const groupOptions = useMemo(() => groups.filter(g => !filters.category || g.category === filters.category).map(g => g.name), [groups, filters.category])
  const brandOptions = useMemo(() => brands.map(b => b.name), [brands])
  const supplierOptions = useMemo(() => thirdParties.filter(t => t.type === 'Supplier').map(t => t.name), [thirdParties])

  // Form Dropdown Options
  const formFamilyOptions = useMemo(() => families.map(f => f.name), [families])
  const formCategoryOptions = useMemo(() => categories.filter(c => !form.family || c.parent === form.family).map(c => c.name), [categories, form.family])
  const formGroupOptions = useMemo(() => groups.filter(g => !form.category || g.category === form.category).map(g => g.name), [groups, form.category])
  const formBrandOptions = useMemo(() => brands.map(b => b.name), [brands])
  const formSupplierOptions = useMemo(() => thirdParties.filter(t => t.type === 'Supplier').map(t => t.name), [thirdParties])

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div className="relative inline-block">
          <h1 className="page-title text-2xl font-semibold  dark:text-white">{labels.title}</h1>
          <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isArabic ? 'auto' : '-4px', right: isArabic ? '-4px' : 'auto', bottom: '-4px' }}></span>
        </div>
        <button className="btn btn-sm bg-green-600 hover:bg-green-500 text-white border-none" onClick={() => {
            setForm({ id: null, name: '', family: '', category: '', group: '', type: 'Product', sku: '', price: '', stock: 0, minStock: 0, unit: 'pcs', status: 'Active', description: '' })
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaSearch className="text-blue-500" size={10} /> {labels.search}</label>
            <input className="input w-full" value={filters.search} onChange={e=>setFilters(prev=>({...prev, search: e.target.value}))} placeholder={isArabic ? 'بحث...' : 'Search...'} />
          </div>
          {(inventoryMode || '').toLowerCase() === 'advanced' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.family}</label>
              <SearchableSelect options={familyOptions} value={filters.family} onChange={val=>setFilters(prev=>({...prev, family: val, category: '', group: ''}))} isRTL={isArabic} />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.category}</label>
            <SearchableSelect options={categoryOptions} value={filters.category} onChange={val=>setFilters(prev=>({...prev, category: val, group: ''}))} isRTL={isArabic} />
          </div>
          {(inventoryMode || '').toLowerCase() === 'advanced' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.group}</label>
              <SearchableSelect options={groupOptions} value={filters.group} onChange={val=>setFilters(prev=>({...prev, group: val}))} isRTL={isArabic} />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.brand}</label>
            <SearchableSelect options={brandOptions} value={filters.brand} onChange={val=>setFilters(prev=>({...prev, brand: val}))} isRTL={isArabic} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.supplier}</label>
            <SearchableSelect options={supplierOptions} value={filters.supplier} onChange={val=>setFilters(prev=>({...prev, supplier: val}))} isRTL={isArabic} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.type}</label>
            <select className="input w-full" value={filters.type} onChange={e => setFilters(prev => ({...prev, type: e.target.value}))}>
                <option value="all">{isArabic ? 'الكل' : 'All'}</option>
                <option value="Product">Product</option>
                <option value="Service">Service</option>
                <option value="Subscription">Subscription</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.status}</label>
            <select className="input w-full" value={filters.status} onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}>
                <option value="all">{isArabic ? 'الكل' : 'All'}</option>
                <option value="Active">{labels.active}</option>
                <option value="Inactive">{labels.inactive}</option>
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
                  <th className="text-start px-3 min-w-[150px]">{labels.name}</th>
                  <th className="text-start px-3 min-w-[100px]">{labels.brand}</th>
                  <th className="text-start px-3 min-w-[100px]">{labels.supplier}</th>
                  <th className="text-start px-3 min-w-[100px]">
                    {(inventoryMode || '').toLowerCase() === 'advanced' ? `${labels.family} / ${labels.category}` : labels.category}
                  </th>
                  {(inventoryMode || '').toLowerCase() === 'advanced' && <th className="text-start px-3 min-w-[100px]">{labels.group}</th>}
                  <th className="text-start px-3 min-w-[80px]">{labels.type}</th>
                  <th className="text-start px-3 min-w-[80px]">{labels.price}</th>
                  <th className="text-start px-3 min-w-[80px]">{labels.stock}</th>
                  <th className="text-center px-3 min-w-[80px]">{labels.status}</th>
                  <th className="text-center px-3 min-w-[110px]">{labels.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td className="px-3">
                        <div className="flex flex-col">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-xs text-[var(--muted-text)]">{item.sku}</span>
                        </div>
                    </td>
                    <td className="px-3 text-sm">{item.brand || '-'}</td>
                    <td className="px-3 text-sm">{item.supplier || '-'}</td>
                    <td className="px-3">
                        <div className="flex flex-col text-xs">
                            {inventoryMode === 'advanced' && <span>{item.family || '-'}</span>}
                            <span className={inventoryMode === 'advanced' ? "text-[var(--muted-text)]" : ""}>{item.category || '-'}</span>
                        </div>
                    </td>
                    {inventoryMode === 'advanced' && <td className="px-3 text-sm">{item.group || '-'}</td>}
                    <td className="px-3 text-sm">{item.type}</td>
                    <td className="px-3 text-sm font-semibold">{item.price} {item.unit}</td>
                    <td className="px-3 text-sm">
                        <span className={Number(item.stock) <= Number(item.minStock) ? 'text-red-500 font-bold' : ''}>
                            {item.stock}
                        </span>
                    </td>
                    <td className="px-3 text-center">
                      <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                        {item.status === 'Active' ? labels.active : labels.inactive}
                      </span>
                    </td>
                    <td className="px-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <button type="button" className="btn btn-sm btn-circle btn-ghost text-blue-600 hover:bg-blue-100" title={labels.edit} onClick={() => onEdit(item)}>
                          <FaEdit size={16} />
                        </button>
                        <button type="button" className="btn btn-sm btn-circle btn-ghost text-red-600 hover:bg-red-100" title={labels.delete} onClick={() => onDelete(item.id)}>
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
          <div className="absolute inset-0 flex items-start justify-center p-6 md:p-6 overflow-y-auto">
            <div className="card p-4 sm:p-6 mt-4 w-[95vw] sm:w-[85vw] lg:w-[70vw] xl:max-w-4xl my-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">{labels.formTitle}</h2>
                <button type="button" className="btn btn-glass btn-sm text-red-500 hover:text-red-600" onClick={() => setShowForm(false)} aria-label={labels.close}>
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">{labels.name}</label>
                  <input name="name" value={form.name} onChange={onChange} placeholder={labels.name} className="input w-full" required />
                </div>
                
                {inventoryMode === 'advanced' && (
                  <div>
                    <label className="block text-sm mb-1">{labels.family}</label>
                    <SearchableSelect options={formFamilyOptions} value={form.family} onChange={val=>setForm(prev=>({...prev, family: val, category: '', group: ''}))} isRTL={isArabic} />
                  </div>
                )}
                <div>
                  <label className="block text-sm mb-1">{labels.category}</label>
                  <SearchableSelect options={formCategoryOptions} value={form.category} onChange={val=>setForm(prev=>({...prev, category: val, group: ''}))} isRTL={isArabic} />
                </div>
                {inventoryMode === 'advanced' && (
                  <div>
                    <label className="block text-sm mb-1">{labels.group}</label>
                    <SearchableSelect options={formGroupOptions} value={form.group} onChange={val=>setForm(prev=>({...prev, group: val}))} isRTL={isArabic} />
                  </div>
                )}
                <div>
                  <label className="block text-sm mb-1">{labels.brand}</label>
                  <SearchableSelect options={formBrandOptions} value={form.brand} onChange={val=>setForm(prev=>({...prev, brand: val}))} isRTL={isArabic} />
                </div>
                <div>
                  <label className="block text-sm mb-1">{labels.supplier}</label>
                  <SearchableSelect options={formSupplierOptions} value={form.supplier} onChange={val=>setForm(prev=>({...prev, supplier: val}))} isRTL={isArabic} />
                </div>

                <div>
                    <label className="block text-sm mb-1">{labels.type}</label>
                    <select name="type" className="input w-full" value={form.type} onChange={onChange}>
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                        <option value="Subscription">Subscription</option>
                    </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">{labels.sku}</label>
                  <input name="sku" value={form.sku} onChange={onChange} placeholder="SKU" className="input w-full" />
                </div>
                <div>
                    <label className="block text-sm mb-1">{labels.price}</label>
                    <input name="price" type="number" value={form.price} onChange={onChange} placeholder="0.00" className="input w-full" />
                </div>
                <div>
                    <label className="block text-sm mb-1">{labels.unit}</label>
                    <input name="unit" value={form.unit} onChange={onChange} placeholder="pcs, kg, etc." className="input w-full" />
                </div>
                <div>
                    <label className="block text-sm mb-1">{labels.stock}</label>
                    <input name="stock" type="number" value={form.stock} onChange={onChange} placeholder="0" className="input w-full" />
                </div>
                <div>
                    <label className="block text-sm mb-1">{labels.minStock}</label>
                    <input name="minStock" type="number" value={form.minStock} onChange={onChange} placeholder="0" className="input w-full" />
                </div>
                <div>
                    <label className="block text-sm mb-1">{labels.status}</label>
                    <select name="status" className="input w-full" value={form.status} onChange={onChange}>
                        <option value="Active">{labels.active}</option>
                        <option value="Inactive">{labels.inactive}</option>
                    </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">{labels.description}</label>
                  <textarea name="description" value={form.description} onChange={onChange} placeholder={labels.description} className="input w-full min-h-[80px]" />
                </div>

                <div className="md:col-span-2 flex gap-3 mt-4">
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
