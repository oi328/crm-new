import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFilter, FaTimes } from 'react-icons/fa';

export default function RealEstatePriceBooks() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const isRTL = isArabic

  const labels = useMemo(() => ({
    title: isArabic ? 'قوائم أسعار العقارات' : 'Real Estate Price Books',
    subtitle: isArabic ? 'إدارة قوائم أسعار الوحدات العقارية' : 'Manage real estate unit price lists',
    add: isArabic ? 'إضافة قائمة أسعار جديدة' : 'Add New Price Book',
    searchPlaceholder: isArabic ? 'بحث في قوائم الأسعار...' : 'Search Price Books...',
    status: isArabic ? 'الحالة (نشط/غير نشط)' : 'Status (Active/Inactive)',
    bookName: isArabic ? 'اسم قائمة الأسعار' : 'Price Book Name',
    validFrom: isArabic ? 'صالح من' : 'Valid From',
    validTo: isArabic ? 'صالح إلى' : 'Valid To',
    currency: isArabic ? 'العملة' : 'Currency',
    productsIn: isArabic ? 'الوحدات في' : 'Units in',
    productName: isArabic ? 'اسم الوحدة' : 'Unit Name',
    sku: isArabic ? 'كود الوحدة' : 'Unit Code',
    basePrice: isArabic ? 'السعر الأساسي' : 'Base Price',
    wholesalePrice: isArabic ? 'سعر الجملة' : 'Wholesale Price',
    actions: isArabic ? 'إجراءات' : 'Actions',
    edit: isArabic ? 'تعديل' : 'Edit',
    delete: isArabic ? 'حذف' : 'Delete',
    saving: isArabic ? 'جاري الحفظ...' : 'Saving...',
    saved: isArabic ? 'تم الحفظ' : 'Saved',
    confirmDelete: isArabic ? 'هل أنت متأكد من حذف هذه القائمة؟' : 'Are you sure you want to delete this price book?',
    noBooks: isArabic ? 'لا توجد قوائم أسعار' : 'No price books found',
    selectBook: isArabic ? 'اختر قائمة لعرض الوحدات' : 'Select a book to view units',
    active: isArabic ? 'نشط' : 'Active',
    inactive: isArabic ? 'غير نشط' : 'Inactive',
    formTitle: isArabic ? 'بيانات القائمة' : 'Price Book Details',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    save: isArabic ? 'حفظ' : 'Save',
    description: isArabic ? 'الوصف' : 'Description',
    filter: isArabic ? 'تصفية' : 'Filter',
    clearFilters: isArabic ? 'مسح المرشحات' : 'Clear Filters',
    search: isArabic ? 'بحث' : 'Search',
    listTitle: isArabic ? 'قائمة قوائم الأسعار' : 'Price Books List',
    allCurrencies: isArabic ? 'كل العملات' : 'All Currencies',
    dateFrom: isArabic ? 'من تاريخ' : 'Date From',
    dateTo: isArabic ? 'إلى تاريخ' : 'Date To',
    restoreData: isArabic ? 'استعادة البيانات التجريبية' : 'Restore Demo Data',
  }), [isArabic])

  const BOOKS_KEY = 'realEstatePriceBooks'
  const PRICES_KEY = 'realEstatePrices'
  const ITEMS_KEY = 'realEstateProperties'

  // Mock Items for Real Estate
  const mockItems = [
    { id: '201', name: 'Villa Type A - Sea View', sku: 'VIL-SEA-A', price: 5000000, currency: 'EGP', unit: 'Unit' },
    { id: '202', name: 'Apartment 150m - Garden', sku: 'APT-G-150', price: 2500000, currency: 'EGP', unit: 'Unit' },
    { id: '203', name: 'Duplex 300m - Roof', sku: 'DUP-R-300', price: 4200000, currency: 'EGP', unit: 'Unit' },
    { id: '204', name: 'Studio 60m', sku: 'STD-60', price: 1200000, currency: 'EGP', unit: 'Unit' },
    { id: '205', name: 'Commercial Shop 40m', sku: 'COM-SH-40', price: 3000000, currency: 'EGP', unit: 'Unit' },
  ];

  // Seed Data if empty
  const defaultBooks = [
    { id: '1', name: 'Standard Pricing 2024', currency: 'EGP', validFrom: '2024-01-01', validTo: '2024-12-31', status: 'Active', description: 'Standard prices for all units' },
    { id: '2', name: 'Cash Payment Discount', currency: 'EGP', validFrom: '2024-01-01', validTo: '2024-12-31', status: 'Active', description: 'Discounted prices for cash payments' },
    { id: '3', name: 'Launch Phase Offer', currency: 'EGP', validFrom: '2024-03-01', validTo: '2024-04-30', status: 'Inactive', description: 'Special prices during launch phase' },
  ];

  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem(BOOKS_KEY)
      return saved ? JSON.parse(saved) : defaultBooks
    } catch {
      return defaultBooks
    }
  })

  const [items, setItems] = useState([])
  const [prices, setPrices] = useState({}) // { bookId_itemId: price }
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [filterCurrency, setFilterCurrency] = useState('All')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const [selectedBookId, setSelectedBookId] = useState(books[0]?.id || null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ id: null, name: '', currency: 'EGP', validFrom: '', validTo: '', description: '', status: 'Active' })

  // Load Items and Prices
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(ITEMS_KEY)
      if (storedItems) setItems(JSON.parse(storedItems))
      else setItems(mockItems)
      
      const storedPrices = localStorage.getItem(PRICES_KEY)
      if (storedPrices) setPrices(JSON.parse(storedPrices))
    } catch (e) {
      console.error('Error loading data', e)
      setItems(mockItems)
    }
  }, [])

  // Save Books
  useEffect(() => {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books))
  }, [books])

  // Save Prices
  useEffect(() => {
    localStorage.setItem(PRICES_KEY, JSON.stringify(prices))
  }, [prices])

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = showInactive ? true : b.status === 'Active'
      const matchesCurrency = filterCurrency === 'All' ? true : b.currency === filterCurrency
      
      let matchesDate = true
      if (filterDateFrom) {
        matchesDate = matchesDate && (b.validFrom >= filterDateFrom)
      }
      if (filterDateTo) {
        matchesDate = matchesDate && (b.validTo <= filterDateTo)
      }

      return matchesSearch && matchesStatus && matchesCurrency && matchesDate
    })
  }, [books, searchQuery, showInactive, filterCurrency, filterDateFrom, filterDateTo])

  const selectedBook = useMemo(() => books.find(b => b.id === selectedBookId), [books, selectedBookId])

  const handlePriceChange = (itemId, value) => {
    if (!selectedBookId) return
    const key = `${selectedBookId}_${itemId}`
    setPrices(prev => ({ ...prev, [key]: value }))
  }

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm(labels.confirmDelete)) {
      setBooks(prev => prev.filter(b => b.id !== id))
      if (selectedBookId === id) setSelectedBookId(null)
    }
  }

  const handleEdit = (book, e) => {
    e.stopPropagation();
    setForm(book)
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name) return

    if (form.id) {
      setBooks(prev => prev.map(b => b.id === form.id ? form : b))
    } else {
      const newBook = { ...form, id: Date.now().toString(), status: 'Active' }
      setBooks(prev => [...prev, newBook])
    }
    setShowForm(false)
    setForm({ id: null, name: '', currency: 'EGP', validFrom: '', validTo: '', description: '', status: 'Active' })
  }

  const handleResetData = () => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من استعادة البيانات التجريبية؟ سيتم مسح أي بيانات قمت بإضافتها.' : 'Are you sure you want to restore demo data? This will clear your custom data.')) {
      setBooks(defaultBooks);
      setSelectedBookId(defaultBooks[0].id);
      alert(isArabic ? 'تم استعادة البيانات بنجاح' : 'Data restored successfully');
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setShowInactive(false)
    setFilterCurrency('All')
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  return (
    <div className="space-y-6 pt-4 pb-10">
      
      {/* Header Section */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="relative inline-block">
          <h1 className={`page-title text-2xl font-semibold dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{labels.title}</h1>
          <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isRTL ? 'auto' : '-4px', right: isRTL ? '-4px' : 'auto', bottom: '-4px' }}></span>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">{labels.subtitle}</p>
        </div>
        
        <div className="flex gap-2">
           <button 
            onClick={handleResetData}
            className="btn btn-sm btn-ghost text-[var(--muted-text)] hover:text-blue-500 border border-gray-300 dark:border-gray-600 px-3 rounded-lg"
          >
             {labels.restoreData}
          </button>
          <button 
            onClick={() => { setForm({ id: null, name: '', currency: 'EGP', validFrom: '', validTo: '', description: '', status: 'Active' }); setShowForm(true); }}
            className="btn btn-sm bg-green-600 hover:bg-green-500 text-white border-none gap-2 px-4 py-2.5 rounded-lg font-medium flex items-center"
          >
            <FaPlus /> {labels.add}
          </button>
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaSearch className="text-blue-500" size={10} /> {labels.search}</label>
            <input 
              className="input w-full"
              placeholder={labels.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.currency}</label>
            <select 
              className="input w-full"
              value={filterCurrency}
              onChange={e => setFilterCurrency(e.target.value)}
            >
              <option value="All">{labels.allCurrencies}</option>
              <option value="EGP">EGP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="SAR">SAR</option>
            </select>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-medium text-[var(--muted-text)]">{labels.dateFrom}</label>
             <input 
               type="date"
               className="input w-full"
               value={filterDateFrom}
               onChange={e => setFilterDateFrom(e.target.value)}
             />
          </div>

          <div className="space-y-1">
             <label className="text-xs font-medium text-[var(--muted-text)]">{labels.dateTo}</label>
             <input 
               type="date"
               className="input w-full"
               value={filterDateTo}
               onChange={e => setFilterDateTo(e.target.value)}
             />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.status}</label>
            <div className="flex items-center gap-2 h-10">
                <button 
                  onClick={() => setShowInactive(!showInactive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showInactive ? 'bg-blue-600' : 'bg-gray-400'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showInactive ? (isRTL ? '-translate-x-6' : 'translate-x-6') : (isRTL ? '-translate-x-1' : 'translate-x-1')}`} />
                </button>
                <span className="text-sm">{showInactive ? labels.active + ' & ' + labels.inactive : labels.active}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Books List (Master) */}
      <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
        <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
        <div className="overflow-x-auto">
          <table className="nova-table w-full">
            <thead className="thead-soft">
              <tr className=" dark:text-gray-300">
                <th className="p-4 font-medium w-16"></th>
                <th className={`p-4 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{labels.bookName}</th>
                <th className="p-4 font-medium w-24 text-center">{labels.currency}</th>
                <th className="p-4 font-medium">{labels.validFrom}</th>
                <th className="p-4 font-medium">{labels.validTo}</th>
                <th className="p-4 font-medium text-center w-32">{labels.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredBooks.map(book => {
                const isSelected = selectedBookId === book.id;
                return (
                  <tr 
                    key={book.id} 
                    className={`cursor-pointer transition-colors border-l-4 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'}`}
                    onClick={() => setSelectedBookId(book.id)}
                  >
                    <td className="p-4 text-center">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-500' : 'border-gray-400'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                      </div>
                    </td>
                    <td className={`p-4 font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'} ${isRTL ? 'text-right' : 'text-left'}`}>
                      {book.name}
                    </td>
                    <td className={`p-4 text-center ${isSelected ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                      {book.currency}
                    </td>
                    <td className={`p-4 ${isSelected ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                      {book.validFrom || '-'}
                    </td>
                    <td className={`p-4 ${isSelected ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                      {book.validTo || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => handleEdit(book, e)}
                          className="p-2  hover:text-blue-500 transition-colors"
                          title={labels.edit}
                        >
                          <FaEdit size={14} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(book.id, e)}
                          className="p-2  hover:text-red-500 transition-colors"
                          title={labels.delete}
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center ">
                    {labels.noBooks}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Units Detail View */}
      {selectedBook && (
        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          {/* Detail Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
            <h2 className="text-lg font-medium  dark:text-white">
              {labels.productsIn} <span className="text-blue-600 font-bold">"{selectedBook.name}"</span>
            </h2>
          </div>

          {/* Units Table */}
          <div className="overflow-x-auto">
            <table className="nova-table w-full">
              <thead className="thead-soft">
                <tr className=" dark:text-gray-300">
                  <th className={`p-4 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{labels.productName}</th>
                  <th className="p-4 font-medium w-32">{labels.sku}</th>
                  <th className="p-4 font-medium w-40">{labels.basePrice} ({selectedBook.currency === 'USD' ? 'USD' : 'EGP'})</th>
                  <th className="p-4 font-medium w-64">{labels.wholesalePrice} ({selectedBook.currency})</th>
                  <th className="p-4 font-medium w-32 text-center">{labels.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.length === 0 ? (
                  // Mock items if no items loaded
                   mockItems.map(item => {
                     const basePrice = Number(item.price) || 0;
                     const wholesalePrice = Math.floor(basePrice * 0.85); // Default rule example
                     
                     return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className={`p-4 font-medium  dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{item.name}</td>
                        <td className="p-4 ">{item.sku}</td>
                        <td className="p-4 ">{basePrice.toLocaleString()} {item.currency}</td>
                        <td className="p-4">
                          <div className="relative">
                            <input 
                              type="number" 
                              value={wholesalePrice}
                              readOnly
                              className="input w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-500"
                              placeholder="0.00"
                            />
                            <span className={`absolute top-1/2 -translate-y-1/2  text-xs font-bold ${isRTL ? 'left-3' : 'right-3'}`}>
                                {selectedBook.currency}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <button className=" hover:text-blue-500 text-sm flex items-center gap-1">
                                {labels.edit} <FaEdit size={12} />
                             </button>
                             <button className="hover:text-red-500 text-sm">
                                <FaTrash size={12} />
                             </button>
                          </div>
                        </td>
                      </tr>
                     )
                   })
                ) : (
                  items.map(item => {
                    const basePrice = Number(item.price) || 0;
                    const wholesalePrice = Math.floor(basePrice * 0.85);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className={`p-4 font-medium  dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{item.name}</td>
                        <td className="p-4 ">{item.sku || '-'}</td>
                        <td className="p-4 ">{basePrice.toLocaleString()} {item.unit}</td>
                        <td className="p-4">
                          <div className="relative">
                            <input 
                              type="number" 
                              value={wholesalePrice}
                              readOnly
                              className="input w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-500"
                              placeholder={basePrice || '0.00'}
                            />
                             <span className={`absolute top-1/2 -translate-y-1/2 text-xs font-bold ${isRTL ? 'left-3' : 'right-3'}`}>
                                {selectedBook.currency}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <button className=" hover:text-blue-500 text-sm flex items-center gap-1">
                                {labels.edit} <FaEdit size={12} />
                             </button>
                             <button className=" hover:text-red-500 text-sm">
                                <FaTrash size={12} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="absolute inset-0 flex items-start justify-center p-6 md:p-6">
            <div className="card p-4 sm:p-6 mt-4 w-[92vw] sm:w-[80vw] lg:w-[60vw] xl:max-w-3xl">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''} mb-4`}>
                <h2 className="text-xl font-medium">{form.id ? labels.edit : labels.add}</h2>
                <button type="button" className="btn btn-glass btn-sm text-red-500 hover:text-red-600" onClick={() => setShowForm(false)} aria-label={labels.cancel}>
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm mb-1">{labels.bookName}</label>
                  <input 
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="input w-full"
                    placeholder={labels.bookName}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">{labels.currency}</label>
                    <select 
                      value={form.currency}
                      onChange={e => setForm({...form, currency: e.target.value})}
                      className="input w-full"
                    >
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="SAR">SAR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{labels.status}</label>
                    <select 
                      value={form.status}
                      onChange={e => setForm({...form, status: e.target.value})}
                      className="input w-full"
                    >
                      <option value="Active">{labels.active}</option>
                      <option value="Inactive">{labels.inactive}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">{labels.validFrom}</label>
                    <input 
                      type="date"
                      value={form.validFrom}
                      onChange={e => setForm({...form, validFrom: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{labels.validTo}</label>
                    <input 
                      type="date"
                      value={form.validTo}
                      onChange={e => setForm({...form, validTo: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">{labels.description}</label>
                  <textarea 
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    className="input w-full min-h-[80px]"
                    placeholder={labels.description}
                  />
                </div>
                <div className={`flex gap-3 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button type="submit" className="btn bg-blue-600 hover:bg-blue-500 text-white flex-1">{labels.save}</button>
                  <button type="button" className="btn btn-ghost flex-1" onClick={() => setShowForm(false)}>{labels.cancel}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
