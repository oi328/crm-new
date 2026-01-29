import React, { useState, useEffect } from 'react'
import { FaTimes, FaSave, FaShoppingCart, FaUser, FaCalendarAlt, FaHashtag, FaStickyNote, FaPaperclip, FaPlus, FaTrash, FaClock, FaFileInvoiceDollar } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../shared/context/ThemeProvider'
import { mockStorage } from '../utils/mockStorage'

const MOCK_CUSTOMERS = [
  { code: 'CUST-001', name: 'Tech Solutions Inc.' },
  { code: 'CUST-002', name: 'Global Trading Co.' },
  { code: 'CUST-003', name: 'Local Services Ltd.' },
  { code: 'CUST-004', name: 'Alpha Corp' },
  { code: 'CUST-005', name: 'Beta Industries' }
]

const MOCK_ITEMS = [
  { id: 1, name: 'Web Development', price: 1500, type: 'Service', category: 'Software' },
  { id: 2, name: 'Mobile App', price: 2500, type: 'Service', category: 'Software' },
  { id: 3, name: 'UI/UX Design', price: 1200, type: 'Service', category: 'Consulting' },
  { id: 4, name: 'Server Setup', price: 800, type: 'Service', category: 'Electronics' },
  { id: 5, name: 'Maintenance', price: 500, type: 'Service', category: 'Software' }
]

const SalesOrdersFormModal = ({ isOpen, onClose, onSave, initialData = null, isRTL, readOnly = false }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [formData, setFormData] = useState({
    id: '',
    quotationId: '',
    customerCode: '',
    customerName: '',
    status: 'Draft',
    date: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    items: [], // Array of line items
    tax: 0,
    paymentTerms: '',
    notes: '',
    attachment: null,
    salesPerson: '',
    discountRate: 0
  })

  const [errors, setErrors] = useState({})
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS)
  const [quotations, setQuotations] = useState([])

  useEffect(() => {
    if (!isOpen) return

    // Load customers from mockStorage
    if (mockStorage && mockStorage.getCustomers) {
      try {
        const storedCustomers = mockStorage.getCustomers()
        // Always set customers if we have storage access, even if empty (though init should seed it)
        // Merge with MOCK_CUSTOMERS if needed, or just replace?
        // Better to just use stored customers as source of truth.
        if (storedCustomers) {
          setCustomers(storedCustomers)
        }
      } catch (err) {
        console.error('Error loading customers:', err)
      }
    }
    
    // Load quotations from mockStorage
    if (mockStorage && mockStorage.getQuotations) {
        try {
            setQuotations(mockStorage.getQuotations())
        } catch (err) {
             console.error('Error loading quotations:', err)
        }
    }
  }, [isOpen])

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        id: initialData.id || '',
        quotationId: initialData.quotationId || '',
        customerCode: initialData.customerCode || '',
        customerName: initialData.customerName || '',
        status: initialData.status || 'Draft',
        date: initialData.createdAt ? new Date(initialData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        deliveryDate: initialData.deliveryDate ? new Date(initialData.deliveryDate).toISOString().split('T')[0] : '',
        items: initialData.items || [],
        tax: initialData.tax || 0,
        isTaxEnabled: initialData.tax > 0,
        paymentTerms: initialData.paymentTerms || '',
        notes: initialData.notes || '',
        attachment: initialData.attachment || null,
        salesPerson: initialData.salesPerson || '',
        discountRate: initialData.discountRate || 0
      })
    } else {
      setFormData({
        id: `SO-${Math.floor(Math.random() * 10000)}`, // Auto-generate ID for new
        quotationId: '',
        customerCode: '',
        customerName: '',
        status: 'Draft',
        date: new Date().toISOString().split('T')[0],
        deliveryDate: '',
        items: [],
        tax: 0,
        isTaxEnabled: true,
        discountRate: 0,
        paymentTerms: '',
        notes: '',
        attachment: null,
        salesPerson: ''
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  const [paymentTermsOptions, setPaymentTermsOptions] = useState([
    { value: 'Immediate', label: isRTL ? 'فوري (خصم 10%)' : 'Immediate (10% Disc.)', discountRate: 0.10 },
    { value: 'Net 15', label: isRTL ? '15 يوم (خصم 5%)' : 'Net 15 (5% Disc.)', discountRate: 0.05 },
    { value: 'Net 30', label: isRTL ? '30 يوم (خصم 2%)' : 'Net 30 (2% Disc.)', discountRate: 0.02 },
    { value: 'Net 60', label: isRTL ? '60 يوم (لا يوجد خصم)' : 'Net 60 (No Disc.)', discountRate: 0.0 }
  ])

  // Update options label when discount changes manually
  useEffect(() => {
    if (formData.paymentTerms) {
      setPaymentTermsOptions(prev => prev.map(opt => {
        if (opt.value === formData.paymentTerms) {
          const newRate = formData.discountRate * 100
          return {
            ...opt,
            label: isRTL 
              ? `${opt.value === 'Immediate' ? 'فوري' : opt.value === 'Net 15' ? '15 يوم' : opt.value === 'Net 30' ? '30 يوم' : '60 يوم'} (خصم ${newRate.toFixed(1)}%)`
              : `${opt.value} (${newRate.toFixed(1)}% Disc.)`,
            discountRate: formData.discountRate
          }
        }
        return opt
      }))
    }
  }, [formData.discountRate, formData.paymentTerms, isRTL])

  // Calculations
  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.price) || 0
      const discount = parseFloat(item.discount) || 0
      return sum + (qty * price) - discount
    }, 0)
  }

  const subtotal = calculateSubtotal()
  const globalDiscountAmount = subtotal * (formData.discountRate || 0)
  const taxAmount = parseFloat(formData.tax) || 0
  const total = subtotal - globalDiscountAmount + taxAmount

  // Auto-calculate tax effect
  useEffect(() => {
    if (formData.isTaxEnabled) {
      const calculatedTax = (subtotal - globalDiscountAmount) * 0.14
      if (Math.abs(formData.tax - calculatedTax) > 0.01) {
        setFormData(prev => ({ ...prev, tax: calculatedTax }))
      }
    }
  }, [subtotal, globalDiscountAmount, formData.isTaxEnabled])

  if (!isOpen) return null

  const validate = () => {
    const newErrors = {}
    if (!formData.customerName) newErrors.customerName = isRTL ? 'اسم العميل مطلوب' : 'Customer Name is required'
    if (!formData.deliveryDate) newErrors.deliveryDate = isRTL ? 'تاريخ التسليم مطلوب' : 'Delivery Date is required'
    if (formData.items.length === 0) newErrors.items = isRTL ? 'يجب إضافة عنصر واحد على الأقل' : 'At least one item is required'
    
    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.name) newErrors[`item_name_${index}`] = true
      if (!item.quantity || item.quantity <= 0) newErrors[`item_qty_${index}`] = true
      if (!item.price || item.price < 0) newErrors[`item_price_${index}`] = true
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave({ 
        ...formData, 
        subtotal, 
        discountAmount: globalDiscountAmount,
        total,
        createdAt: new Date().toISOString()
      })
    }
  }

  // Item Management
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), type: 'Product', category: '', name: '', quantity: 1, price: 0, discount: 0 }
      ]
    }))
  }

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }))
  }

  // Options
  const itemTypeOptions = [
    { value: 'Product', label: isRTL ? 'منتج' : 'Product' },
    { value: 'Service', label: isRTL ? 'خدمة' : 'Service' }
  ]

  const categoryOptions = [
    { value: 'Electronics', label: isRTL ? 'إلكترونيات' : 'Electronics' },
    { value: 'Software', label: isRTL ? 'برمجيات' : 'Software' },
    { value: 'Consulting', label: isRTL ? 'استشارات' : 'Consulting' }
  ]
  
  const inputClass = `w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
    isDark 
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
      : 'bg-white border-gray-300 text-theme-text placeholder-gray-400'
  } ${readOnly ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`

  const labelClass = `block text-sm font-medium mb-1 text-theme-text`
  const errorClass = "text-xs text-red-500 mt-1"

  return (
    <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`card relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 text-theme-text`}>
            <FaShoppingCart className="text-blue-600" />
            {readOnly 
              ? (isRTL ? 'عرض تفاصيل الطلب' : 'View Order Details')
              : initialData 
                ? (isRTL ? 'تعديل طلب مبيعات' : 'Edit Sales Order') 
                : (isRTL ? 'إضافة طلب مبيعات' : 'Add Sales Order')}
          </h2>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-theme-text hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section 1: Basic Info & Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1: Order # & Customer Code */}
            <div>
              <label className={labelClass}>{isRTL ? 'رقم الطلب' : 'Order #'}</label>
              <div className="relative">
                <FaHashtag className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                <input
                  type="text"
                  value={formData.id}
                  readOnly
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'} opacity-70 cursor-not-allowed`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{isRTL ? 'كود العميل' : 'Customer Code'}</label>
              <div className="relative">
                <FaUser className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                <select
                  value={formData.customerCode}
                  onChange={e => {
                    const selectedCode = e.target.value;
                    const customer = customers.find(c => (c.id || c.code) === selectedCode);
                    setFormData({
                      ...formData,
                      customerCode: selectedCode,
                      customerName: customer ? customer.name : '',
                      quotationId: '' // Reset quotation when customer changes
                    });
                  }}
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'}`}
                >
                  <option value="">{isRTL ? 'اختر الكود' : 'Select Code'}</option>
                  {customers.map(c => (
                    <option key={c.id || c.code} value={c.id || c.code}>{(c.id || c.code)} - {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>{isRTL ? 'اسم العميل' : 'Customer Name'}</label>
              <div className="relative">
                <FaUser className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                <input
                  type="text"
                  value={formData.customerName}
                  readOnly
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'} opacity-70 cursor-not-allowed`}
                  placeholder={isRTL ? 'اسم العميل' : 'Customer Name'}
                />
              </div>
              {errors.customerName && <p className={errorClass}>{errors.customerName}</p>}
            </div>

            <div>
              <label className={labelClass}>{isRTL ? 'كود عرض السعر' : 'Quotation Code'}</label>
              <div className="relative">
                <FaFileInvoiceDollar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                <select
                  value={formData.quotationId}
                  onChange={e => {
                    const selectedQId = e.target.value;
                    const quotation = quotations.find(q => q.id === selectedQId);
                    
                    if (quotation) {
                      setFormData(prev => ({
                        ...prev,
                        quotationId: selectedQId,
                        customerCode: quotation.customerCode || prev.customerCode,
                        customerName: quotation.customerName || prev.customerName,
                        salesPerson: quotation.salesPerson || prev.salesPerson,
                        items: quotation.items ? quotation.items.map(item => ({
                          ...item,
                          type: item.type || 'Product',
                          category: item.category || 'Electronics',
                          discount: item.discount || 0
                        })) : []
                      }));
                    } else {
                      setFormData(prev => ({ ...prev, quotationId: selectedQId }));
                    }
                  }}
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'} ${!formData.customerCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!formData.customerCode}
                >
                  <option value="">{isRTL ? 'اختر العرض' : 'Select Quotation'}</option>
                  {quotations
                    .filter(q => !formData.customerCode || String(q.customerCode) === String(formData.customerCode))
                    .map(q => (
                    <option key={q.id} value={q.id}>{q.id} - {q.customerName}</option>
                  ))}
                </select>
              </div>
            </div>

             <div>
              <label className={labelClass}>{isRTL ? 'مندوب المبيعات' : 'Sales Person'}</label>
              <div className="relative">
                <FaUser className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                <input
                  type="text"
                  value={formData.salesPerson}
                  onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'}`}
                  placeholder={isRTL ? 'اسم مندوب المبيعات' : 'Sales Person Name'}
                />
              </div>
            </div>
            
            {/* Row 3: Dates & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>{isRTL ? 'تاريخ الطلب' : 'Order Date'}</label>
                <div className="relative">
                  <FaCalendarAlt className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'}`}
                  />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>{isRTL ? 'تاريخ التسليمب' : ' Delivery Date'}</label>
                <div className="relative">
                  <FaCalendarAlt className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'} ${errors.deliveryDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.deliveryDate && <p className={errorClass}>{errors.deliveryDate}</p>}
              </div>

              <div>
                <label className={labelClass}>{isRTL ? 'الحالة' : 'Status'}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={inputClass}
                >
                  <option value="Draft">{isRTL ? 'مسودة' : 'Draft'}</option>
                  <option value="Confirmed">{isRTL ? 'مؤكد' : 'Confirmed'}</option>
                  <option value="In Progress">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</option>
                  <option value="Completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                  <option value="Cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</option>
                  <option value="Partially Invoiced">{isRTL ? 'مفوتر جزئياً' : 'Partially Invoiced'}</option>
                  <option value="Fully Invoiced">{isRTL ? 'مفوتر بالكامل' : 'Fully Invoiced'}</option>
                </select>
              </div>
            </div>
            
            {/* Row 4: Payment Info */}
            <div>
              <label className={labelClass}>{isRTL ? 'شروط الدفع / نسبة الخصم' : 'Payment Terms / Discount %'}</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FaClock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => {
                      const selectedTerm = paymentTermsOptions.find(opt => opt.value === e.target.value)
                      setFormData({ 
                        ...formData, 
                        paymentTerms: e.target.value,
                        discountRate: selectedTerm ? selectedTerm.discountRate : 0
                      })
                    }}
                    className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'}`}
                  >
                    <option value="">{isRTL ? 'اختر الشروط' : 'Select Terms'}</option>
                    {paymentTermsOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="relative w-24">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    className={`${inputClass} text-center`}
                    value={formData.discountRate ? parseFloat((formData.discountRate * 100).toFixed(2)) : 0}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      const rate = isNaN(val) ? 0 : val / 100;
                      setFormData({...formData, discountRate: rate});
                    }}
                    placeholder="%"
                  />
                  <span className="absolute top-2.5 right-2 text-theme-text text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`h-px w-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />

          {/* Section 2: Items (Dynamic List) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-theme-text">{isRTL ? 'المنتجات / البنود' : 'Products / Items'}</h3>
              {!readOnly && (
                <button
                  type="button"
                  onClick={addItem}
                  className="btn btn-sm btn-primary gap-2"
                >
                  <FaPlus size={12} />
                  {isRTL ? 'إضافة بند' : 'Add Item'}
                </button>
              )}
            </div>
            
            {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}

            <div className="overflow-x-auto rounded-lg border border-theme-border dark:border-gray-700">
              <table className="w-full text-sm text-left">
                <thead className="  text-xs uppercase text-theme-text">
                  <tr>
                    <th className="px-4 py-3 min-w-[120px]">{isRTL ? 'النوع' : 'Type'}</th>
                    <th className="px-4 py-3 min-w-[120px]">{isRTL ? 'الفئة' : 'Category'}</th>
                    <th className="px-4 py-3 min-w-[200px]">{isRTL ? 'اسم البند' : 'Item Name'}</th>
                    <th className="px-4 py-3 w-[100px]">{isRTL ? 'الكمية' : 'Qty'}</th>
                    <th className="px-4 py-3 w-[120px]">{isRTL ? 'السعر' : 'Price'}</th>
                    <th className="px-4 py-3 w-[120px]">{isRTL ? 'الخصم' : 'Discount'}</th>
                    <th className="px-4 py-3 w-[120px]">{isRTL ? 'المجموع' : 'Total'}</th>
                    <th className="px-4 py-3 w-[50px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {formData.items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-700/50 ">
                      <td className="px-2 py-2">
                        <select 
                          className="input input-sm w-full"
                          value={item.type}
                          onChange={e => updateItem(index, 'type', e.target.value)}
                        >
                          {itemTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                         <select 
                          className="input input-sm w-full"
                          value={item.category}
                          onChange={e => {
                            const newCategory = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              items: prev.items.map((it, i) => i === index ? { 
                                ...it, 
                                category: newCategory,
                                name: '',
                                price: 0
                              } : it)
                            }));
                          }}
                        >
                          <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                          {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className={`input input-sm w-full ${errors[`item_name_${index}`] ? 'border-red-500' : ''}`}
                          value={item.name}
                          onChange={e => {
                            const selectedName = e.target.value;
                            const product = MOCK_ITEMS.find(p => p.name === selectedName);
                            setFormData(prev => ({
                              ...prev,
                              items: prev.items.map((it, i) => i === index ? { 
                                ...it, 
                                name: selectedName,
                                price: product ? product.price : it.price,
                                type: product ? product.type : it.type,
                                category: product ? product.category : it.category
                              } : it)
                            }));
                          }}
                        >
                          <option value="">{isRTL ? 'اختر العنصر' : 'Select Item'}</option>
                          {MOCK_ITEMS
                            .filter(i => !item.category || i.category === item.category)
                            .map(i => (
                              <option key={i.id} value={i.name}>{i.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="1"
                          className={`input input-sm w-full ${errors[`item_qty_${index}`] ? 'border-red-500' : ''}`}
                          value={item.quantity}
                          onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={`input input-sm w-full ${errors[`item_price_${index}`] ? 'border-red-500' : ''}`}
                          value={item.price}
                          onChange={e => updateItem(index, 'price', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input input-sm w-full"
                          value={item.discount}
                          onChange={e => updateItem(index, 'discount', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2 font-medium">
                        {((item.quantity * item.price) - item.discount).toLocaleString()}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {formData.items.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-theme-text ">
                        {isRTL ? 'لا توجد عناصر. أضف بند جديد.' : 'No items. Add a new item.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`h-px w-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />

          {/* Section 3: Financials & Attachments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Notes & Attachments */}
            <div className="space-y-4">
               <div>
                <label className={labelClass}>{isRTL ? 'ملاحظات' : 'Notes'}</label>
                <div className="relative">
                  <FaStickyNote className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'} min-h-[80px] py-3`}
                    placeholder={isRTL ? 'أضف ملاحظات...' : 'Add notes...'}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>{isRTL ? 'المرفقات' : 'Attachment'}</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                  <input type="file" className="hidden" id="file-upload" onChange={e => setFormData({...formData, attachment: e.target.files[0]})} />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <FaPaperclip className="text-gray-400" size={24} />
                    <span className="text-sm text-theme-text ">
                      {formData.attachment ? formData.attachment.name : (isRTL ? 'انقر لرفع ملف' : 'Click to upload file')}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Totals */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-theme-text">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-medium">{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-theme-text">{isRTL ? 'قيمة الخصم' : 'Discount Value'}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-sm w-24 text-end text-green-600 font-medium"
                    value={globalDiscountAmount ? parseFloat(globalDiscountAmount.toFixed(2)) : 0}
                    onChange={e => {
                       const val = parseFloat(e.target.value);
                       const amount = isNaN(val) ? 0 : val;
                       const rate = subtotal > 0 ? amount / subtotal : 0;
                       setFormData({...formData, discountRate: rate});
                    }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-theme-text">{isRTL ? 'الضريبة' : 'Tax'}</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-xs checkbox-primary"
                        checked={formData.isTaxEnabled}
                        onChange={(e) => {
                           const isEnabled = e.target.checked
                           const taxableAmount = subtotal - globalDiscountAmount
                           setFormData(prev => ({ 
                             ...prev, 
                             isTaxEnabled: isEnabled,
                             tax: isEnabled ? taxableAmount * 0.14 : 0
                           }))
                        }}
                      />
                      <span className="text-xs text-gray-500">{isRTL ? 'تطبيق 14%' : 'Apply 14%'}</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    value={formData.tax}
                    onChange={e => setFormData({...formData, tax: Number(e.target.value)})}
                    className={`input input-sm w-24 text-end ${formData.isTaxEnabled ? 'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''}`}
                    placeholder="0.00"
                    readOnly={formData.isTaxEnabled}
                  />
                </div>
                
                <div className={`h-px w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-theme-text">{isRTL ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-blue-600">{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost flex-1"
                >
                  {readOnly ? (isRTL ? 'إغلاق' : 'Close') : (isRTL ? 'إلغاء' : 'Cancel')}
                </button>
                {!readOnly && (
                  <button
                    type="submit"
                    className="btn btn-primary flex-1 gap-2"
                  >
                    <FaSave />
                    {isRTL ? 'حفظ الطلب' : 'Save Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SalesOrdersFormModal