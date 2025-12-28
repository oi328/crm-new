import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  FaFilter, FaSearch, FaPlus, FaTimes, FaEdit, FaTrash, 
  FaWhatsapp, FaEnvelope, FaBoxOpen, FaTools, FaLink, FaLayerGroup 
} from 'react-icons/fa'

// Helper for localStorage
const STORAGE_KEY = 'inventorySuppliers'

export default function Suppliers() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const isRTL = isArabic

  // Labels & Translations
  const labels = useMemo(() => ({
    title: isArabic ? 'الموردين' : 'Suppliers',
    subtitle: isArabic ? 'إدارة الموردين والخدمات' : 'Manage Suppliers & Services',
    add: isArabic ? 'إضافة مورد' : 'Add Supplier',
    filterAll: isArabic ? 'الكل' : 'All',
    filterProducts: isArabic ? 'منتجات' : 'Products',
    filterServices: isArabic ? 'خدمات' : 'Services',
    companyName: isArabic ? 'اسم الشركة' : 'Company Name',
    contactPerson: isArabic ? 'الشخص المسؤول' : 'Contact Person',
    whatsapp: isArabic ? 'واتساب' : 'WhatsApp',
    email: isArabic ? 'البريد الإلكتروني' : 'Email',
    supplyType: isArabic ? 'نوع التوريد' : 'Supply Type',
    catalogName: isArabic ? 'اسم الكتالوج' : 'Catalog Name',
    serviceDescription: isArabic ? 'وصف الخدمة' : 'Service Description',
    save: isArabic ? 'حفظ' : 'Save',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    actions: isArabic ? 'إجراءات' : 'Actions',
    viewLinked: isArabic ? 'المرتبطات' : 'Linked Items',
    searchPlaceholder: isArabic ? 'بحث عن مورد...' : 'Search suppliers...',
    typeProduct: isArabic ? 'منتج' : 'Product',
    typeService: isArabic ? 'خدمة' : 'Service',
    typeBoth: isArabic ? 'كلاهما' : 'Both',
    filter: isArabic ? 'تصفية' : 'Filter',
    clearFilters: isArabic ? 'مسح المرشحات' : 'Clear Filters',
    search: isArabic ? 'بحث' : 'Search',
  }), [isArabic])

  // State
  const [suppliers, setSuppliers] = useState([])
  const [filterType, setFilterType] = useState('all') // 'all', 'product', 'service'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterContact, setFilterContact] = useState('')
  const [filterEmail, setFilterEmail] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Form State
  const initialForm = {
    companyName: '',
    contactPerson: '',
    whatsapp: '',
    email: '',
    supplyType: 'product', // 'product', 'service', 'both'
    catalogName: '',
    serviceDescription: ''
  }
  const [formData, setFormData] = useState(initialForm)

  // Load Data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      let parsed = raw ? JSON.parse(raw) : []
      
      // Extended Seed Data
      const seed = [
        { id: 1, companyName: 'Tech Solutions Ltd', contactPerson: 'Ahmed Ali', whatsapp: '966500000001', email: 'ahmed@tech.com', supplyType: 'product', catalogName: 'Electronics 2024' },
        { id: 2, companyName: 'Clean Pro Services', contactPerson: 'Sara Smith', whatsapp: '966500000002', email: 'sara@cleanpro.com', supplyType: 'service', serviceDescription: 'Office Cleaning & Maintenance' },
        { id: 3, companyName: 'Build & Fix Co', contactPerson: 'John Doe', whatsapp: '966500000003', email: 'john@buildfix.com', supplyType: 'both', catalogName: 'Construction Materials', serviceDescription: 'Installation Services' },
        { id: 4, companyName: 'Al-Marai Logistics', contactPerson: 'Mohammed Sami', whatsapp: '966512345678', email: 'logistics@almarai.com', supplyType: 'service', serviceDescription: 'Nationwide Distribution' },
        { id: 5, companyName: 'Golden Foods', contactPerson: 'Layla Hassan', whatsapp: '966523456789', email: 'sales@goldenfoods.com', supplyType: 'product', catalogName: 'Organic Ingredients' },
        { id: 6, companyName: 'Creative Minds Agency', contactPerson: 'Omar Farooq', whatsapp: '966534567890', email: 'contact@creativeminds.sa', supplyType: 'service', serviceDescription: 'Digital Marketing & SEO' },
        { id: 7, companyName: 'Office Depot SA', contactPerson: 'Fatima Al-Zahrani', whatsapp: '966545678901', email: 'support@officedepot.sa', supplyType: 'product', catalogName: 'Stationery & Furniture' },
        { id: 8, companyName: 'Smart Systems', contactPerson: 'Khalid Waleed', whatsapp: '966556789012', email: 'info@smartsys.com', supplyType: 'both', catalogName: 'Security Hardware', serviceDescription: 'System Integration' },
        { id: 9, companyName: 'Green Energy Corp', contactPerson: 'Noura Ahmed', whatsapp: '966567890123', email: 'noura@greenenergy.com', supplyType: 'product', catalogName: 'Solar Panels' },
        { id: 10, companyName: 'Express Delivery', contactPerson: 'Saeed Al-Ghamdi', whatsapp: '966578901234', email: 'dispatch@express.com', supplyType: 'service', serviceDescription: 'Same-day Delivery' },
        { id: 11, companyName: 'Modern Furniture', contactPerson: 'Yousef Kamel', whatsapp: '966589012345', email: 'yousef@modernfur.com', supplyType: 'product', catalogName: 'Luxury Interiors' },
        { id: 12, companyName: 'Alpha Tech', contactPerson: 'Rana Mahmoud', whatsapp: '966590123456', email: 'rana@alphatech.com', supplyType: 'both', catalogName: 'Server Hardware', serviceDescription: 'IT Support Contract' },
        { id: 13, companyName: 'Pure Water Co', contactPerson: 'Hassan Ali', whatsapp: '966501234567', email: 'orders@purewater.com', supplyType: 'product', catalogName: 'Bottled Water' },
        { id: 14, companyName: 'Elite Security', contactPerson: 'Ibrahim Khalil', whatsapp: '966512345098', email: 'security@elite.com', supplyType: 'service', serviceDescription: 'Manned Guarding' },
        { id: 15, companyName: 'Raw Materials Inc', contactPerson: 'Zainab Omar', whatsapp: '966523456109', email: 'zainab@rawmat.com', supplyType: 'product', catalogName: 'Industrial Metals' },
      ]

      // If no data or just the old seed (<= 3 items), populate with new rich data
      if (!parsed || parsed.length <= 3) {
        setSuppliers(seed)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      } else {
        setSuppliers(parsed)
      }
    } catch (e) {
      console.error('Error loading suppliers:', e)
    }
  }, [])

  // Save Data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers))
  }, [suppliers])

  // Filtered Data
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      // Type Filter
      if (filterType !== 'all') {
        if (filterType === 'product' && s.supplyType === 'service') return false
        if (filterType === 'service' && s.supplyType === 'product') return false
      }
      
      // Search Filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!s.companyName?.toLowerCase().includes(q) &&
            !s.contactPerson?.toLowerCase().includes(q) &&
            !s.email?.toLowerCase().includes(q)) {
          return false
        }
      }

      // Contact Filter
      if (filterContact && !s.contactPerson?.toLowerCase().includes(filterContact.toLowerCase())) {
        return false
      }

      // Email Filter
      if (filterEmail && !s.email?.toLowerCase().includes(filterEmail.toLowerCase())) {
        return false
      }

      return true
    })
  }, [suppliers, filterType, searchQuery, filterContact, filterEmail])

  // Handlers
  const handleSave = (e) => {
    e.preventDefault()
    if (editingId) {
      setSuppliers(prev => prev.map(s => s.id === editingId ? { ...s, ...formData } : s))
    } else {
      setSuppliers(prev => [{ ...formData, id: Date.now() }, ...prev])
    }
    closeModal()
  }

  const handleDelete = (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id))
    }
  }

  const openEdit = (supplier) => {
    setFormData(supplier)
    setEditingId(supplier.id)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData(initialForm)
  }
  
  const clearFilters = () => {
    setSearchQuery('')
    setFilterType('all')
    setFilterContact('')
    setFilterEmail('')
  }

  const openWhatsApp = (number) => {
    if (!number) return
    window.open(`https://wa.me/${number.replace(/[^0-9]/g, '')}`, '_blank')
  }

  // Render Helpers
  const renderBadge = (type) => {
    if (type === 'product') return <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-none px-3 py-1">{labels.typeProduct}</span>
    if (type === 'service') return <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-none px-3 py-1">{labels.typeService}</span>
    if (type === 'both') return (
      <span className="flex gap-1">
        <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-none text-xs">{labels.typeProduct}</span>
        <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-none text-xs">{labels.typeService}</span>
      </span>
    )
    return null
  }

  return (
    <div className={`space-y-6 pt-4 pb-10 ${isRTL ? 'rtl' : 'ltr'}`}>
      
      {/* Header Section */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="relative inline-block">
          <h1 className={`page-title text-2xl font-semibold dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
            {labels.title}
          </h1>
          <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isRTL ? 'auto' : '-4px', right: isRTL ? '-4px' : 'auto', bottom: '-4px' }}></span>
          <p className="text-sm text-[var(--muted-text)] mt-2">{labels.subtitle}</p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none gap-2 px-4 py-2.5 rounded-lg font-medium flex items-center shadow-lg hover:shadow-xl transition-all"
        >
          <FaPlus /> {labels.add}
        </button>
      </div>

      {/* Filters Section */}
      <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FaFilter className="text-blue-500" /> {labels.filter}
          </h2>
          <button onClick={clearFilters} className="btn btn-glass btn-compact text-[var(--muted-text)] hover:text-red-500">
              {labels.clearFilters}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* General Search */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1">
              <FaSearch className="text-blue-500" size={10} /> {labels.search}
            </label>
            <input 
              type="text" 
              placeholder={labels.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full bg-white dark:bg-gray-800"
            />
          </div>

          {/* Supply Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.supplyType}</label>
            <select 
              className="input w-full bg-white dark:bg-gray-800"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">{labels.filterAll}</option>
              <option value="product">{labels.filterProducts}</option>
              <option value="service">{labels.filterServices}</option>
            </select>
          </div>

          {/* Contact Person Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.contactPerson}</label>
            <input 
              type="text" 
              placeholder={labels.contactPerson}
              value={filterContact}
              onChange={(e) => setFilterContact(e.target.value)}
              className="input w-full bg-white dark:bg-gray-800"
            />
          </div>

          {/* Email Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.email}</label>
            <input 
              type="text" 
              placeholder={labels.email}
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="input w-full bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
        <div className="overflow-x-auto">
          <table className="nova-table w-full">
            <thead className="thead-soft">
              <tr>
                <th className="p-4 text-start min-w-[200px]">{labels.companyName}</th>
                <th className="p-4 text-start min-w-[150px]">{labels.contactPerson}</th>
                <th className="p-4 text-center min-w-[120px]">{labels.supplyType}</th>
                <th className="p-4 text-start min-w-[200px]">{labels.details}</th>
                <th className="p-4 text-center min-w-[150px]">{labels.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    {isArabic ? 'لا توجد بيانات' : 'No suppliers found'}
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{supplier.companyName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <FaEnvelope className="text-gray-400" size={10} /> {supplier.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-700 dark:text-gray-300">{supplier.contactPerson}</div>
                      <button 
                        onClick={() => openWhatsApp(supplier.whatsapp)}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs mt-1 font-medium cursor-pointer"
                      >
                        <FaWhatsapp /> {supplier.whatsapp}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        {renderBadge(supplier.supplyType)}
                      </div>
                    </td>
                    <td className="p-4">
                      {(supplier.supplyType === 'product' || supplier.supplyType === 'both') && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <FaBoxOpen className="text-blue-500" /> {supplier.catalogName || '-'}
                        </div>
                      )}
                      {(supplier.supplyType === 'service' || supplier.supplyType === 'both') && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <FaTools className="text-purple-500" /> {supplier.serviceDescription || '-'}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                         <button 
                          className="p-2 hover:text-blue-500 transition-colors tooltip tooltip-top" 
                          data-tip={labels.viewLinked}
                        >
                          <FaLink size={14} />
                        </button>
                        <button 
                          onClick={() => openEdit(supplier)} 
                          className="p-2 hover:text-blue-500 transition-colors"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(supplier.id)} 
                          className="p-2 hover:text-red-500 transition-colors"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="absolute inset-0 flex items-start justify-center p-6 md:p-6 overflow-y-auto">
            <div className="card p-4 sm:p-6 mt-4 w-[95vw] sm:w-[85vw] lg:w-[60vw] xl:max-w-3xl my-auto">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''} mb-4`}>
                <h2 className="text-xl font-medium">
                  {editingId ? (isArabic ? 'تعديل مورد' : 'Edit Supplier') : labels.add}
                </h2>
                <button type="button" className="btn btn-glass btn-sm text-red-500 hover:text-red-600" onClick={closeModal}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Supply Type Select */}
                <div className="md:col-span-2 form-control">
                   <label className="label label-text text-xs font-semibold text-[var(--muted-text)]">{labels.supplyType}</label>
                   <select 
                      className="select select-bordered select-sm w-full bg-white dark:bg-gray-700"
                      value={formData.supplyType}
                      onChange={(e) => setFormData({...formData, supplyType: e.target.value})}
                   >
                      <option value="product">{labels.typeProduct}</option>
                      <option value="service">{labels.typeService}</option>
                      <option value="both">{labels.typeBoth}</option>
                   </select>
                </div>

                <div className="form-control">
                  <label className="label label-text text-xs font-semibold text-[var(--muted-text)]">{labels.companyName}</label>
                  <input 
                    required 
                    className="input input-bordered input-sm w-full" 
                    value={formData.companyName}
                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
                <div className="form-control">
                  <label className="label label-text text-xs font-semibold text-[var(--muted-text)]">{labels.contactPerson}</label>
                  <input 
                    className="input input-bordered input-sm w-full" 
                    value={formData.contactPerson}
                    onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label className="label label-text text-xs font-semibold text-[var(--muted-text)]">{labels.whatsapp}</label>
                  <input 
                    className="input input-bordered input-sm w-full" 
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    placeholder="9665..."
                  />
                </div>
                <div className="form-control">
                  <label className="label label-text text-xs font-semibold text-[var(--muted-text)]">{labels.email}</label>
                  <input 
                    type="email"
                    className="input input-bordered input-sm w-full" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                {/* Conditional Fields */}
                {(formData.supplyType === 'product' || formData.supplyType === 'both') && (
                  <div className="md:col-span-2 form-control animate-fade-in">
                    <label className="label label-text text-xs font-semibold text-blue-600">{labels.catalogName}</label>
                    <input 
                      className="input input-bordered input-sm w-full border-blue-200 focus:border-blue-500" 
                      value={formData.catalogName}
                      onChange={e => setFormData({...formData, catalogName: e.target.value})}
                      placeholder="e.g. Summer Collection 2024"
                    />
                  </div>
                )}

                {(formData.supplyType === 'service' || formData.supplyType === 'both') && (
                  <div className="md:col-span-2 form-control animate-fade-in">
                    <label className="label label-text text-xs font-semibold text-purple-600">{labels.serviceDescription}</label>
                    <textarea 
                      className="textarea textarea-bordered textarea-sm w-full border-purple-200 focus:border-purple-500" 
                      value={formData.serviceDescription}
                      onChange={e => setFormData({...formData, serviceDescription: e.target.value})}
                      placeholder="e.g. Maintenance and Repair"
                      rows="2"
                    />
                  </div>
                )}

                {/* Footer Buttons */}
                <div className={`md:col-span-2 flex gap-3 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button 
                    type="submit" 
                    className="btn bg-blue-600 hover:bg-blue-500 text-white flex-1"
                  >
                    {labels.save}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="btn btn-ghost flex-1"
                  >
                    {labels.cancel}
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
