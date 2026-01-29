import React, { useState, useEffect } from 'react'
import { FaTimes, FaSave, FaFileInvoiceDollar, FaUser, FaCalendarAlt, FaHashtag, FaStickyNote, FaPaperclip, FaPlus, FaTrash } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../shared/context/ThemeProvider'
import { mockStorage } from '../utils/mockStorage'
import SearchableSelect from './SearchableSelect'

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

const QuotationsFormModal = ({ isOpen, onClose, onSave, initialData = null, isRTL }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [formData, setFormData] = useState({
    id: '',
    customerCode: '',
    customerName: '',
    status: 'Draft',
    date: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [], // Array of line items
    tax: 0,
    notes: '',
    attachment: null,
    salesPerson: '',
    isTaxEnabled: true
  })

  const [errors, setErrors] = useState({})
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS)

  useEffect(() => {
    if (!isOpen) return

    if (mockStorage && mockStorage.getCustomers) {
      try {
        const stored = mockStorage.getCustomers()
        if (stored) {
          setCustomers(stored)
        }
      } catch (err) {
        console.error('Error loading customers:', err)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        id: initialData.id || '',
        customerCode: initialData.customerCode || '',
        customerName: initialData.customerName || '',
        status: initialData.status || 'Draft',
        date: initialData.createdAt ? new Date(initialData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: initialData.items || [],
        tax: initialData.tax || 0,
        notes: initialData.notes || '',
        attachment: initialData.attachment || null,
        salesPerson: initialData.salesPerson || '',
        isTaxEnabled: initialData.tax > 0 
      })
    } else {
      setFormData({
        id: `QUO-${Math.floor(Math.random() * 10000)}`, // Auto-generate ID for new
        customerCode: '',
        customerName: '',
        status: 'Draft',
        date: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [],
        tax: 0,
        notes: '',
        attachment: null,
        salesPerson: '',
        isTaxEnabled: true
      })
    }
    setErrors({})
  }, [initialData, isOpen])

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
  
  // Auto-calculate tax effect
  useEffect(() => {
    if (formData.isTaxEnabled) {
      const calculatedTax = subtotal * 0.14
      if (Math.abs(formData.tax - calculatedTax) > 0.01) {
        setFormData(prev => ({ ...prev, tax: calculatedTax }))
      }
    }
  }, [subtotal, formData.isTaxEnabled])

  const taxAmount = parseFloat(formData.tax) || 0
  const total = subtotal + taxAmount

  if (!isOpen) return null

  const validate = () => {
    const newErrors = {}
    // if (!formData.customerId && !initialData) newErrors.customerId = isRTL ? 'العميل مطلوب' : 'Customer is required' // Removed customerId validation
    if (!formData.customerName) newErrors.customerName = isRTL ? 'اسم العميل مطلوب' : 'Customer Name is required'
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
      onSave({ ...formData, subtotal, total })
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
  }`

  const labelClass = `block text-sm font-medium mb-1 text-theme-text`
  const errorClass = "text-xs text-red-500 mt-1"

  return (
    <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`card relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 text-theme-text`}>
            <FaFileInvoiceDollar className="text-blue-600" />
            {initialData 
              ? (isRTL ? 'تعديل عرض سعر' : 'Edit Quotation') 
              : (isRTL ? 'إضافة عرض سعر' : 'Add Quotation')}
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
            {/* Row 1: Quotation # & Customer Code */}
            <div>
              <label className={labelClass}>{isRTL ? 'رقم العرض' : 'Quotation #'}</label>
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
                <SearchableSelect
                  options={customers.map(c => ({ value: c.id || c.code, label: `${c.id || c.code} - ${c.name}` }))}
                  value={formData.customerCode}
                  onChange={(val) => {
                    const selectedCode = val;
                    const customer = customers.find(c => (c.id || c.code) === selectedCode);
                    setFormData({
                      ...formData,
                      customerCode: selectedCode,
                      customerName: customer ? customer.name : ''
                    });
                  }}
                  placeholder={isRTL ? 'اختر الكود' : 'Select Code'}
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'}`}
                  isRTL={isRTL}
                  showAllOption={false}
                />
              </div>
            </div>

            {/* Row 2: Customer Name & Expired Date */}
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

            {/* Row 3: Sales Person */}
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
                <label className={labelClass}>{isRTL ? 'تاريخ العرض' : 'Quotation Date'}</label>
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
                <label className={labelClass}>{isRTL ? 'صالح حتى' : 'Valid Until'}</label>
                <div className="relative">
                  <FaCalendarAlt className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'}`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>{isRTL ? 'الحالة' : 'Status'}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={inputClass}
                >
                  <option value="Draft">{isRTL ? 'مسودة' : 'Draft'}</option>
                  <option value="Sent">{isRTL ? 'تم الإرسال' : 'Sent'}</option>
                  <option value="Approved">{isRTL ? 'موافق عليه' : 'Approved'}</option>
                  <option value="Rejected">{isRTL ? 'مرفوض' : 'Rejected'}</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`h-px w-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />

          {/* Section 2: Items (Dynamic List) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-theme-text">{isRTL ? 'العناصر' : 'Items'}</h3>
              <button
                type="button"
                onClick={addItem}
                className="btn btn-sm btn-primary gap-2"
              >
                <FaPlus size={12} />
                {isRTL ? 'إضافة عنصر' : 'Add Item'}
              </button>
            </div>
            
            {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}

            <div className="overflow-x-auto rounded-lg border border-theme-border dark:border-gray-700">
              <table className="w-full text-sm text-left">
                <thead className="  text-xs uppercase text-theme-text">
                  <tr>
                    <th className="px-4 py-3 min-w-[120px]">{isRTL ? 'النوع' : 'Type'}</th>
                    <th className="px-4 py-3 min-w-[120px]">{isRTL ? 'الفئة' : 'Category'}</th>
                    <th className="px-4 py-3 min-w-[200px]">{isRTL ? 'اسم العنصر' : 'Item Name'}</th>
                    <th className="px-4 py-3 w-[100px]">{isRTL ? 'الكمية' : 'Qty'}</th>
                    <th className="px-4 py-3 w-[120px]">{isRTL ? 'السعر' : 'Price'}</th>
                    <th className="px-4 py-3 w-[120px]">{isRTL ? 'الخصم' : 'Discount'}</th>
                    <th className="px-4 py-3 w-[120px]">{isRTL ? 'المجموع الفرعي' : 'Sub Total'}</th>
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
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formData.items.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        {isRTL ? 'لا توجد عناصر. أضف عنصر جديد.' : 'No items. Add a new item.'}
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
                    <span className="text-sm text-gray-500">
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
                    <span className="text-theme-text">{isRTL ? 'الضريبة' : 'Tax'}</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-xs checkbox-primary"
                        checked={formData.isTaxEnabled}
                        onChange={(e) => {
                           const isEnabled = e.target.checked
                           setFormData(prev => ({ 
                             ...prev, 
                             isTaxEnabled: isEnabled,
                             tax: isEnabled ? subtotal * 0.14 : 0
                           }))
                        }}
                      />
                      <span className="text-xs text-gray-500">{isRTL ? 'تطبيق 14%' : 'Apply 14%'}</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-1/3">
                    <input
                      type="number"
                      value={formData.tax}
                      onChange={e => setFormData({...formData, tax: Number(e.target.value)})}
                      className={`input input-sm w-full text-right ${formData.isTaxEnabled ? 'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''}`}
                      placeholder="0.00"
                      readOnly={formData.isTaxEnabled}
                    />
                  </div>
                </div>

                <div className={`h-px w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

                <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                  <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                  <span>{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        
          {/* Footer - Moved inside form for submit handling */}
          <div className={`flex justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'} rounded-b-2xl mt-6 -mx-6 -mb-6`}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost text-theme-text hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="btn bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center gap-2"
            >
              <FaSave />
              {isRTL ? 'حفظ البيانات' : 'Save Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuotationsFormModal