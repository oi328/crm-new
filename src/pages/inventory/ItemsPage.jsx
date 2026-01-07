import React, { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { useTranslation } from 'react-i18next'
import SearchableSelect from '../../components/SearchableSelect'
import { FaFilter, FaSearch, FaChevronDown, FaTimes, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaFileExport, FaFileImport, FaFileCsv, FaFilePdf } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa'
import ItemsImportModal from './ItemsImportModal'

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
    basicInfo: isArabic ? 'البيانات الأساسية' : 'Basic Info',
    pricing: isArabic ? 'التسعير' : 'Pricing',
    salesOptions: isArabic ? 'خيارات البيع' : 'Sales Options',
    pricingType: isArabic ? 'نوع التسعير' : 'Pricing Type',
    fixed: isArabic ? 'ثابت' : 'Fixed',
    perUnit: isArabic ? 'لكل وحدة' : 'Per Unit',
    monthly: isArabic ? 'شهري' : 'Monthly',
    yearly: isArabic ? 'سنوي' : 'Yearly',
    billingCycle: isArabic ? 'دورة الفوترة' : 'Billing Cycle',
    allowDiscount: isArabic ? 'السماح بالخصم' : 'Allow Discount',
    maxDiscount: isArabic ? 'أقصى نسبة خصم (%)' : 'Max Discount %',
    isActive: isArabic ? 'نشط' : 'Is Active',
    import: isArabic ? 'استيراد' : 'Import',
    export: isArabic ? 'تصدير' : 'Export',
    exportCsv: isArabic ? 'تصدير CSV' : 'Export CSV',
    exportPdf: isArabic ? 'تصدير PDF' : 'Export PDF',
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
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  
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

  const [showAllFilters, setShowAllFilters] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

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
      id: null, name: '', family: '', category: '', group: '', type: 'Product', sku: '', price: '', pricingType: 'Fixed', billingCycle: 'Monthly', stock: 0, minStock: 0, unit: 'pcs', status: 'Active', allowDiscount: false, maxDiscount: '', description: ''
    })
    setActiveTab('basic')
    setShowForm(false)
  }

  function onDelete(id) {
    if (window.confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this item?')) {
      setItems(prev => prev.filter(i => i.id !== id))
    }
  }

  function onEdit(item) {
    setForm({ ...item })
    setActiveTab('basic')
    setShowForm(true)
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

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
    setIsFiltering(true)
    setFilters({ search: '', status: 'all', type: 'all', family: '', category: '', group: '', brand: '', supplier: '' })
    setTimeout(() => setIsFiltering(false), 300)
  }

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage])

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

  const exportItemsCsv = () => {
    const headers = ['Name', 'SKU', 'Family', 'Category', 'Group', 'Type', 'Status', 'Price', 'Stock']
    const csvContent = [
      headers.join(','),
      ...filtered.map(item => [
        `"${item.name}"`,
        `"${item.sku || ''}"`,
        `"${item.family || ''}"`,
        `"${item.category || ''}"`,
        `"${item.group || ''}"`,
        `"${item.type}"`,
        `"${item.status}"`,
        `"${item.price || 0}"`,
        `"${item.stock || 0}"`
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'items.csv'
    a.click(); URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const exportItemsPdf = async (items) => {
    try {
      const jsPDF = (await import('jspdf')).default
      const autoTable = await import('jspdf-autotable')
      const doc = new jsPDF()
      
      const tableColumn = ["Name", "SKU", "Family", "Category", "Status", "Price", "Stock"]
      const tableRows = []

      items.forEach(item => {
        const rowData = [
          item.name,
          item.sku || '',
          item.family || '',
          item.category || '',
          item.status,
          item.price || 0,
          item.stock || 0
        ]
        tableRows.push(rowData)
      })

      doc.text("Items List", 14, 15)
      autoTable.default(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { font: 'helvetica', fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      })
      doc.save("items_list.pdf")
      setShowExportMenu(false)
    } catch (error) {
      console.error("Export PDF Error:", error)
    }
  }

  const handleImport = (importedData) => {
    const newItems = importedData.map((item, index) => ({
      ...item,
      id: Date.now() + index,
      stock: Number(item.stock) || 0,
      price: Number(item.price) || 0,
      minStock: Number(item.minStock) || 0
    }))
    
    const updatedItems = [...newItems, ...items]
    setItems(updatedItems)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems)) } catch (e) { void e }
    setShowImportModal(false)
  }

  return (
    <div className="space-y-6 pt-4 px-4 sm:px-6">
      <div className="flex flex-wrap lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative inline-block">
          <h1 className="page-title text-2xl font-semibold  dark:text-white">{labels.title}</h1>
          <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isArabic ? 'auto' : '-4px', right: isArabic ? '-4px' : 'auto', bottom: '-4px' }}></span>
        </div>
        
        <div className="w-full lg:w-auto flex flex-wrap lg:flex-row items-stretch lg:items-center gap-2 lg:gap-3">
           <button 
              className="btn btn-sm w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center justify-center gap-2"
              onClick={() => setShowImportModal(true)}
           >
              <FaFileImport />
              {labels.import}
           </button>



           <button className="btn btn-sm w-full lg:w-auto bg-green-600 hover:bg-green-500 text-white border-none gap-2" onClick={() => {
              setForm({ id: null, name: '', family: '', category: '', group: '', type: 'Product', sku: '', price: '', stock: 0, minStock: 0, unit: 'pcs', status: 'Active', description: '' })
              setShowForm(true)
          }}> <span><FaPlus /></span> {labels.add}
          </button>
           <div className="relative dropdown-container w-full lg:w-auto">
              <button 
                  className="btn btn-sm w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center justify-center gap-2"
                  onClick={() => setShowExportMenu(!showExportMenu)}
              >
                  <span className="flex items-center gap-2">
                    <FaFileExport  />
                    {labels.export}
                  </span>
                  <FaChevronDown className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} size={12} />
              </button>
              
              {showExportMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50">
                      <button 
                          className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                          onClick={exportItemsCsv}
                      >
                          <FaFileCsv className="text-green-500" /> {labels.exportCsv}
                      </button>
                      <button 
                          className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                          onClick={() => exportItemsPdf(filtered)}
                      >
                          <FaFilePdf className="text-red-500" /> {labels.exportPdf}
                      </button>
                  </div>
              )}
           </div>
        </div>
      </div>

      {showImportModal && (
        <ItemsImportModal 
          onClose={() => setShowImportModal(false)} 
          onImport={handleImport}
          isRTL={isArabic}
        />
      )}

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

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaSearch className="text-blue-500" size={10} /> {labels.search}</label>
              <input className="input w-full" value={filters.search} onChange={e=>setFilters(prev=>({...prev, search: e.target.value}))} placeholder={isArabic ? 'بحث...' : 'Search...'} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.category}</label>
              <SearchableSelect options={categoryOptions} value={filters.category} onChange={val=>setFilters(prev=>({...prev, category: val, group: ''}))} isRTL={isArabic} />
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
      </div>

      <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
        <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
        ) : (
          <>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedItems.map(item => (
              <div key={item.id} className=" dark:bg-gray-800/40 dark:backdrop-blur-md p-4 rounded-lg shadow-sm border border-gray-100 dark:border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg  dark:text-white">{item.name}</h3>
                    <p className="text-xs font-mono text-gray-500 dark:text-white">{item.sku || '-'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.status === 'Active' ? labels.active : labels.inactive}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm dark:text-white mb-4">
                  <div className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                    <span className=" dark:text-white">{labels.category}:</span>
                    <span className="font-medium dark:text-white">{item.category || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                    <span className=" dark:text-white">{labels.type}:</span>
                    <span className="font-medium dark:text-white">{item.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                    <span className=" dark:text-white">{labels.price}:</span>  
                    <span className="font-medium dark:text-white">{item.price} {item.unit}</span>
                  </div>
                   <div className="flex flex-col gap-1 pt-1">
                    <span className="dark:text-white">{labels.description}:</span>
                    <p className=" dark:text-white text-sm line-clamp-2">{item.description}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                   <button type="button" className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50" onClick={() => onEdit(item)}>
                    <FaEdit size={16} className="mr-1" /> {labels.edit}
                  </button>
                  <button type="button" className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50" onClick={() => onDelete(item.id)}>
                    <FaTrash size={16} className="mr-1" /> {labels.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="nova-table w-full">
              <thead className="thead-soft">
                <tr className=" dark:text-white">
                  <th className="text-start px-3 min-w-[150px]">{labels.name}</th>
                  <th className="text-start px-3 min-w-[80px]">{labels.type}</th>
                  <th className="text-start px-3 min-w-[100px]">{labels.category}</th>
                  <th className="text-start px-3 min-w-[80px]">{labels.price}</th>
                  <th className="text-center px-3 min-w-[80px]">{labels.status}</th>
                  <th className="text-center px-3 min-w-[110px]">{labels.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(item => (
                  <tr key={item.id} className="dark:text-white">
                    <td className="px-3">
                        <div className="flex flex-col">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-xs text-[var(--muted-text)]">{item.sku}</span>
                        </div>
                    </td>
                    <td className="px-3 text-sm">{item.type}</td>
                    <td className="px-3">
                        <div className="flex flex-col text-xs">
                            <span className={inventoryMode === 'advanced' ? "text-[var(--muted-text)]" : ""}>{item.category || '-'}</span>
                        </div>
                    </td>
                    <td className="px-3 text-sm font-semibold">{item.price} {item.unit}</td>
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

      {/* Modal */}
      {showImportModal && (
        <ItemsImportModal 
          onClose={() => setShowImportModal(false)}
          onImport={(data) => {
            const newItems = data.map(item => ({
              id: Date.now() + Math.random(),
              name: item.name || 'New Item',
              sku: item.sku || '',
              category: item.category || '',
              price: item.price || 0,
              stock: item.stock || 0,
              status: item.status || 'Active',
              type: 'Product',
              unit: 'pcs'
            }))
            setItems(prev => [...newItems, ...prev])
            setShowImportModal(false)
          }}
          isRTL={isArabic}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="absolute inset-0 flex items-start justify-center p-6 md:p-6 overflow-y-auto">
            <div className="card p-4 sm:p-6 mt-4 w-[95vw] sm:w-[85vw] lg:w-[70vw] xl:max-w-4xl my-auto  dark:bg-gray-800  dark:text-white shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold  dark:!text-white">{labels.formTitle}</h2>
                <button type="button" className="btn btn-glass btn-sm  hover:text-red-600" onClick={() => setShowForm(false)} aria-label={labels.close}>
                  <FaTimes />
                </button>
              </div>
              <div className="flex border-b border-gray-200 dark:border-gray-600 mb-6">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors duration-200 ${activeTab === 'basic' ? 'border-yellow-500 text-yellow-600 dark:text-yellow-300' : 'border-transparent  hover:text-gray-700 dark:!text-white '}`}
                  onClick={() => setActiveTab('basic')}
                >
                  {labels.basicInfo}
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors duration-200 ${activeTab === 'pricing' ? 'border-yellow-500 text-yellow-600 dark:text-yellow-300' : 'border-transparent  hover:text-gray-700 dark:!text-white '}`}
                  onClick={() => setActiveTab('pricing')}
                >
                  {labels.pricing}
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors duration-200 ${activeTab === 'sales' ? 'border-yellow-500 text-yellow-600 dark:text-yellow-300' : 'border-transparent  hover:text-gray-700 dark:!text-white '}`}
                  onClick={() => setActiveTab('sales')}
                >
                  {labels.salesOptions}
                </button>
              </div>
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Section 1: Basic Info */}
                <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
                <div className=" dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2  text-yellow-600 dark:text-yellow-300 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    {labels.basicInfo}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block dark:!text-white text-sm font-medium mb-1">{labels.name} <span className="text-red-500">*</span></label>
                      <input name="name" value={form.name} onChange={onChange} placeholder={labels.name} className="input w-full dark:!text-white" required />
                    </div>

                    <div>
                      <label className="block dark:!text-white text-sm font-medium mb-1">{labels.type} <span className="text-red-500">*</span></label>
                      <select name="type" className="input w-full dark:!text-white" value={form.type} onChange={onChange} required>
                          <option value="Product">Product</option>
                          <option value="Service">Service</option>
                          <option value="Subscription">Subscription</option>
                          <option value="Package">Package</option>
                      </select>
                    </div>

                    <div>
                      <label className="block dark:!text-white text-sm font-medium mb-1">{labels.category}</label>
                      <SearchableSelect options={formCategoryOptions} value={form.category} onChange={val=>setForm(prev=>({...prev, category: val, group: ''}))} isRTL={isArabic} />
                    </div>

                    <div>
                      <label className="block dark:!text-white text-sm font-medium mb-1">{labels.sku}</label>
                      <input name="sku" value={form.sku} onChange={onChange} placeholder="SKU" className="input w-full dark:!text-white" />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block dark:!text-white text-sm font-medium mb-1">{labels.description}</label>
                      <textarea name="description" value={form.description} onChange={onChange} placeholder={labels.description} className="input w-full min-h-[80px] dark:!text-white" />
                    </div>
                  </div>
                </div>
                </div>

                {/* Section 2: Pricing */}
                <div className={activeTab === 'pricing' ? 'block' : 'hidden'}>
                <div className=" dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-300 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    {labels.pricing}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block dark:!text-white text-sm font-medium mb-1">{labels.price} <span className="text-red-500">*</span></label>
                      <input name="price" type="number" value={form.price} onChange={onChange} placeholder="0.00" className="input w-full dark:!text-white" required />
                    </div>

                    <div>
                      <label className="block dark:!text-white text-sm font-medium mb-1">{labels.pricingType} <span className="text-red-500">*</span></label>
                      <select name="pricingType" className="input w-full dark:!text-white" value={form.pricingType} onChange={onChange} required>
                          <option value="Fixed">{labels.fixed}</option>
                          <option value="Per Unit">{labels.perUnit}</option>
                          <option value="Monthly">{labels.monthly}</option>
                          <option value="Yearly">{labels.yearly}</option>
                      </select>
                    </div>

                    {form.type === 'Subscription' && (
                      <div>
                        <label className="block dark:!text-white text-sm font-medium mb-1">{labels.billingCycle}</label>
                         <select name="billingCycle" className="input w-full dark:!text-white" value={form.billingCycle} onChange={onChange}>
                              <option value="Monthly">{labels.monthly}</option>
                              <option value="Yearly">{labels.yearly}</option>
                          </select>
                      </div>
                    )}

                    {form.type !== 'Service' && (
                      <div>
                          <label className="block dark:!text-white text-sm font-medium mb-1">{labels.stock}</label>
                          <input name="stock" type="number" value={form.stock} onChange={onChange} placeholder="0" className="input w-full dark:!text-white" />
                      </div>
                    )}

                    {form.type === 'Product' && (
                      <div>
                          <label className="block dark:!text-white text-sm font-medium mb-1">{labels.minStock}</label>
                          <input name="minStock" type="number" value={form.minStock} onChange={onChange} placeholder="0" className="input w-full dark:!text-white" />
                      </div>
                    )}

                     <div>
                          <label className="block dark:!text-white text-sm font-medium mb-1">{labels.unit}</label>
                          <input name="unit" value={form.unit} onChange={onChange} placeholder="pcs, kg, etc." className="input w-full dark:!text-white" />
                      </div>
                  </div>
                </div>
                </div>

                {/* Section 3: Sales Options */}
                <div className={activeTab === 'sales' ? 'block' : 'hidden'}>
                  <div className=" dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2  text-yellow-600 dark:text-yellow-300 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    {labels.salesOptions}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 pt-6">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="allowDiscount" checked={form.allowDiscount} onChange={(e) => setForm(prev => ({ ...prev, allowDiscount: e.target.checked }))} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ms-3 text-sm font-medium  dark:!text-white">{labels.allowDiscount}</span>
                      </label>
                    </div>

                    <div>
                      <label className="block dark:!text-white text-sm font-medium mb-1">{labels.maxDiscount}</label>
                      <input name="maxDiscount" type="number" value={form.maxDiscount} onChange={onChange} placeholder="%" className="input w-full dark:!text-white" disabled={!form.allowDiscount} />
                    </div>

                    <div className="flex items-center gap-3 md:col-span-2 mt-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="status" checked={form.status === 'Active'} onChange={(e) => setForm(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        <span className="ms-3 text-sm font-medium  dark:!text-white">{labels.isActive}</span>
                      </label>
                    </div>
                  </div>
                </div>
                </div>

                <div className={`flex gap-2 pt-4 border-t dark:border-gray-700 ${isArabic ? 'justify-start' : 'justify-end'}`}>
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
